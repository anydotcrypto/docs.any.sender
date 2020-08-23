const yargs = require("yargs");
const { ethers } = require("ethers");
const { withKeyArgs } = require("./parseArgKeys");

const parseArgs = yargs
  .scriptName("echo")
  .usage(
    "$0 --jsonRpc=<value> ( --privKey=<value> | (--keyfile=<value> --password=<value>)) --value=<value> [--relayContract=<value>]"
  )
  .help()
  .option("relayContract", {
    description: "The address of the any.sender relay contract",
    string: true,
    alias: "r",
    default: "0x9b4FA5A1D9f6812e2B56B36fBde62736Fa82c2a7",
  })
  .option("value", {
    description: "The value to top up.",
    string: true,
    alias: "s",
    default: "0.5",
  })
  .option("jsonRpc", {
    description: "A json rpc url.",
    string: true,
    alias: "j",
    demandOption: true,
  });

const run = async () => {
  const args = withKeyArgs(parseArgs).parse(process.argv);

  let userWallet;
  if (args.privKey) userWallet = new ethers.Wallet(args.privKey);
  else if (args.mnemonic) userWallet = new ethers.Wallet(args.mnemonic);
  else {
    userWallet = ethers.Wallet.fromEncryptedJson(
      readFileSync(args.keyfil),
      args.password
    );
  }

  let jsonRpcUrl;
  if (args.jsonRpc.startsWith("https://")) {
    jsonRpcUrl = args.jsonRpc.substr(8);
  } else if (args.jsonRpc.startsWith("http://")) {
    jsonRpcUrl = args.jsonRpc.substr(7);
  } else jsonRpcUrl = args.jsonRpc;

  //   if (!jsonRpcUrl.startsWith("ropsten")) {
  //     throw new Error("--jsonRpc is not for ropsten network");
  //   }
  jsonRpcUrl = "https://" + jsonRpcUrl;

  const provider = new ethers.providers.JsonRpcProvider(jsonRpcUrl);

  const connectedWallet = userWallet.connect(provider);
  const value = ethers.utils.parseEther(args.value);

  console.log(
    `Sending transaction from ${connectedWallet.address} to ${args.relayContract} with value ${args.value}.`
  );
  const tx = await connectedWallet.sendTransaction({
    to: args.relayContract,
    value: value,
    gasPrice: 30000000000,
  });
  console.log(`Transaction https://ropsten.etherscan.io/tx/${tx.hash} sent.`);
  console.log("Waiting for mining.");

  await tx.wait(1);
  console.log(
    "Transaction mined now waiting 10 confirmations. Should take approx. 4 minutes."
  );

  await tx.wait(12);
  console.log("Transaction has 10 confirmation.");
};
run().catch((err) => console.error(err));
