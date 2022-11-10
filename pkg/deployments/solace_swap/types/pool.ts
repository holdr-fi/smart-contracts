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

export type CreateLBPParams = {
  name: string;
  symbol: string;
  tokens: string[];
  weights: BigNumberish[];
  swapFeePercentage: BigNumberish;
  owner: string;
  swapEnabledOnStart: true;
};

export type LBPPoolConstructorParams = {
  vault: string;
  name: string;
  symbol: string;
  tokens: string[];
  normalizedWeights: BigNumberish[];
  swapFeePercentage: BigNumberish;
  pauseWindowDuration: BigNumberish;
  bufferPeriodDuration: BigNumberish;
  owner: string;
  swapEnabledOnStart: boolean;
};
