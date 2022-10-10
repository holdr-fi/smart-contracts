import { BigNumberish } from 'ethers';

export type NewWeightedPoolParams = {
  name: string;
  symbol: string;
  tokens: string[];
  normalizedWeights: BigNumberish[];
  rateProviders: string[];
  swapFeePercentage: BigNumberish;
  owner: string;
};
