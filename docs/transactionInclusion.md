# Transaction inclusion

Managing a transaction from the point it's broadcast until the point that it's mined isn't as simple as it sounds. Transactions compete to be mined in a volatile gas market making it hard to predict when a transaction will be mined. Transactions from an account must be ordered by nonce, which adds a further complication as transactions can effectively only be mined as quickly as the lowest price transaction before them in the queue.

You can find more detail about the problems associated with managing transactions at the start of [this](https://docs.google.com/presentation/d/1gWrEjJICL23583pqKIsKg9HxIFUo6j_AvexrM1GPHvw/edit#slide=id.g703d72a88b_0_0) presentation.

To solve these problems any.sender uses a combination of transaction replacements and multiple accounts to dynamically adjust fees to keep up with the market whilst also allowing for a flexible, concurrent system. This is what allows any.sender to guarantee that a transaction is never held up by other transactions, and that its price can always be adjusted to stay relevant to the current market.

## Gas market movement

#### Problem

The moving target of the gas market presents a unique challenge to Ethereum users and developers. Transactions are broadcast with a gas price that is relevant to the market at the time of broadcast. But since transactions take some time to mine, and the gas market continues to move after a transaction is broadcast, transaction prices can quickly become irrelevant to the market prices. Transactions, that should have been mined in minutes due to the estimate at the time of broadcast, can take days in practice.

#### Solution - Transaction replacement

Ethereum nodes allow the transaction at a given nonce to be replaced with another, as long as the gas price is increased by a certain percentage. Nodes can set this increase individually but the defaults are 12.5% for [Parity](https://github.com/openethereum/openethereum/blob/9da1304539d4182981673711fe7a8bcc20fbbcab/miner/src/pool/scoring.rs#L38) and 10% for [Geth](https://github.com/ethereum/go-ethereum/wiki/Command-Line-Options). This means that if the gas market increases in price we can replace a transaction on the network with one of a higher price so that it'll still be mined in reasonable time.

## Nonce ordering

#### Problem

The gas market movement problem is further exacerbated by concurrency, or transactions broadcast in quick succession. There is a consensus rule that transactions from a single account can only be mined in consecutive nonce order. Thus a miner cannot mine higher nonce transactions, even if they have a higher price, before the lower nonce transactions. And a miner will not mine any transactions unless they have a price that is competitive in the current gas market. Therefore gas market movement, causing the gas price estimate on a low nonce transaction to not be enough, will mean that that single bad estimate will hold up all transactions with a higher nonce.

#### Solution - Transaction replacement + multiple sending accounts

Transaction replacement means that we can replace the fields of a transaction, except `nonce`, which effectively allows us to reorder transactions as long as we we bump their prices. So if an account has recently broadcast some low priority items, with low gas price and they are still in pending, we can still use this same account to broadcast a new high priority transaction by replacing the lowest nonce transaction. Given this we can ensure that highest priorities transactions are always front of the queue, and are never held up by low gas prices.

However transaction replacement can add additional cost. In the worst case moving a transaction to the front of the queue may require all transactions of a lower nonce to need replacement - increasing their fee. It may be undesirable to increase the fees of low priority items which are not time sensitive, so in some cases any.sender sends transactions from different accounts.

Separating transactions onto different accounts, and in particular grouping similar priority transactions on the same account allows any.sender to send concurrent transactions without requiring replacements, however it does come with a management overhead. Each of the sending accounts must be kept topped up with ETH to pay for gas, which itself requires transactions. For this reason any.sender keeps only a finite pool of accounts rather than sending every transaction on a new account.

A combination of multiple accounts with replacements within each account ensures that priority ordering whilst keeping gas costs low.
