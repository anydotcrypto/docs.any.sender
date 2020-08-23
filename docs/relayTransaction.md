# Relay Transactions

any.sender has two types of relay transactions:

- **Direct transaction.** Best effort delivery and the relay transaction is sent directly to the target contract. It incurs 0 gas overhead.
- **Accountable transaction.** Guaranteed delivery by a block deadline, but the transaction is sent via a relay contract. It incurs a 45k gas overhead.

We recommend the **Direct Transaction** approach as there is no gas overhead when using the any.sender service and in the current implementation the _best effort delivery_ is just as good as the _guaranteed delivery_. In both cases, any.sender will continuously bump the fee until the transaction is confirmed.

Both relay transactions have a very similar structure to a normal transaction. The main difference is that `gasPrice`, `value` and `nonce` have been removed. Accountable transactions have additional fields including `compensation`, `relayContractAddress`, and `deadline`. To preserve `msg.sender` and ETH transfers, we recommend users send transactions via a smart contract wallet.

**Note**: Some fields are marked **BETA** to signify they currently have limits. It is expected that these will be removed post beta phase.

## Direct Transaction

### Fields

A direct transaction is validated against this [json schema](./directTransaction.schema.json).

```
{
  "type": "direct",
  "chainId": number,
  "from": string (address)
  "to": string (address)
  "gasLimit": number (uint256)
  "data": string (bytes)
  "signature": string (bytes)
}
```

### type (string: "direct")

A string with the value "direct", specifies that this is an direct tx.

### chainId (uint256)

Currently supports Ropsten = 3 and Mainnet = 1.

### from (address bytes20)

The ethereum address of the user authorising this relay transaction. This address must have deposited Eth to our payments contract before using the relay. See [payments](./payments.md). This is also the address of the authority signing this transaction.

### to (address bytes20)

The address the transaction is directed to. This is the same field, and contains the same value, as the `to` field in a standard Ethereum transaction. Unlike a normal Ethereum transaction this field cannot be empty as any.sender cannot currently be used directy for contract creation.

### gasLimit (uint256)

The gas limit to provided to the transaction for execution. This is the same field, and contains the same value, as the `gasLimit` field in a standard Ethereum transaction.

**BETA**: Max gasLimit is 3000000.

### data (hex string bytes)

The abi encoded call data. This is the same field, and contains the same data, as the `data` field in a standard Ethereum transaction.

**BETA**: Max data length is 3000 bytes

### signature (bytes)

A signature made by the `from` authority over the full relay transaction data, using this [digest](https://github.com/PISAresearch/contracts.any.sender/blob/b13be3dff24989fd24783ae3d79104124a38b2fa/versions/0.3.0/contracts/core/RelayTxStruct.sol#L23).

## Accountable Transactions

### Fields

An accountable transaction is validated against this [json schema](./accountableTransaction.schema.json).

```
{
  "type": "accountable",
  "chainId": number,
  "from": string (address)
  "to": string (address)
  "gasLimit": number (uint256)
  "deadline": number (uint256) or 0 (uint256)
  "data": string (bytes)
  "compensation": string (number uint256) // number as a string - stringified base 10
  "relayContractAddress": string (address),
  "signature": string (bytes)
}
```

### type (string: "accountable")

A string with the value "accountable", specifies that this is an accountable tx.

### chainId (uint256)

Currently supports Ropsten = 3 and Mainnet = 1.

### from (address bytes20)

The ethereum address of the user authorising this relay transaction. This address must have deposited Eth to our payments contract before using the relay. See [payments](./payments.md). This is also the address of the authority signing this transaction.

### to (address bytes20)

The address the transaction is directed to. This is the same field, and contains the same value, as the `to` field in a standard Ethereum transaction. Unlike a normal Ethereum transaction this field cannot be empty as any.sender cannot currently be used directy for contract creation.

### gasLimit (uint256)

The gas limit to provided to the transaction for execution. This is the same field, and contains the same value, as the `gasLimit` field in a standard Ethereum transaction.

**BETA**: Max gasLimit is 3000000.

### deadline (uint256)

The block by which this transaction must be mined. This allows any.sender a large window to mine the transaction, although it will endeavour to get the transaction mined long before this deadline. As confidence in the abilities of any.sender increase this minimum deadline limit will be lowered.

The deadline can optionally be set to 0. In this case the any.sender API will fill in a deadline (currentBlock + 400) and populate it in the returned receipt. If the hash of the relay transaction is being used to observe whether the transaction has been mined the hash should be calculated with the deadline populated from any.sender, as this is the transaction that will be submitted.

**BETA**: The deadline must current head number + 400. There is a tolerance of 20 blocks above and below 400 to allow for chain views being out of sync.

### data (hex string bytes)

The abi encoded call data. This is the same field, and contains the same data, as the `data` field in a standard Ethereum transaction.

**BETA**: Max data length is 3000 bytes

### compensation (string)

The value of the compensation (wei) that the user will be owed if any.sender fails to mine the transaction before the `deadline`. Financial accountability is at the core of any.sender's design, see [guarantees](./guarantees.md) for more details.

**BETA**: Max compensation is 0.05 ETH

### relayContractAddress (address)

The address of the relay contract that will be used to relay this transaction. This is a necessary for proving accountable behaviour on-chain.

### signature (bytes)

A signature made by the `from` authority over the full relay transaction data, using this [digest](https://github.com/PISAresearch/contracts.any.sender/blob/b13be3dff24989fd24783ae3d79104124a38b2fa/versions/0.3.0/contracts/core/RelayTxStruct.sol#L23).
