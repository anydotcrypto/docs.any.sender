# Queueing strategy

The moving target of the gas market presents a unique challenge to Ethereum users and developers. Gas prices estimates can quickly become invalidated as the gas market moves. Transactions, that should have been mined in minutes due to the estimate at the time of broadcast, can take days in practice. 

This problem is further exacerbated by concurrency, or transactions broadcast in quick succession. Since transactions from a single account can only be mined in consecutive nonce order, a transaction with a bad price estimate broadcast at a lower nonce will hold up all transactions with a higher nonce.

The combination of multiple keys and fee replacements allows any.sender to dynamically adjust fees to keep up with the market, whilst also allowing for a flexible, concurrent system. This is what allows any.sender to guarantee that a transaction is never held up by other transactions, and that its price can always be adjusted to stay relevant to the current market.

### Transaction replacement
Transaction replacement is the major tool at our disposal. Ethereum nodes allow the transaction at a given nonce to be replaced with another, as long as the gas price is increased by a certain percentage. Nodes can set this increase individually but the defaults are 12.5% for [Parity](https://github.com/openethereum/openethereum/blob/9da1304539d4182981673711fe7a8bcc20fbbcab/miner/src/pool/scoring.rs#L38) and 10% for [Geth](https://github.com/ethereum/go-ethereum/wiki/Command-Line-Options). This means that if the gas market increases in price we can replace a transaction on the network with one of a higher price so that it'll still be mined in reasonable time.

Replacement also allows us to reorder transactions, as long as we we bump their prices. So if an account has recently broadcast some low priority items, with low gas price and they are still in pending, we can still use this account to broadcast the transaction a new high priority item by replacing the lowest nonce transaction. Given this we can ensure that highest priorities transactions are always front of the queue, and are never held up by low gas prices.

### Multiple sending accounts

Fee replacement is a useful tool, but it can add additional cost. In the worst case moving a transaction to the front of the queue may require all transactions of a lower nonce to need replacement - increasing their fee. It may be undesirable to increase the fees of low priority items which are not time sensitive, so in some cases any.sender sends transactions from different accounts.

Separating transactions onto different accounts, and in particular grouping similar priority transactions on the same key allows any.sender to send concurrent transactions without requiring replacements, however it does come with a management overhead. Each of the sending accounts must be kept topped up with ETH to pay for gas, which itself requires transactions. For this reason any.sender keeps a finite pool of accounts rather than sending every transaction on a new key.