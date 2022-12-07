import { Contract, providers } from 'ethers';
import { AssetHelpers } from '../../utils';
import { fp } from '@balancer-labs/v2-helpers/src/numbers';
import { WETH_ADDRESS } from '../../constants';
import LBP_ABI from '../../../tasks/2022xxxx-holdr/abi/NoProtocolFeeLiquidityBootstrappingPool.json';
import { DAY } from '@balancer-labs/v2-helpers/src/time';

export const getLBPPoolActivateTx = async function getLBPPoolActivateTx(
  POOL_ADDRESS: string,
  HLDR_ADDRESS: string,
  USDC_ADDRESS: string,
  provider: providers.Provider
): Promise<void> {
  console.log('Activate LBP pool params: ');
  const pool = new Contract(POOL_ADDRESS, LBP_ABI, provider);
  const currentTime = Math.floor(Date.now() / 1000);
  const assetHelpers = new AssetHelpers(WETH_ADDRESS);
  const tokens = assetHelpers.sortTokens([HLDR_ADDRESS, USDC_ADDRESS], [fp(0.1), fp(0.9)]);
  const endWeights = tokens[1];

  console.log(
    await pool.populateTransaction.updateWeightsGradually(currentTime + 300, currentTime + 300 * 2 + DAY, endWeights)
  );
};
