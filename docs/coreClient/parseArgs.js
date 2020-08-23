const yargs = require("yargs");
const { withKeyArgs } = require("./parseArgKeys");

const parseArgs = yargs
  .scriptName("echo")
  .usage(
    "$0 --jsonRpc=<value> ( --privKey=<value> | (--keyfile=<value> --password=<value>)) [--msg=<value>] [--anySenderApi=<value>] [--relayContract=<value>] [--receiptSigner=<value>]"
  )
  .help()
  .option("anySenderApi", {
    description: "The url of the any.sender api",
    string: true,
    alias: "a",
    default: "https://api.anydot.dev/any.sender.ropsten"
  })
  .option("relayContract", {
    description: "The address of the any.sender relay contract",
    string: true,
    alias: "r",
    default: "0x9b4FA5A1D9f6812e2B56B36fBde62736Fa82c2a7"
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
  });
module.exports = { parseArgs: withKeyArgs(parseArgs) };
