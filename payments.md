## Payments
any.sender has a pay-per-use model. Users pay up front for credit with the any.sender API. They are then charged for the gas consumed by each relayed transaction. Currently payments are only accepted in ETH by making a payment to the any.sender relay contract. 

### Depositing
To make a deposit use your favourite wallet to send funds to the any.sender contract. The balance API to check current credit, however when depositing up allow for 10 confirmations before balance is visible in the API.

```ts
// top up credit by 1 ETH using the fallback functionS
const topUpTransaction = await userWallet.sendTransaction({
    to: relayContractAddress,
    value: parseEther("1")
});

// wait for confirmations
await topUpTransaction.wait(20)

// check the balance
const client = new AnySenderClient(anySenderUrl, receiptSignerAddress);
const balance = await client.balance(userWallet.address);
console.log(balance.toString());
```

Funds can be deposited via the following methods:

#### Deposit
Calling the deposit function on the relay contract will assign the msg.sender of the transaction with the msg.value amount.

```ts
await relayContract.connect(userWallet).deposit({ value: parseEther("1") });
```

#### Fallback
Identical to the deposit function, calling the fallback will increase the credit of the msg.sender by the msg.value amount.

```ts
await userWallet.sendTransaction({ to: relayContractAddress, value: parseEther("1") });
```

#### Deposit For
The `depositFor` functions allows the delegation of any.sender credit. The `recipient` address will have their credit increased by the msg.value amount.

```ts
await relayContract.connect(userWallet).depositFor(recipientAddress, { value: parseEther("1") });
```

### Checking balance
Checking balance can be done by calling the /balance API. Note that 10 confirmations are required before the a new deposit will be recognised.
```ts
const client = new AnySenderClient(anySenderUrl, receiptSignerAddress);
const balance = await client.balance(userWallet.address);
```

### Pricing
Any.sender charges a 30% of the gas costs. Network gas costs are highly volatile, often rising and falling by 100s of percent. We dynamically follow these rises and dips, adjusting our gas prices to strike the right balance between low gas prices and mining in a timely manner. In this way we hope that, even taking in to account the fee markup, customers will overall save money by using any.sender.

## Calculating gas prices
The gas prices are calculated on-chain and emitted in an event so that the payment gateway can record how much gas was used in the transaction when it was mined, and at what price. The amount of ETH that was used can be totaled the outputs of the `RelayExecuted` event in the `Relay` contract.

// TODO:DOCS: link all references to contracts

## Locked pending transactions
Due to fluctuations in gas prices, any.sender cannot know ahead of time what the gas price of a transaction will be. In order to protect itself, it locks an amount of the users credit whilst a transaction is still in pending, and releases it again when the transaction is mined. The locked amount is larger than the expected charge to ensure that any.sender cannot be used for cheap during high gas price periods.