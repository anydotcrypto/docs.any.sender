# Core Client

any.sender ships with a client library for easier access to the API. At the core of the library is the Core Client, which delivers the least functionality but it also the least opinionated. It has some core tools for working any.sender, including calculating hashes and topics. The Core Client does not require access to a signing key, all signing takes place outside the library. Most applications will be better suited to use the standard library [LINK] as it's more straightforward and easier to use, but some may prefer the smaller dependency of the Core Client.
```
npm i @any-sender/client
```


## Constructor
**apiUrl**: The url of the any.sender service

**receiptSigner**: The address of the authority used by any.sender to sign relay receipts.

```ts
import { AnyDotSenderCoreClient } from "@any-sender/client";
const client = new AnyDotSenderCoreClient({ apiUrl, receiptASignerddress });
```

## Static methods

### relayTxId(tx: UnsignedRelayTransaction)

Calculates the id of a transaction ready for signature. The `UnsignedRelayTransaction` is identical to a [relay transaction](../relayTransaction.md) with the signature omitted.

```ts
const id = AnyDotSenderCoreClient.relayTxId(relayTx);
const signature = await userWallet.signMessage(arrayify(id));
```

### getRelayExecutedEventTopics(tx: UnsignedRelayTransaction)
Expects a relay transaction and returns the event topics to observe from the relay contract to be notified when that transaction is relayed

```ts
const topics = AnyDotSenderCoreClient.getRelayExecutedEventTopics(relayTx);

provider.once(
    {
        address: relayContractAddress,
        topics: topics
    },
    () => console.log("Relay occurred.")
);
```

## Instance methods

### balance(address: string)
Gets the balance of the provided address, returns `BigNumber`.
```ts
const balance = await client.balance(userWallet.address);
```

### relay (tx: RelayTransaction)
Informs the any.sender service to relay the provided [transaction](../relayTransaction.md).

Returns a [receipt](../relayReceipt.md) signed by the receipt signer address. The client library verifies that the provided signature matches the receipt signer provided in the constructor.

```ts
const signedReceipt = await client.relay({...relayTx, signature})
```





