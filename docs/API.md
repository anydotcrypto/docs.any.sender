# API

## Addresses	

|      | Ropsten | Mainnet |	
| --- | --- | --- |	
| **API** | https://api.anydot.dev/any.sender.ropsten | https://api.anydot.dev/any.sender.mainnet |	
| **Receipt signer** | 0xe41743Ca34762b84004D3ABe932443FC51D561D5 | 0x02111c619c5b7e2aa5c1f5e09815be264d925422 |	
| **Relay contract** | 0x9b4FA5A1D9f6812e2B56B36fBde62736Fa82c2a7 | 0x9b4FA5A1D9f6812e2B56B36fBde62736Fa82c2a7 |	
| **Adjudicator contract** | 0xAa517b16cAADc44b542c843AAfcaf274f6965016 | 0xAa517b16cAADc44b542c843AAfcaf274f6965016 |	
| **Lockable deposit contract** | 0xc617c0Fb33B7B6413b60beaB1bA0979Ae3166f54 | 0xc617c0Fb33B7B6413b60beaB1bA0979Ae3166f54 |	

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