const { JsonRpcProvider } = require("ethers/providers");
const { Wallet, Contract } = require("ethers");
const { any } = require("@any-sender/client");

// prerequisites
const message = "Hello world";
const userWallet = new Wallet("<key>");
const provider = new JsonRpcProvider("<infura link>");
const echoContractAddress = "0xFDE83bd51bddAA39F15c1Bf50E222a7AE5831D83";
const echoAbi = [
  {
    constant: false,
    inputs: [{ internalType: "string", name: "data", type: "string" }],
    name: "echo",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "string", name: "data", type: "string" },
    ],
    name: "Echo",
    type: "event",
  },
];

const run = async (
  userWallet,
  provider,
  message,
  echoContractAddress,
  echoAbi
) => {
  // the wallet must be connected to a provider
  const connectedUser = userWallet.connect(provider);

  // create a Contract object for echo and wrap it with any.sender
  const echo = new Contract(echoContractAddress, echoAbi, connectedUser);
  const anyEcho = any.senderGnosis(echo);

  const blockBeforeSend = await provider.getBlockNumber();
  // send the tx, all functions on the contract forward transactions to any.sender
  const relayReceipt = await anyEcho.functions.echo(
    `-- ${message} -- (message sent by ${userWallet.address} at ${new Date(
      Date.now()
    ).toString()})`
  );

  // wait until the transaction is mined
  console.log("Transaction sent, waiting for blocks to be mined.");
  const txReceipt = await relayReceipt.wait();

  const blocksUntilMined = txReceipt.blockNumber - blockBeforeSend;
  console.log(
    `Tx relayed after ${blocksUntilMined - 1} block${
      blocksUntilMined > 2 ? "s" : ""
    }. Pretty cool, I guess. (⌐■_■)`
  );
  console.log(
    `See your message at https://ropsten.etherscan.io/tx/${txReceipt.transactionHash}#eventlog`
  );
};

run(userWallet, provider, message, echoContractAddress, echoAbi).catch((err) =>
  err.message ? console.error(err.message) : err
);
