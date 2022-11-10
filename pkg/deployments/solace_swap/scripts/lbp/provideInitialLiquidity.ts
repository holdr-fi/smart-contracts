import { Contract, BigNumber } from 'ethers';
import { JoinPoolRequest } from '@balancer-labs/balancer-js';
const { defaultAbiCoder } = ethers.utils;
import { WETH_ADDRESS, MAX_UINT256 } from '../../constants';
import { ethers, logger } from '../../input';
import { AssetHelpers } from '../../utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { fp } from '@balancer-labs/v2-helpers/src/numbers';

export const provideInitialLiquidity = async function provideInitialLiquidity(
  poolContract: Contract,
  vaultContract: Contract,
  token0: Contract,
  token1: Contract,
  initialLiquidityToken0: BigNumber,
  provider: SignerWithAddress
): Promise<void> {
  const poolId = await poolContract.getPoolId();
  const assetHelpers = new AssetHelpers(WETH_ADDRESS);
  const tokens = assetHelpers.sortTokens(
    [token0.address, token1.address],
    [fp(0.02).mul(initialLiquidityToken0).div(fp(1.0)), fp(0.98).mul(initialLiquidityToken0).div(fp(1.0))]
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

  logger.info('Approving Vault to transfer HLDR and token1 tokens');
  await token0.connect(provider).approve(vaultContract.address, MAX_UINT256);
  await token1.connect(provider).approve(vaultContract.address, MAX_UINT256);
  logger.info('Seeding initial liquidity for LBP');
  const tx = await vaultContract
    .connect(provider)
    .joinPool(poolId, provider.address, provider.address, joinPoolRequest);
  await tx.wait();
  logger.success('Seeded initial liquidity for SWP-ETH 80-20 SPT pool');
};
