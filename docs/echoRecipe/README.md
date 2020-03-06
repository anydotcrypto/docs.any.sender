# Echo Recipe

Any.sender is a general purpose transaction relayer that is responsible for getting a transaction delivered. You can configure the payload to anything you like, but in this demo we just send a string message to an echo contract.

The echo contract just echoes whatever is sent to it in an event. You can take a look at the contract [here](https://ropsten.etherscan.io/address/0xFDE83bd51bddAA39F15c1Bf50E222a7AE5831D83#code). Also take a look at the [Internal Transactions tab](https://ropsten.etherscan.io/address/0xFDE83bd51bddAA39F15c1Bf50E222a7AE5831D83), since any.sender relays your transaction via a Relay contract your transaction will show up as an internal transaction.

#### Note
The whole demo takes place on the ROPSTEN network, so ensure that any urls you use (eg. etherscan, infura) are for that network.

## Prerequisites
1. Install [Node](https://nodejs.org/en/download/). 
2. Clone this docs repo:
```
git clone git@github.com:PISAresearch/docs.any.sender.git
```

3. Change directory to the echoRecipe directory
```
cd docs/echoRecipe
```

4. Install packages in this folder - npm is installed as part of node.
```
npm i
```

5. Get access to a json rpc url for the ropsten network. [Infura.io](https://infura.io/) is fine for this.

6. Get a user account with some Ropsten eth. You can use any kind of wallet that can export a private key or an encrypted json file. I suggest creating a new throw away Ropsten account with like Metamask.

7. Get some ropsten Eth from a faucet. You can use either of these, both of them can be a bit temperamental:
https://faucet.ropsten.be/
https://faucet.metamask.io/

8. Choose a message to send! E.g. "Hello world!"

## First Run - not enough balance.

Lets start by running the echoRecipe. The user account dont currently have any balance with any.sender, so we expect this to fail. You'll need your private key (without a 0x prefix) and the json rpc url, and to choose a message.

Export your private details from the wallet created in prerequisite step 6. If you exported a private key, insert values into the command below.
```
node ./echoRecipe.js --jsonRpc=<value> --privKey=<value> --msg=<value>

```

If you exported a encrypted json file, use the command below:
```
node ./echoRecipe.js --jsonRpc=<value> --encryptedJson=<value> --password=<value> --msg=<value>

```

Execute the command! You should receive the following message:
```
Not enough balance. Balance is: 0 wei.
```

## Funding the user

To top up balance with any.sender we need to send some funds to the relay contract address. 0xe8468689AB8607fF36663EE6522A7A595Ed8bC0C. 

You can find more details about topping up balance [here](../payments.md), but for now we can just send funds to the fallback function. Do this by sending a transaction, with value of 0.5 ETH to the relay contract address using your wallet software. 

Alternatively, execute the `topUp.js` script:

```
node ./topUp.js --jsonRpc=<value> --privKey=<value> --value=0.5
```
or
```
node ./topUp.js --jsonRpc=<value> --encryptedJson=<value> --password=<value> --value=0.5
```

After sending funds to the relay contract the any.sender payment gateway will wait 10 confirmations before confirming the deposit. You can view the status of your balance by inserting the user address in the url: 
```
https://api.pisa.watch/any.sender.ropsten/balance/<user-address>
```

## Second run - success!
Now that the user has been topped up lets run the echo script again, this time it should be successful. After running the script and getting a successful result, we'll open the script and walk through it line by line, explaining what any.sender is doing and how to communicate with it.

```
node ./echoRecipe.js --jsonRpc=<value> --privKey=<value> --msg=<value>
```
you should get a result that looks something like:

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

## Walkthrough

Now lets go through the code line by line, dissecting what's happening. Open [echoRecipe.js](./echoRecipe.js) in a text editor.

#### 1. Imports:

```js
const { ethers } = require("ethers");
const { AnySenderClient } = require("@any-sender/client");
const config = require("./configuration");
```

The script imports:
* [ethersjs](https://github.com/ethers-io/ethers.js) - to handle access to the JSON RPC and cryptographic functions like the user's wallet
* AnySenderClient - a lightweight wrapper for the any.sender API. It also provides some utility functions for eg. forming digests ready for signing, or forming the event topics to watch for relay events
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
* userWallet: An ethersjs wallet created from the privKey, or the encryptedJsonFile command line args
* provider: An etherjs provider for access to Ropsten JSON RPC.
* apiUrl: The url of the any.sender API
* receiptSignerAddress: When the any.sender API accepts a relay request it signs the transaction with a known receipt signer. In the event that any.sender fails to send a transaction before a deadline the user can submit the relay transaction along with the receipt signer signature to the [Adjudicator contract](https://ropsten.etherscan.io/address/0xCe6d434782ADD5A20B825daAD84119a454ec6dC9#code), which will ensure the user receives compensation. You can read more about the guarantees offered by any.sender [here](../guarantees.md).
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
The relay tx defines all the properties of what any.sender must do. A relay tx is very similar to a normal transaction except for some differing fields. You can read more about the individual fields [here](./relayTransaction.md).
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
* from: The user who's balance will be used. This account must also sign the relay transaction
* to: The destination of the transaction, in this case we're targeting the echo contract
* data: The data to be executed at the target, we formed this earlier using the echo contract ABI
* deadlineBlockNumber: The deadline by which this transaction MUST be mined. Although this is expected to reduce, the curent beta requires that the deadline must be at least 400 blocks from the current block. Although this is far in future, the relay transaction is expected to be mined long before this time.
* gas: The amount of gas allocated to the call. This should be the same as a normal transaction
* refund: any.sender tries very hard to get a transaction mined before a deadline, but in the event that it's unable to user is liable to compensation of the refund amount. See [guarantees](../guarantees.md) for more details.
* relayContractAddress: the address of the [relay contract address](https://ropsten.etherscan.io/address/0xe8468689AB8607fF36663EE6522A7A595Ed8bC0C). This ensures that the user can verify what relay any.sender will use.

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

#### 7. Send the relay transaction!
Now that everything is set up, all that's left to do is send the relay transaction to the any.sender API. This `relay` function just sets some headers and executes a POST to the any.sender API with the relay transaction as the payload.
```js
const receipt = await anySenderClient.relay(signedTx);
```
The returned receipt contains the receipt signer signature, and can be stored until the user is sure the transaction has been mined. This signature is also checked inside the relay function to ensure it corresponds to the receipt signer used to construct the client.

#### 8. Wait ...
We execute the run function which will send the relay transaction and wait until it's mined.
```js
run().catch(err => console.error(err.message));
```