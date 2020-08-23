# Gnosis Safe Client

For an overview of how a wallet contract works with any.sender, please check out our [Overview of any.sender](../overview.md#wallet-contract-interaction).

A client library for using Gnosis Safe as a wallet contract:

- **Auto-deployment:** It batches the initial deployment of Gnosis Safe with the first transaction.
- **Auto-wrapping:** Given a minimal transaction with `to`, `data` and `value` it takes care of wrapping the transaction such that it is sent via the Gnosis Safe contract.
- **Replay protection:** It tracks the transaction nonce when signing the transaction.

Our library takes care of handling the Gnosis Safe, so you only need to worry about what transactions you want to send. It works with [ethersjs v4](https://github.com/ethers-io/ethers.js/) to add the ethers Signer or Contract objects.

**Note:** it's important to ensure that the Signer or Contract is connected to an ethers provider.

Before we continue you must install the client library:

```
npm i @any-sender/client
```

## Wallet Account Signer

### Import

To import and use the any.sender client import the `any` object from the client library:

```ts
import { any } from "@any-sender/client";
```

### any.senderGnosis(signer: Signer, settings?: {} )

Adds any.sender functionality to a signer on an `any` property. This will not replace or effect any of the existing functions on the Signer. For example `any.senderAcccount(signer).sendTransaction(tx)` does not send transactions via any.sender, it is just a normal transaction from the signer.

Optional setting can also be provided:

- apiUrl: the url of the any.sender API defaults to the known instance for the provider network
- receiptSigner: the url of the any.sender API defaults to known address for the provider network
- pollingInterval: number. A polling interval to be used when monitoring for events. Defaults to the provider polling interval.

#### Usage

```ts
const userWallet = new Wallet("<private key>");
const connectedUser = userWallet.connect(provider);
const anyUserWallet = any.senderGnosis(connectedUser);
```

Just like the Client, it has [getBalance(), deposit() & depositFor()](https://github.com/anydotcrypto/docs.any.sender/tree/master/docs/client), so please check the Client documentation for more information. We take this opportunity to only cover new functionality introduced in the experimental client library to manage wallet contracts. It also has some additional methods for managing and checking the gnosis contract, however these are only necessary to achieve fine grained control. If these are not used the client library will internally check if the Gnosis wallet is deployed, and if not create a batch function will deploy the contract before calling it with the transaction.

### signer.any.getWalletAddress() : Promise\<string\>

The `getWalletAddress` function on the `any` property returns the address of the wallet contract. Every signing key has a deterministic wallet contract as it is deployed using CREATE2. It is safe to send funds to the wallet contract address before it is deployed on the network.

#### Usage

```ts
const anyUserWallet = any.senderGnosis(connectedUser);
const walletContractAddress = await anyUserWallet.any.getWalletAddress();
```

### signer.any.isWalletDeployed() : Promise\<boolean\>

The `isWalletDeployed()` function on the `any` property returns whether the wallet contract is already deployed on the network. If the wallet contract is not deployed, then our library will auto-deploy the wallet contract when the user sends their first transaction. e.g., we automatically batch the wallet contract deployment and the authorised meta-transaction in a single transaction.

#### Usage

```ts
const anyUserWallet = any.senderGnosis(connectedUser);
const isProxyDeployed = await anyUserWallet.any.isWalletDeployed();
if(isProxyDeployed) { ... }
```

### signer.any.getWalletTransaction() : Promise\<MinimalTx\>

The `getWalletTransaction` function on the `any` property returns a `MinimalTx` that contains `{ to: string, data: string}`. This provides you flexibility on how the contract wallet is deployed. Of course, if the wallet contract does not exist, then our library auto-deploys the wallet contract when the user is sending their first transaction via any.sender. So there is no explicit requirement to use this function.

#### Usage

```ts
const anyUserWallet = any.senderGnosis(connectedUser);
const minimalTx = await anyUserWallet.any.getWalletTransaction();
const tx = await anyUserWallet.sendTransaction({
  to: minimalTx.to,
  data: minimalTx.data,
}); // A normal transaction
```

### signer.any.deployWallet(overrides: { gasLimit?, value?, gasPrice? }): Promise\<TransactionResponse\>

The `deployWallet` function on the `any` property returns a `TransactionResponse`. It sends the Ethereum Transaction to the network (not via any.sender). Of course, if the wallet contract does not exist, then our library auto-deploys the wallet contract when the user is sending their first transaction via any.sender. So there is no explicit requirement to use this function.

### signer.any.sendTransaction(tx: { to: string, data: string, value?: BigNumber, callType?: CallType, compensation?: string, gaslimit?: number }) : Promise\<RelayTransactionReceipt\>

```ts
signer.any.sendTransaction(tx: {
    to: string,
    data?: string,
    value?: BigNumber,
    callType?: CallType,
    compensation?: string,
    type?: "accountable" | "direct",
    gasLimit?: number
    }): Promise<RelayTransactionReceipt>
```

Sends a transaction via any.sender. Mandatory fields:

- **to**: same as a normal transaction
- **data**: same as a normal transaction

Optional fields:

- **type**: defines if the transaction is "direct" or "accountabe", it defaults to "direct".
- **callType**: whether to delegate call or call from the gnosis contract
- **gasLimit**: same as a normal transaction

Optional accountable transaction fields:

- **compensation**: any.sender provides additional guarantees that a transaction will be delivered. See [Guarantees](../guarantees.md) for more details and [API](../relayTransaction.md#compensation) for current limits.

Notice there is no option to provide a nonce. any.sender will publish transactions in the order it receives transactions from the same sender. If you need to guarantee order, then wait until the `sendTransaction` function returns a signed receipt before sending the next one. Likewise if ordering is not a requirement, then you can send transactions concurrently.

**Wallet contract is not yet deployed?** No problem! This function batches the call such that the wallet contract is deployed before the meta-transaction is executed. The batch is performed in a single Ethereum Transaction.

#### Returns data

`sendTransaction` returns a signed receipt object of the form:

```ts
{
    "relayTransaction": RelayTransaction, // Same relay transaction sent by the user.
    "id": string, // Relay Transaction ID, created by hashing the relay transaction.
    "receiptSignature": string, // Signaturefrom any.sender to prove that it accepted the job.
    "wait": function(confirmations: number): TransactionReceipt {...} // Waits until the transaction is mined. Returns a normal transaction receipt.
}
```

#### Usage

```ts
const anyUserWallet = any.senderGnosis(connectedUser);
const relayReceipt = await anyUserWallet.any.sendTransaction({
  to: "<address>",
  data: "<data>",
});
const transactionReceipt = await relayReceipt.wait();
```

### signer.any.sendBatchTransaction

```ts
signer.any.sendBatchTransaction(
    transaction: [ {
        to: string,
        data: string,
        value?: BigNumber,
        revertOnFail?: boolean,
        callType?: CallType
    } ],
    overrides?: {
        compensation?: string,
        type?: "accountable" | "direct",
        gasLimit?: number
    }
): Promise<RelayTransactionReceipt>
```

Sends a batch of transactions, each has the following fields:

- **to**: (string - mandatory) same as a normal transaction
- **data**: (string - optional, defaults to 0x ) same as a normal transaction
- **callType**: (Call = 0 or DelegateCall = 1 - optional, defaults to Call) whether to call or delegatecall from the wallet contract
- **revertOnFail**: (boolean - optional, defaults to true) - whether to revert the whole batch if this transaction fails
- **value**: (BigNumber - optional, defaults to 0) - amount to send from the wallet contract

Options:

- **type**: defines if the transaction is "direct" or "accountable", it defaults to "direct".
- **gasLimit**: same as a normal transaction, will estimate if explicit gas isnt supplied
- **value**: the amount to transfer out of the wallet contract
- **compensation**: (Only available for accountable transactions) any.sender provides additional guarantees that a transaction will be delivered. See [Guarantees](../guarantees.md) for more details and [API](../relayTransaction.md#compensation) for current limits.

Notice there is no option to provide a nonce. any.sender will publish transactions in the order it receives transactions from the same sender. If you need to guarantee order, then wait until the `sendTransaction` function returns a signed receipt before sending the next one. Likewise if ordering is not a requirement, then you can send transactions concurrently.

**Wallet contract is not yet deployed?** No problem! The same as `sendTransaction` the client library will batch a contract deployment with the transactions, if the wallet contract is not already deployed.

#### Returns data

`sendBatchTransaction` returns a signed receipt object of the form:

```ts
{
    "relayTransaction": RelayTransaction, // Same relay transaction sent by the user.
    "id": string, // Relay Transaction ID, created by hashing the relay transaction.
    "receiptSignature": string, // Signaturefrom any.sender to prove that it accepted the job.
    "wait": function(confirmations: number): TransactionReceipt {...} // Waits until the transaction is mined. Returns a normal transaction receipt.
}
```

#### Usage

```ts
const anyUserWallet = any.senderGnosis(connectedUser);
const relayReceipt = await anyUserWallet.any.sendBatchTransaction(
  {
    to: "<address>",
    data: "<data>",
  },
  {
    to: "<address>",
    data: "<data>",
  },
  {
    to: "<address>",
    data: "<data>",
  }
);
const transactionReceipt = await relayReceipt.wait();
```

## Target contract

### Import

To import and use the any.sender client import the `any` object from the client library:

```ts
import { any } from "@any-sender/client";
```

### any.senderGnosis(contract: Contract, settings?: {})

Because a contract object has dynamic properties we can't add an `any` property to it, so instead we replace the functions that send transactions. Contracts must be created with a signer, which must also be connected to a `provider` object.

All transactions are sent via the wallet contract and the wallet contract is auto-deployed if necessary.

Optional setting can also be provided:

- apiUrl: the url of the any.sender API defaults to the known instance for the provider network
- receiptSigner: the url of the any.sender API defaults to known address for the provider network
- pollingInterval: number. A polling interval to be used when monitoring for events. Defaults to the provider polling interval.

#### Usage

```ts
const signer = new Wallet("<priv key>").connect(provider);
const contract = new Contract("<address>", erc20Abi, signer);
const anyContract = any.senderGnosis(contract);
```

### Functions

Each of the functions that send transactions have been replaced to instead send transactions via any.sender. They also now have a different signature. Each function has the normal function arguments, but now has overrides relevant to any.sender. Additionally the functions return a relay receipt, instead of a transaction response.

#### Optional overrides

Optional fields:

- **type**: defines if the transaction is "direct" or "accountabe", it defaults to "direct".
- **gasLimit**: same as a normal transaction

Optional accountable transaction fields:

- **compensation**: any.sender provides additional guarantees that a transaction will be delivered. See [Guarantees](../guarantees.md) for more details and [API](../relayTransaction.md#compensation) for current limits.

Notice there is no option to provide a nonce. any.sender will publish transactions in the order it receives transactions from the same sender. If you need to guarantee order, then wait until the `sendTransaction` function returns a signed receipt before sending the next one. Likewise if ordering is not a requirement, then you can send transactions concurrently.

**Wallet contract is not yet deployed?** No problem! This function batches the call such that the wallet contract is deployed before the meta-transaction is executed. The batch is performed in a single Ethereum Transaction.

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
const signer = new Wallet("<priv key>").connect(provider);
const contract = new Contract("<address>", erc20Abi, signer);
const anyContract = any.senderGnosis(contract);
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
   cd docs.any.sender/docs/gnosisClient
   ```

4. Install packages in this folder - npm is installed as part of node.

   ```
   npm i
   ```

5. Get access to a JSON RPC url for the Ropsten network.

   If you don't have access to a Ropsten node you can create an account with [Infura.io](https://infura.io/). To create an account do the following: Register, verify mail, create new project in Infura, Select the View Project button and select the Ropsten endpoint from the dropdown.

   Copy the json rpc url (e.g. https://ropsten.infura.io/v3/7333c8bcd07b4a179b0b0a958778762b) for later use.

6. If you already have an Ethereum address on Ropsten, then you'll need to export the private key (or the keyfile/mnemonic) from your wallet. Otherwise you can create a new account by running [generateAccount.js](../coreClient/generateAccount.js)

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

Lets start by running the `walletExample` script.

Users need to have balance with any.sender, which your user account does not yet. We expect the echo script to fail at this point, so let's verify this by running it.

You'll need your key details and the json rpc url, and to choose a message to send to the echo contract e.g. "Hi echo!".

Modify `walletExample.js` and fill in:

```
const userWallet = new Wallet("<private key>");
const provider = new JsonRpcProvider("<infura link>");
```

Now you can run the example:

```
node walletExample.js
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
node walletExample.js
```

If all goes well, this should be your result:

```
Transaction sent, waiting for blocks to be mined.
Tx relayed after 0 block. Pretty cool, I guess. (⌐■_■)
See your message at https://ropsten.etherscan.io/tx/0x6334b128f9237209a041add7f01d7f9fb11ee0e435b08c3dd55e597b4a9e5865#eventlog
```

Go to the link in the output, did you see your message? Click the Event Logs tab if it is not already selected. Don't forget to repeat the above steps for `contractExample.js`!

## Code walkthrough - what actually happened

Now let's go through the code line by line, dissecting what's happening. Open [walletExample.js](./walletExample.js) in a text editor.

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

We only had to modify `userWallet` and `provider`. Although you can modify `message` to change what the Echo contract will broadcast.

#### 3. Wrapping the Signer with any.sender functionality

We wrap the `userWallet` with the any.sender functionality:

```ts
const userAnyWallet = any.senderGnosis(connectedUser);
```

The `Wallet` has new functionality that is accessible via `userAnyWallet.any.*` and we have not overridden its original functionality.

#### 4. Sending a transaction

We need to encode the contract's call that we want to send:

```
// construct the data we want to send
const echoInterface = new ethers.utils.Interface(echoAbi);
const data = echoInterface.functions.echo.encode([
    `-- ${message} -- (message sent by ${userWallet.address} at ${new Date(
      Date.now()
    ).toString()})`,
]);
```

The `data` is the same data that can be plugged directly into an Ethereum Transaction to execute the function call.

To send the transaction via the proxy contract:

```
// use the any.sendTransaction function to send via any.sender
const relayReceipt = await userAnyWallet.any.sendTransaction({
    to: echoContractAddress,
    data: data,
    gasLimit: 200000,
});
```

As you can see it looks exactly like a normal sendTransaction(). It constructs the transaction such that it is sent via the wallet contract and sends it to the any.sender service. If the wallet contract does not yet exist, then it will prepare a batch transaction that deploys the wallet contract first before executing the meta-transaction.

It returns a signed relay receipt from the any.sender service to acknowledge the job was accepted. An example of a relay receipt:

```ts
{ relayTransaction:
   {
     type: "direct",
     data:
      '0xf15da729000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000892d2d2048656c6c6f20776f726c64202d2d20286d6573736167652073656e7420627920307862366439653030303631323830624146333661636437426335363230363133354264413330324330206174204d6f6e204a756e20303820323032302031393a30393a353920474d542b303130302028427269746973682053756d6d65722054696d6529290000000000000000000000000000000000000000000000',
     from: '0xb6d9e00061280bAF36acd7Bc56206135BdA302C0',
     gasLimit: 27445,
     to: '0xFDE83bd51bddAA39F15c1Bf50E222a7AE5831D83',
     chainId: 3,
     signature:
      '0x11e623aadd5240e0fbb4a49ed97c356c82a7ea186df575e3daa0772aac9258b06b9852063c60a740c5139699fbae8474d6d96b5ba603115d14fce83e9b65dbbf1c' },
  receiptSignature:
   '0xe6938cf057665be65c25d6793585988c4d51e3a3e15e71e48d52a28d49dae3923496695a422ec5ddeec416693a38e7d27b965f4b18d8b29371a7e8aca8c3d46c1c',
  id:
   '0x3a3e84f79fdd4d69347dd7fbb24994044ce5aa3903644c21813aeb6d2416a041',
  wait: [AsyncFunction: wait] }
```

Now that any.sender has accepted the job, we can simply request to wait until it is confirmed:

```js
// wait until the transaction is mined
console.log("Transaction sent, waiting for blocks to be mined.");
const txReceipt = await relayReceipt.wait();
```

It returns a transaction receipt after the transaction is confirmed including the transaction hash. This is useful if you want to print a nice etherscan link:

```
  console.log(
    `See your message at https://ropsten.etherscan.io/tx/${txReceipt.transactionHash}#eventlog`
  );
```

Easy! Now check out the code in `contractExample.js` and see if you can spot the small differences :)
