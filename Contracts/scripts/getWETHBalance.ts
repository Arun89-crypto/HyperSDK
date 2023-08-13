import { ethers } from "hardhat";
import { TESTNET_CONFIG } from "../config";

const main = async () => {
  const signers = await ethers.getSigners();

  const bal_erc20_weth = await ethers.getContractAt(
    "ERC20",
    TESTNET_CONFIG.BASE.TOKENS.tWETH,
    signers[0]
  );

  const bal = await bal_erc20_weth.balanceOf(signers[0].address);

  console.log(bal);

  //   const bal = await ethers.provider.getBalance(signers[0].address);
  //   const bal2 = await ethers.provider.getBalance(
  //     "0xb6b3e3990e72c054fff5aca3bdc093611c4aee74"
  //   );

  //   console.log(`Balance :`, bal.toString());
  //   console.log(`Balance Contract :`, bal2.toString());
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
