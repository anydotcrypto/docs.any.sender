# API

The REST API has two endpoints: /relay and /balance.

## Relay

Relays the supplied transaction, returns a signed receipt that guarantees transaction submission.

| Relay | |
| --- | --- |
| Endpoint | /relay |
| Method | POST |
| Content-Type | application/json |
| Request body format | [Relay transaction](./relayTransaction.md) |
| Response body format | [Relay receipt](./relayReceipt.md) |

## Balance

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