# Dev tools

Local development tools for deploying the [any.sender contracts](https://github.com/PISAresearch/contracts.any.sender) and hosting a mock any.sender instance. We also have a live ropsten API for when you're ready to take it to the next level :)

## Deploying contracts locally

To deploy the contracts import the `deploy` object from the `@any-sender/client` package.  The deploy object has an `contracts` function which accepts a provider and returns a promise of the contracts. Call this at some point in your tests before wrapping objects with `any.sender()`.


```
contracts(provider: Provider, options?: DeployOptions) => Promise<Contracts>
```

#### provider: JsonRpcProvider | AsyncSendable | string
Can be an ethers `JsonRpcProvider`, `AsyncSendable` or a json rpc url as a `string`.

#### options: DeployOptions
```
{
    funder?: string | number;
    shardInterval?: number;
    compensationPeriod?: number;
    withdrawalPeriod?: number;
    deployMetaTxContracts?: boolean;
}
```

* `funder`: The address or index of the wallet that will be used to fund the any.sender deployment. If not supplied last wallet returned by provider.listAccounts will be used for this.
* `shardInterval`: The data registry shard interval. The number of blocks before a shard can be rotated. Defaults to 180000.
* `compensationPeriod`: The adjudicator compensation period. The number of blocks any.sender is allowed to give out compensation. Defaults to 180000.
* `withdrawalPeriod`: The minimum amount of time between a withdrawal request and a withdrawal in the lockable deposit contract. Defaults to 360000.
* `deployMetaTxContracts`: Whether to deploy the metatransaction hub, and the proxy account deployer. Default is true.

#### Returns
```
Promise<{
    funder?: string | number;
    shardInterval?: number;
    compensationPeriod?: number;
    withdrawalPeriod?: number;
    deployMetaTxContracts?: boolean;
}>
```
An object containing the `relay`, `adjudicator`, `lockableDeposit`, `relayer` contracts and the `receiptSigner` signer.


#### Example
```
import { deploy } from "@any-sender/client;
const contracts = await deploy.contracts(provider);
```
You can see a full runable example in [example.js](./example.js). To run it, first install packages, then run.
```
cd docs/devTools
npm i
npm run start
```

## Local API mocking
When the `any.sender()` function wraps a contract or signer that's connected to a local rpc provider, the function automatically detects that a local provider is being used and instead of calling a real API instance will instead create a mock any.sender API internally from the provider. The mock API has a reduced feature set, as an example it doesnt wait a number of confirmations for a deposit to be recognised, but instead recognises the deposit immediately. 

Whilst the mock is useful in unit/integration testing it's important to test your code against our live [ropsten API](../addresses.md) before going to production. 

Check out at [example.js](./example.js) to see the mock being used in conjuction with a local provider.
