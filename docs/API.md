# API

The REST API has two endpoints: /relay and /balance.

## Relay

The relay endpoint expects a POST with application/json body. The body is a [relay transaction](./relayTransaction.md).

The response is a [relay receipt](./relayReceipt.md) which includes the relay transaction itself and a signature from the [receipt signer](../README.md#addresses).The signature should be validated against the receipt signer address.

## Balance

The balance endpoint expects a GET with the address as its single path parameter: `/balance/<address>`. It returns the balance of the address in the form:
```json
{
    "balance": "<balance>"
}
```