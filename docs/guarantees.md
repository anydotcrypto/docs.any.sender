# The any.sender quality of service guarantee

See the [contracts](https://github.com/PISAresearch/contracts.any.sender) for exact functionality

The any.sender service promises to relay transactions and get them mined by a user-specified `deadlineBlockNumber`.

Four smart contracts enforce the promise: 
- `Relay`: Executes the relay transaction 
- `LockableDeposit`: The any.sender operator's locked up security deposit. 
- `RefundAdjudicator`: Evaluates on-chain evidence and the signed receipt to determine if the transaction was relayed by the promised block deadline.
- `DataRegistry`: Temporarily stores timestamps of all relay transactions 

At a high level, the customer will have a relay receipt signed by the `receiptSigner` authority (e.g. the any.sender service operator). There are two outcomes after the job was accepted: 

***Relay transaction is minted.***  When the any.sender service relays a transaction to the network, it is first processed by the `Relay` smart contract. This contract executes the relay transaction job (e.g. casting a vote) before recording a block timestamp for the relay transaction in the `DataRegistry` contract. As an additional bonus, it will also refund the relayer the cost of the job for easy wallet management. 

***Relay transaction is not minted.*** If the any.sender service fails to relay the transaction to the network, then it did not provide the promised quality of service and there will be no record of the job in the `DataRegistry` contract. 

At any time, even if the relay transaction is minted, the user can try to submit a signed receipt to the the user can submit  `RefundAdjudicator` contract. It is up to the Refund Adjudicator to evaluate whether the any.sender service delivered on its promised quality of service. 

***Submitting evidence to the Refund Adjudicator.*** Given a signed receipt, the `Refund Adjudicator` will look up the corresponding entry in the `DataRegistry` contract. If there is an entry for the relay transaction, then it will check the entry's timestamp with the receipt's deadline. If there is no entry (or the data registry's timestamp is bad), then the `RefundAdjudicator` triggers a compensation time period in which the any.sender service must provide compensation to the user of value `refund` specified in the signed receipt. Again there are two outcomes, if the any.sender service operator pays the compensation in time, then no further action is taken. However, if after the compensation time period the user has still not received their refund, then the security deposit held in `LockableDeposit` is slashed.

It is expected that any.sender will never have to pay out compensation, except for unpredicted relayer bugs. However the compensation option is available to ensure the any.sender's service is financially aligned with its customers. It is further expected that the large deposit in `LockableDeposit` will never be slashed, since it would be much cheaper for any.sender to compensate the user than to lose its deposit.
