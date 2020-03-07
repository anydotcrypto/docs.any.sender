# Echo Walkthrough

Any.sender is a general purpose transaction relayer that is responsible for getting a transaction delivered. You can configure the payload to anything you like, but in this demo we just send a string message to an echo contract.

The echo contract just echoes whatever is sent to it in an event. You can take a look at the contract [here](https://ropsten.etherscan.io/address/0xFDE83bd51bddAA39F15c1Bf50E222a7AE5831D83#code). Also take a look at the [Internal Transactions tab](https://ropsten.etherscan.io/address/0xFDE83bd51bddAA39F15c1Bf50E222a7AE5831D83#internaltx), since any.sender relays your transaction via a Relay contract your transaction will show up as an internal transaction.

**Note**: The whole demo takes place on the Ropsten network, so ensure that any urls you use (e.g. etherscan, infura) are for that network.

## Prerequisites
1. Install [Node](https://nodejs.org/en/download/), if you dont have it already. 
2. Clone this docs repo:
   
    ```
    git clone https://github.com/PISAresearch/docs.any.sender.git
    ```

3. Change directory to the echoWalkthrough directory

    ```
    cd docs.any.sender/docs/echoWalkthrough
    ```

4. Install packages in this folder - npm is installed as part of node.
    ```
    npm i
    ```

5. Get access to a JSON RPC url for the Ropsten network. If you don't have access to a Ropsten node you can create an account with [Infura.io](https://infura.io/). To create an account do the following: Register, verify mail, create new project in Infura, Select the View Project button, select the Ropsten endpoint from the dropdown and copy the url. e.g. ropsten.infura.io/v3/268eda053b2a35cb846ee997fb879282. 

    Copy the json rpc url for later use.

6. If you already have an Ethereum address you'd like to test with, you can use that - you'll need to export the private key (you can also export keyfile, or a mnemonic) from your wallet. Otherwise you can create a new account by running [generateAccount.js](./generateAccount.js)
    ```
    node generateAccount.js
    ```
    Copy the private key and address for later use.

7. Get some ropsten Eth for the user account you just created. You can use the following faucet: https://faucet.ropsten.be/
    
    It can be a bit temperamental though, if you're unable to get Ropsten Eth that way you can import your private key into [MetaMask](https://metamask.io/) and use their faucet: https://faucet.metamask.io/

    If you're still unable to get some, tweet at our twitter account @anydotcrypto, and we'll send you some :)

8. Checklist
    1. You have a jsonRpcUrl of the form `ropsten.infura.io/v3/268eda053b2a35cb846ee997fb879282`
    2. You have a private key, keyfile or mnemonic of a user account
    3. You have an address of a user account
    4. The address has been funded with ETH. You can check the value at: `https://ropsten.etherscan.io/address/<you address here>`

## First run - not enough balance.

Having completed the setup lets start by running the `echo` script. Users need to have balance with any.sender, which your user account does not yet. We expect the echo script to fail at this point, so let's verify this by running it. You'll need your key details and the json rpc url, and to choose a message to send to the echo contract e.g. "Hiyo echo!".

The echo command accepts one of `--privKey`, `--mnemonic` or the `--keyfile --password` options for authenticating the user account. It also requires the `--jsonRpc` to be set, along with a `--msg` of your choice.
```
node echo.js --jsonRpc=<value> --privKey=<value> --msg=<value>
```
example with dummy variables:
```
node echo.js --jsonRpc=--jsonRpc=https://ropsten.infura.io/v3/268eda053b2a35cb846ee997fb879282 --privKey=0x9a7a70558b7e16e9874eaa35b51aa388b9a32e13607b38f5f4f53926ab1aff8b --msg="Hi from anydot!"
```

Execute the command - you should receive the following message:
```
Not enough balance. Balance is: 0 wei.
```

## Funding the user

To top up balance with any.sender we need to send some funds to the relay contract address. 0xe8468689AB8607fF36663EE6522A7A595Ed8bC0C. 

You can find more details about topping up balance [here](../payments.md), but for now we can just send funds to the fallback function. Do this by sending a transaction, with value of 0.5 ETH (any amount above 0.2 ETH should be fine for this demo) to the relay contract address. You can do this using your wallet software if you exported your keys from a wallet previously, or by using the `topUp.js` script.

To execute the `topUp.js` script:

```
node topUp.js --jsonRpc=<value> --privKey=<value> --value=0.5
```

Note: The `topUp.js` script has the same authentication options as the `echo` script: `--privKey`, `--mnemonic` or the `--keyfile --password`.

After sending funds to the relay contract the any.sender payment gateway will wait 10 confirmations before confirming the deposit. You can view the status of your balance by inserting the user address in the url: 
```
https://api.pisa.watch/any.sender.ropsten/balance/<user-address>
```

## Second run - success!
Now that the user has been topped up let's run the echo script again, this time it should be successful. After running the script and getting a successful result, we'll open the script and walk through it line by line, explaining what any.sender is doing and how to communicate with it.

Run the echo script again, inserting the same values as the first run:
```
node echo.js --jsonRpc=<value> --privKey=<value> --msg=<value>
```
this time you should get a result that looks something like:

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

Go to the link in the output, did you see your message? Click the Event Logs tab if it's not already selected.

## Code walkthrough - what actually happened

Now let's go through the code line by line, dissecting what's happening. Open [echo.js](./echo.js) in a text editor.

#### 1. Imports:

```js
const { ethers } = require("ethers");
const { AnySenderClient } = require("@any-sender/client");
const config = require("./configuration");
```

The script imports:
* [ethers.js](https://github.com/ethers-io/ethers.js) - to handle access to the JSON RPC and cryptographic functions like the user's wallet
* AnySenderClient - a lightweight wrapper for the any.sender API. It also provides some utility functions, for example to form digests ready for signing, or to create the event topics to watch for relay events
* config - the command line args (parsed with [yargs](https://github.com/yargs/yargs)) and some defaults.

#### 2. Configuration variables
We declare a run function that we'll execute later, and assign all the variables from config. All the configuration variables (except echoContract and echoAbi) can be set by the command line, but if they're not supplied some Ropsten defaults are already configured.
```js
const userWallet = config.userWallet;
const provider = new ethers.providers.JsonRpcProvider(config.jsonRpcUrl);
const anySenderClient = new AnySenderClient(
  config.apiUrl,
  config.receiptSignerAddress
);
const message = config.message;
const echoContractAddress = config.echoContractAddress;
const echoAbi = config.echoAbi;
const relayContractAddress = config.relayContractAddress;
```
* userWallet: An ethers.js wallet created from the privKey, or the keyfile command line args
* provider: An ether.js provider for access to Ropsten JSON RPC.
* apiUrl: The url of the any.sender API
* receiptSignerAddress: When the any.sender API accepts a relay request, it signs the transaction with a known receipt signer. In the event that any.sender fails to send a transaction before a deadline the user can submit the relay transaction along with the receipt signer signature to the [Adjudicator contract](https://ropsten.etherscan.io/address/0xCe6d434782ADD5A20B825daAD84119a454ec6dC9#code), which will ensure the user receives compensation. You can read more about the guarantees offered by any.sender [here](../guarantees.md).
* anySenderClient - a thin client for communicating with the any.sender API
* message - the message taken from the command line, to be echoed at the echo contract
* echoContractAddress - the address of the [Echo contract](https://ropsten.etherscan.io/address/0xFDE83bd51bddAA39F15c1Bf50E222a7AE5831D83#code) where the message will be received
* echoContractAbi - the abi of the echo contract

#### 3. Balance check
To execute relay transactions via the any.sender API a user must be topped up with balance, before we continue we check that the transaction has enough balance. See [here](../payments.md) for options on how to top up.
```js
const balance = await anySenderClient.balance(userWallet.address);
if (balance.lt(ethers.utils.parseEther("0.1")))
  throw new Error(
    `Not enough balance. Balance is: ${balance.toString()} wei.`
  );
console.log("Current balance: " + balance.toString());
```

#### 4. Construct the transaction data
We construct the transaction data from the echo interface abi. We're defining that the `echo` function should be called, with the supplied message (formatted with the datetime and user address).
```js
const echoInterface = new ethers.utils.Interface(echoAbi);
const data = echoInterface.functions.echo.encode([
  `-- ${message} -- (message sent by ${userWallet.address} at ${new Date(
    Date.now()
  ).toString()})`
]);
```

#### 5. Form the relay tx
The relay tx defines all the properties of what any.sender must do. A relay tx is very similar to a normal transaction except for a few fields. You can read more about the individual fields [here](./relayTransaction.md).
```js
const currentBlock = await provider.getBlockNumber();
const deadline = currentBlock + 405;
const relayTx = {
  from: userWallet.address,
  to: echoContractAddress,
  data: data,
  deadlineBlockNumber: deadline,
  gas: 100000, // should be plenty
  refund: "500000000", // 5 gwei
  relayContractAddress: relayContractAddress
};
```
* **from**: The user whose balance will be used. This account must also sign the relay transaction
* **to**: The destination of the transaction, in this case we're targeting the echo contract
* **data**: The data to be executed at the target, we formed this earlier using the echo contract ABI
* **deadlineBlockNumber**: The deadline by which this transaction MUST be mined. Although this is expected to reduce, the current beta requires that the deadline must be at least 400 blocks from the current block. Although this is far in future, the relay transaction is expected to be mined long before this time.
* **gas**: The amount of gas allocated to the call. This should be the same as a normal transaction
* **refund**: any.sender tries very hard to get a transaction mined before a deadline, but in the event that it's unable to, the user is owed a compensation specified by the refund amount. See [guarantees](../guarantees.md) for more details.
* **relayContractAddress**: the address of the [relay contract address](https://ropsten.etherscan.io/address/0xe8468689AB8607fF36663EE6522A7A595Ed8bC0C). This ensures that the user can verify the deployed Relay contract that any.sender will use.

#### 6. Subscribe to the relay event
Before we send the transaction to any.sender we subscribe to the event that will be emitted when the transaction is mined. The any.sender client has a utility function for constructing the topics for this. If the relay contract emits a event with correct topics we'll consider the transaction to be relayed. We then print some feedback to the user.
```js
const topics = AnySenderClient.getRelayExecutedEventTopics(relayTx);
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
provider.on("block", block => {
  if (block !== currentBlock) console.log("... block mined", block);
});
```

#### 7. Send the relay transaction
Now that everything is set up, all that's left to do is to send the relay transaction to the any.sender API. This `relay` function just sets some headers and executes a POST to the any.sender API with the relay transaction as the payload.
```js
const receipt = await anySenderClient.relay(signedTx);
```
The returned receipt contains the receipt signer's signature, and can be stored until the user is sure the transaction has been mined. This signature is also checked inside the relay function to ensure it corresponds to the receipt signer used to construct the client.

#### 8. Wait ...
We execute the run function which will send the relay transaction and wait until it's mined.
```js
run().catch(err => console.error(err.message));
```
