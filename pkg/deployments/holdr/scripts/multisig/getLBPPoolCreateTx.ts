import { Contract } from 'ethers';
import { AssetHelpers } from '../../utils';
import { fp } from '@balancer-labs/v2-helpers/src/numbers';
import { WETH_ADDRESS } from '../../constants';
import { CreateLBPParams } from '../../types';

export const getLBPPoolCreateTx = async function getLBPPoolCreateTx(
  factory: Contract,
  ADMIN_ADDRESS: string,
  HLDR_ADDRESS: string,
  USDC_ADDRESS: string
): Promise<void> {
  console.log('Launch LBP pool params: ');
  const assetHelpers = new AssetHelpers(WETH_ADDRESS);
  const tokens = assetHelpers.sortTokens([HLDR_ADDRESS, USDC_ADDRESS], [fp(0.9), fp(0.1)]);
  const sortedTokens = tokens[0];
  const sortedWeights = tokens[1];

  const createLBPParams: CreateLBPParams = {
    name: 'HLDR->USDC Auction Pool',
    symbol: 'apHLDR-USDC',
    tokens: sortedTokens,
    weights: sortedWeights,
    swapFeePercentage: fp(0.01),
    owner: ADMIN_ADDRESS,
    swapEnabledOnStart: true,
  };

  console.log(await factory.populateTransaction.create(...Object.values(createLBPParams)));
};
