## Payments

any.sender has a pay-per-use model. Users pay up front for credit with the any.sender API. They are then charged for the gas consumed by each relayed transaction. Currently payments are only accepted in ETH by making a payment to the any.sender `Relay` contract.

### Depositing

The easiest way to make a deposit is to send funds to the any.sender contract address using MetaMask or any wallet of your choice. The fallback function of the contract will assign the balance to the sender using `msg.sender`. The balance API allows to check current credit, that becomes available after 10 confirmations (typically 2-3 minutes).

Here is a code example using ethers.js:

```ts
// top up credit by 1 ETH using the fallback function
const topUpTransaction = await userWallet.sendTransaction({
  to: relayContractAddress,
  value: parseEther("1"),
});

// wait for confirmations
await topUpTransaction.wait(20);

// check the balance
const client = new AnyDotSenderCoreClient({
  apiUrl: anySenderUrl,
  receiptSignerAddress,
});
const balance = await client.balance(userWallet.address);
console.log(balance.toString());
```

#### Delegated deposit

The `depositFor` functions allows the delegation of any.sender credit. The `recipient` address will have their credit increased by the `msg.value` amount.

```ts
await relayContract
  .connect(userWallet)
  .depositFor(recipientAddress, { value: parseEther("1") });
```

### Checking balance

Checking balance can be done by calling the `/balance` API. Note that 10 confirmations are required before the a new deposit will be recognised.

```ts
const client = new AnyDotSenderCoreClient({
  apiUrl: anySenderUrl,
  receiptSignerAddress,
});
const balance = await client.balance(userWallet.address);
```

### Pricing

Any.sender charges a 20% of the gas costs. Network gas costs are highly volatile, often rising and falling by 100s of percent. We dynamically follow these rises and dips, adjusting our gas prices to strike the right balance between low gas prices and mining in a timely manner. In this way we hope that, even taking in to account the fee markup, customers will overall save money by using any.sender.

## Calculating gas prices

The gas prices are calculated on-chain and emitted in an event so that the payment gateway can record how much gas was used in the transaction when it was mined, and at what price. The amount of ETH that was used can be obtained by adding the outputs of the `RelayExecuted` event in the `Relay` contract. See the [contracts](https://github.com/PISAresearch/contracts.any.sender) for more details.

## Locked balance for pending transactions

Due to fluctuations in gas prices, any.sender cannot know ahead of time what the gas price of a transaction will be. In order to protect itself, it locks an amount of the user's credit whilst a transaction is still pending, and releases it again when the transaction is mined. The locked amount is larger than the expected charge to ensure that any.sender cannot be used for cheap during high gas price periods.

Note that any.sender will look after the transaction for a number of blocks _after_ it has been mined; locked funds will be available only after the transaction has enough confirmations.
