import { ethers } from "hardhat";
import PositionManagerABI from "../abis/PositionManager.json";
import BigNumber from "bignumber.js";

const main = async () => {
  //   const provider = new ethers.JsonRpcProvider(
  //     "https://optimism-goerli.public.blastapi.io"
  //   );
  //   const contract = new ethers.Contract(
  //     "0x39ca85af2f383190cbf7d7c41ed9202d27426ef6",
  //     PositionManagerABI,
  //     provider
  //   );

  //   const call = await contract.factory();
  //   console.log(call);

  const amount = new BigNumber("1031985596180812680");
  const _divideBy = new BigNumber("1000000000000000000");

  const _asset_price = amount.div(_divideBy);
  console.log(_asset_price.toString());
};

main();
