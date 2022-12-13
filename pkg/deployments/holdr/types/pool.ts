import { BigNumberish } from 'ethers';

export type NewStablePoolParams = {
  name: string;
  symbol: string;
  tokens: string[];
  // 'Flatness' of curve. More stable coins => Higher amplification factor
  // Constant product => A = )
  // Constant sum => A = infinity
  amplificationParameter: BigNumberish;
  // Stable pool rely on rate providers to inform of exchange rate, if pass ZERO_ADDRESS => Value of 1
  // Require 'getRate()' method
  rateProviders: string[];
  // How long will rate be cached in seconds
  tokenRateCacheDurations: BigNumberish[];
  // Avoid double tax on yield? Irrelevant if no rate provider
  exemptFromYieldProtocolFeeFlags: boolean[];
  swapFeePercentage: BigNumberish;
  owner: string;
};

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
