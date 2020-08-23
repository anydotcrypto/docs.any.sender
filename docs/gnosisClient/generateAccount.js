const { ethers } = require("ethers");
const randomWallet = ethers.Wallet.createRandom()
console.log("PRIVATE KEY: " + randomWallet.privateKey)
console.log("ADDRESS: " + randomWallet.address)
