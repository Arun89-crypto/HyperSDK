import { Provider, Signer, ethers } from "ethers";
import HyperSwapper from "../index";
import { expect } from "chai";
import dotenv from "dotenv";
dotenv.config();

describe("Initiation Tests", () => {
  let swapper: HyperSwapper;
  let signer: Signer;
  let provider: Provider;

  const RPC_OPT = process.env.RPC_OPT as string;
  const RPC_BASE = process.env.RPC_BASE as string;
  const P_KEY = process.env.P_KEY as string;

  beforeEach(async () => {
    provider = new ethers.JsonRpcProvider(RPC_OPT);

    signer = new ethers.Wallet(P_KEY);

    swapper = new HyperSwapper({
      rpc_url_1: RPC_OPT,
      rpc_url_2: RPC_BASE,
      name_1: "OPTIMISM",
      name_2: "BASE",
      signer,
    });
  });
  it("Should init all the providers succesfully", async () => {
    const p1 = swapper.provider1;
    const p2 = swapper.provider2;

    const call1 = await p1.getBlock("latest");
    const call2 = await p2.getBlock("latest");

    expect(call1?.number).greaterThan(0);
    expect(call2?.number).greaterThan(0);
  });

  it("Should init all the contracts succesfully", async () => {
    const c1 = swapper.contract1;
    const c2 = swapper.contract2;

    const call1 = await c1.getAddress();
    const call2 = await c2.getAddress();

    expect(call1).to.not.equal("");
    expect(call2).to.not.equal("");
  });
});
