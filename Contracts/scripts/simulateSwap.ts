import { ethers } from 'hardhat';
import { solidityPacked } from 'ethers';
import { TESTNET_CONFIG } from '../config';

const main = async () => {
  const local_opt = TESTNET_CONFIG.DEPLOYED.OPTIMISM;
  const dest_chain_id_opt = TESTNET_CONFIG.BASE.CHAIN_ID;

  const signers = await ethers.getSigners();

  const contract = await ethers.getContractAt('TokenBridgeHyper', local_opt, signers[0]);

  const amount = ethers.parseUnits('0.0001', 18);
  console.log(amount);

  const amount2 = ethers.parseUnits('0.002', 18);

  const call = await contract.bridgeToken(amount, dest_chain_id_opt, {
    value: amount2,
    gasPrice: '350000',
  });

  console.log(call);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
