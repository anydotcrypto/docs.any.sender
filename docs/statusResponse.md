# Status response

JSON Schema: [./statusResponse.schema.json](./statusResponse.schema.json)

Contains a single field `broadcasts`, which contains an array of broadcast objects.

```
{
    "broadcasts": [
        {
            "ethTxHash": string (bytes32),
            "broadcastTime": string (ISO 8601 date-time string),
            "gasPrice": string (base 10)
        }
    ]
}
```

The broadcast objects are ordered from newest to oldest by broadcast time. Each object has the following fields:

### ethTxHash: string (bytes32)

The hash of the Ethereum transaction hash that was broadcast for this relay transaction. Use JSON RPC (preferably with batches to avoid too many requests) to fetch receipts for these transaction hashes. Note that these hashes are not guaranteed to be unique as any.sender may decide to re-publish the same transaction to the network - in the event that it thinks it may be dropped.

### broadcastTime: string (ISO 8601 date-time string)

And ISO 8601 formatted date time string populated for the moment the transaction was published to the network.

### gasPrice: string (base 10)

The gasPrice of the broadcast Ethereum transaction.
