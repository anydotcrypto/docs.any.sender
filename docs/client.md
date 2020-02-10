# Client

any.sender ships with a client library for easier access to the API.

## Constructor
**apiUrl**: The url of the any.sender service

**receiptSigner**: The address of the authority used by any.sender to sign relay receipts.

```ts
new AnySenderClient(apiUrl, receiptASignerddress);
```

## Static methods

### relayTxId(tx: UnsignedRelayTransaction)

Calculates the id of a transaction ready for signature. The UnsignedRelayTransaction is identical to a [relay transaction](./relayTransaction) with the signature omitted.

```ts
const id = AnySenderClient.relayTxId(relayTx);
const signature = await userWallet.signMessage(arrayify(id));
```

### getRelayExecutedEventTopics(tx: UnsignedRelayTransaction)
Expects a relay transacation and returns the event topics to observe the emit that is emitted from the relay contract when that transaction is relayed

```ts
const topics = AnySenderClient.getRelayExecutedEventTopics(relayTx);

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
Gets the balance of the provided address, returns BigNumber.
```ts
const balance = await anySenderClient.balance(userWallet.address);
```

### relay (tx: RelayTransaction)
Informs the any.sender service to relay the provided [transaction](./docs/relayTransaction.md).

Returns a relay transaction signed by the receipt signer. The client library verifies that the provided signature matches the receipt signer provided in the constructor.

```ts
const signedReceipt = await anySenderClient.relay({...relayTx, signature})
```





