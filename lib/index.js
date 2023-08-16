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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HyperSwapper = void 0;
var ethers_1 = require("ethers");
var TokenBridgeHyper_json_1 = __importDefault(require("./contract_artifacts/contracts/TokenBridgeHyper.sol/TokenBridgeHyper.json"));
var TestWETH_json_1 = __importDefault(require("./contract_artifacts/contracts/tWETH.sol/TestWETH.json"));
var ILayerZeroEndpoint_json_1 = __importDefault(require("./contract_artifacts/@layerzerolabs/solidity-examples/contracts/interfaces/ILayerZeroEndpoint.sol/ILayerZeroEndpoint.json"));
var config_1 = require("./config");
var bignumber_js_1 = __importDefault(require("bignumber.js"));
var TransactionResult_1 = require("./enum/TransactionResult");
var scan_client_1 = require("@layerzerolabs/scan-client");
var _TEST_PAYLOAD = '0x00000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000858a9477f74baa24a7f062b74a7f2d064443df2e';
var _TEST_ADAPTER_PARAM = '0x00010000000000000000000000000000000000000000000000000000000000055730';
/**
 * @class HyperSwapper
 */
var HyperSwapper = /** @class */ (function () {
    /**
     * @description Main Constructor for HyperSwapper
     * @param config : MainConfig
     */
    function HyperSwapper(config) {
        var _this = this;
        /**
         * @description Swaps token from chain 1 to chain 2
         * @param _amount
         * @returns SwapResults : Interface
         */
        this.Swap1to2 = function (_amount) { return __awaiter(_this, void 0, void 0, function () {
            var fee_estimate, price_wei, total_value, call, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._estimateFeeFrom1to2()];
                    case 1:
                        fee_estimate = _a.sent();
                        price_wei = ethers_1.ethers.parseUnits(_amount, 18).toString();
                        total_value = this._calcTotalValue(fee_estimate, price_wei);
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.contract1.bridgeToken(total_value, config_1.TESTNET_CONFIG[this.config.name_2].CHAIN_ID, {
                                value: total_value,
                                gasPrice: '350000',
                            })];
                    case 3:
                        call = _a.sent();
                        return [2 /*return*/, {
                                result: TransactionResult_1.TransactionResult.ACCEPTED,
                                TransactionHash: call.hash,
                                TransactionData: call,
                            }];
                    case 4:
                        error_1 = _a.sent();
                        console.log(error_1);
                        return [2 /*return*/, {
                                result: TransactionResult_1.TransactionResult.REJECTED,
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        /**
         * @description Swaps token from chain 2 to chain 1
         * @param _amount
         * @returns SwapResults : Interface
         */
        this.Swap2to1 = function (_amount) { return __awaiter(_this, void 0, void 0, function () {
            var fee_estimate, price_wei, total_value, call, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._estimateFeeFrom2to1()];
                    case 1:
                        fee_estimate = _a.sent();
                        price_wei = ethers_1.ethers.parseUnits(_amount, 18).toString();
                        total_value = this._calcTotalValue(fee_estimate, price_wei);
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.contract2.bridgeToken(total_value, config_1.TESTNET_CONFIG[this.config.name_1].CHAIN_ID, {
                                value: total_value,
                                gasPrice: '350000',
                            })];
                    case 3:
                        call = _a.sent();
                        return [2 /*return*/, {
                                result: TransactionResult_1.TransactionResult.ACCEPTED,
                                TransactionHash: call.hash,
                                TransactionData: call,
                            }];
                    case 4:
                        error_2 = _a.sent();
                        console.log(error_2);
                        return [2 /*return*/, {
                                result: TransactionResult_1.TransactionResult.REJECTED,
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        /**
         *
         * @param fee_estimate
         * @param amount
         * @returns total_value : Value to be sent through the transaction
         */
        this._calcTotalValue = function (fee_estimate, amount) {
            var fee_estimate_bn = new bignumber_js_1.default(fee_estimate);
            var amount_bn = new bignumber_js_1.default(amount);
            var total_value_bn = fee_estimate_bn.plus(amount_bn);
            var total_value = total_value_bn.toString();
            return total_value;
        };
        /**
         * @description Function to get the estimated message fee for relayer to process cross chain transaction [Chain 1 -> Chain 2]SWAP
         * @returns fee : estimated fee for message
         */
        this._estimateFeeFrom1to2 = function () { return __awaiter(_this, void 0, void 0, function () {
            var contract, destChainID, address, fee;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contract = this.endpoint1;
                        destChainID = config_1.TESTNET_CONFIG[this.config.name_2].CHAIN_ID;
                        return [4 /*yield*/, this.contract1.getAddress()];
                    case 1:
                        address = _a.sent();
                        return [4 /*yield*/, contract.estimateFees(destChainID, address, _TEST_PAYLOAD, false, _TEST_ADAPTER_PARAM)];
                    case 2:
                        fee = _a.sent();
                        return [2 /*return*/, fee[0].toString()];
                }
            });
        }); };
        /**
         * @description Function to get the estimated message fee for relayer to process cross chain transaction [Chain 2 -> Chain 1]SWAP
         * @returns fee : estimated fee for message
         */
        this._estimateFeeFrom2to1 = function () { return __awaiter(_this, void 0, void 0, function () {
            var contract, destChainID, address, fee;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contract = this.endpoint2;
                        destChainID = config_1.TESTNET_CONFIG[this.config.name_1].CHAIN_ID;
                        return [4 /*yield*/, this.contract1.getAddress()];
                    case 1:
                        address = _a.sent();
                        return [4 /*yield*/, contract.estimateFees(destChainID, address, _TEST_PAYLOAD, false, _TEST_ADAPTER_PARAM)];
                    case 2:
                        fee = _a.sent();
                        return [2 /*return*/, fee[0].toString()];
                }
            });
        }); };
        // ==========================================================
        // Functions to get the transaction status from layerzero
        // ==========================================================
        this._getTransactionStatusLZ_1 = function (txn_hash) { return __awaiter(_this, void 0, void 0, function () {
            var chainId_source, call;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        chainId_source = config_1.TESTNET_CONFIG[this.config.name_1].CHAIN_ID;
                        // wait for message to relay in layerzero
                        // --------------------------------------
                        setTimeout(function () { }, 5000);
                        return [4 /*yield*/, (0, scan_client_1.getMessagesBySrcTxHash)(Number(chainId_source), txn_hash)];
                    case 1:
                        call = _a.sent();
                        console.log(call);
                        return [2 /*return*/, call.messages[0].status];
                }
            });
        }); };
        this._getFullTransactionStatusLZ_1 = function (txn_hash) { return __awaiter(_this, void 0, void 0, function () {
            var chainId_source, call;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        chainId_source = config_1.TESTNET_CONFIG[this.config.name_1].CHAIN_ID;
                        return [4 /*yield*/, (0, scan_client_1.getMessagesBySrcTxHash)(Number(chainId_source), txn_hash)];
                    case 1:
                        call = _a.sent();
                        //@ts-ignore
                        return [2 /*return*/, call.messages[0]];
                }
            });
        }); };
        this._getTransactionStatusLZ_2 = function (txn_hash) { return __awaiter(_this, void 0, void 0, function () {
            var chainId_source, call;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        chainId_source = config_1.TESTNET_CONFIG[this.config.name_2].CHAIN_ID;
                        return [4 /*yield*/, (0, scan_client_1.getMessagesBySrcTxHash)(Number(chainId_source), txn_hash)];
                    case 1:
                        call = _a.sent();
                        return [2 /*return*/, call.messages[0].status];
                }
            });
        }); };
        this._getFullTransactionStatusLZ_2 = function (txn_hash) { return __awaiter(_this, void 0, void 0, function () {
            var chainId_source, call;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        chainId_source = config_1.TESTNET_CONFIG[this.config.name_2].CHAIN_ID;
                        return [4 /*yield*/, (0, scan_client_1.getMessagesBySrcTxHash)(Number(chainId_source), txn_hash)];
                    case 1:
                        call = _a.sent();
                        //@ts-ignore
                        return [2 /*return*/, call.messages[0]];
                }
            });
        }); };
        // ==========================================================
        // ==========================================================
        // Functions to get tWETH address according to chain
        // ==========================================================
        this.getNativeWrappedTokenAddressChain1 = function () {
            return config_1.TESTNET_CONFIG[_this.config.name_1].TOKENS.tWETH;
        };
        this.getNativeWrappedTokenAddressChain2 = function () {
            return config_1.TESTNET_CONFIG[_this.config.name_2].TOKENS.tWETH;
        };
        // ==========================================================
        // ==========================================================
        // Functions to get tWETH balance in both of the contracts
        // ==========================================================
        this.getNativeWrappedTokenBalanceContract1 = function () { return __awaiter(_this, void 0, void 0, function () {
            var address, contract, balance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contract1.getAddress()];
                    case 1:
                        address = _a.sent();
                        contract = new ethers_1.ethers.Contract(config_1.TESTNET_CONFIG[this.config.name_1].TOKENS.tWETH, TestWETH_json_1.default.abi, this.signer1);
                        return [4 /*yield*/, contract.balanceOf(address)];
                    case 2:
                        balance = _a.sent();
                        return [2 /*return*/, balance.toString()];
                }
            });
        }); };
        this.getNativeWrappedTokenBalanceContract2 = function () { return __awaiter(_this, void 0, void 0, function () {
            var address, contract, balance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.contract2.getAddress()];
                    case 1:
                        address = _a.sent();
                        contract = new ethers_1.ethers.Contract(config_1.TESTNET_CONFIG[this.config.name_2].TOKENS.tWETH, TestWETH_json_1.default.abi, this.signer2);
                        return [4 /*yield*/, contract.balanceOf(address)];
                    case 2:
                        balance = _a.sent();
                        return [2 /*return*/, balance.toString()];
                }
            });
        }); };
        this.config = config;
        this.signer1 = config.signer_1;
        this.signer2 = config.signer_2;
        this.provider1 = new ethers_1.ethers.JsonRpcProvider(config.rpc_url_1);
        this.provider2 = new ethers_1.ethers.JsonRpcProvider(config.rpc_url_2);
        this.contract1 = new ethers_1.ethers.Contract(config_1.TESTNET_CONFIG.DEPLOYED[config.name_1], TokenBridgeHyper_json_1.default.abi, this.signer1);
        this.contract2 = new ethers_1.ethers.Contract(config_1.TESTNET_CONFIG.DEPLOYED[config.name_2], TokenBridgeHyper_json_1.default.abi, this.signer2);
        this.endpoint1 = new ethers_1.ethers.Contract(config_1.TESTNET_CONFIG[config.name_1].ENDPOINT, ILayerZeroEndpoint_json_1.default.abi, this.signer1);
        this.endpoint2 = new ethers_1.ethers.Contract(config_1.TESTNET_CONFIG[config.name_2].ENDPOINT, ILayerZeroEndpoint_json_1.default.abi, this.signer2);
    }
    return HyperSwapper;
}());
exports.HyperSwapper = HyperSwapper;
