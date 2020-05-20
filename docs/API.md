# API

The REST API has two endpoints: /relay and /balance.

## Relay

| Endpoint | /relay |
| --- | --- |
| Method | POST |
| Content-Type | application/json |
| Request body format | [Relay transaction](./relayTransaction.md) |
| Response body format | [Relay receipt](./relayReceipt.md) |

## Balance

| Endpoint | /balance/\<address\> |
| --- | --- |
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