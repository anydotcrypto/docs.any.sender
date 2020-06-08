const { JsonRpcProvider } = require("ethers/providers");
const { Wallet, Contract } = require("ethers");
const { any } = require("@any-sender/client");

// prerequisites
const message = "Hello world";
const userWallet = new Wallet(
  "21A13BB36805692782A1F337F0DE0F82DBBF2679AC150FB38B8811D3AB438AC1"
);
const provider = new JsonRpcProvider(
  "https://ropsten.infura.io/v3/7333c8bcd07b4a179b0b0a958778762b"
);
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
  const anyEcho = any.senderAccount(echo);

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

  // Let's fetch the anydot wallet and check if the proxy contract was deployed.
  // the wallet must be connected to a provider
  const userAnyWallet = any.senderAccount(connectedUser);
  const isProxyDeployed = await userAnyWallet.any.isProxyAccountDeployed();
  console.log("Proxy account exists: " + isProxyDeployed);
};

run(userWallet, provider, message, echoContractAddress, echoAbi).catch(err => err.message ? console.error(err.message) : err);;
