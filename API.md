# API

The REST API has two endpoints: /relay and /balance.

## Relay

The relay endpoint expects a POST with application/json body. The body is a relay transaction. //TODO:DOCS:link.

The response is a relay transaction and signature from the receipt signer authority.

## Balance

The balance endpoint expects the address as it's single path parameter: `/balance/<address>`. It returns the balance of the address in the form:
```json
{
    "balance": "<balance>"
}
```