# API

See [Addresses](./addresses.md) for instance and contract addresses.

## Methods

The REST API has two endpoints: /relay and /balance.

### Relay

Relays the supplied transaction, returns a signed receipt that [guarantees](./guarantees.md) transaction submission.

| Relay                |                                            |
| -------------------- | ------------------------------------------ |
| Endpoint             | /relay                                     |
| Method               | POST                                       |
| Content-Type         | application/json                           |
| Request body format  | [Relay transaction](./relayTransaction.md) |
| Response body format | [Relay receipt](./relayReceipt.md)         |

#### Ordering

any.sender guarantees that transactions from the same address will be mined in the order in which it receives them. Therefore, if you need to guarantee a specific order for transactions, then you should send and receive them serially. Only send a second transaction once you've received an acknowledgment for the first from the any.sender API.

#### Error codes

In most cases, you should expect the 200 OK response from any.sender that the job was accepted. However, there is a range of potential error codes that can be returned if the job is malformed or if there is a server-side issue.

| Code | Return Messsage                               | Description                                                                                                                                                                                |
| ---- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 200  | Success                                       | All good!                                                                                                                                                                                  |
| 400  | Data validation error                         | Unable to validate the relay transaction. Please check at the values sent.                                                                                                                 |
| 402  | Insufficient funds                            | You need to top up your account.                                                                                                                                                           |
| 409  | Transaction already sent                      | We have sent the same transaction recently for you. If you want to send the same transaction twice in a short period of time, then just tweak the gasLimit field.                          |
| 429  | Too many requests.                            | We have a global rate limit of 6 calls per second. We plan to increase limit over time and you can just try again.                                                                         |
| 500  | Internal server error                         | An unexpected error occurred server-side. Please contact us.                                                                                                                               |
| 502  | Internal server error.                        | An unexpected error occurred server-side. Please contact us.                                                                                                                               |
| 503  | Service initialising, please try again later. | Our relayer is starting up. Please wait.                                                                                                                                                   |
| 503  | No available sender.                          | Configuration error for any.sender. Please contact us.                                                                                                                                     |
| 503  | Max pending gas reached.                      | Our relayer cannot accept any more jobs as we are trying to broadcast at least 12 million gas (12 blocks) of transactions. We plan to increase limit overtime, but just try again shortly. |

### Balance

Returns the current any.sender balance of an address. This is the amount of funds reserved for this address to pay for gas.

| Balance              |                              |
| -------------------- | ---------------------------- |
| Endpoint             | /balance/\<address\>         |
| Method               | GET                          |
| Content-Type         | N/A                          |
| Request body format  | N/A                          |
| Response body format | Balance response (see below) |

#### Balance response format

```json
{
  "balance": "string"
}
```
