import { Contract, utils, providers } from 'ethers';
import { AssetHelpers } from '../../utils';
import { JoinPoolRequest } from '@balancer-labs/balancer-js';
import LBP_ABI from '../../../tasks/2022xxxx-holdr/abi/NoProtocolFeeLiquidityBootstrappingPool.json';
import ERC20_ABI from '../../constants/abis/ERC20.json';
import { WETH_ADDRESS, MAX_UINT256, ONE_MILLION_ETHER, ONE_HUNDRED_THOUSAND_USDC } from '../../constants';
const { defaultAbiCoder } = utils;

export const getSeedLiquidityTx = async function getSeedLiquidityTx(
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
  const tokens = assetHelpers.sortTokens(
    [HLDR_ADDRESS, USDC_ADDRESS],
    [ONE_MILLION_ETHER.mul(2), ONE_HUNDRED_THOUSAND_USDC]
  );
  const JoinKind = 0;
  const sortedTokens = tokens[0];
  const exactAmountsIn = tokens[1];
  const abi = ['uint256', 'uint256[]'];
  const data = [JoinKind, exactAmountsIn];
  const userDataEncoded = defaultAbiCoder.encode(abi, data);

  const joinPoolRequest: JoinPoolRequest = {
    assets: sortedTokens,
    maxAmountsIn: exactAmountsIn,
    userData: userDataEncoded,
    fromInternalBalance: false,
  };

  console.log(
    'Seed initial LBP liquidity parameter: ',
    await vault.populateTransaction.joinPool(poolId, ADMIN_ADDRESS, ADMIN_ADDRESS, joinPoolRequest)
  );
};
