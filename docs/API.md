# API

See [Addresses](./addresses.md) for instance and contract addresses.

## Methods

The REST API has two endpoints: /relay and /balance.

### Relay

Relays the supplied transaction, returns a signed receipt that [guarantees](./guarantees.md) transaction submission.

| Relay | |
| --- | --- |
| Endpoint | /relay |
| Method | POST |
| Content-Type | application/json |
| Request body format | [Relay transaction](./relayTransaction.md) |
| Response body format | [Relay receipt](./relayReceipt.md) |

#### Ordering

any.sender guarantees that transactions from the same address will be mined in the order in which it receives them. Therefore, if you need to guarantee a specific order for transactions, then you should send and receive them serially. Only send a second transaction once you've received an acknowledgment for the first from the any.sender API.

### Balance

Returns the current any.sender balance of an address. This is the amount of funds reserved for this address to pay for gas.

| Balance | |
| --- | --- |
| Endpoint | /balance/\<address\> |
| Method | GET |
| Content-Type | N/A |
| Request body format | N/A |
| Response body format | Balance response (see below) |

#### Balance response format
```json
{
    "balance": "string"
}
```