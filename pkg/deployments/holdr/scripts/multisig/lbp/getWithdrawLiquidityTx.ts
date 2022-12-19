import { Contract, BigNumber, utils, providers } from 'ethers';
import { AssetHelpers } from '../../utils';
import { ExitPoolRequest } from '@balancer-labs/balancer-js';
import LBP_ABI from '../../../tasks/2022xxxx-holdr/abi/NoProtocolFeeLiquidityBootstrappingPool.json';
import { WETH_ADDRESS } from '../../constants';
const { defaultAbiCoder } = utils;

export const getWithdrawLiquidityTx = async function getWithdrawLiquidityTx(
  vault: Contract,
  ADMIN_ADDRESS: string,
  POOL_ADDRESS: string,
  HLDR_ADDRESS: string,
  USDC_ADDRESS: string,
  provider: providers.Provider
): Promise<void> {
  console.log('Seed initial liquidity params: ');
  const pool = new Contract(POOL_ADDRESS, LBP_ABI, provider);

  const poolId = await pool.getPoolId();
  const assetHelpers = new AssetHelpers(WETH_ADDRESS);
  const tokens = assetHelpers.sortTokens([HLDR_ADDRESS, USDC_ADDRESS], [BigNumber.from(10), BigNumber.from(10)]);
  const sortedTokens = tokens[0];
  const minAmountsOut = tokens[1];
  const BPT_BALANCE = await pool.balanceOf(ADMIN_ADDRESS);
  console.log('BPT_BALANCE - ', BPT_BALANCE.toString());

  const ExitKind = 1;
  const abi = ['uint256', 'uint256'];
  const data = [ExitKind, BPT_BALANCE];
  const userDataEncoded = defaultAbiCoder.encode(abi, data);

  const exitPoolRequest: ExitPoolRequest = {
    assets: sortedTokens,
    minAmountsOut: minAmountsOut,
    userData: userDataEncoded,
    toInternalBalance: false,
  };

  console.log('exitPoolRequest: ', exitPoolRequest);

  console.log(
    'Seed initial LBP liquidity parameter: ',
    await vault.populateTransaction.exitPool(poolId, ADMIN_ADDRESS, ADMIN_ADDRESS, exitPoolRequest)
  );
};
