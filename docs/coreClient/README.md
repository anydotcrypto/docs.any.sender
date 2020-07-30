# Core Client

The Core Client delivers the least functionality but it also the least opinionated. It has some core tools for working any.sender, including calculating hashes and topics. The Core Client does not require access to a signing key, all signing takes place outside the library. Most applications will be better suited to use the [standard client](../client/README.md) as it's more straightforward and easier to use, but some may prefer the smaller dependency of the Core Client.

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

### relayTxId(tx: UnsignedRelayTransaction) : string

Calculates the id of a transaction ready for signature. The `UnsignedRelayTransaction` is identical to a [relay transaction](../relayTransaction.md) with the signature omitted.

```ts
const id = AnyDotSenderCoreClient.relayTxId(relayTx);
const signature = await userWallet.signMessage(arrayify(id));
```

### getRelayExecutedEventTopics(tx: UnsignedRelayTransaction) : string[]

Expects a relay transaction and returns the event topics to observe from the relay contract to be notified when that transaction is relayed

```ts
const topics = AnyDotSenderCoreClient.getRelayExecutedEventTopics(relayTx);
provider.once(
  {
    address: relayContractAddress,
    topics: topics,
  },
  () => console.log("Relay occurred.")
);
```

## Instance methods

### balance(address: string) : Promise<BigNumber>

Gets the balance of the provided address, returns `BigNumber`.

```ts
const balance = await client.balance(userWallet.address);
```

### relay (tx: RelayTransaction) : Promise<RelayTransactionReceipt>

Informs the any.sender service to relay the provided [transaction](../relayTransaction.md).

Returns a [receipt](../relayReceipt.md) signed by the receipt signer address. The client library verifies that the provided signature matches the receipt signer provided in the constructor.

```ts
const signedReceipt = await client.relay({ ...relayTx, signature });
```

### getStatus (relayTxId: string) : Promise<TxStatus[]>

Gets status information about this relay tx id. `getStatus` returns an array of broadcasts, ordered from most recent to oldest, representing each of the times any.sender has broadcast this relay transaction, and at what price. See the [Status API](../API.md#Status)

```ts
const statusInfos = await client.getStatus(relayTxId);
```

## Example - basic usage (direct transaction)

```ts
import { AnyDotSenderCoreClient } from "@any-sender/client";
import { Wallet, ethers } from "ethers";

// prerequisites
const apiUrl = "https://api.anydot.dev/any.sender.ropsten";
const receiptSignerAddress = "<to fill>"; // see [Addresses](../API.md#addresses)
const userWallet = new Wallet("<to fill>");
const provider = new ethers.providers.JsonRpcProvider("<to fill>");
const address = "<address>";

// set up the any sender client
const anySenderClient = new AnyDotSenderCoreClient({
  apiUrl,
  receiptSignerAddress,
});

// check we have enough balance
const balance = await anySenderClient.balance(userWallet.address);
if (balance.lt(ethers.utils.parseEther("0.1"))) {
  // see [Payments](../payments.md)
  throw new Error(`Not enough balance. Balance is: ${balance.toString()} wei.`);
}

// form a relay transaction
const currentBlock = await provider.getBlockNumber();
const deadline = currentBlock + 400;
const relayTx = {
  chainId: 3,
  from: userWallet.address,
  to: echoContractAddress,
  data: data,
  gasLimit: 100000, // should be plenty
};

// sign the direct transaction
const id = AnyDotSenderCoreClient.relayTxId(relayTx);
const signature = await userWallet.signMessage(ethers.utils.arrayify(id));
const signedTx = { ...relayTx, signature };

// send the transaction & get signed receipt from any.sender
const receipt = await anySenderClient.relay(signedTx);
```

# Full example and walkthrough

any.sender is a general-purpose transaction relayer and its only job is to guarantee your transactions get accepted in the Ethereum blockchain in a timely manner.

You can configure the payload as you like, but in this tutorial, we will just send a string message to an echo contract.

Our example echo contract can be found [here](https://ropsten.etherscan.io/address/0xFDE83bd51bddAA39F15c1Bf50E222a7AE5831D83#code). All transactions sent using any.sender are processed via our Relay contract to record a log that we completed the job (and thus enforce accountability). Check out the [Internal Transactions tab](https://ropsten.etherscan.io/address/0xFDE83bd51bddAA39F15c1Bf50E222a7AE5831D83#internaltx) so see the previous echos!

**Note**: The whole demo takes place on the Ropsten network, so ensure that any urls you use (e.g. etherscan, infura) are for that network.

## Prerequisites

1. Install [Node](https://nodejs.org/en/download/), if you dont have it already.
2. Clone this docs repo:

   ```
   git clone https://github.com/PISAresearch/docs.any.sender.git
   ```

3. Change to this directory

   ```
   cd docs.any.sender/docs/coreClient
   ```

4. Install packages in this folder - npm is installed as part of node.

   ```
   npm i
   ```

5. Get access to a JSON RPC url for the Ropsten network.

   If you don't have access to a Ropsten node you can create an account with [Infura.io](https://infura.io/). To create an account do the following: Register, verify mail, create new project in Infura, Select the View Project button and select the Ropsten endpoint from the dropdown.

   Copy the json rpc url (e.g. https://ropsten.infura.io/v3/268eda053b2a35cb846ee997fb879282) for later use.

6. If you already have an Ethereum address on Ropsten, then you'll need to export the private key (or the keyfile/mnemonic) from your wallet. Otherwise you can create a new account by running [generateAccount.js](./generateAccount.js)

   ```
   node generateAccount.js
   ```

   Copy the private key and address for later use.

7. You can use a faucet to get some ropsten eth for your new account: https://faucet.ropsten.be/

   Although the faucet website can be a bit temperamental. If it doesn't work, then you can import your private key into [MetaMask](https://metamask.io/) and use their faucet: https://faucet.metamask.io/

   If you're still unable to get some, tweet at us @anydotcrypto, and we'll send you some :)

8. Final Checklist
   1. **Json RPC url.** You have a jsonRpcUrl of the form `https://ropsten.infura.io/v3/268eda053b2a35cb846ee997fb879282`
   2. **Keys.** You have a private key, keyfile or mnemonic of an account (and its public address)
   3. **Ropsten eth.** The address has been funded with ETH. You can check the value at: `https://ropsten.etherscan.io/address/<you address here>`

## First run - not enough balance.

Lets start by running the `echo-direct.js` script to send a direct transaction.

Users need to have balance with any.sender, which your user account does not yet. We expect the echo script to fail at this point, so let's verify this by running it.

You'll need your key details and the json rpc url, and to choose a message to send to the echo contract e.g. "Hi echo!".

The echo command accepts one of `--privKey`, `--mnemonic` or the `--keyfile --password` options for authenticating the user account. It also requires the `--jsonRpc` to be set, along with a `--msg` of your choice.

```
node echo-direct.js --jsonRpc=<value> --privKey=<value> --msg=<value>
```

example with dummy variables:

```
node echo-direct.js --jsonRpc=https://ropsten.infura.io/v3/268eda053b2a35cb846ee997fb879282 --privKey=0x9a7a70558b7e16e9874eaa35b51aa388b9a32e13607b38f5f4f53926ab1aff8b --msg="Hi from anydot!"
```

Execute the command - you should receive the following message:

```
Not enough balance. Balance is: 0 wei.
```

## Funding the user

To top up balance with any.sender we need to send some funds to the relay contract address. 0x9b4FA5A1D9f6812e2B56B36fBde62736Fa82c2a7.

You can find more details about topping up balance [here](../payments.md), but for now we can just send funds to the fallback function.

To deposit, send a transaction with value of 0.5 ETH (any amount above 0.2 ETH is fine for this tutorial) to the relay contract address. You can do this using your wallet software if you exported your keys from a wallet previously, or by using the `topUp.js` script.

To execute the `topUp.js` script:

```
node topUp.js --jsonRpc=<value> --privKey=<value> --value=0.5
```

Note: The `topUp.js` script has the same authentication options as the `echo` script: `--privKey`, `--mnemonic` or the `--keyfile --password`.

The any.sender payment gateway will wait 10 confirmations before confirming your deposit. You can view the status of your balance by inserting the user address in the url:

```
https://api.anydot.dev/any.sender.ropsten/balance/<user-address>
```

## Second run - success!

Now that the user has been topped up let's run the echo script again, this time it should be successful. After running the script and getting a successful result, we'll open the script and walk through it line by line, explaining what any.sender is doing and how to communicate with it.

Run the echo script again, inserting the same values as the first run:

```
node echo-direct.js --jsonRpc=<value> --privKey=<value> --msg=<value>
```

If all goes well, this should be your result:

```
Current balance: 205956460494620122
Sending relay tx: 0x3e3a880c0a6f5880fde712d549a82f2ae71d57f509ce92c1df9c563a86e8334d at block 8372940

Direct tx mined with id: 0x3e3a880c0a6f5880fde712d549a82f2ae71d57f509ce92c1df9c563a86e8334d at block 8372942
Tx relayed after 0 block. Pretty cool, I guess. (⌐■_■)

See your message at https://ropsten.etherscan.io/tx/0x7fc694cc130057657b63a541837e552a3585dd38fcb6a05ea9413569ecceed8e#eventlog
```

Go to the link in the output, did you see your message? Click the Event Logs tab if it is not already selected.

## Code walkthrough - what actually happened

Now let's go through the code line by line, dissecting what's happening. Open [echo.js](./echo-direct.js) in a text editor.

#### 1. Imports:

```js
const { ethers } = require("ethers");
const { AnyDotSenderCoreClient } = require("@any-sender/client");
const config = require("./configuration");
```

The script imports:

- [ethers.js](https://github.com/ethers-io/ethers.js) - to handle access to the JSON RPC and cryptographic functions like the user's wallet
- AnyDotSenderCoreClient - a lightweight wrapper for the any.sender API. It also provides some utility functions, for example to form digests ready for signing, or to create the event topics to watch for relay events
- config - the command line args (parsed with [yargs](https://github.com/yargs/yargs)) and some defaults.

#### 2. Configuration variables

We declare a run function that we'll execute later, and assign all the variables from config. All the configuration variables (except echoContract and echoAbi) can be set by the command line, but if they're not supplied some Ropsten defaults are already configured.

```js
const anySenderClient = new AnyDotSenderCoreClient({
  apiUrl,
  receiptSignerAddress,
});
```

- userWallet: An ethers.js wallet created from the privKey, or the keyfile command line args
- provider: An ether.js provider for access to Ropsten JSON RPC.
- apiUrl: The url of the any.sender API
- receiptSignerAddress: When the any.sender API accepts a relay request, it signs the transaction with a known receipt signer. In the event that any.sender fails to send a transaction before a deadline the user can submit the relay transaction along with the receipt signer signature to the [Adjudicator contract](https://ropsten.etherscan.io/address/0xCe6d434782ADD5A20B825daAD84119a454ec6dC9#code), which will ensure the user receives compensation. You can read more about the guarantees offered by any.sender [here](../guarantees.md).
- anySenderClient - a thin client for communicating with the any.sender API
- message - the message taken from the command line, to be echoed at the echo contract
- echoContractAddress - the address of the [Echo contract](https://ropsten.etherscan.io/address/0xFDE83bd51bddAA39F15c1Bf50E222a7AE5831D83#code) where the message will be received
- echoContractAbi - the abi of the echo contract

#### 3. Balance check

To execute relay transactions via the any.sender API a user must be topped up with balance, before we continue we check that the transaction has enough balance. See [here](../payments.md) for options on how to top up.

```js
const balance = await anySenderClient.balance(userWallet.address);
if (balance.lt(ethers.utils.parseEther("0.1")))
  throw new Error(`Not enough balance. Balance is: ${balance.toString()} wei.`);
console.log("Current balance: " + balance.toString());
```

#### 4. Construct the transaction data

We construct the transaction data from the echo interface abi. We're defining that the `echo` function should be called, with the supplied message (formatted with the datetime and user address).

```js
const echoInterface = new ethers.utils.Interface(echoAbi);
const data = echoInterface.functions.echo.encode([
  `-- ${message} -- (message sent by ${userWallet.address} at ${new Date(
    Date.now()
  ).toString()})`,
]);
```

#### 5. Form the direct transaction

The direct tx defines all the properties of what any.sender must do. A relay tx is very similar to a normal transaction except for a few fields. You can read more about the individual fields [here](../relayTransaction.md).

```js
const relayTx = {
  chainId: 3,
  from: userWallet.address,
  to: echoContractAddress,
  data: data,
  gasLimit: 100000, // should be plenty
};
```

- **chainId**: The chain id for the Ethereum network being connected to
- **from**: The user whose balance will be used. This account must also sign the relay transaction
- **to**: The destination of the transaction, in this case we're targeting the echo contract
- **data**: The data to be executed at the target, we formed this earlier using the echo contract ABI
- **gasLimit**: The amount of gas allocated to the call. This should be the same as a normal transaction

#### 6. Sign the relay transacation

The user now creates a digest from the relay transaction and signs it. The signature is then added to the relayTx json ready to be sent.

```js
const id = AnyDotSenderCoreClient.relayTxId(relayTx);
const signature = await userWallet.signMessage(arrayify(id));
const signedTx = { ...relayTx, signature };
```

#### 7. Send the relay transaction

Now that everything is set up, all that's left to do is to send the relay transaction to the any.sender API. This `relay` function just sets some headers and executes a POST to the any.sender API with the relay transaction as the payload.

```js
const receipt = await anySenderClient.relay(signedTx);
```

The returned receipt contains the receipt signer's signature, and can be stored until the user is sure the transaction has been mined. This signature is also checked inside the relay function to ensure it corresponds to the receipt signer used to construct the client.

#### 8. Request transaction hashes from the Status API

The any.sender service sends the transaction to the network and periodically bumps the transaction fee until the transaction is confirmed. Every fee bump changes the Ethereum transaction hash and this has an impact on the client as there is no single transaction hash to watch. In our example code, the client requests the list of transaction hashes from the any.sender API and then it can check with the provider if the transaction was confirmed in the blockchain.

```js
await waitForConfirmation(provider, anySenderClient, id, sentAtBlock);
```

To summarise what `waitForConfirmation` is doing under the hood:

```js
const status = await anySenderClient.getStatus(id);

    for (let i = 0; i < status.length; i++) {
      const txReceipt = await provider.getTransactionReceipt(
        status[i].ethTxHash
      );
      // Go through each transaction hash and check if it is confirmed.
```

If we find a confirmed transaction hash, then the echo script prints to the screen.


#### 9. Wait ...

We execute the run function which will send the relay transaction and wait until it's mined.

```js
run().catch((err) => console.error(err.message));
```

#### 10. What about accountable transactions?

Check out the script `accountable-echo.js`. It copies the above tutorial, but it sends any.sender a financially accountable transaction in which we guarantee it will be confirmed in Ethereum by a future block deadline.

An accountable transaction has some additional fields:

```js
const currentBlock = await provider.getBlockNumber();
const deadline = currentBlock + 405;
const relayTx = {
  chainId: 3,
  from: userWallet.address,
  to: echoContractAddress,
  data: data,
  deadline: deadline,
  gasLimit: 100000, // should be plenty
  compensation: "500000000", // 0.5 gwei
  relayContractAddress: relayContractAddress,
  type: "accountable", // accountable transaction type
};
```

A short explanation for each field:

- **deadline**: The deadline by which this transaction MUST be mined. Although this is expected to reduce, the current beta requires that the deadline must be at least 400 blocks from the current block. Although this is far in future, the relay transaction is expected to be mined long before this time.
- **compensation**: any.sender tries very hard to get a transaction mined before a deadline, but in the event that it's unable to, the user is owed a compensation specified by the compensation amount. See guarantees for more details.
- **relayContractAddress**: the address of the relay contract address. This ensures that the user can verify the deployed Relay contract that any.sender will use.

Finally, all accountable transactions are sent via our relay contract to record a log that your transaction was confirmed on block X. It also emits an event when the relay transaction is confirmed. Our example code watches for the relay event in the contract to verify when the transaction is confirmed. While we recommend using the Status API to fetch the transaction hashes, you can also just watch for the events on-chain.
