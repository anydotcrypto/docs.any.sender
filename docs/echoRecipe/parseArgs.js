const yargs = require("yargs");

const parseArgs = yargs
  .scriptName("echoRecipe")
  .usage(
    "$0 --jsonRpc=<value> ( --privKey=<value> | (--encryptedJson=<value> --password=<value>)) [--msg=<value>] [--anySenderApi=<value>] [--relayContract=<value>] [--receiptSigner=<value>]"
  )
  .help()
  .option("anySenderApi", {
    description: "The url of the any.sender api",
    string: true,
    alias: "a",
    default: "https://api.pisa.watch/any.sender.ropsten"
  })
  .option("relayContract", {
    description: "The address of the any.sender relay contract",
    string: true,
    alias: "r",
    default: "0xe8468689AB8607fF36663EE6522A7A595Ed8bC0C"
  })
  .option("receiptSigner", {
    description: "The address of the any.sender receipt signer",
    string: true,
    alias: "s",
    default: "0xe41743Ca34762b84004D3ABe932443FC51D561D5"
  })
  .option("msg", {
    description: "The message to echo.",
    string: true,
    alias: "m",
    default: "Default message: hello world."
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
module.exports = { parseArgs };
