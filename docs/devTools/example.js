const {
  deploy,
  enableMockApi,
  disableMockApi,
} = require("@any-sender/dev-tools");
const { any } = require("@any-sender/client");
const { ethers } = require("ethers");
const { parseEther } = require("ethers/utils");
const Ganache = require("ganache-core");

const run = async () => {
  const ganache = Ganache.provider();
  const provider = new ethers.providers.Web3Provider(ganache);
  const user = provider.getSigner(0);

  // deploy contracts needed for local development
  await deploy.contracts(provider);

  // enable the mock api
  enableMockApi();

  // wrap a signer with any.sender, since the mock API has been enabled
  // it'll automatically get picked up by any.sender()
  const userDot = any.sender(user);

  // now you're ready to check your balance and relay transactions
  console.log((await userDot.any.getBalance()).toString());
  await (await userDot.any.deposit(parseEther("0.5"))).wait();
  console.log((await userDot.any.getBalance()).toString());

  // disable the mock api, since we dont need it any more
  disableMockApi();
};

run();
