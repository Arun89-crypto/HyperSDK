import { ethers } from "hardhat";
import { solidityPacked } from "ethers";
import { TESTNET_CONFIG } from "../config";

const main = async () => {
  const local_opt = TESTNET_CONFIG.DEPLOYED.OPTIMISM;
  const remote_opt = TESTNET_CONFIG.DEPLOYED.BASE;
  const remoteChainID_opt = TESTNET_CONFIG.BASE.CHAIN_ID;

  const local_base = TESTNET_CONFIG.DEPLOYED.BASE;
  const remote_base = TESTNET_CONFIG.DEPLOYED.OPTIMISM;
  const remoteChainID_base = TESTNET_CONFIG.OPTIMISM.CHAIN_ID;

  // Optimism
  let trustedRemote = solidityPacked(
    ["address", "address"],
    [remote_opt, local_opt]
  );

  let trustedRemoteBase = solidityPacked(
    ["address", "address"],
    [remote_base, local_base]
  );

  console.log("trustedRemote : ", trustedRemote);
  console.log("trustedRemoteBase : ", trustedRemoteBase);

  const signers = await ethers.getSigners();

  const contract = await ethers.getContractAt(
    "TokenBridgeHyper",
    local_opt,
    signers[0]
  );

  const call = await contract.setTrustedRemote(
    remoteChainID_opt,
    trustedRemote,
    { gasPrice: "350000" }
  );

  console.log(call);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
