# any.sender

**BETA**: Although any.sender is fast approaching production readiness it is currently only at v0.2.1 beta. Please only use with small funds and for non-critical transactions.

### Transactions made simple!

The any.sender service is a simple and efficient way of sending transactions to Ethereum. 

Its API handles the entire transaction process on behalf of the user, so they don't have to battle with nonces or gas prices. The service is held accountable by a smart contract to ensure either the user's transaction is mined before a block deadline or compensation is paid out. 

any.sender endeavours to save precious development time by handling all edge cases for transaction delivery and getting it mined reliably. You, the user, can simply focus on making your dapp great and we'll take care of getting transactions mined on time, every time. 

## [Try it yourself](./docs/echoWalkthrough/)

The [Echo Walkthrough](./docs/echoWalkthrough/) is a start to finish walkthrough of sending a transaction to any.sender. All you need is some Ropsten ETH and a connection to a Ropsten RPC. This is the easiest place to start to get a grip on how to interact with the any.sender API.

## Addresses

|      | Ropsten | Mainnet |
| --- | --- | --- |
| **API** | https://api.anydot.dev/any.sender.ropsten | https://api.anydot.dev/any.sender.mainnet |
| **Receipt signer** | 0xe41743Ca34762b84004D3ABe932443FC51D561D5 | 0x02111c619c5b7e2aa5c1f5e09815be264d925422 |
| **Relay contract** | 0xa404d1219Ed6Fe3cF2496534de2Af3ca17114b06 | 0xa404d1219Ed6Fe3cF2496534de2Af3ca17114b06 |
| **Adjudicator contract** | 0x29C031B5d6978f9C1d85CdD252297d2C95d51Fe8 | 0x29C031B5d6978f9C1d85CdD252297d2C95d51Fe8 |
| **Lockable deposit contract** | 0x2D1A73512F107668C15BF0f1Ccc8dfb45f1a2cCE | 0x2D1A73512F107668C15BF0f1Ccc8dfb45f1a2cCE |

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

* Tutorials and examples
    * [Simple echo walkthrough](./docs/echoWalkthrough)
    * [Ballot voting demo](https://github.com/stonecoldpat/anysender-voting)
* In depth
    * [Client library](./docs/client.md)
    * [Payments](./docs/payments.md)
    * [Contracts](https://github.com/PISAresearch/contracts.any.sender)
    * [Accountability guarantees](./docs/guarantees.md)
    * [Transaction inclusion](./docs/transactionInclusion.md)
    * [API](./docs/API.md)

## Quick guide on how to get started - for more details follow the [echo walkthrough](./docs/echoWalkthrough)

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
    // any.sender returns a signed receipt as proof that it accepted the relay tx
    const signedReceipt = await client.relay(signedTx);
    ```
