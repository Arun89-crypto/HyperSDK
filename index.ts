import { Contract, Provider, Signer, ethers } from "ethers";
import { MainConfig } from "./Interface/MainConfig";
import HyperTokenBridgeABI from "./contract_artifacts/contracts/TokenBridgeHyper.sol/TokenBridgeHyper.json";
import ERC20ABI from "./contract_artifacts/contracts/tWETH.sol/TestWETH.json";
import ENDPOINTABI from "./contract_artifacts/@layerzerolabs/solidity-examples/contracts/interfaces/ILayerZeroEndpoint.sol/ILayerZeroEndpoint.json";
import { TESTNET_CONFIG } from "./config";
import BigNumber from "bignumber.js";
import { SwapResult } from "./Interface/SwapResult";
import { TransactionResult } from "./enum/TransactionResult";
import { getMessagesBySrcTxHash } from "@layerzerolabs/scan-client";
import { Message } from "./Types/LayerZeroMessage";
import { MessageStatus } from "./enum/MessageStatus";

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

  signer1: Signer; // signer chain 1
  signer2: Signer; // signer chain 2

  contract1: Contract; // contract instance on chain 1
  contract2: Contract; // contract instance on chain 2

  endpoint1: Contract;
  endpoint2: Contract;

  config: MainConfig;

  /**
   * @description Main Constructor for HyperSwapper
   * @param config : MainConfig
   */
  constructor(config: MainConfig) {
    this.config = config;
    this.signer1 = config.signer1;
    this.signer2 = config.signer2;

    this.provider1 = new ethers.JsonRpcProvider(config.rpc_url_1);
    this.provider2 = new ethers.JsonRpcProvider(config.rpc_url_2);

    this.contract1 = new ethers.Contract(
      TESTNET_CONFIG.DEPLOYED[config.name_1],
      HyperTokenBridgeABI.abi,
      this.signer1
    );

    this.contract2 = new ethers.Contract(
      TESTNET_CONFIG.DEPLOYED[config.name_2],
      HyperTokenBridgeABI.abi,
      this.signer2
    );

    this.endpoint1 = new ethers.Contract(
      TESTNET_CONFIG[config.name_1].ENDPOINT,
      ENDPOINTABI.abi,
      this.signer1
    );

    this.endpoint2 = new ethers.Contract(
      TESTNET_CONFIG[config.name_2].ENDPOINT,
      ENDPOINTABI.abi,
      this.signer2
    );
  }

  /**
   * @description Swaps token from chain 1 to chain 2
   * @param _amount
   * @returns SwapResults : Interface
   */
  Swap1to2 = async (_amount: string): Promise<SwapResult> => {
    const fee_estimate = await this._estimateFeeFrom1to2();
    const price_wei = ethers.parseUnits(_amount, 18).toString();
    const total_value = this._calcTotalValue(fee_estimate, price_wei);

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
        TransactionHash: call.hash,
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
    const price_wei = ethers.parseUnits(_amount, 18).toString();
    const total_value = this._calcTotalValue(fee_estimate, price_wei);

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
        TransactionHash: call.hash,
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
    const contract = this.endpoint1;
    const destChainID = TESTNET_CONFIG[this.config.name_2].CHAIN_ID;
    const address = await this.contract1.getAddress();

    // Get estimated fees to be sent along the value
    const fee = await contract.estimateFees(
      destChainID,
      address,
      _TEST_PAYLOAD,
      false,
      _TEST_ADAPTER_PARAM
    );

    return fee[0].toString();
  };

  /**
   * @description Function to get the estimated message fee for relayer to process cross chain transaction [Chain 2 -> Chain 1]SWAP
   * @returns fee : estimated fee for message
   */
  _estimateFeeFrom2to1 = async (): Promise<string> => {
    const contract = this.endpoint2;
    const destChainID = TESTNET_CONFIG[this.config.name_1].CHAIN_ID;
    const address = await this.contract1.getAddress();

    // Get estimated fees to be sent along the value
    const fee = await contract.estimateFees(
      destChainID,
      address,
      _TEST_PAYLOAD,
      false,
      _TEST_ADAPTER_PARAM
    );

    return fee[0].toString();
  };

  // ==========================================================
  // Functions to get the transaction status from layerzero
  // ==========================================================
  _getTransactionStatusLZ_1 = async (
    txn_hash: string
  ): Promise<MessageStatus> => {
    const chainId_source = TESTNET_CONFIG[this.config.name_1].CHAIN_ID;
    // wait for message to relay in layerzero
    // --------------------------------------
    setTimeout(() => {}, 5000);
    const call = await getMessagesBySrcTxHash(Number(chainId_source), txn_hash);
    console.log(call);
    return call.messages[0].status;
  };
  _getFullTransactionStatusLZ_1 = async (
    txn_hash: string
  ): Promise<Message> => {
    const chainId_source = TESTNET_CONFIG[this.config.name_1].CHAIN_ID;
    const call = await getMessagesBySrcTxHash(Number(chainId_source), txn_hash);
    //@ts-ignore
    return call.messages[0];
  };
  _getTransactionStatusLZ_2 = async (
    txn_hash: string
  ): Promise<MessageStatus> => {
    const chainId_source = TESTNET_CONFIG[this.config.name_2].CHAIN_ID;
    const call = await getMessagesBySrcTxHash(Number(chainId_source), txn_hash);
    return call.messages[0].status;
  };
  _getFullTransactionStatusLZ_2 = async (
    txn_hash: string
  ): Promise<Message> => {
    const chainId_source = TESTNET_CONFIG[this.config.name_2].CHAIN_ID;
    const call = await getMessagesBySrcTxHash(Number(chainId_source), txn_hash);
    //@ts-ignore
    return call.messages[0];
  };
  // ==========================================================

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
    const address = await this.contract1.getAddress();

    const contract = new ethers.Contract(
      TESTNET_CONFIG[this.config.name_1].TOKENS.tWETH,
      ERC20ABI.abi,
      this.signer1
    );

    const balance = await contract.balanceOf(address);
    return balance.toString();
  };

  getNativeWrappedTokenBalanceContract2 = async () => {
    const address = await this.contract2.getAddress();

    const contract = new ethers.Contract(
      TESTNET_CONFIG[this.config.name_2].TOKENS.tWETH,
      ERC20ABI.abi,
      this.signer2
    );

    const balance = await contract.balanceOf(address);
    return balance.toString();
  };

  // ==========================================================
}

export default HyperSwapper;
