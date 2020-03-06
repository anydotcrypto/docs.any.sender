# Echo Recipe

This is a full walkthrough of how to get up and running with any.sender. The whole demo takes place on the ROPSTEN network, so ensure that any urls (eg. etherscan, infura) are for that network.

The aim is to send a transaction, via the any.sender relay, to the echo contract which will simply echo your message in an event. You can take a look at this contract [here](https://ropsten.etherscan.io/address/0xFDE83bd51bddAA39F15c1Bf50E222a7AE5831D83#code). Also take a look at the [Internal Transactions tab](https://ropsten.etherscan.io/address/0xFDE83bd51bddAA39F15c1Bf50E222a7AE5831D83), since any.sender relays your transaction via a Relay contract your transaction will show up as an internal transaction.

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

After sending funds to the relay contract the any.sender payment gateway will wait 10 confirmations before confirming the deposit. You can view the status of your balance by going to: https<nolink>://api.pisa.watch/any.sender.ropsten/balance/\<user-address\>

## Second run - success!
We'll run the echo script again, this time it should be successful as the user has balance at any.sender. After running the script and getting a successful result, we'll open the script and walk through it line by line, explaining what any.sender is doing and how to communicate with it.

```
node ./echoRecipe.js --jsonRpc=<value> --privKey=<value> --msg=<value>
```



