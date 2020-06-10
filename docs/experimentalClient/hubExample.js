const { JsonRpcProvider } = require("ethers/providers");
const { Wallet, ethers } = require("ethers");
const { any } = require("@any-sender/client");

// prerequisites
const message = "Hello world";
const userWallet = new Wallet("<private key here>");
const provider = new JsonRpcProvider(
  "https://ropsten.infura.io/v3/7333c8bcd07b4a179b0b0a958778762b"
);

// An echo contract with the _msgSender() standard.
const echoContractAddress = "0x23a2F5caD758a2b9a46969C3742D6dfB245CE0cf";
const echoAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_relayHub",
        type: "address",
      },
    ],
    stateMutability: "payable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "message",
        type: "string",
      },
    ],
    name: "Broadcast",
    type: "event",
  },
  {
    inputs: [],
    name: "lastMessage",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "relayHub",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_message",
        type: "string",
      },
    ],
    name: "sendMessage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
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

  // set up the any.sender client & proxy accounts
  const userAnyWallet = any.senderHub(connectedUser);

  // construct the data we want to send
  const echoInterface = new ethers.utils.Interface(echoAbi);
  const data = echoInterface.functions.sendMessage.encode([
    `-- ${message} -- (at ${new Date(Date.now()).toString()})`,
  ]);

  const blockBeforeSend = await provider.getBlockNumber();

  // use the any.sendTransaction function to send via any.sender
  const relayReceipt = await userAnyWallet.any.sendTransaction({
    to: echoContractAddress,
    data: data,
    gasLimit: 200000,
  });

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

  const event = echoInterface.events.Broadcast.decode(
    txReceipt.logs[1].data,
    txReceipt.logs[1].topics
  );

  console.log("Your signing key address: " + userAnyWallet.address);
  console.log("msg.sender for echo contract: " + event[0]);
  console.log("Message: " + event[1]);
  console.log("All sent via a RelayHub contract!");
};

run(userWallet, provider, message, echoContractAddress, echoAbi);
