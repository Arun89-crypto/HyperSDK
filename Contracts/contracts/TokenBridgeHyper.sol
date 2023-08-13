// SPDX-License-Identifier: UNLICENCED
pragma solidity ^0.8.0;
pragma abicoder v2;

/**
 * @title Token Bridge Hyper
 * @notice This is the main contract that will have all the 0Layer & uniswap implementation
 */

// IMPORTS
// import "./NonblockingLzApp.sol";

// LayerZero Imports
import "@layerzerolabs/solidity-examples/contracts/lzApp/NonblockingLzApp.sol";
import "@layerzerolabs/solidity-examples/contracts/lzApp/LzApp.sol";
import "@layerzerolabs/solidity-examples/contracts/interfaces/ILayerZeroReceiver.sol";
import "@layerzerolabs/solidity-examples/contracts/interfaces/ILayerZeroUserApplicationConfig.sol";
import "@layerzerolabs/solidity-examples/contracts/interfaces/ILayerZeroEndpoint.sol";
import "@layerzerolabs/solidity-examples/contracts/util/BytesLib.sol";
import "@layerzerolabs/solidity-examples/contracts/util/ExcessivelySafeCall.sol";

// Uniswap V3 Imports
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-core/contracts/libraries/FixedPoint96.sol";
import "./FullMath.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-core/contracts/interfaces/callback/IUniswapV3SwapCallback.sol";
import "@uniswap/v3-core/contracts/interfaces/pool/IUniswapV3PoolImmutables.sol";
import "@uniswap/v3-core/contracts/interfaces/pool/IUniswapV3PoolState.sol";
import "@uniswap/v3-core/contracts/interfaces/pool/IUniswapV3PoolDerivedState.sol";
import "@uniswap/v3-core/contracts/interfaces/pool/IUniswapV3PoolActions.sol";
import "@uniswap/v3-core/contracts/interfaces/pool/IUniswapV3PoolOwnerActions.sol";
import "@uniswap/v3-core/contracts/interfaces/pool/IUniswapV3PoolEvents.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";

// Uniswap V2 Imports
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router01.sol";

// Open Zeppelin Imports
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

contract TokenBridgeHyper is Ownable, NonblockingLzApp {
    ISwapRouter public immutable swapRouter;
    IUniswapV2Router01 public immutable swapRouter2;
    IUniswapV3Factory public immutable uniswapV3Factory;
    address public priceFeedAddress;
    address public stableAssetAddressUSDC;
    address public wrappedAssetAddressNative;
    uint24 public constant POOL_FEE = 500;

    /**
     * @notice Getting the native balance of the contract
     * @param _endpoint - Endpoint address of Zero Layer Interface
     * @param _swapRouter - UniswapV3 swap router address
     */
    constructor(
        address _endpoint,
        ISwapRouter _swapRouter,
        IUniswapV2Router01 _swapRouter2,
        address _stableAssetAddressUSDC,
        address _wrappedAssetAddressNative,
        IUniswapV3Factory _uniswapV3Factory
    ) NonblockingLzApp(_endpoint) {
        swapRouter = _swapRouter;
        swapRouter2 = _swapRouter2;
        stableAssetAddressUSDC = _stableAssetAddressUSDC;
        wrappedAssetAddressNative = _wrappedAssetAddressNative;
        uniswapV3Factory = _uniswapV3Factory;
    }

    /**
     * @notice To initiate the Token Swap
     * @param _amount - Amount of token to be swapped
     * @param _dstChainId - Destination chain id of the other chain (zero layer id)
     */
    function bridgeToken(uint256 _amount, uint16 _dstChainId) public payable {
        require(
            msg.value >= _amount,
            "You need to send the exact amount of tokens !!"
        );

        // gives 1 eth price
        uint256 amountToSwap = _amount;
        bytes memory payload = abi.encodePacked(amountToSwap, msg.sender);

        uint16 version = 1;
        uint gasForDestinationLzReceive = 350000;
        bytes memory adapterParams = abi.encodePacked(
            version,
            gasForDestinationLzReceive
        );

        // Sending the params to the other chain
        _lzSend(
            _dstChainId,
            payload,
            payable(address(this)),
            address(0x0),
            adapterParams,
            msg.value
        );
    }

    /**
     * @notice To be executed when message is recieved
     * @param _srcChainId - chain id of the message (zero layer id)
     * @param _srcAddress - source address of the message (contract address)
     * @param _payload - Payload of the message received
     */
    function _nonblockingLzReceive(
        uint16 _srcChainId,
        bytes memory _srcAddress,
        uint64,
        bytes memory _payload
    ) internal override {
        address sendBackToAddress;
        assembly {
            sendBackToAddress := mload(add(_srcAddress, 20))
        }

        uint16 srcChainId = _srcChainId;

        (uint256 _amountOfTokenSwapETH, address _recieverAddress) = abi.decode(
            _payload,
            (uint256, address)
        );

        // ! [UNISWAP ERROR] : Quotes not available for custom token pair yet.
        // if (srcChainId == 0) {
        //     // In case of Base -> Optimism
        //     _performAssetSwapOnReceivingV3(
        //         _amountOfTokenSwapUSD,
        //         _recieverAddress
        //     );
        // } else {
        //     // In case of Optimism -> Base
        //     _performAssetSwapOnReceivingV2(
        //         _amountOfTokenSwapUSD,
        //         _recieverAddress
        //     );
        // }

        _performSwap(_amountOfTokenSwapETH, _recieverAddress);
    }

    function _performSwap(uint256 _amount, address _reciever) private {
        IERC20(wrappedAssetAddressNative).transfer(_reciever, _amount);
    }

    /**
     * @notice To execute the swaps on the behalf of the contract
     * @param _amountIn - the sent amount
     * @param _recipient - address of the receiver of the assets
     */
    function _performAssetSwapOnReceivingV3(
        uint256 _amountIn,
        address _recipient
    ) private returns (uint256 _amountOut) {
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: stableAssetAddressUSDC,
                tokenOut: wrappedAssetAddressNative,
                fee: POOL_FEE,
                recipient: _recipient,
                deadline: block.timestamp,
                amountIn: _amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        _amountOut = swapRouter.exactInputSingle(params);
        return _amountOut;
    }

    /**
     * @notice To execute the swaps on the behalf of the contract
     * @param _amountIn - the sent amount
     * @param _recipient - address of the receiver of the assets
     */
    function _performAssetSwapOnReceivingV2(
        uint256 _amountIn,
        address _recipient
    ) private returns (uint256[] memory _amountOut) {
        uint deadline = block.timestamp + 100000;
        address[] memory path = new address[](2);
        path[0] = address(stableAssetAddressUSDC);
        path[1] = address(wrappedAssetAddressNative);

        _amountOut = swapRouter2.swapExactTokensForTokens(
            0,
            _amountIn,
            path,
            _recipient,
            deadline
        );
    }

    /**
     * @notice To get the price of the native asset
     * @param _amount - The amount of native token that needs to be swapped
     */
    function _getAssetPrice(uint256 _amount) private view returns (uint256) {
        IUniswapV3Pool pool = IUniswapV3Pool(
            uniswapV3Factory.getPool(
                stableAssetAddressUSDC,
                wrappedAssetAddressNative,
                POOL_FEE
            )
        );
        (uint160 sqrtPriceX96, , , , , , ) = pool.slot0();
        uint256 amount0 = FullMath.mulDiv(
            pool.liquidity(),
            FixedPoint96.Q96,
            sqrtPriceX96
        );
        uint256 amount1 = FullMath.mulDiv(
            pool.liquidity(),
            sqrtPriceX96,
            FixedPoint96.Q96
        );
        uint256 priceFromLiquidityPool = (amount1 *
            10 ** ERC20(stableAssetAddressUSDC).decimals()) / amount0;

        return _amount * priceFromLiquidityPool;
    }

    /**
     * @notice Getting the native balance of the contract
     */
    function getContractBalanceNatve() public view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Withdrawing the Native Balance from the smart contract
     * @dev Only owner function
     */
    function withdrawNative() public onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Withdraw Failed !!!");
    }

    receive() external payable {}
}
