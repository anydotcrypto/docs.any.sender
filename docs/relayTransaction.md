# Relay Transactions
A relay transaction has a structure very similar to a normal transaction, the main difference is that `gasPrice` and `nonce` have been removed and replaced with `relayContractAddress`, `deadline` and `compensation`.
The `value` field has also been removed, in order to make ETH transfers with any.sender the user will have to use a smart contract wallet.

**Note**: Some fields are marked **BETA** to signify they currently have limits. It is expected that these will be removed post beta phase.

## Fields
A relay transaction can be validated against this [json schema](./relayTx.schema.json).

```
{
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
A signature made by the `from` authority over the full relay transaction data, using this [digest](https://github.com/PISAresearch/contracts.any.sender/blob/e7d9cf8c26bdcae67e39f464b4a102a8572ff468/versions/0.2.1/contracts/core/RelayTxStruct.sol#L23).

