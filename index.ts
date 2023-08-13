import { Contract, Provider, Signer, ethers } from "ethers";
import { MainConfig } from "./Interface/MainConfig";
import HyperTokenBridgeABI from "./contract_artifacts/contracts/TokenBridgeHyper.sol/TokenBridgeHyper.json";
import ERC20ABI from "./contract_artifacts/contracts/tWETH.sol/TestWETH.json";

import { TESTNET_CONFIG } from "./config";
import BigNumber from "bignumber.js";
import { SwapResult } from "./Interface/SwapResult";
import { TransactionResult } from "./enum/TransactionResult";

const _TEST_PAYLOAD =
  "0x00000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000858a9477f74baa24a7f062b74a7f2d064443df2e";

const _TEST_ADAPTER_PARAM =
  "0x00010000000000000000000000000000000000000000000000000000000000055730";

/**
 * @class HyperSwapper
 */
class HyperSwapper {
  provider1: Provider; // chain 1 provider
  provider2: Provider; // chain 2 provider
  signer: Signer; // signer object (ethers)

  contract1: Contract; // contract instance on chain 1
  contract2: Contract; // contract instance on chain 2

  config: MainConfig;

  /**
   * @description Main Constructor for HyperSwapper
   * @param config : MainConfig
   */
  constructor(config: MainConfig) {
    this.config = config;

    this.provider1 = new ethers.JsonRpcProvider(config.rpc_url_1);
    this.provider2 = new ethers.JsonRpcProvider(config.rpc_url_2);
    this.signer = config.signer;

    this.contract1 = new ethers.Contract(
      TESTNET_CONFIG.DEPLOYED[config.name_1],
      HyperTokenBridgeABI.abi,
      this.signer
    );

    this.contract2 = new ethers.Contract(
      TESTNET_CONFIG.DEPLOYED[config.name_2],
      HyperTokenBridgeABI.abi,
      this.signer
    );
  }

  /**
   * @description Swaps token from chain 1 to chain 2
   * @param _amount
   * @returns SwapResults : Interface
   */
  Swap1to2 = async (_amount: string): Promise<SwapResult> => {
    const fee_estimate = await this._estimateFeeFrom1to2();
    const total_value = this._calcTotalValue(fee_estimate, _amount);

    try {
      const call = await this.contract1.bridgeToken(
        total_value,
        TESTNET_CONFIG[this.config.name_2].CHAIN_ID,
        {
          value: total_value,
          gasPrice: "350000",
        }
      );

      return {
        result: TransactionResult.ACCEPTED,
        TransactionHash: call.transaction_hash,
        TransactionData: call,
      };
    } catch (error) {
      console.log(error);
      return {
        result: TransactionResult.REJECTED,
      };
    }
  };

  /**
   * @description Swaps token from chain 2 to chain 1
   * @param _amount
   * @returns SwapResults : Interface
   */
  Swap2to1 = async (_amount: string): Promise<SwapResult> => {
    const fee_estimate = await this._estimateFeeFrom2to1();
    const total_value = this._calcTotalValue(fee_estimate, _amount);

    try {
      const call = await this.contract2.bridgeToken(
        total_value,
        TESTNET_CONFIG[this.config.name_1].CHAIN_ID,
        {
          value: total_value,
          gasPrice: "350000",
        }
      );

      return {
        result: TransactionResult.ACCEPTED,
        TransactionHash: call.transaction_hash,
        TransactionData: call,
      };
    } catch (error) {
      console.log(error);
      return {
        result: TransactionResult.REJECTED,
      };
    }
  };

  /**
   *
   * @param fee_estimate
   * @param amount
   * @returns total_value : Value to be sent through the transaction
   */
  _calcTotalValue = (fee_estimate: string, amount: string): string => {
    const fee_estimate_bn = new BigNumber(fee_estimate);
    const amount_bn = new BigNumber(amount);

    const total_value_bn = fee_estimate_bn.plus(amount_bn);

    const total_value = total_value_bn.toString();

    return total_value;
  };

  /**
   * @description Function to get the estimated message fee for relayer to process cross chain transaction [Chain 1 -> Chain 2]SWAP
   * @returns fee : estimated fee for message
   */
  _estimateFeeFrom1to2 = async (): Promise<string> => {
    const contract = this.contract1;
    const destChainID = TESTNET_CONFIG[this.config.name_2].CHAIN_ID;
    const address = await this.contract1.getAddress();

    // Get estimated fees to be sent along the value
    const fee = await contract.estimateFee(
      destChainID,
      address,
      _TEST_PAYLOAD,
      false,
      _TEST_ADAPTER_PARAM
    );

    return fee[0];
  };

  /**
   * @description Function to get the estimated message fee for relayer to process cross chain transaction [Chain 2 -> Chain 1]SWAP
   * @returns fee : estimated fee for message
   */
  _estimateFeeFrom2to1 = async (): Promise<string> => {
    const contract = this.contract2;
    const destChainID = TESTNET_CONFIG[this.config.name_1].CHAIN_ID;
    const address = await this.contract1.getAddress();

    // Get estimated fees to be sent along the value
    const fee = await contract.estimateFee(
      destChainID,
      address,
      _TEST_PAYLOAD,
      false,
      _TEST_ADAPTER_PARAM
    );

    return fee[0];
  };

  // ==========================================================
  // Functions to get tWETH address according to chain
  // ==========================================================

  getNativeWrappedTokenAddressChain1 = () => {
    return TESTNET_CONFIG[this.config.name_1].TOKENS.tWETH;
  };
  getNativeWrappedTokenAddressChain2 = () => {
    return TESTNET_CONFIG[this.config.name_2].TOKENS.tWETH;
  };

  // ==========================================================

  // ==========================================================
  // Functions to get tWETH balance in both of the contracts
  // ==========================================================

  getNativeWrappedTokenBalanceContract1 = async () => {
    const provider = this.provider1;
    const address = await this.contract1.getAddress();

    const contract = new ethers.Contract(
      TESTNET_CONFIG[this.config.name_1].TOKENS.tWETH,
      ERC20ABI.abi,
      this.signer
    );

    const balance = await contract.balanceOf(address);
    return balance.toString();
  };

  getNativeWrappedTokenBalanceContract2 = async () => {
    const provider = this.provider1;
    const address = await this.contract1.getAddress();

    const contract = new ethers.Contract(
      TESTNET_CONFIG[this.config.name_2].TOKENS.tWETH,
      ERC20ABI.abi,
      this.signer
    );

    const balance = await contract.balanceOf(address);
    return balance.toString();
  };

  // ==========================================================
}

module.exports = HyperSwapper;
