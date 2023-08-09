import { ethers } from "hardhat";
import PositionManagerABI from "../abis/PositionManager.json";

const main = async () => {
  const provider = new ethers.JsonRpcProvider(
    "https://optimism-goerli.public.blastapi.io"
  );
  const contract = new ethers.Contract(
    "0x39ca85af2f383190cbf7d7c41ed9202d27426ef6",
    PositionManagerABI,
    provider
  );

  const call = await contract.factory();

  console.log(call);
};

main();
