# any.sender
### Transactions made simple!

The **any.sender** service is a simple and efficient services for sending transactions to Ethereum. It offers an API that guarantees a transaction will be mined by a given deadline, so that users don't have to consider nonces and gas prices. The service is held accountable by a smart contract that trustlessly ensures that either the user transaction is mined before the deadline or compensation is paid out. 

**any.sender** endevours to save precious development time by solving all the edge cases of getting a transaction mined. You can focus on what makes your dapp great and feel secure that your transactions will be mined on time, every time.

## Features
* **Forget about gas prices.** Users just set a deadline and **any.sender** makes sure the transaction is mined.
* **No more nonce problems.** **any.sender** internally re-orders transactions to make sure that your transaction never gets stuck or orphaned
* **No more lost transactions.** The service carefully monitors the progress of transactions through the pending pool, ensuring that your transaction gets mined on time, every time.
* **Delegated fees and meta-transactions.** As a relayer **any.sender** allows Dapps to pay gas fees for their users, meaning that their customers no longer need ETH to interact with the Dapp.
* **Easily pluggable.** Designed with extensibility in mind the relay can be made to fit any smart contract.
* **Simple API.** Interact with **any.sender** over an HTTP REST api to get up and running in minutes.
* **Reorg safe.** We keep an eye on your transaction many blocks after it's been mined so that even deep re-orgs won't shake us.
* **Congestion safe.** **any.sender** tracks network gas prices and adjusts transactions to ensure that if you really need your transaction to be mined even network congestion won't stop you.
* **Accountable.** Although **any.sender**'s raison d'etre is to never miss a transaction, if it does happen an on-chain contract ensures that transaction sender is liable for compensation. We never expect this to happen but this contract financially aligns **any.sender** with its users ensuring that it's everyones interests to get the transaction mined.
* **High concurrency.** Since users no longer need to worry about nonces they can submit transactions at a time knowing that they wont be forced to queue behind each other.

## Contents
* API documentation
* Payments
* Guarantees
* Typescript/javascript client
* Examples