## Payments

Any.sender has a pay per use model. Users are charged for the amount of gas consumed as well as a fee taken by the any.sender service. Currently payments are only accepted in ETH by making a payment to the any.sender payment deposit contract. To make a payment simply send funds to the fallback function of the contract, the sending account will then be credited with an equivalent amount for use at the any.sender service

### Current network contract addresses

Ropsten: 0xE25ec6cB37b1a37D8383891BC5DFd627c6Cd66C8

### Checking balance
There is currently no way to check current balance, this is a feature we will be adding shortly. New deposits must wait have 100 confirmations before the sending account is creditted.

### Pricing
Any.sender charges a 30% markup on gas costs. Network gas costs are highly volatile, often rising and falling by 100s of percent. We dynamically follow these rises and dips, adjusting our gas prices to strike the right balance between low gas prices and mining in a timely manner. In this way we hope that, even taking in to account the fee markup, customers will overall save money by using any.sender.

## Calculating gas prices
The gas prices are calculated on-chain and emitted in an event so that the payment gateway can record how much gas was used in the transaction when it was mined, and at what price. Used eth can be totaled by adding the outputs of the RelayExcuted event in the Relay contract.

## Locked pending transactions
Due to fluctuations in gas prices any.sender cannot know ahead of time what the gas price of a transaction will be. To protect itself it locks an amount of the users credit whilst a transaction is still in pending, and releases it again when the transaction is mined. The locked amount is larger than the expected charge to ensure that any.sender cannot be used for cheap during high gas price periods.
500000000000000000
117348612185338454