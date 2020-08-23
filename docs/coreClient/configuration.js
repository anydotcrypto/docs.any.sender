const { parseArgs } = require("./parseArgs");
const { readFileSync } = require("fs");
const { ethers } = require("ethers");
const args = parseArgs.parse(process.argv);

const apiUrl = args.anySenderApi;
const receiptSignerAddress = args.receiptSigner;
const relayContractAddress = args.relayContract;
let userWallet;
if (args.privKey) userWallet = new ethers.Wallet(args.privKey);
else if (args.mnemonic) userWallet = new ethers.Wallet(args.mnemonic);
else {
  userWallet = ethers.Wallet.fromEncryptedJson(
    readFileSync(args.keyfil),
    args.password
  );
}

const message = args.msg;
let jsonRpcUrl;
if (args.jsonRpc.startsWith("https://")) {
  jsonRpcUrl = args.jsonRpc.substr(8);
} else if (args.jsonRpc.startsWith("http://")) {
  jsonRpcUrl = args.jsonRpc.substr(7);
} else jsonRpcUrl = args.jsonRpc;

if (!jsonRpcUrl.startsWith("ropsten")) {
  throw new Error("--jsonRpc is not for ropsten network");
}
jsonRpcUrl = "https://" + jsonRpcUrl;

args.jsonRpc;
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

module.exports = {
  apiUrl,
  receiptSignerAddress,
  relayContractAddress,
  userWallet,
  jsonRpcUrl,
  echoContractAddress,
  echoAbi,
  message,
};
