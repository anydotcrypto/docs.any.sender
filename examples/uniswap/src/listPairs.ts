import { providers, utils } from "ethers";

const pairCreatedEvent =
  "event PairCreated(address indexed token0, address indexed token1, address pair, uint)";
const factoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

export const listPairs = async (
  provider: providers.Provider
): Promise<{ token0: string; token1: string; pair: string }[]> => {
  const iFace = new utils.Interface([pairCreatedEvent]);
  const topic = iFace.events["PairCreated"].topic;

  const logs = await provider.getLogs({
    fromBlock: 0,
    toBlock: "pending",
    address: factoryAddress,
    topics: [topic],
  });

  return logs.map((l) => iFace.events["PairCreated"].decode(l.data, l.topics));
};

export const getPairs = async (
  token: string,
  provider: providers.Provider
): Promise<
  {
    otherToken: string;
    pair: string;
  }[]
> => {
  const pairs = await listPairs(provider);

  return pairs
    .map((a) => {
      if (a.token0 === token) {
        return {
          otherToken: a.token1,
          pair: a.pair,
        };
      } else if (a.token1 === token) {
        return {
          otherToken: a.token0,
          pair: a.pair,
        };
      } else return undefined;
    })
    .filter((a) => !!a) as {
    otherToken: string;
    pair: string;
  }[];
};
