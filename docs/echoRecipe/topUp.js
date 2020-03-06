const yargs = require("yargs");
const { ethers } = require("ethers");

const parseArgs = yargs
  .scriptName("echoRecipe")
  .usage(
    "$0 --jsonRpc=<value> ( --privKey=<value> | (--encryptedJson=<value> --password=<value>)) --value=<value> [--relayContract=<value>]"
  )
  .help()
  .option("relayContract", {
    description: "The address of the any.sender relay contract",
    string: true,
    alias: "r",
    default: "0xe8468689AB8607fF36663EE6522A7A595Ed8bC0C"
  })
  .option("value", {
    description: "The value to top up.",
    string: true,
    alias: "s",
    default: "0.5"
  })
  .option("jsonRpc", {
    description: "A json rpc url.",
    string: true,
    alias: "j",
    demandOption: true
  })
  .option("privKey", {
    description: "A user private key",
    alias: "k",
    string: true
  })
  .option("encryptedJson", {
    description: "An encrypted json keyfile for the user",
    alias: "f",
    string: true
  })
  .option("password", {
    description: "A password for the encrypted json file",
    alias: "p",
    string: true
  })
  .conflicts("password", "privKey")
  .conflicts("encryptedJson", "privKey")
  .check(argv => {
    if (!((argv.password && argv.encryptedJson) || argv.privKey)) {
      throw new Error(
        "MISSING ARGS: Either user private key or json-file+password must be provided."
      );
    } else return true;
  });

const run = async () => {
  const args = parseArgs.parse(process.argv);

  const userWallet = args.privKey
    ? new ethers.Wallet(args.privKey)
    : ethers.Wallet.fromEncryptedJson(
        readFileSync(args.encryptedJson),
        args.password
      );

  const provider = new ethers.providers.JsonRpcProvider(args.jsonRpc);

  const connectedWallet = userWallet.connect(provider);
  const value = ethers.utils.parseEther(args.value);

  console.log(`Sending transaction from ${connectedWallet.address} to ${args.relayContract} with value ${args.value}.`)
  const tx = await connectedWallet.sendTransaction({ to : args.relayContract, value: value, gasPrice: 30000000000 });
  console.log(`Transaction https://ropsten.etherscan.io/tx/${tx.hash} sent.`)
  console.log("Waiting for mining.")

  await tx.wait(1);
  console.log("Transaction mined now waiting 10 confirmations. Should take approx. 4 minutes.")

  await tx.wait(12)
  console.log("Transaction has 10 confirmation.")
};
run().catch(err => console.error(err));
