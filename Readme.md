# HyperSDK 🌀

[![](https://img.shields.io/badge/made%20by-w3Ts0ckeT_eth-blue.svg?style=flat-square)](https://arunjangra.vercel.app)
[![](https://img.shields.io/badge/project-HyperSDK-blue.svg?style=flat-square)]()
[![](https://img.shields.io/badge/status-stable-brightgreen.svg?style=flat-square)]()

Hyper Bridge Project: Seamlessly links Base & Optimism blockchains via Layer Zero Router. Swap native & wrapped tokens effortlessly. Empowers devs with user-friendly SDK for cross-chain interaction. Unlocking DeFi potential & blockchain adoption.

**[NATIVE TO WRAPPED NATIVE SWAPPER]**

**Cross Chain Swap Time** : `10 sec` to `1 min`

## Simple to use

```ts
import { HyperSwapper } from '@arun89-crypto/hypersdk';
import { ethers } from 'ethers';

const main = async () => {
  // Declaring the providers
  const provider1 = new ethers.JsonRpcProvider(RPC_OPT);
  const provider2 = new ethers.JsonRpcProvider(RPC_BASE);

  // Declaring the signers
  const signer1 = new ethers.Wallet(P_KEY, provider1);
  const signer2 = new ethers.Wallet(P_KEY, provider2);

  // Initiating the swapper
  const swapper = new HyperSwapper({
    rpc_url_1: RPC_OPT, // RPC URL : chain 1
    rpc_url_2: RPC_BASE, // RPC URL : chain 2
    name_1: 'OPTIMISM', // Chain 1 Name
    name_2: 'BASE', // Chain 2 Name
    signer1: signer1, // Signer : chain 1
    signer2: signer2, // Signer : chain 2
  });

  // Swapping from Optimism -> Base
  const swap = await swapper.Swap1to2('0.0001');

  console.log(swap);
  /*
  Returns :

  interface SwapResult {
    result: TransactionResult;
    TransactionHash?: string;
    TransactionData?: string;
  }

  enum TransactionResult {
    ACCEPTED,
    REJECTED,
  }
  */
};
```

## Supported Chains (Testnet)

- Optimism Göerli
- Base Göerli
- Polygon Mumbai (Coming soon .....)
- Ethereum Göerli (Coming soon .....)

## Tech Stack

- Typescript
- Solidity
- EthersJS
- Layer Zero
- UniswapV3

## How to install ?

```sh
npm i @arun89-crypto/hypersdk
--
yarn add @arun89-crypto/hypersdk
```

## Config

| Param     | Optional | Description               |
| :-------- | :------- | :------------------------ |
| rpc_url_1 | `true`   | RPC URL for chain 1       |
| rpc_url_2 | `true`   | RPC URL for chain 2       |
| name_1    | `true`   | Name of chain 1           |
| name_2    | `true`   | Name of chain 2           |
| signer_1  | `true`   | Ethers Signer for chain 1 |
| signer_2  | `true`   | Ethers Signer for chain 2 |

## Functions

| Name                                  | Params                          | Description                                              |
| :------------------------------------ | :------------------------------ | :------------------------------------------------------- |
| Swap1to2                              | `_amount:string` `Eg : "0.001"` | Swap assets from chain 1 to chain 2                      |
| Swap2to1                              | `_amount:string` `Eg : "0.001"` | Swap assets from chain 2 to chain 1                      |
| \_estimateFeeFrom1to2                 |                                 | Return the estimated relayer fee from chain 1 to chain 2 |
| \_estimateFeeFrom2to1                 |                                 | Return the estimated relayer fee from chain 2 to chain 1 |
| \_getTransactionStatusLZ_1            | `txn_hash:string`               | Return the transaction status for chain 1                |
| \_getTransactionStatusLZ_2            | `txn_hash:string`               | Return the transaction status for chain 2                |
| \_getFullTransactionStatusLZ_1        | `txn_hash:string`               | Return the full transaction status for chain 1           |
| \_getFullTransactionStatusLZ_2        | `txn_hash:string`               | Return the full transaction status for chain 2           |
| getNativeWrappedTokenAddressChain1    |                                 | Return the tWETH address for chain 1                     |
| getNativeWrappedTokenAddressChain2    |                                 | Return the tWETH address for chain 2                     |
| getNativeWrappedTokenBalanceContract1 |                                 | Return the tWETH balance for chain 1 contract            |
| getNativeWrappedTokenBalanceContract2 |                                 | Return the tWETH balance for chain 2 contract            |
