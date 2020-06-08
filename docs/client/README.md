# Client

The any.sender client is the easiest way to interact with the any.sender API. It works with [ethersjs v4](https://github.com/ethers-io/ethers.js/) to add the ethers Signer or Contract objects.

**Note:** it's important to ensure that the Signer or Contract is connected to an ethers provider.

## Signer

### Import

To import and use the any.sender client import the `any` object from the client library:

```ts
import { any } from "@any-sender/client";
```

### any.sender(signer: Signer, settings?: {} )

Adds any.sender functionality to a signer on an `any` property. This will not replace or effect any of the existing functions on the Signer, eg `any.sender(signer).sendTransaction(tx)` will not got via any.sender but will send a normal transaction from the signer.

Optional setting can also be provided:
* apiUrl: the url of the any.sender API defaults to the known instance for the provider network
* receiptSigner: the url of the any.sender API defaults to known address for the provider network
* pollingInterval: number. A polling interval to be used when monitoring for events. Defaults to the provider polling interval.

#### Usage

```ts
const anyUserWallet = any.sender(connectedUser);
```

### signer.any.getBalance() : Promise<BigNumber>

The `getBalance` function on the `any` property returns the signers balance with any.sender.

#### Usage

```ts
const anyUserWallet = any.sender(connectedUser);
const balance = await anyUserWallet.any.getBalance();
```

### signer.any.deposit(amount: BigNumberish, overrides?: TransactionOverrides) : Promise<TransactionResponse>

Deposit some credit for the signer on any.sender. This will send a normal transaction to any.sender and excepts any of the normal transaction overrides such as `nonce` and `gasLimit`

On mainnet any.sender waits for 35 confirmations before registering the balance update, on ropsten it's 12.

#### Usage

```ts
const anyUserWallet = any.sender(connectedUser);
const tx = await anyUserWallet.any.deposit("1000000000000000000"); // 1 ETH
await tx.wait(40);
```

### signer.any.depositFor(amount: BigNumberish, recipient: string, overrides?: TransactionOverrides) : Promise<TransactionResponse>

Deposit some credit for another user on any.sender. This will send a normal transaction to any.sender and excepts any of the normal transaction overrides such as `nonce` and `gasLimit`

On mainnet any.sender waits for 35 confirmations before registering the balance update, on ropsten it's 12.

#### Usage

```ts
const anyUserWallet = any.sender(connectedUser);
const recipient = "<to fill>";
const tx = await anyUserWallet.any.deposit("1000000000000000000", recipient); // 1 ETH
await tx.wait(40);
```

### signer.any.sendTransaction(tx: { to: string, data: string, compensation?: string, gaslimit?: number }) : RelayTransactionReceipt

Sends a transaction via any.sender. Mandatory fields:
* **to**: same as a normal transaction
* **data**: same as a normal transaction

Optional fields:
* **compensation**: any.sender provides additional guarantees that a transaction will be delivered. See [Guarantees](../guarantees.md) for more details and [API](../relayTransaction.md#compensation) for current limits.
* **gasLimit**: same as a normal transaction

Notice that there is no option to provide a nonce. Maintains the order in which it receives transactions from the same sender, so if you need to guarantee order wait until the `sendTransaction` function returns before sending the next one. Likewise if ordering is not a requirement you can send transactions concurrently.

#### Returns data
`sendTransaction` returns a signed receipt object of the form:
```
{
    "relayTransaction": RelayTransaction, // the same as the input tx
    "id": string, // an id for this transaction, created by hashing the relay transaction
    "receiptSignature": string, // a signature from any.sender to prove that it accepted the job
    "wait": function(confirmations: number): TransactionReceipt // a function that can be called to wait until the transaction is mined. Returns a normal transaction receipt.
}
```
#### Usage

```ts
const anyUserWallet = any.sender(connectedUser);
const relayReceipt = await anyUserWallet.any.sendTransaction({ to: "<address>", data: "<data>" });
const transactionReceipt = await relayReceipt.wait();
```

### any.sender(contract: Contract, settings?: {})

Because a contract object has dynamic properties we can't add an `any` property to it, so instead we replace the functions that send transactions. Contracts must be created with a signer, which must also be connected to a `provider` object.

Optional setting can also be provided:
* apiUrl: the url of the any.sender API defaults to the known instance for the provider network
* receiptSigner: the url of the any.sender API defaults to known address for the provider network
* pollingInterval: number. A polling interval to be used when monitoring for events. Defaults to the provider polling interval.

#### Usage

```ts
const signer = new Wallet("<priv key>")
const contract = new Contract("<address>", erc20Abi, signer);
const anyContract = any.sender(contract);
```

### Functions

Each of the functions that send transactions have been replaced to instead send transactions via any.sender. They also now have a different signature. Each function has the normal function arguments, but now has overrides relevant to any.sender. Additionally the functions return a relay receipt, instead of a transaction response.

#### Optional overrides
* **compensation**: any.sender provides additional guarantees that a transaction will be delivered. See [Guarantees](../guarantees.md) for more details and [API](../relayTransaction.md#compensation) for current limits.
* **gasLimit**: same as a normal transaction

#### Return data
```
{
    "relayTransaction": RelayTransaction, // the relay transaction that was sent to any.sender
    "id": string, // an id for that transaction, created by hashing the relay transaction
    "receiptSignature": string, // a signature from any.sender to prove that it accepted the job
    "wait": function(confirmations: number): TransactionReceipt // a function that can be called to wait until the transaction is mined. Returns a normal transaction receipt.
}
```

#### Usage
```ts
const signer = new Wallet("<priv key>")
const contract = new Contract("<address>", erc20Abi, signer);
const anyContract = any.sender(contract);
const relayReceipt = await anyContract.functions.transfer("10", "<address>", {gasLimit: 200000 });
const transactionReceipt = await relayReceipt.wait();
```

# Full example and walkthrough

any.sender is a general-purpose transaction relayer and its only job is to guarantee your transactions get accepted in the Ethereum blockchain by a deadline.

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

Lets start by running the `echo` script.

Users need to have balance with any.sender, which your user account does not yet. We expect the echo script to fail at this point, so let's verify this by running it.

You'll need your key details and the json rpc url, and to choose a message to send to the echo contract e.g. "Hi echo!".

The echo command accepts one of `--privKey`, `--mnemonic` or the `--keyfile --password` options for authenticating the user account. It also requires the `--jsonRpc` to be set, along with a `--msg` of your choice.

```
node echo.js --jsonRpc=<value> --privKey=<value> --msg=<value>
```

example with dummy variables:

```
node echo.js --jsonRpc=https://ropsten.infura.io/v3/268eda053b2a35cb846ee997fb879282 --privKey=0x9a7a70558b7e16e9874eaa35b51aa388b9a32e13607b38f5f4f53926ab1aff8b --msg="Hi from anydot!"
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
node echo.js --jsonRpc=<value> --privKey=<value> --msg=<value>
```

If all goes well, this should be your result:

```
Current balance: 609999999993928805

Subscribing to relay event.
Sending relay tx with id: 0x3901e8b7998b1a03d0c1b73abca6b9ff7cb9f0c9f718bd50fc4384d7020d3706 at block 7467284

Receipt received for tx with id: 0x3901e8b7998b1a03d0c1b73abca6b9ff7cb9f0c9f718bd50fc4384d7020d3706
Waiting for relay event...

... block mined 7467285
... block mined 7467286

Relay tx mined with id: 0x3901e8b7998b1a03d0c1b73abca6b9ff7cb9f0c9f718bd50fc4384d7020d3706 at block 7467286
Tx relayed after 1 block. Pretty cool, I guess. (⌐■_■)

See your message at https://ropsten.etherscan.io/tx/0xe557d5feee1d2cc28cca4ce61a5f78ca271e6f139bd82f4a44d9a671a994dd8e#eventlog
```

Go to the link in the output, did you see your message? Click the Event Logs tab if it is not already selected.

## Code walkthrough - what actually happened

Now let's go through the code line by line, dissecting what's happening. Open [echo.js](./echo.js) in a text editor.

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

#### 5. Form the relay tx

The relay tx defines all the properties of what any.sender must do. A relay tx is very similar to a normal transaction except for a few fields. You can read more about the individual fields [here](../relayTransaction.md).

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
  compensation: "5000000000", // 5 gwei
  relayContractAddress: relayContractAddress,
};
```

- **chainId**: The chain id for the Ethereum network being connected to
- **from**: The user whose balance will be used. This account must also sign the relay transaction
- **to**: The destination of the transaction, in this case we're targeting the echo contract
- **data**: The data to be executed at the target, we formed this earlier using the echo contract ABI
- **deadline**: The deadline by which this transaction MUST be mined. Although this is expected to reduce, the current beta requires that the deadline must be at least 400 blocks from the current block. Although this is far in future, the relay transaction is expected to be mined long before this time.
- **gasLimit**: The amount of gas allocated to the call. This should be the same as a normal transaction
- **compensation**: any.sender tries very hard to get a transaction mined before a deadline, but in the event that it's unable to, the user is owed a compensation specified by the compensation amount. See [guarantees](../guarantees.md) for more details.
- **relayContractAddress**: the address of the [relay contract address](https://ropsten.etherscan.io/address/0x9b4FA5A1D9f6812e2B56B36fBde62736Fa82c2a7). This ensures that the user can verify the deployed Relay contract that any.sender will use.

#### 6. Sign the relay transacation

The user now creates a digest from the relay transaction and signs it. The signature is then added to the relayTx json ready to be sent.

```js
const id = AnyDotSenderCoreClient.relayTxId(relayTx);
const signature = await userWallet.signMessage(arrayify(id));
const signedTx = { ...relayTx, signature };
```

#### 7. Subscribe to the relay event

Before we send the transaction to any.sender we subscribe to the event that will be emitted when the transaction is mined. The any.sender client has a utility function for constructing the topics for this. If the relay contract emits a event with correct topics we'll consider the transaction to be relayed. We then print some feedback to the user.

```js
const topics = AnyDotSenderCoreClient.getRelayExecutedEventTopics(relayTx);
provider.once(
  { address: relayContractAddress, topics },
  async event => {
    const blocksUntilMined = event.blockNumber - currentBlock;
    console.log();
    console.log(
      `Relay tx mined with id: ${event.topics[1]} at block ${event.blockNumber}`
    );
    console.log(
      `Tx relayed after ${blocksUntilMined - 1} block${
        blocksUntilMined > 2 ? "s" : ""
      }. Pretty cool, I guess. (⌐■_■)`
    );
    console.log();
    console.log(
      `See your message at https://ropsten.etherscan.io/tx/${event.transactionHash#eventlog`
    );
    // remove the block listener so we can exit
    provider.removeAllListeners("block");
  }
);
```

We also subscribe to the "block" event to feedback to the console when a new block is mined.

```js
provider.on("block", (block) => {
  if (block !== currentBlock) console.log("... block mined", block);
});
```

#### 8. Send the relay transaction

Now that everything is set up, all that's left to do is to send the relay transaction to the any.sender API. This `relay` function just sets some headers and executes a POST to the any.sender API with the relay transaction as the payload.

```js
const receipt = await anySenderClient.relay(signedTx);
```

The returned receipt contains the receipt signer's signature, and can be stored until the user is sure the transaction has been mined. This signature is also checked inside the relay function to ensure it corresponds to the receipt signer used to construct the client.

#### 9. Wait ...

We execute the run function which will send the relay transaction and wait until it's mined.

```js
run().catch((err) => console.error(err.message));
```
