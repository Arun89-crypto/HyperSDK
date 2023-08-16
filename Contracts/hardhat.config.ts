import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import dotenv from 'dotenv';

dotenv.config();

const priv_key = process.env.ACCOUNT_PKEY as string;
const opt_rpc = process.env.RPC_OPTIMISM as string;
const base_rpc = process.env.RPC_BASE as string;

// console.log(priv_key);
// console.log(opt_rpc);
// console.log(base_rpc);

const config: HardhatUserConfig = {
  solidity: '0.8.19',
  networks: {
    optimism: {
      url: opt_rpc,
      accounts: [priv_key],
    },
    base: {
      url: base_rpc,
      accounts: [priv_key],
      gasPrice: 50000000000,
    },
  },
};

export default config;
