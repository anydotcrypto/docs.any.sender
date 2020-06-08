# any.sender

**BETA**: While any.sender is fast approaching production readiness, we still consider it in beta and the latest release is v0.3.0 beta. We recommend using any.sender with small funds and non-critical transactions.

### Transactions made simple!

The any.sender service is a simple and efficient way of sending transactions to Ethereum.

Its API handles the entire transaction process on behalf of the user, so they don't have to battle with nonces or gas prices. The service is held accountable by a smart contract to ensure either the user's transaction is mined before a block deadline or compensation is paid out.

any.sender endeavours to save precious development time by handling all edge cases for transaction delivery and getting it mined reliably. You, the user, can simply focus on making your dapp great and we'll take care of getting transactions mined on time, every time.

## Features that make any.sender useful

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

## Try it out

We recommend trying any.sender on the Ropsten network and to get started we are happy to supply you with some Ropsten ETH via our [chatroom](https://t.me/anydotsender). There are three ways to start using any.sender:

* The [Client](./docs/client/) takes care of crafting the relay transaction and sending it up to any.sender. The example walkthrough shows how to wrap a contract to natively use any.sender when sending a transaction. It is the simplest and easiest way to use any.sender, but it does have a dependency on ethersjs. **We recommend using this client.**

* The [Core Client](./docs/coreClient/) is a light-weight wrapper around the API to take care of basic functionality of sending a transaction via any.sender. Use this client as a raw wrapper for the [API](./docs/API.md).

* The [Experimental Client](./docs/experimentalClient/) takes care of deploying and managing a wallet contract on behalf of the signer. It auto-deploys the wallet contract when the first transaction is issued & takes care of all replay protection. It currently supports our [MetaTx library](https://github.com/anydotcrypto/metatransactions/) and we plan to support Gnosis Safe.

## Quick guide on how to get started

Here is a super-quick example on how to get started using the core-client library.

1. Install the client lib

   ```
   npm i @any-sender/client
   ```

2. Use your favourite wallet to top up balance with any.sender. Send funds directly to our relay contract address to top up gas credit. See [payments](./docs/payments.md) for more details.

3. Connect an [ethersjs](https://github.com/ethers-io/ethers.js/) Signer or Contract to a any.sender, and relay transactions!

   #### Wallet:
   ```typescript
    import { any } from "@any-sender/client";
    const userWallet = new ethers.Wallet("<priv key>", provider);

    const anyUserWallet = any.sender(connectedUser);
    const relayReceipt = await anyUserWallet.any.sendTransaction({ to: "<address>", data: "<data>" });
    const transactionReceipt = await relayReceipt.wait();
   ```

   #### Contract:
   ```typescript
    import { any } from "@any-sender/client";
    const userWallet = new ethers.Wallet("<priv key>", provider);
    const erc20 = new ethers.Contract("<address>", "<abi>", userWallet)
    
    const anyErc20 = any.sender(erc20);
    const relayReceipt = await anyErc20.transfer("<recipient>", 10);
    const transactionReceipt = await relayReceipt.wait();
   ```

For more details see the [client documentation and walkthrough](./docs/client/)

## Further & In-depth Reading

We have put together a collection of documents to explain how any.sender works under the hood alongside some code examples of how to use the service.

- In depth documentation
  - [any.sender API](./docs/API.md)
  - [Client library](./docs/client)
  - [Core client library](./docs/coreClient)
  - [Experimental client library](./docs/experimentalClient)
  - [Payments](./docs/payments.md)
  - [Contracts](https://github.com/PISAresearch/contracts.any.sender)
  - [Accountability guarantees](./docs/guarantees.md)
  - [Transaction inclusion](./docs/transactionInclusion.md)
