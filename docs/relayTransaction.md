# Relay Transactions
A relay transaction has a structure very similar to a normal transaction, the main difference is that `gasPrice` and `nonce` have been removed and replaced with `relayContractAddress`, `deadlineBlockNumber` and `compensation`.
The `value` field has also been removed, in order to make ETH transfers with any.sender the user will have to use a smart contract wallet.

**Note**: Some fields are marked **BETA** to signify they currently have limits. It is expected that these will be removed post beta phase.

## Fields
A relay transaction can be validated against this [json schema](./relayTx.schema.json).

```
{
  "from": string (address)
  "to": string (address)
  "gas": number (uint256)
  "deadlineBlockNumber": number (uint256)
  "data": string (bytes)
  "compensation": string (number uint256) // number as a string - stringified decimal
  "relayContractAddress": string (address),
  "signature": string (bytes)
}
```

### from (address bytes20)
The ethereum address of the user authorising this relay transaction. This address must have deposited Eth to our payments contract before using the relay. See [payments](./payments.md). This is also the address of the authority signing this transaction.

### to (address bytes20)
The address the transaction is directed to. This is the same field, and contains the same value, as the `to` field in a standard Ethereum transaction. Unlike a normal Ethereum transaction this field cannot be empty as any.sender cannot currently be used directy for contract creation.

### gas (uint256)
The gas limit to provided to the transaction for execution. This is the same field, and contains the same value, as the `gas` field in a standard Ethereum transaction. 

**BETA**: Max gas is 3000000.

### deadlineBlockNumber (uint256)
The block by which this transaction must be mined. This allows any.sender a large window to mine the transaction, although it will endeavour to get the transaction mined long before this deadline. As confidence in the abilities of any.sender increase this minimum deadline limit will be lowered.

**BETA**: Minimum deadline must be 400 greater than current block

### data (hex string bytes)
The abi encoded call data. This is the same field, and contains the same data, as the `data` field in a standard Ethereum transaction.

**BETA**: Max data length is 3000 bytes

### compensation (string)
The value of the compensation that the user will be owed if any.sender fails to mine the transaction before the `deadlineBlockNumber`. Financial accountability is at the core of any.sender's design. A further write up on how to trustlessly receive the compensation will be available soon.

**BETA**: Max compensation is 0.05 ETH

### relayContractAddress (address)
The address of the relay contract that will be used to relay this transaction. This is a necessary for proving accountable behaviour on-chain.

### signature (bytes)
A signature made by the `from` authority over the full relay transaction data, using this [digest](https://github.com/PISAresearch/contracts.any.sender/blob/e7d9cf8c26bdcae67e39f464b4a102a8572ff468/versions/0.2.1/contracts/core/RelayTxStruct.sol#L23).

