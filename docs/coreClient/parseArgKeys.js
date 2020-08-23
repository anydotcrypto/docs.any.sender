const withKeyArgs = currentYargs => {
  return currentYargs
    .option("privKey", {
      description: "A user private key",
      alias: "k",
      string: true
    })
    .option("keyfile", {
      description: "An encrypted json keyfile for the user",
      alias: "f",
      string: true
    })
    .option("password", {
      description: "A password for the encrypted json file",
      alias: "p",
      string: true
    })
    .option("mnemonic", {
      description: "A mnemonic for the user account",
      alias: "mn",
      string: true
    })
    .conflicts("mnemonic", "privKey")
    .conflicts("mnemonic", "keyfile")
    .conflicts("mnemonic", "password")
    .conflicts("password", "privKey")
    .conflicts("keyfile", "privKey")
    .check(argv => {
      if (!((argv.password && argv.keyfile) || argv.privKey || argv.mnemonic)) {
        throw new Error(
          "MISSING ARGS: Either user private key, keyfile+password or mnemonic must be provided."
        );
      } else return true;
    });
};

module.exports = { withKeyArgs };
