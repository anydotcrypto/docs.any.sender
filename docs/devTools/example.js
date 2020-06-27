const { deploy, any } = require("@any-sender/client");
const { ethers } = require("ethers");
const { parseEther } = require("ethers/utils");
const Ganache = require("ganache-core");

const run = async () => {
  const ganache = Ganache.provider();
  const provider = new ethers.providers.Web3Provider(ganache);
  const user = provider.getSigner(0);

  // deploys all the contracts needed for running any.sender
  const contracts = await deploy.contracts(provider);

  // at this point any.sender() detects that the user connected to a
  // local json rpc provider and creates a mock API internally
  const userDot = any.sender(user);

  // now you're ready to check your balance and relay transactions
  console.log((await userDot.any.getBalance()).toString());
  await (await userDot.any.deposit(parseEther("0.5"))).wait();
  console.log((await userDot.any.getBalance()).toString());
};

run();
