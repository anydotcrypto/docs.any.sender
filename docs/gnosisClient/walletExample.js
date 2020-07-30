const { JsonRpcProvider } = require("ethers/providers");
const { Wallet, ethers } = require("ethers");
const { any } = require("@any-sender/client");

// prerequisites
const message = "Hello world";
const userWallet = new Wallet("<priv key>");
const provider = new JsonRpcProvider("<json rpc url>");
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

  // set up the any.sender client
  const userAnyWallet = any.senderGnosis(connectedUser);

  // construct the data we want to send
  const echoInterface = new ethers.utils.Interface(echoAbi);
  const data = echoInterface.functions.echo.encode([
    `-- ${message} -- (message sent by ${userWallet.address} at ${new Date(
      Date.now()
    ).toString()})`,
  ]);

  const blockBeforeSend = await provider.getBlockNumber();

  // user the any.sendTransaction function to send via any.sender
  const relayReceipt = await userAnyWallet.any.sendTransaction({
    to: echoContractAddress,
    data: data,
    gasLimit: 400000,
  });

  // wait until the transaction is mined
  console.log("Transaction sent, waiting for blocks to be mined.");
  console.log(
    `Your contract address will be ${await userAnyWallet.any.getWalletAddress()}`
  );
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
