# any.sender

### Transactions made simple!

The any.sender service is a simple and efficient way of sending transactions to Ethereum. Its API guarantees a transaction will be mined by a given deadline, so that users don't have to battle with nonces and gas prices. The service is held accountable by a smart contract that trustlessly ensures that either the user transaction is mined before the deadline or compensation is paid out.

any.sender endeavours to save precious development time by solving all the edge cases of getting a transaction mined. You can focus on what makes your dapp great and feel secure that your transactions will be mined on time, every time.

## Addresses

### Ropsten
* API: https://api.pisa.watch/any.sender.ropsten
* Relay contract: 0xe8468689AB8607fF36663EE6522A7A595Ed8bC0C
* RefundAdjudicator contract: 0xCe6d434782ADD5A20B825daAD84119a454ec6dC9
* LockableDeposit contract: 0xDA342E509220034e75822B753629fa212Fd4D443
* Receipt signer: 0xe41743Ca34762b84004D3ABe932443FC51D561D5

## Features

- **Forget about gas prices.** Users just set a deadline and any.sender makes sure the transaction is mined.
- **No more nonces.** any.sender re-orders transactions internally to make sure that your transaction never gets stuck.
- **No more lost transactions.** The service carefully monitors the progress of transactions through the pending pool, ensuring that your transaction gets mined on time, every time.
- **Delegated fees and meta-transactions.** As a relayer any.sender allows DApps to pay gas fees for their users, meaning that their customers no longer need ETH to interact with the DApp.
- **Easily pluggable.** Designed with extensibility in mind, the relay can be made to fit any smart contract.
- **Simple API.** Interact with any.sender over a REST api to get up and running in minutes.
- **Re-org safe.** We keep an eye on your transaction many blocks after it's been mined so that even deep re-orgs won't shake us.
- **Congestion safe.** any.sender tracks network gas prices and adjusts fees as needed. If you really need your transaction to be mined, even network congestion won't stop you.
- **Accountable.** Although any.sender's _raison d'etre_ is to never miss a transaction, if it does happen then an on-chain contract ensures that any.sender will issue a compensation. We never expect this to happen but this contract financially aligns any.sender with its users, ensuring that it's everyone's interests to get the transaction mined.
- **High concurrency.** Users can submit many transactions at a time, without having to worry about previous transactions getting stuck. any.sender manages a pool of relayers, using multiple wallets in order to make sure that all transactions get confirmed smoothly.
- **Low gas overhead.** The whole accountable relaying logic adds only 70k gas to the transaction.

## Contents

- [Client library](./docs/client.md)
- [Payments](./docs/payments.md)
- [Guarantees](./docs/guarantees.md)
- [Contracts](https://github.com/PISAresearch/contracts.any.sender)
- [API](./docs/API.md)
- Recipes
    - [Simple echo](./echoRecipe.md)
    - [Ballot voting](https://github.com/stonecoldpat/anysender-voting)

## Getting started

1. Install the client lib

```
npm i @any-sender/client
```

2. Use your favourite wallet to top up balance with any.sender. Sending funds directly to our relay contract address to top up gas credit. See [payments](./docs/payments.md) for more details.

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
  refund: parseEther("0.01").toString(), // compensation in case of failure
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
