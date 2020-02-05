# API

The API has a single endpoint `/relay` which accepts a POST request with an application/json body that matches the following [schema](./relayTx.schema.json).

The body is referred to as a "Relay Transaction" and contains many of the same fields as a normal transaction. However there are some key differences:
1. A `gasPrice` and `nonce` need not be set, instead a `deadlineBlockNumber` is all that is required.
2. A `refund` and `relayContractAddress` must be provided to ensure the third party relayer remains accountable.
3. Value cannot be set.

The current endpoint can be found at 

[##TODO## Examples]
[##TODO## Add all the current restrictions on value - naming beta where relevant]

## Relay Transaction
Request body. All fields are mandatory.
```
{
  "from": string (address)
  "to": string (address)
  "gas": number (uint256)
  "deadlineBlockNumber": number (uint256)
  "data": string (bytes)
  "refund": string (hex number uint256) // number as a string as refund can be larger than js max integer
  "relayContractAddress": string (address),
  "signature": string (bytes)
}
```




### from (address bytes20)
The ethereum address of the user authorising this relay transaction. This address must have deposited Eth to our payments contract before using the relay. See [payments](./payments.md). This is also the address of the authority signing this transaction.

### to (address bytes20)
The address the transaction is directed to. This is the same field, and contains the same value, as the `to` field in a standard Ethereum transaction. Unlike a normal Ethereum transaction this field cannot be empty as any.sender cannot currently be used directy for contract creation.


### gas (uint256)
The gas limit to provided to the transaction for execution. This is the same field, and contains the same value, as the `gas` field in a standard Ethereum transaction. BETA: current maximum is 3000000 gas.

### deadlineBlockNumber (uint256)
The block by which this transaction must be mined. For the current Beta version this must be at least 600 blocks ahead of the current block. This allows any.sender a large window to mine the transaction, although it will endeavour to get the transaction mined long before this deadline. As confidence in the abilities of any.sender increase this minimum deadline limit will be lowered.

### data (hex string 20 bytes)
The abi encoded call data. This is the same field, and contains the same data, as the `data` field in a standard Ethereum transaction.

### refund (string)
The value of the compensation that the user will be owed if any.sender fails to mine the transaction before the `deadlineBlockNumber`. Financial accountability is at the core of any.sender's design. A further write up on how to trustlessly receive the compensation will be available soon.

### relayContractAddress (address)
The address of the relay contract that will be used to relay this transaction. This is a necessary for proving accountable behaviour on-chain. Populate with either:

Ropsten: 0xE25ec6cB37b1a37D8383891BC5DFd627c6Cd66C8

### signature (bytes)
A signature made by the `from` authority over the full relay transaction data.

