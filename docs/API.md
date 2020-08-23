# API

See [Addresses](../README.md#addresses) for instance and contract addresses.

## Methods

The REST API has two endpoints: /relay and /balance.

### Relay

Relays the supplied transaction, returns a signed receipt that is signed by any.sender.

| Relay                |                                            |
| -------------------- | ------------------------------------------ |
| Endpoint             | /relay                                     |
| Method               | POST                                       |
| Content-Type         | application/json                           |
| Request body format  | [Relay transaction](./relayTransaction.md) |
| Response body format | [Relay receipt](./relayReceipt.md)         |

#### Ordering

any.sender guarantees that transactions from the same address will be mined in the order in which it receives them. Therefore, if you need to guarantee a specific order for transactions, then you should send and receive them serially: only send a second transaction once you've received an acknowledgment for the first from the any.sender API.

#### Error codes

The API can return the following HTTP status codes:

| Code | Return Messsage                               | Description                                                                                                                                                                                 |
| ---- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 200  | Success                                       | All good!                                                                                                                                                                                   |
| 400  | Data validation error                         | Unable to validate the relay transaction. Please check the values sent.                                                                                                                     |
| 402  | Insufficient funds                            | You need to top up your account. Please check our [payment documentation](./payments.md).                                                                                                   |
| 409  | Transaction already sent                      | We have sent the same transaction recently for you. If you want to send the same transaction twice in a short period of time, then increment the gasLimit field by 1.                       |
| 429  | Too many requests.                            | Our global rate limit has been reached.                                                                                                                                                     |
| 500  | Internal server error.                        | An unexpected error occurred server-side. Please contact us.                                                                                                                                |
| 502  | Internal server error.                        | An unexpected error occurred server-side. Please contact us.                                                                                                                                |
| 503  | Service initialising, please try again later. | Our relayer is starting up. Please wait.                                                                                                                                                    |
| 503  | No available sender.                          | Configuration error for any.sender. Please contact us.                                                                                                                                      |
| 503  | Max pending gas reached.                      | Our relayer cannot accept any more jobs as we are trying to broadcast at least 120 million gas (12 blocks) of transactions. We plan to increase this limit overtime, but try again shortly. |

### Balance

Returns the current any.sender balance of an address. This is the amount of funds reserved for this address to pay for gas.

| Balance              |                              |
| -------------------- | ---------------------------- |
| Endpoint             | /balance/\<address\>         |
| Method               | GET                          |
| Content-Type         | application/json             |
| Request body format  | N/A                          |
| Response body format | Balance response (see below) |

#### Error codes

The API can return the following HTTP status codes:

| Code | Return Messsage                               | Description                                                                      |
| ---- | --------------------------------------------- | -------------------------------------------------------------------------------- |
| 200  | Success                                       | All good!                                                                        |
| 400  | Data validation error                         | Unable to validate the address. Please check the address is formatted correctly. |
| 429  | Too many requests.                            | Our global rate limit has been reached.                                          |
| 500  | Internal server error.                        | An unexpected error occurred server-side. Please contact us.                     |
| 502  | Internal server error.                        | An unexpected error occurred server-side. Please contact us.                     |
| 503  | Service initialising, please try again later. | Our relayer is starting up. Please wait.                                         |

#### Balance response format

```json
{
  "balance": "string"
}
```

### Status

The status endpoint returns information about the current status of a relay transaction. Since any.sender slowly bumps transaction fees over time it will need to broadcast new transactions, with new transaction hashes. Use this API to keep track of these changing transaction hashes. If you have access to an Ethereum JSON RPC you can then use these hashes to fetch receipts, which will tell you if the transaction has been mined. It is reccommended that you uses batch requests (these are supported by the [Ethereum JSON RPC](https://eth.wiki/json-rpc/API)) to avoid making too many RPC calls. The broadcasts are ordered newests to oldest.

| Balance              |                                        |
| -------------------- | -------------------------------------- |
| Endpoint             | /status/\<relayTxId\>                  |
| Method               | GET                                    |
| Content-Type         | application/json                       |
| Request body format  | N/A                                    |
| Response body format | [Status response](./statusResponse.md) |

#### Error codes

The `status` endpoint can return the following HTTP status codes:

| Code | Return Messsage                               | Description                                                           |
| ---- | --------------------------------------------- | --------------------------------------------------------------------- |
| 200  | Success                                       | All good!                                                             |
| 400  | Data validation error                         | Unable to validate the relayTxId - this must be a 32 byte hex string. |
| 429  | Too many requests.                            | Our global rate limit has been reached.                               |
| 500  | Internal server error.                        | An unexpected error occurred server-side. Please contact us.          |
| 502  | Internal server error.                        | An unexpected error occurred server-side. Please contact us.          |
| 503  | Service initialising, please try again later. | Our relayer is starting up. Please wait.                              |
