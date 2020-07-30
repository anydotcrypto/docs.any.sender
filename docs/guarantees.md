# The any.sender quality of service guarantee

This section is only applicable for **accountable transactions**.

See the [contracts](https://github.com/PISAresearch/contracts.any.sender) for exact functionality.

The any.sender service promises to get accountable transactions mined before a user-specified `deadline`.

Four smart contracts enforce the promise:

- `Relay`: Executes the accountable transaction
- `LockableDeposit`: The any.sender operator's locked up security deposit.
- `Adjudicator`: Evaluates on-chain evidence and the signed receipt to determine if the transaction was relayed by the promised block deadline.
- `DataRegistry`: Temporarily stores timestamps of all accountable transactions

At a high level, the any.sender service sends the customer an accountable transaction receipt signed by `receiptSigner` and there are two outcomes after the job was accepted:

**Accountable transaction is recorded.** All accountable transactions from the any.sender service is processed by the the `Relay` smart contract. This contract executes the accountable transaction (e.g. casting a vote or transfering an ERC20 token) before recording a block timestamp for the accountable transaction in the `DataRegistry` contract.

**Accountable transaction is not recorded.** If the any.sender service fails to relay the transaction to the network, then the `DataRegistry` contract will not have a corresponding entry.

At any time, even if the quality of service is delivered, the user can submit a signed receipt to the `Adjudicator` contract. It is up to the Adjudicator to evaluate whether the any.sender service delivered on its promised quality of service.

**Submitting the signed receipt to the Adjudicator.** Given a signed receipt, the `Adjudicator` look ups the corresponding entry in the `DataRegistry` contract.

If there is an entry for the accountable transaction, then it will check the entry's timestamp with the receipt's deadline. If there is no entry (or the data registry's timestamp is bad), then the `Adjudicator` triggers a compensation time period in which the any.sender service must provide compensation to the user of value `compensation` specified in the signed receipt. No further action is taken if the any.sender service operator pays the compensation in time. However, if after the compensation time period the user has still not received their compensation, then the security deposit held in `LockableDeposit` is slashed.

It is expected that any.sender will never have to pay out compensation, except for unpredicted relayer bugs. However the compensation option is available to ensure the any.sender's service is financially aligned with its customers. It is further expected the large deposit in `LockableDeposit` will never be slashed, since it is much cheaper for any.sender to compensate the user than to be fined & lose its deposit.
