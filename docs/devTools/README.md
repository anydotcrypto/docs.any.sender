# Dev tools

```sh
npm i @any-sender/dev-tools
```

Local development tools for deploying the [any.sender contracts](https://github.com/PISAresearch/contracts.any.sender) and hosting a mock any.sender API instance. We also have a live [ropsten API](../../README.md#addresses) for when you're ready to take it to the next level :)

```js
import { deploy, enableMockApi } from "@any-sender/dev-tools";
import { any } from "@any-sender/client";

// deploy contracts needed for local development
await deploy.contracts(provider);

// enable the mock api
enableMockApi();

// wrap a signer with any.sender, since the mock API has been enabled
// it'll automatically get picked up by any.sender()
const signerDot = any.sender(signer);
```

You can see a full runable example in [example.js](./example.js). To run it, first install packages, then run.

```
cd docs/devTools
npm i
npm run start
```

## Contracts

To deploy the contracts import the `deploy` object from the `@any-sender/client` package. The deploy object has a `contracts` function which accepts a provider and returns a promise of the contracts. Call this at the start of your tests before wrapping objects with `any.sender()`.

```
contracts(provider: Provider, options?: DeployOptions) => Promise<Contracts>
```

#### provider: JsonRpcProvider | AsyncSendable | string

Can be an ethers `JsonRpcProvider`, `AsyncSendable` or a json rpc url as a `string`.

#### options?: DeployOptions

An object containing options for the contract deployments. This parameter is optional.

```js
{
    funder?: string | number;
    shardInterval?: number;
    compensationPeriod?: number;
    withdrawalPeriod?: number;
    deployMetaTxContracts?: boolean;
}
```

- `funder`: The address or index of the wallet that will be used to fund the any.sender deployment. Defaults to the last signer returned by `provider.listAccounts`.
- `shardInterval`: The data registry shard interval. The number of blocks before a shard can be rotated. Defaults to 180000.
- `compensationPeriod`: The adjudicator compensation period. The number of blocks any.sender is allowed to give out compensation. Defaults to 180000.
- `withdrawalPeriod`: The minimum amount of time between a withdrawal request and a withdrawal in the lockable deposit contract. Defaults to 360000.
- `deployMetaTxContracts`: Whether to deploy the metatransaction hub, and the proxy account deployer. Default is true.

#### Returns

```js
Promise<{
    funder?: string | number;
    shardInterval?: number;
    compensationPeriod?: number;
    withdrawalPeriod?: number;
    deployMetaTxContracts?: boolean;
}>
```

Returns a promise of an object containing the `relay`, `adjudicator`, `lockableDeposit`, `relayer` contracts and the `receiptSigner` signer.

## Local API mocking

When the `any.sender()` function wraps a contract or signer that's connected to a local rpc provider, the function detects if a mock API has been enabled uses it instead of making remote calls to our live APIs. The mock API has a reduced feature set, as an example it doesnt wait a number of confirmations for a deposit to be recognised, but instead recognises the deposit immediately.

Whilst the mock is useful in unit/integration testing it's important to test your code against our live [ropsten API](../../README.md#addresses) before going to production.

Check out at [example.js](./example.js) to see the mock being used in conjuction with a local provider.

#### enableMockApi(): void

Call this at the start of your tests to give the any.sender client access to a global mock

#### disableMockApi(): void

Call this when you no longer need the mock

## CLI

The dev tools can also executed from the command line using the `@any-sender/dev-tools-cli` package. This package puts an any.sender command on the path with starts a local chain, a deploys contracts and hosts any.sender via a local url.

```sh
npm i -g @any-sender/dev-tools-cli
any.sender
```

Or if you wish to run your own development chain and attach any.sender to it you can pass the development chain url to the any.sender command with the `--jsonRpcUrl` command

```sh
any.sender --jsonRpcUrl http://localhost:8545
```
