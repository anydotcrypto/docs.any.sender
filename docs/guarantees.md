# Guarantees

See the [contracts](https://github.com/PISAresearch/contracts.any.sender) for exact functionality

The any.sender service offers strong guarantees that a relay transaction will be mined before the specified `deadlineBlockNumber`. Three contracts exist to ensure that this is the case: the `RefundAdjudicator`, the `DataRegistry` and the `LockableDeposit`.

When a transaction is relayed via the any.sender relay contract, an entry is added to the `DataRegistry` contract. Thus, if a relay transaction is not relayed then there will be no corresponding entry in the `DataRegistry`. When the user requests a transaction to be relayed, any.sender responds by signing the transaction with a `receiptSigner` authority. If the any.sender service signs a receipt, but does not relay the transaction before the deadline, then the user can submit the receipt to the `RefundAdjudicator` which checks the signature and looks for a corresponding entry in the `DataRegistry`.

If there is no entry in the `DataRegisty`, then the any.sender service has failed. This triggers a compensation time period within which the any.sender service must provide compensation to the user to the value of the `refund` amount specified in the relay transaction. If the service pays the compensation then no further action is taken. However, if after the compensation time period the user has still not been paid, then the large one time deposit - held in the `LockableDeposit` contract - will be slashed.

It is expected that any.sender will never have to pay out compensation, except for unpredicted relayer bugs. However the compensation is there to ensure that any.sender's incentives remain financially aligned with its customers. It is further expected that the large deposit in `LockableDeposit` will never be slashed, since it would be much cheaper for any.sender to compensate the user than to lose its deposit.
