"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const TokenBridgeHyper_json_1 = __importDefault(require("./contract_artifacts/contracts/TokenBridgeHyper.sol/TokenBridgeHyper.json"));
const TestWETH_json_1 = __importDefault(require("./contract_artifacts/contracts/tWETH.sol/TestWETH.json"));
const ILayerZeroEndpoint_json_1 = __importDefault(require("./contract_artifacts/@layerzerolabs/solidity-examples/contracts/interfaces/ILayerZeroEndpoint.sol/ILayerZeroEndpoint.json"));
const config_1 = require("./config");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const TransactionResult_1 = require("./enum/TransactionResult");
const scan_client_1 = require("@layerzerolabs/scan-client");
const _TEST_PAYLOAD = "0x00000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000858a9477f74baa24a7f062b74a7f2d064443df2e";
const _TEST_ADAPTER_PARAM = "0x00010000000000000000000000000000000000000000000000000000000000055730";
/**
 * @class HyperSwapper
 */
class HyperSwapper {
    /**
     * @description Main Constructor for HyperSwapper
     * @param config : MainConfig
     */
    constructor(config) {
        /**
         * @description Swaps token from chain 1 to chain 2
         * @param _amount
         * @returns SwapResults : Interface
         */
        this.Swap1to2 = (_amount) => __awaiter(this, void 0, void 0, function* () {
            const fee_estimate = yield this._estimateFeeFrom1to2();
            const price_wei = ethers_1.ethers.parseUnits(_amount, 18).toString();
            const total_value = this._calcTotalValue(fee_estimate, price_wei);
            try {
                const call = yield this.contract1.bridgeToken(total_value, config_1.TESTNET_CONFIG[this.config.name_2].CHAIN_ID, {
                    value: total_value,
                    gasPrice: "350000",
                });
                return {
                    result: TransactionResult_1.TransactionResult.ACCEPTED,
                    TransactionHash: call.hash,
                    TransactionData: call,
                };
            }
            catch (error) {
                console.log(error);
                return {
                    result: TransactionResult_1.TransactionResult.REJECTED,
                };
            }
        });
        /**
         * @description Swaps token from chain 2 to chain 1
         * @param _amount
         * @returns SwapResults : Interface
         */
        this.Swap2to1 = (_amount) => __awaiter(this, void 0, void 0, function* () {
            const fee_estimate = yield this._estimateFeeFrom2to1();
            const price_wei = ethers_1.ethers.parseUnits(_amount, 18).toString();
            const total_value = this._calcTotalValue(fee_estimate, price_wei);
            try {
                const call = yield this.contract2.bridgeToken(total_value, config_1.TESTNET_CONFIG[this.config.name_1].CHAIN_ID, {
                    value: total_value,
                    gasPrice: "350000",
                });
                return {
                    result: TransactionResult_1.TransactionResult.ACCEPTED,
                    TransactionHash: call.hash,
                    TransactionData: call,
                };
            }
            catch (error) {
                console.log(error);
                return {
                    result: TransactionResult_1.TransactionResult.REJECTED,
                };
            }
        });
        /**
         *
         * @param fee_estimate
         * @param amount
         * @returns total_value : Value to be sent through the transaction
         */
        this._calcTotalValue = (fee_estimate, amount) => {
            const fee_estimate_bn = new bignumber_js_1.default(fee_estimate);
            const amount_bn = new bignumber_js_1.default(amount);
            const total_value_bn = fee_estimate_bn.plus(amount_bn);
            const total_value = total_value_bn.toString();
            return total_value;
        };
        /**
         * @description Function to get the estimated message fee for relayer to process cross chain transaction [Chain 1 -> Chain 2]SWAP
         * @returns fee : estimated fee for message
         */
        this._estimateFeeFrom1to2 = () => __awaiter(this, void 0, void 0, function* () {
            const contract = this.endpoint1;
            const destChainID = config_1.TESTNET_CONFIG[this.config.name_2].CHAIN_ID;
            const address = yield this.contract1.getAddress();
            // Get estimated fees to be sent along the value
            const fee = yield contract.estimateFees(destChainID, address, _TEST_PAYLOAD, false, _TEST_ADAPTER_PARAM);
            return fee[0].toString();
        });
        /**
         * @description Function to get the estimated message fee for relayer to process cross chain transaction [Chain 2 -> Chain 1]SWAP
         * @returns fee : estimated fee for message
         */
        this._estimateFeeFrom2to1 = () => __awaiter(this, void 0, void 0, function* () {
            const contract = this.endpoint2;
            const destChainID = config_1.TESTNET_CONFIG[this.config.name_1].CHAIN_ID;
            const address = yield this.contract1.getAddress();
            // Get estimated fees to be sent along the value
            const fee = yield contract.estimateFees(destChainID, address, _TEST_PAYLOAD, false, _TEST_ADAPTER_PARAM);
            return fee[0].toString();
        });
        // ==========================================================
        // Functions to get the transaction status from layerzero
        // ==========================================================
        this._getTransactionStatusLZ_1 = (txn_hash) => __awaiter(this, void 0, void 0, function* () {
            const chainId_source = config_1.TESTNET_CONFIG[this.config.name_1].CHAIN_ID;
            // wait for message to relay in layerzero
            // --------------------------------------
            setTimeout(() => { }, 5000);
            const call = yield (0, scan_client_1.getMessagesBySrcTxHash)(Number(chainId_source), txn_hash);
            console.log(call);
            return call.messages[0].status;
        });
        this._getFullTransactionStatusLZ_1 = (txn_hash) => __awaiter(this, void 0, void 0, function* () {
            const chainId_source = config_1.TESTNET_CONFIG[this.config.name_1].CHAIN_ID;
            const call = yield (0, scan_client_1.getMessagesBySrcTxHash)(Number(chainId_source), txn_hash);
            //@ts-ignore
            return call.messages[0];
        });
        this._getTransactionStatusLZ_2 = (txn_hash) => __awaiter(this, void 0, void 0, function* () {
            const chainId_source = config_1.TESTNET_CONFIG[this.config.name_2].CHAIN_ID;
            const call = yield (0, scan_client_1.getMessagesBySrcTxHash)(Number(chainId_source), txn_hash);
            return call.messages[0].status;
        });
        this._getFullTransactionStatusLZ_2 = (txn_hash) => __awaiter(this, void 0, void 0, function* () {
            const chainId_source = config_1.TESTNET_CONFIG[this.config.name_2].CHAIN_ID;
            const call = yield (0, scan_client_1.getMessagesBySrcTxHash)(Number(chainId_source), txn_hash);
            //@ts-ignore
            return call.messages[0];
        });
        // ==========================================================
        // ==========================================================
        // Functions to get tWETH address according to chain
        // ==========================================================
        this.getNativeWrappedTokenAddressChain1 = () => {
            return config_1.TESTNET_CONFIG[this.config.name_1].TOKENS.tWETH;
        };
        this.getNativeWrappedTokenAddressChain2 = () => {
            return config_1.TESTNET_CONFIG[this.config.name_2].TOKENS.tWETH;
        };
        // ==========================================================
        // ==========================================================
        // Functions to get tWETH balance in both of the contracts
        // ==========================================================
        this.getNativeWrappedTokenBalanceContract1 = () => __awaiter(this, void 0, void 0, function* () {
            const address = yield this.contract1.getAddress();
            const contract = new ethers_1.ethers.Contract(config_1.TESTNET_CONFIG[this.config.name_1].TOKENS.tWETH, TestWETH_json_1.default.abi, this.signer1);
            const balance = yield contract.balanceOf(address);
            return balance.toString();
        });
        this.getNativeWrappedTokenBalanceContract2 = () => __awaiter(this, void 0, void 0, function* () {
            const address = yield this.contract2.getAddress();
            const contract = new ethers_1.ethers.Contract(config_1.TESTNET_CONFIG[this.config.name_2].TOKENS.tWETH, TestWETH_json_1.default.abi, this.signer2);
            const balance = yield contract.balanceOf(address);
            return balance.toString();
        });
        this.config = config;
        this.signer1 = config.signer1;
        this.signer2 = config.signer2;
        this.provider1 = new ethers_1.ethers.JsonRpcProvider(config.rpc_url_1);
        this.provider2 = new ethers_1.ethers.JsonRpcProvider(config.rpc_url_2);
        this.contract1 = new ethers_1.ethers.Contract(config_1.TESTNET_CONFIG.DEPLOYED[config.name_1], TokenBridgeHyper_json_1.default.abi, this.signer1);
        this.contract2 = new ethers_1.ethers.Contract(config_1.TESTNET_CONFIG.DEPLOYED[config.name_2], TokenBridgeHyper_json_1.default.abi, this.signer2);
        this.endpoint1 = new ethers_1.ethers.Contract(config_1.TESTNET_CONFIG[config.name_1].ENDPOINT, ILayerZeroEndpoint_json_1.default.abi, this.signer1);
        this.endpoint2 = new ethers_1.ethers.Contract(config_1.TESTNET_CONFIG[config.name_2].ENDPOINT, ILayerZeroEndpoint_json_1.default.abi, this.signer2);
    }
}
exports.default = HyperSwapper;
