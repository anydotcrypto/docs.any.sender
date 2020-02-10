# Recipes

## Echo contract
A recipe for calling the echo contract. The Echo contract just echos whatever is sent to it in an event.

```ts
// prerequisites
const apiUrl = "https://api.pisa.watch/any.sender.ropsten";
const receiptSignerAddress = "0xe41743Ca34762b84004D3ABe932443FC51D561D5";
const relayContractAddress = "0x8C5a8F9A8Ab1391e55569841e6789D34A628829c";
const userWallet = new Wallet("<to fill");
const provider = new JsonRpcProvider("<to fill>");    
const echoContractAddress = "0xFDE83bd51bddAA39F15c1Bf50E222a7AE5831D83";
const echoAbi = [
    {
        constant: false,
        inputs: [{ internalType: "string", name: "data", type: "string" }],
        name: "echo",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function"
    },
    { anonymous: false, inputs: [{ indexed: false, internalType: "string", name: "data", type: "string" }], name: "Echo", type: "event" }
];

// set up the any sender client
const anySenderClient = new AnySenderClient(apiUrl, receiptSignerAddress);

// check we have enough balance at any.sender
const balance = await anySenderClient.balance(userWallet.address);
expect(balance.gt(parseEther("0.1")), "Not enough balance.").to.be.true;
console.log("Current balance: " + balance.toString());

// form a relay to the echo contract
// first construct the data
const echoInterface = new ethers.utils.Interface(echoAbi);
const data = echoInterface.functions.echo.encode(["Hi from " + userWallet.address + " at " + Date.now()]);

// set the deadline = 400 + small margin
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

// subscribe to the relay event, so we know when the transaction has been relayed
console.log();
console.log("Subscribing to relay event.");
const topics = AnySenderClient.getRelayExecutedEventTopics(relayTx);
provider.on("block", (block: number) => {
    if(block !== currentBlock) console.log("... block mined", block);
});
provider.once({ address: relayContractAddress, topics }, async event => {
    const blocksUntilMined = event.blockNumber - currentBlock;
    console.log();
    console.log(`Relay tx mined: ${event.topics[1]} at block ${event.blockNumber}`);
    console.log(`Tx relayed after ${blocksUntilMined - 1} block${blocksUntilMined > 2 ? "s" : ""}. Pretty cool, I guess. (⌐■_■)`);
    console.log()
    console.log(`See the transaction at https://ropsten.etherscan.io/tx/${event.transactionHash}`);
    // remove the block listener so we can exit
    provider.removeAllListeners("block");
});

// sign the relay transaction
const id = AnySenderClient.relayTxId(relayTx);
const signature = await userWallet.signMessage(arrayify(id));
const signedTx = { ...relayTx, signature };

// send it!
console.log(`Sending relay tx: ${id} at block ${currentBlock}`);
console.log();
const receipt = await anySenderClient.relay(signedTx);

// received, we can save this receipt for later proof that any.sender was hired
console.log("Receipt received for tx: " + AnySenderClient.relayTxId(receipt.relayTransaction));
console.log("Waiting for relay event...");
console.log();
```