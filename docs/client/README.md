# Client

The any.sender client is the easiest way to interact with the any.sender API.

This tutorial for the client does NOT manage any wallet contracts. It only takes care of sending the relay transaction to the any.sender service. If you want a client library that includes a wallet contract, then please check [Gnosis](../gnosisClient) or [ProxyAccount](../experimentalClient).

It works with [ethersjs v4](https://github.com/ethers-io/ethers.js/) to add the ethers Signer or Contract objects.

**Note:** it's important to ensure that the Signer or Contract is connected to an ethers provider.

Before we continue you must install the client library:

```
npm i @any-sender/client
```

## Signer (no wallet contract)

### Import

Use the `any` object to import any.sender from the client library:

```ts
import { any } from "@any-sender/client";
```

### any.sender(signer: Signer, settings?: {} )

Adds any.sender functionality to a signer on an `any` property. This will not replace or effect any of the existing functions on the Signer. For example `any.sender(signer).sendTransaction(tx)` will not go via any.sender but will send a normal transaction from the signer.

Optionals setting can also be provided:

- apiUrl: the url of the any.sender API defaults to the known instance for the provider network
- receiptSigner: the url of the any.sender API defaults to known address for the provider network
- pollingInterval: number. A polling interval to be used when monitoring for events. Defaults to the provider polling interval.

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

- **to**: same as a normal transaction
- **data**: same as a normal transaction

Optional fields:

- **type**: defines if the transaction is "direct" or "accountabe", it defaults to "direct".
- **gasLimit**: same as a normal transaction

Only applicable for accountable transactions (optional):

- **compensation**: any.sender provides additional guarantees that a transaction will be delivered. See [Guarantees](../guarantees.md) for more details and [API](../relayTransaction.md#compensation) for current limits.
- **deadline**: any.sender guarantees the transaction is accepted by an absolute block deadline. If set to 0, it is set by the any.sender service. Default is set to 0 and for our BETA it can only be set approximately 400 blocks in the future.
- **relayContractAddress**: any.sender sends the transaction via an intermediary relay contract. Default is our relay contract ([Addresses](../../README.md#addresses)) and any.sender will reject any other address.

Notice there is no option to provide a nonce. any.sender will publish transactions in the order it receives them from the same sender. If you need to guarantee order, then wait until the `sendTransaction` function returns a signed receipt before sending the next one. Likewise if ordering is not a requirement, then you can send transactions concurrently.

#### Returns data

`sendTransaction` returns a signed receipt object of the form:

```js
{
    "relayTransaction": RelayTransaction, // the same as the input tx
    "id": string, // an id for this transaction, created by hashing the relay transaction
    "receiptSignature": string, // a signature from any.sender to prove the job was accepted
    "wait": function(confirmations: number): TransactionReceipt { ... }; // it waits until the transaction is mined. Returns a normal transaction receipt.
}
```

#### Usage

```ts
const anyUserWallet = any.sender(connectedUser);
const relayReceipt = await anyUserWallet.any.sendTransaction({
  to: "<address>",
  data: "<data>",
});
const transactionReceipt = await relayReceipt.wait();
```

## Contract

### Import

Use the `any` object to import any.sender from the client library:

```ts
import { any } from "@any-sender/client";
```

### any.sender(contract: Contract, settings?: {})

Because a contract object has dynamic properties we can't add an `any` property to it, so instead we replace the functions that send transactions. Contracts must be created with a signer, which must also be connected to a `provider` object.

Optional setting can also be provided:

- apiUrl: the url of the any.sender API defaults to the known instance for the provider network
- receiptSigner: the url of the any.sender API defaults to known address for the provider network
- pollingInterval: number. A polling interval to be used when monitoring for events. Defaults to the provider polling interval.

#### Usage

```ts
const signer = new Wallet("<priv key>");
const contract = new Contract("<address>", erc20Abi, signer);
const anyContract = any.sender(contract);
```

### Functions

When a function on a contract sends a transaction to Ethereum, we have changed it such that the transaction is sent via any.sender. Each function still has the normal function arguments, but it can include additional overrides relevant for any.sender. When the function is called, it returns a relay receipt instead of a transaction response and just to clarify, `response.wait()` still works and that will return a normal transaction receipt.

#### Optional overrides

Optional fields:

- **type**: defines if the transaction is "direct" or "accountabe", it defaults to "direct".
- **gasLimit**: same as a normal transaction

Only applicable for accountable transactions (optional):

- **compensation**: any.sender provides additional guarantees that a transaction will be delivered. See [Guarantees](../guarantees.md) for more details and [API](../relayTransaction.md#compensation) for current limits.
- **deadline**: any.sender guarantees the transaction is accepted by an absolute block deadline. If set to 0, it is set by the any.sender service. Default is set to 0 and for our BETA it can only be set approximately 400 blocks in the future.
- **relayContractAddress**: any.sender sends the transaction via an intermediary relay contract. Default is our relay contract ([Addresses](../../README.md#addresses)) and any.sender will reject any other address.

Notice there is no option to provide a nonce. any.sender will publish transactions in the order it receives transactions from the same sender. If you need to guarantee order, then wait until the `sendTransaction` function returns a signed receipt before sending the next one. Likewise if ordering is not a requirement, then you can send transactions concurrently.

#### Return data

```js
{
    "relayTransaction": RelayTransaction, // the relay transaction that was sent to any.sender
    "id": string, // an id for that transaction, created by hashing the relay transaction
    "receiptSignature": string, // a signature from any.sender to prove that it accepted the job
    "wait": function(confirmations: number): TransactionReceipt { ... } // a function that can be called to wait until the transaction is mined. Returns a normal transaction receipt.
}
```

#### Usage

```ts
const signer = new Wallet("<priv key>");
const contract = new Contract("<address>", erc20Abi, signer);
const anyContract = any.sender(contract);
const relayReceipt = await anyContract.functions.transfer(
  "<recipient address>",
  "10",
  { gasLimit: 200000 }
);
const transactionReceipt = await relayReceipt.wait();
```

# Full example and walkthrough

any.sender is a general-purpose transaction relayer and its only job is to guarantee your transactions get accepted in the Ethereum blockchain by a deadline.

You can configure the payload as you like, but in this tutorial, we will just send a string message to an echo contract.

Our example echo contract can be found [here](https://ropsten.etherscan.io/address/0xFDE83bd51bddAA39F15c1Bf50E222a7AE5831D83#code) and check out the [Internal Transactions tab](https://ropsten.etherscan.io/address/0xFDE83bd51bddAA39F15c1Bf50E222a7AE5831D83#internaltx) to see the previous echos!

**Note**: The whole demo takes place on the Ropsten network, so ensure that any urls you use (e.g. etherscan, infura) are for that network.

## Prerequisites

1. Install [Node](https://nodejs.org/en/download/), if you dont have it already.
2. Clone this docs repo:

   ```
   git clone https://github.com/PISAresearch/docs.any.sender.git
   ```

3. Change to this directory

   ```
   cd docs.any.sender/docs/client
   ```

4. Install packages in this folder - npm is installed as part of node.

   ```
   npm i
   ```

5. Get access to a JSON RPC url for the Ropsten network.

   If you don't have access to a Ropsten node you can create an account with [Infura.io](https://infura.io/). To create an account do the following: Register, verify mail, create new project in Infura, Select the View Project button and select the Ropsten endpoint from the dropdown.

   Copy the json rpc url (e.g. https://ropsten.infura.io/v3/7333c8bcd07b4a179b0b0a958778762b) for later use.

6. If you already have an Ethereum address on Ropsten, then you'll need to export the private key (or the keyfile/mnemonic) from your wallet. Otherwise you can create a new account by running [generateAccount.js](./generateAccount.js)

   ```
   node generateAccount.js
   ```

   Copy the private key and address for later use.

7. You can use a faucet to get some ropsten eth for your new account: https://faucet.ropsten.be/

   Although the faucet website can be a bit temperamental. If it doesn't work, then you can import your private key into [MetaMask](https://metamask.io/) and use their faucet: https://faucet.metamask.io/

   If you're still unable to get some, tweet at us @anydotcrypto or join our [telegram](https://t.me/anydotsender), and we'll send you some :)

8. Final Checklist
   1. **Json RPC url.** You have a jsonRpcUrl of the form `https://ropsten.infura.io/v3/7333c8bcd07b4a179b0b0a958778762b`
   2. **Keys.** You have a private key, keyfile or mnemonic of an account (and its public address)
   3. **Ropsten eth.** The address has been funded with ETH. You can check the value at: `https://ropsten.etherscan.io/address/<you address here>`

## First run - not enough balance.

Lets start by running the `contractExample` script.

Users need to have balance with any.sender, which your user account does not yet. We expect the echo script to fail at this point, so let's verify this by running it.

You'll need your key details and the json rpc url, and to choose a message to send to the echo contract e.g. "Hi echo!".

Modify `contractExample.js` and fill in:

```
const userWallet = new Wallet("<private key>");
const provider = new JsonRpcProvider("<infura link>");
```

Now you can run the example:

```
node contractExample.js
```

Execute the command - you will see an Error message with the following message:

```
HTTPResponseError: 402: Insufficient funds.
```

This is because the signing key lacks a balance on the any.sender service. So let's fix that.

## Funding the user

To top up balance with any.sender we need to send some funds to the relay contract address. 0x9b4fa5a1d9f6812e2b56b36fbde62736fa82c2a7.

You can find more details about topping up balance [here](../payments.md), but for now we can just send funds to the fallback function.

To deposit, send a transaction with value of 0.5 ETH (any amount above 0.2 ETH is fine for this tutorial) to the relay contract address. (Note: Make sure to supply sufficient gas and not 21k gas).

The any.sender payment gateway will wait 10 confirmations before confirming your deposit. You can view the status of your balance by inserting the user address in the url:

```
https://api.anydot.dev/any.sender.ropsten/balance/<user-address>
```

## Second run - success!

Now that the user has been topped up let's run the echo script again, this time it should be successful. After running the script and getting a successful result, we'll open the script and walk through it line by line, explaining what any.sender is doing and how to communicate with it.

Run the echo script again, inserting the same values as the first run:

```
node contractExample.js
```

If all goes well, this should be your result:

```
Transaction sent, waiting for blocks to be mined.
Tx relayed after 0 block. Pretty cool, I guess. (⌐■_■)
See your message at https://ropsten.etherscan.io/tx/0x6334b128f9237209a041add7f01d7f9fb11ee0e435b08c3dd55e597b4a9e5865#eventlog
```

Go to the link in the output, did you see your message? Click the Event Logs tab if it is not already selected.

## Code walkthrough - what actually happened

Now let's go through the code line by line, dissecting what's happening. Open [contractExample.js](./contractExample.js) in a text editor.

#### 1. Imports:

```js
const { JsonRpcProvider } = require("ethers/providers");
const { Wallet, Contract } = require("ethers");
const { any } = require("@any-sender/client");
```

The script imports:

- [ethers.js](https://github.com/ethers-io/ethers.js) - to handle the Wallet, Contract and JSON RPC provider.
- any - the lightweiht wrapper that can add functionality to a Signer, Wallet or Contract.

#### 2. Configuration variables

We declare a run function that we'll execute later, and assign all the variables from inside the file:

- `userWallet`: A wallet generated from the user's private key.
- `provider`: JSON RPC provider. Typically Infura.
- `message`: Message that is broadcast by the Echo Contract (make it something fun)
- `echoContractAddress`: Address of the [Echo Contract](https://ropsten.etherscan.io/address/0xCe6d434782ADD5A20B825daAD84119a454ec6dC9#code) on the Ropsten Network.
- `abi`: Defines the interface for the contract.

We only had to modify `userWallet` and `provider`. Although you can modify `message` to change what the Echo contract will broadcast. Of course, we have the `echoContractAddress` and `abi` that defines the interface for the contract.

#### 3. Wrapping contract with any.sender functionality

Once we have constructed the contract using the address, abi and the user's wallet, we can easily wrap the any.sender functionality on it.

```ts
const echo = new Contract(echoContractAddress, echoAbi, connectedUser);
const anyEcho = any.sender(echo);
```

This overrides all function calls for the contract such that the transaction is sent via the any.sender service instead of publishing an Ethereum Transaction to the network.

#### 4. Sending a transaction

We can access the contract's functions directly via `anyEcho.functions.*` and it will request the necessary arguments.

```ts
// send the tx, all functions on the contract forward transactions to any.sender
const relayReceipt = await anyEcho.functions.echo(
  `-- ${message} -- (message sent by ${userWallet.address} at ${new Date(
    Date.now()
  ).toString()})`
);
```

A signed relay receipt from the any.sender service is returned after the job is accepted. This includes a brief summary of the transaction and it is signed by the any.sender receipt signing key. An example of a relay receipt:

```ts
{ relayTransaction:
   { data:
      '0xf15da729000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000892d2d2048656c6c6f20776f726c64202d2d20286d6573736167652073656e7420627920307864613044323564374646393731423741354265463032454338423639313736366639394338306330206174204d6f6e204a756c20323720323032302031333a30333a303520474d542b303130302028427269746973682053756d6d65722054696d6529290000000000000000000000000000000000000000000000',
     from: '0xda0D25d7FF971B7A5BeF02EC8B691766f99C80c0',
     gasLimit: 27445,
     to: '0xFDE83bd51bddAA39F15c1Bf50E222a7AE5831D83',
     chainId: 3,
     type: 'direct',
     signature:
      '0xd5cbbdd5ccf4137ad026aa49afa78160d0c3b2edf3ece353779940ac19cd0b107f4b9bdabbfdd4a82fcb9187323cfed617c4f3689ede5c274191122992e911ef1c' },
  receiptSignature:
   '0xec2210dce170c2202f6be3dbaa115792557653ec00b5f31df4458e39f268e2ab30ed6d20dcac11fe96157dc2b0632b7c5f8afb4eebbf8314e987200eb3ec8aa11b',
  id:
   '0xecefd81f4b55017d4e840cb8b10d52cd9be0e9e6d51b07d846943e47a8292586',
  wait: [AsyncFunction: wait] }
```

Now that any.sender has accepted the job, we can simply request to wait until it is confirmed:

```js
// wait until the transaction is mined
console.log("Transaction sent, waiting for blocks to be mined.");
const txReceipt = await relayReceipt.wait();
```

It returns a typical transaction receipt after the transaction is confirmed including the transaction hash. This is useful if you want to print a nice etherscan link:

```
  console.log(
    `See your message at https://ropsten.etherscan.io/tx/${txReceipt.transactionHash}#eventlog`
  );
```

Easy! Now check out the code in [walletExample](./walletExample.js) and see if you can spot the differences :)
