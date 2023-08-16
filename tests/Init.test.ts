import { Provider, Signer, ethers } from 'ethers';
import HyperSwapper from '../src/index';
import { expect } from 'chai';
import dotenv from 'dotenv';
dotenv.config();
jest.setTimeout(100000);

describe('Initiation Tests', () => {
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
      name_1: 'OPTIMISM',
      name_2: 'BASE',
      signer1: signer1,
      signer2: signer2,
    });
  });
  it('Should init all the providers succesfully', async () => {
    const p1 = swapper.provider1;
    const p2 = swapper.provider2;

    const call1 = await p1.getBlock('latest');
    const call2 = await p2.getBlock('latest');

    expect(call1?.number).greaterThan(0);
    expect(call2?.number).greaterThan(0);
  });

  it('Should init all the contracts succesfully', async () => {
    const c1 = swapper.contract1;
    const c2 = swapper.contract2;

    const call1 = await c1.getAddress();
    const call2 = await c2.getAddress();

    expect(call1).to.not.equal('');
    expect(call2).to.not.equal('');
  });
});
