# any.sender
### Transactions made simple!

The **any.sender** service is a simple and efficient way of sending transactions to Ethereum. Its API guarantees a transaction will be mined by a given deadline, so that users don't have to battle with nonces and gas prices. The service is held accountable by a smart contract that trustlessly ensures that either the user transaction is mined before the deadline or compensation is paid out.

**any.sender** endeavours to save precious development time by solving all the edge cases of getting a transaction mined. You can focus on what makes your dapp great and feel secure that your transactions will be mined on time, every time.

## Features
* **Forget about gas prices.** Users just set a deadline and **any.sender** makes sure the transaction is mined.
* **No more nonce problems.** **any.sender** internally re-orders transactions to make sure that your transaction never gets stuck or orphaned
* **No more lost transactions.** The service carefully monitors the progress of transactions through the pending pool, ensuring that your transaction gets mined on time, every time.
* **Delegated fees and meta-transactions.** As a relayer **any.sender** allows Dapps to pay gas fees for their users, meaning that their customers no longer need ETH to interact with the Dapp.
* **Easily pluggable.** Designed with extensibility in mind, the relay can be made to fit any smart contract.
* **Simple API.** Interact with **any.sender** over an HTTP REST api to get up and running in minutes.
* **Re-org safe.** We keep an eye on your transaction many blocks after it's been mined so that even deep re-orgs won't shake us.
* **Congestion safe.** **any.sender** tracks network gas prices and adjusts transactions to ensure that if you really need your transaction to be mined even network congestion won't stop you.
<<<<<<< HEAD
* **Accountable.** Although **any.sender**'s raison d'etre is to never miss a transaction, if it does happen an on-chain contract ensures that the transaction sender is liable for compensation. We never expect this to happen but this contract financially aligns **any.sender** with its users ensuring that it's everyone's interests to get the transaction mined.
* **High concurrency.** Since users no longer need to worry about nonces they can submit transactions at a time knowing that they won't be forced to queue behind each other.
=======
* **Accountable.** Although **any.sender**'s *raison d'etre* is to never miss a transaction, if it does happen an on-chain contract ensures that transaction sender is liable for compensation. We never expect this to happen but this contract financially aligns **any.sender** with its users ensuring that it's everyones interests to get the transaction mined.
* **High concurrency.** Users can submit many transactions at a time, without having to worry about previous transactions getting stuck. **any.sender** manages a pool of relayers, using multiple wallets in order to make sure that all transactions get confirmed smoothly.
>>>>>>> 168532d13e278f3df24226c9064a7c51d3e229a5

## Contents
* API
* Payments
* Guarantees
* Typescript/javascript client
* Examples


## Getting started
1. Install the client lib
```
npm i @any-sender/client
```

2. Use your favourite wallet to top up balance with any.sender. Sending funds directly to our contract address will add equivalent balance to the sender's address. [TODO: see payments for more details] [TODO: view balance]

3. Start relaying!
```typescript
// set up the any sender client
const anySenderUrl = `http://${testConfig.hostName}:${testConfig.hostPort}`;
const relayContractAddress = "TODO";
const receiptSignerAddress = "TODO";
const userWallet = new ethers.Wallet("<to fill>");
const provider = new ethers.providers.JsonRpcProvider("<to fill>");
const echoContractAddress = "TODO";
const client = new AnySenderClient(anySenderUrl, relayContractAddress, receiptSignerAddress);
console.log("any.sender client set up.");

// create a relay transaction to the echo contract
// the echo contract just echos any data you send to it
const deadlineBlockNumber = (await provider.getBlockNumber()) + 600;
const relayTx = {
    from: userWallet.address,
    to: echoContractAddress,
    gas: 100000,
    deadlineBlockNumber,
    data: "0x",
    refund: parseEther("0.1").toString(),
    relayContractAddress
};
const id = AnySenderClient.relayTxId(relayTx);
const signature = await userWallet.signMessage(ethers.utils.arrayify(id));
console.log("Transaction formed.");

// send the relay tx. The server returns a signed receipt that can be used to prove that
// the any.sender was hired.
const signedReceipt = await client.relay({ ...relayTx, signature });
console.log("Relay tx sent and signed receipt received.");

// and that's it, just sit back and wait for the transaction to be mined
const echoTopics = ["", ""];
await new Promise((resolve, reject) => {
    provider.once({ address: echoContractAddress, topics: echoTopics }, resolve);
});
console.log("Transaction mined. (⌐■_■) Pretty cool, I guess.");
```
