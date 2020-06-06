# any.sender

**BETA**: Although any.sender is fast approaching production readiness it is currently at v0.2.1 beta. Please only use with small funds and for non-critical transactions.

### Transactions made simple!

The any.sender service is a simple and efficient way of sending transactions to Ethereum. 

Its API handles the entire transaction process on behalf of the user, so they don't have to battle with nonces or gas prices. The service is held accountable by a smart contract to ensure either the user's transaction is mined before a block deadline or compensation is paid out. 

any.sender endeavours to save precious development time by handling all edge cases for transaction delivery and getting it mined reliably. You, the user, can simply focus on making your dapp great and we'll take care of getting transactions mined on time, every time. 

## [Try it yourself](./docs/coreClient/walkthrough/)

The [Core Client Echo Walkthrough](./docs/coreClient/walkthrough/) is a start to finish walkthrough of sending a transaction to any.sender using the basic core client. All you need is some Ropsten ETH and a connection to a Ropsten RPC. This is the easiest place to start to get a grip on how to interact with the any.sender API.

## Addresses

|      | Ropsten | Mainnet |
| --- | --- | --- |
| **API** | https://api.anydot.dev/any.sender.ropsten | https://api.anydot.dev/any.sender.mainnet |
| **Receipt signer** | 0xe41743Ca34762b84004D3ABe932443FC51D561D5 | 0x02111c619c5b7e2aa5c1f5e09815be264d925422 |
| **Relay contract** | 0x9b4FA5A1D9f6812e2B56B36fBde62736Fa82c2a7 | 0x9b4FA5A1D9f6812e2B56B36fBde62736Fa82c2a7 |
| **Adjudicator contract** | 0xAa517b16cAADc44b542c843AAfcaf274f6965016 | 0xAa517b16cAADc44b542c843AAfcaf274f6965016 |
| **Lockable deposit contract** | 0xc617c0Fb33B7B6413b60beaB1bA0979Ae3166f54 | 0xc617c0Fb33B7B6413b60beaB1bA0979Ae3166f54 |

## Features

Essential features: 

- **Simple API.** Interact with any.sender over a REST api to get up and running in minutes.
- **Deadlines, not gas prices.** Users just set a deadline and any.sender makes sure the transaction is mined.
- **No more lost transactions.** The service monitors and progressively bumps the fee for all pending transactions, ensuring your transaction gets mined on time, every time.  
- **Delegated fees via meta-transactions.** The service allows DApps to pay gas fees for their users, meaning their customers no longer need ETH to interact with their DApp. 
- **Plug & play.** Designed with extensibility in mind, the any.sender service can be made to work with any smart contract. 
- **Low gas overhead.** The whole accountable relaying logic adds only 45k gas to the transaction.

Advanced features: 

- **Re-org safety.** We monitor transactions many blocks after they are mined, so even deep re-orgs won't shake us from ensuring your transaction gets confirmed. 
- **Congestion safe.** any.sender tracks network gas prices and adjusts fees as needed. If you really need your transaction to be mined, even network congestion won't stop you.
- **Concurrent in-flight transactions.** Users can submit several transactions at a time, without the worry of previous transactions getting stuck. The any.sender service employs novel replay protection and manages a pool of relayers, ensuring users can submit several transactions at a time and they all get confirmed in any order. 
- **Smart-contract enforced accountability.** Although any.sender's _raison d'etre_ is to never miss a transaction, if it does happen then an on-chain contract ensures the any.sender will issue a compensation (or get slashed). We never expect it to happen, but it ensures the customer can swiftly enforce accountability if we fail our promise. 

## Contents


* In depth
    * [API](./docs/API.md)
    * [Core client library](./docs/coreClient)
    * [Payments](./docs/payments.md)
    * [Contracts](https://github.com/PISAresearch/contracts.any.sender)
    * [Accountability guarantees](./docs/guarantees.md)
    * [Transaction inclusion](./docs/transactionInclusion.md)
* Tutorials and examples
    * [Core client walkthrough](./docs/coreClient/walkthrough)

## Quick guide on how to get started - for more details follow the [core client echo walkthrough](./docs/coreClient/walkthrough/)

1. Install the client lib

    ```
    npm i @any-sender/client
    ```

2. Use your favourite wallet to top up balance with any.sender. Send funds directly to our relay contract address to top up gas credit. See [payments](./docs/payments.md) for more details.

3. Create and sign a relay transaction:

    ```typescript
    // a relay tx looks a lot like a regular tx
    const deadline = (await provider.getBlockNumber()) + 405;
    const relayTx = {
      chainId: 3,
      from: userWallet.address, // source address
      to: echoContractAddress, // target address
      gasLimit: 100000, // transaction gas limit
      deadline, // a deadline in the future
      data: "0x", // transaction data
      compensation: parseEther("0.01").toString(), // compensation in case of failure
      relayContractAddress // the relay contract to use
    };
    
    // authorise the transaction using the 'from' wallet
    const id = AnyDotSenderCoreClient.relayTxId(relayTx);
    const signature = await userWallet.signMessage(arrayify(id));
    const signedTx = { ...relayTx, signature };
    ```

4. Relay!
    ```ts
    const client = new AnyDotSenderCoreClient({ apiUrl: anySenderUrl, receiptSignerAddress });
    // any.sender returns a signed receipt as proof that it accepted the relay tx
    const signedReceipt = await client.relay(signedTx);
    ```
