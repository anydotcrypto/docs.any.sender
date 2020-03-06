const { parseArgs } = require("./parseArgs");
const { readFileSync } = require("fs");
const { ethers } = require("ethers");
const args = parseArgs.parse(process.argv);

const apiUrl = args.anySenderApi;
const receiptSignerAddress = args.receiptSigner;
const relayContractAddress = args.relayContract;
const userWallet = args.privKey
  ? new ethers.Wallet(args.privKey)
  : ethers.Wallet.fromEncryptedJson(
      readFileSync(args.encryptedJson),
      args.password
    );

const message = args.msg;
const jsonRpcUrl = args.jsonRpc;
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
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "string", name: "data", type: "string" }
    ],
    name: "Echo",
    type: "event"
  }
];

module.exports = {
  apiUrl,
  receiptSignerAddress,
  relayContractAddress,
  userWallet,
  jsonRpcUrl,
  echoContractAddress,
  echoAbi,
  message
};
