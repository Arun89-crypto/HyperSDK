import { Provider, Signer, ethers } from "ethers";
import HyperSwapper from "../src/index";
import { expect } from "chai";
import dotenv from "dotenv";
import { TransactionResult } from "../src/enum/TransactionResult";
dotenv.config();
jest.setTimeout(100000);

describe("Initiation Tests", () => {
  let swapper: HyperSwapper;
  let signer1: Signer;
  let signer2: Signer;
  let provider1: Provider;
  let provider2: Provider;

  const RPC_OPT = process.env.RPC_OPT as string;
  const RPC_BASE = process.env.RPC_BASE as string;
  const P_KEY = process.env.P_KEY as string;

  beforeEach(async () => {
    provider1 = new ethers.JsonRpcProvider(RPC_OPT);
    provider2 = new ethers.JsonRpcProvider(RPC_BASE);

    signer1 = new ethers.Wallet(P_KEY, provider1);
    signer2 = new ethers.Wallet(P_KEY, provider2);

    swapper = new HyperSwapper({
      rpc_url_1: RPC_OPT,
      rpc_url_2: RPC_BASE,
      name_1: "OPTIMISM",
      name_2: "BASE",
      signer1: signer1,
      signer2: signer2,
    });
  });

  it("Should get the fee estimate for chain 1 to chain 2", async () => {
    const fee_estimate = await swapper._estimateFeeFrom1to2();
    console.log("Fee Estimate 1 -> 2 :", fee_estimate);
    expect(fee_estimate.length).to.greaterThan(10);
  });

  it("Should get the fee estimate for chain 2 to chain 1", async () => {
    const fee_estimate = await swapper._estimateFeeFrom2to1();
    console.log("Fee Estimate 1 -> 2 :", fee_estimate);
    expect(fee_estimate.length).to.greaterThan(10);
  });

  it("Should get native tWETH balance of contracts", async () => {
    const balance = await swapper.getNativeWrappedTokenBalanceContract1();
    console.log("tWETH : OPTIMISM :", balance);
    const balance2 = await swapper.getNativeWrappedTokenBalanceContract2();
    console.log("tWETH : BASE :", balance2);

    expect(Number(balance)).to.greaterThanOrEqual(0);
    expect(Number(balance2)).to.greaterThanOrEqual(0);
  });

  it("Should swap native ETH:[OPTIMISM] -> tWETH:[BASE]", async () => {
    const swap_call = await swapper.Swap1to2("0.001");
    console.log(swap_call);
    expect(swap_call.result).to.equal(TransactionResult.ACCEPTED);
  });

  it("Should swap native tWETH:[BASE] -> ETH:[OPTIMISM]", async () => {
    const swap_call = await swapper.Swap2to1("0.001");
    console.log(swap_call);
    expect(swap_call.result).to.equal(TransactionResult.ACCEPTED);
  });
});
