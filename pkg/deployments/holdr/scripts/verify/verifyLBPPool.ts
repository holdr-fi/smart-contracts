import { task } from '../../input';
import { providers, Contract, BigNumber } from 'ethers';
import LBP_ABI from '../../../tasks/2022xxxx-holdr/abi/NoProtocolFeeLiquidityBootstrappingPool.json';

export const verifyLBPPool = async function verifyLBPPool(
  vaultAddress: string,
  poolAddress: string,
  provider: providers.Provider,
  force = false
): Promise<void> {
  const pool = new Contract(poolAddress, LBP_ABI, provider);
  const [, pauseWindowEndTime, bufferPeriodEndTime] = await pool.getPausedState();

  //   constructor(
  //     IVault vault,
  //     string memory name,
  //     string memory symbol,
  //     IERC20[] memory tokens,
  //     uint256[] memory normalizedWeights,
  //     uint256 swapFeePercentage,
  //     uint256 pauseWindowDuration,
  //     uint256 bufferPeriodDuration,
  //     address owner,
  //     bool swapEnabledOnStart
  // )

  const CONSTRUCTOR_ARGS = [
    vaultAddress,
    'HLDR->wNEAR Auction Pool',
    'HLDR->wNEAR',
    ['0x1aaee8F00D02fcdb10cF1F0caB651dC83318c7AA', '0x7a4137fC69d2460B52c0eb85BC1B9B6aE5e781f6'],
    [BigNumber.from('980000000000000000'), BigNumber.from('20000000000000000')],
    BigNumber.from('10000000000000000'),
    pauseWindowEndTime,
    bufferPeriodEndTime,
    '0xC32e0d89e25222ABb4d2d68755baBF5aA6648F15',
    true,
  ];

  await task.verify('NoProtocolFeeLiquidityBootstrappingPool', poolAddress, CONSTRUCTOR_ARGS);
};
