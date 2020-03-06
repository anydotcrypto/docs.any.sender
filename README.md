# any.sender

### Transactions made simple!

The any.sender service is a simple and efficient way of sending transactions to Ethereum. 

Its API handles the entire transaction process on behalf of the user, so they don't have to battle with nonces or gas prices. The service is held accountable by a smart contract to ensure either the user's transaction is mined before a block deadline or compensation is paid out. 

any.sender endeavours to save precious development time by handling all edge cases for transaction delivery and getting it mined reliably. You, the user, can simply focus on making your dapp great and we'll take care of getting transactions mined on time, every time. 

## [Try it yourself!](./docs/echoRecipe/README.md)

The [Echo Recipe](./docs/echoRecipe/README.md) is a start to finish walkthrough of sending a transaction to any.sender. All you need is some Ropsten ETH and a connection to a Ropsten RPC.

## Addresses

### Ropsten
* API: https://api.pisa.watch/any.sender.ropsten
* Relay contract: 0xe8468689AB8607fF36663EE6522A7A595Ed8bC0C
* Adjudicator contract: 0xCe6d434782ADD5A20B825daAD84119a454ec6dC9
* LockableDeposit contract: 0xDA342E509220034e75822B753629fa212Fd4D443
* Receipt signer: 0xe41743Ca34762b84004D3ABe932443FC51D561D5

## Features

Essential features: 

- **Simple API.** Interact with any.sender over a REST api to get up and running in minutes.
- **Deadlines, not gas prices.** Users just set a deadline and any.sender makes sure the transaction is mined.
- **No more lost transactions.** The service monitors and progressively bumps the fee for all pending transactions, ensuring your transaction gets mined on time, every time.  
- **Delegated fees via meta-transactions.** The service allows DApps to pay gas fees for their users, meaning their customers no longer need ETH to interact with their DApp. 
- **Plug & play.** Designed with extensibility in mind, the any.sender service can be made to work with any smart contract. 
- **Low gas overhead.** The whole accountable relaying logic adds only 70k gas to the transaction.

Advanced features: 

- **Re-org safety.** We monitor transactions many blocks after it is mined, so even deep re-orgs won't shake us from ensuring your transaction gets confirmed. 
- **Congestion safe.** any.sender tracks network gas prices and adjusts fees as needed. If you really need your transaction to be mined, even network congestion won't stop you.
- **Concurrent in-flight transactions.** Users can submit several transactions at a time, without the worry of previous transactions getting stuck. The any.sender service employs novel replay protection and manages a pool of relayers, ensuring users can submit several transactions at a time and they all get confirmed in any order. 
- **Smart-contract enforced accountability.** Although any.sender's _raison d'etre_ is to never miss a transaction, if it does happen then an on-chain contract ensures the any.sender will issue a compensation (or get slashed). We never expect it to happen, but it ensures the customer can swiftly enforce accountability if we fail our promise. 

## Contents

We've put together a range of documentation to help you get started. 

If you want to learn how: 

- Any.sender works under the hood, check out [Contracts](https://github.com/PISAresearch/contracts.any.sender) and [Guarantees](./docs/guarantees.md). 
- To get started with the any.sender client & depositing funds, check out [API](./docs/API.md) and [Client library](./docs/client.md).
- To build using any.sender via an example, check our receipes [Simple echo](./docs/echoRecipe/README.md) and [Ballot voting](https://github.com/stonecoldpat/anysender-voting)

Finally, if you don't want to use our client library, you can also check out our super-simple [API](./docs/API.md)

## Quick guide on how to get started!

1. Install the client lib

```
npm i @any-sender/client
```

2. Use your favourite wallet to top up balance with any.sender. Send funds directly to our relay contract address to top up gas credit. See [payments](./docs/payments.md) for more details.

3. Create and sign a relay transaction:

```typescript
// a relay tx looks a lot like a regular tx
const deadlineBlockNumber = (await provider.getBlockNumber()) + 405;
const relayTx = {
  from: userWallet.address, // source address
  to: echoContractAddress, // target address
  gas: 100000, // transaction gas limit
  deadlineBlockNumber, // a deadline in the future
  data: "0x", // transaction data
  compensation: parseEther("0.01").toString(), // compensation in case of failure
  relayContractAddress // the relay contract to use
};

// authorise the transaction using the 'from' wallet
const id = AnySenderClient.relayTxId(relayTx);
const signature = await userWallet.signMessage(arrayify(id));
const signedTx = { ...relayTx, signature };
```

4. Relay!
```ts
const client = new AnySenderClient(anySenderUrl, receiptSignerAddress);
// any.sender returns a signed receipt as prove that it accepted the relay tx
const signedReceipt = await client.relay(signedTx);
```
