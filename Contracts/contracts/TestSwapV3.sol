// SPDX-License-Identifier: UNLICENCED
pragma solidity ^0.8.0;
pragma abicoder v2;

// Uniswap V3 Imports
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/interfaces/IQuoter.sol";
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
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Contract to test the swap on Optimism chain
contract TestSwapV3 {
    ISwapRouter public immutable swapRouter;
    address public stableAssetAddressUSDC;
    address public wrappedAssetAddressNative;
    uint24 public constant POOL_FEE = 500;
    IUniswapV3Factory public immutable uniswapV3Factory;
    IQuoter public immutable quoter;

    constructor(
        ISwapRouter _swapRouter,
        address _stableAssetAddressUSDC,
        address _wrappedAssetAddressNative,
        IUniswapV3Factory _uniswapV3Factory,
        IQuoter _quoter
    ) {
        swapRouter = _swapRouter;
        stableAssetAddressUSDC = _stableAssetAddressUSDC;
        wrappedAssetAddressNative = _wrappedAssetAddressNative;
        uniswapV3Factory = _uniswapV3Factory;
        quoter = _quoter;
    }

    function _swapTest(
        uint256 _amountIn,
        address _recipient
    ) public returns (uint256 _amountOut) {
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

    function _getAssetPrice(uint256 _amount) public view returns (uint256) {
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

    function _getQuotes(uint256 _amountIn) public returns (uint256) {
        uint256 _amountOut = quoter.quoteExactInputSingle(
            stableAssetAddressUSDC,
            wrappedAssetAddressNative,
            POOL_FEE,
            _amountIn,
            0
        );
        return _amountOut;
    }

    function _getPool() public view returns (address) {
        address _pool = uniswapV3Factory.getPool(
            stableAssetAddressUSDC,
            wrappedAssetAddressNative,
            POOL_FEE
        );

        return _pool;
    }
}

// 0xE592427A0AEce92De3Edee1F18E0157C05861564
// 0x8A82c434F2701A44258173287aa0497856735386
// 0xea4e3eB04d7EEb22B679D7d753AcCf5e54c6C019
// 0xB656dA17129e7EB733A557f4EBc57B76CFbB5d10
// 0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6
