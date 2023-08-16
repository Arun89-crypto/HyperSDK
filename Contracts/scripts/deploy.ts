import { ethers } from 'hardhat';
import { TESTNET_CONFIG } from '../config';

async function main() {
  const tweth = TESTNET_CONFIG.OPTIMISM.TOKENS.tWETH;
  const tusdc = TESTNET_CONFIG.OPTIMISM.TOKENS.tUSDC;

  const factory = TESTNET_CONFIG.OPTIMISM.V3_FACTORY;
  const swap_router = TESTNET_CONFIG.OPTIMISM.V3_SWAP_ROUTER;

  const endpoint = TESTNET_CONFIG.OPTIMISM.ENDPOINT;

  const tweth_base = TESTNET_CONFIG.BASE.TOKENS.tWETH;
  const tusdc_base = TESTNET_CONFIG.BASE.TOKENS.tUSDC;

  const factory_base = TESTNET_CONFIG.BASE.V3_FACTORY;
  const swap_router_base = TESTNET_CONFIG.BASE.V2_SWAP_ROUTER;

  const endpoint_base = TESTNET_CONFIG.BASE.ENDPOINT;

  const signers = await ethers.getSigners();
  console.log(signers[0]);

  // OPTIMISM
  const contract = await ethers.deployContract(
    'TokenBridgeHyper',
    [endpoint_base, swap_router, swap_router_base, tusdc_base, tweth_base, factory_base],
    signers[0],
  );

  await contract.waitForDeployment();
  console.log('CONTRACT :', contract.getAddress());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
