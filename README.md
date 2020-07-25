# any.sender

**BETA**: While any.sender is fast approaching production readiness, we still consider it in beta and the latest release is v0.3.0 beta. We recommend using any.sender with small funds and non-critical transactions.

### Announcement!

We have released two new features for any.sender:

- **Direct transaction.** The relay transaction is sent directly to the target contract and it is no longer routed via our relay contract. The gas overhead of using any.sender reduces **from 45k gas to 0 gas!**
- **Status API.** To keep track of your relayed transaction, we now have a status service API to support fetching the list of published Ethereum transactions alongside the gas price issued for each transaction.

Finally, even with this upgrade, any.sender is still non-custodial and never has access to your primary funds.

### Transactions made simple!

The any.sender service is a simple and efficient way of sending transactions to Ethereum.

Its API handles the entire transaction process on behalf of the user, so they don't have to battle with nonces or gas prices. The service is held accountable by a smart contract to ensure either the user's transaction is mined before a block deadline or compensation is paid out.

any.sender endeavours to save precious development time by handling all edge cases for transaction delivery and getting it mined reliably. You, the user, can simply focus on making your dapp great and we'll take care of getting transactions mined on time, every time.

## Features that make any.sender useful

Sending a transaction via any.sender has **0 gas overhead.**

Essential features:

- **Simple API.** Interact with any.sender over a REST api to get up and running in minutes.
- **No more lost transactions.** The service monitors and progressively bumps the fee for all pending transactions, ensuring your transaction gets mined on time, every time.
- **Delegated fees via meta-transactions.** The service allows DApps to pay gas fees for their users, meaning their customers no longer need ETH to interact with their DApp.
- **Plug & play.** Designed with extensibility in mind, the any.sender service can be made to work with any smart contract.
- **No gas overhead.** any.sender is the only relayer with 0 gas overhead.

Advanced features:

- **Re-org safety.** We monitor transactions many blocks after they are mined, so even deep re-orgs won't shake us from ensuring your transaction gets confirmed.
- **Congestion safe.** any.sender tracks network gas prices and adjusts fees as needed. If you really need your transaction to be mined, even network congestion won't stop you.
- **Concurrent in-flight transactions.** Users can submit several transactions at a time, without the worry of previous transactions getting stuck.
- **Smart-contract enforced accountability.** Although any.sender's _raison d'etre_ is to never miss a transaction, we offer _accountable transactions_ such that if any.sender fails to deliver the promised quality of service, then it must issue compensation to the customer or get slashed.

## Try it out

We recommend trying any.sender on the Ropsten network and to get started we are happy to supply you with some Ropsten ETH via our [chatroom](https://t.me/anydotsender). There are three ways to start using any.sender:

- The [Client](./docs/client/) takes care of crafting the relay transaction and sending it up to any.sender. The example walkthrough shows how to wrap a contract to natively use any.sender when sending a transaction. It is the simplest and easiest way to use any.sender, but it does have a dependency on ethersjs. **We recommend using this client.**

- The [Core Client](./docs/coreClient/) is a light-weight wrapper around the API to take care of basic functionality of sending a transaction via any.sender. Use this client as a raw wrapper for the [API](./docs/API.md).

- The [Experimental Client](./docs/experimentalClient/) takes care of deploying and managing a wallet contract on behalf of the signer. It auto-deploys the wallet contract when the first transaction is issued & takes care of all replay protection. It currently supports our [MetaTx library](https://github.com/anydotcrypto/metatransactions/) and we plan to support Gnosis Safe.

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
   const relayReceipt = await anyUserWallet.any.sendTransaction({
     to: "<address>",
     data: "<data>",
   });
   const transactionReceipt = await relayReceipt.wait();
   ```

   #### Contract:

   ```typescript
   import { any } from "@any-sender/client";
   const userWallet = new ethers.Wallet("<priv key>", provider);
   const erc20 = new ethers.Contract("<address>", "<abi>", userWallet);

   const anyErc20 = any.sender(erc20);
   const relayReceipt = await anyErc20.transfer("<recipient>", 10);
   const transactionReceipt = await relayReceipt.wait();
   ```

For more details see the [client documentation and walkthrough](./docs/client/)

## Further reading & In-depth docs

- [API](./docs/API.md)
- [Dev tools](./docs/devTools)
- [Client library](./docs/client)
- [Core client library](./docs/coreClient)
- [Experimental client library](./docs/experimentalClient)
- [Payments](./docs/payments.md)
- [Contracts](https://github.com/PISAresearch/contracts.any.sender)
- [Accountability guarantees](./docs/guarantees.md)
- [Transaction inclusion](./docs/transactionInclusion.md)

## Addresses

|                               | Ropsten                                    | Mainnet                                    |
| ----------------------------- | ------------------------------------------ | ------------------------------------------ |
| **API**                       | https://api.anydot.dev/any.sender.ropsten  | https://api.anydot.dev/any.sender.mainnet  |
| **Receipt signer**            | 0xe41743Ca34762b84004D3ABe932443FC51D561D5 | 0x02111c619c5b7e2aa5c1f5e09815be264d925422 |
| **Relay contract**            | 0x9b4FA5A1D9f6812e2B56B36fBde62736Fa82c2a7 | 0x9b4FA5A1D9f6812e2B56B36fBde62736Fa82c2a7 |
| **Adjudicator contract**      | 0xAa517b16cAADc44b542c843AAfcaf274f6965016 | 0xAa517b16cAADc44b542c843AAfcaf274f6965016 |
| **Lockable deposit contract** | 0xc617c0Fb33B7B6413b60beaB1bA0979Ae3166f54 | 0xc617c0Fb33B7B6413b60beaB1bA0979Ae3166f54 |
