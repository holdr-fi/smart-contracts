import { BigNumber as BN, BigNumberish } from 'ethers';

export type NewInvestmentPoolParams = {
  name: string;
  symbol: string;
  tokens: string[];
  weights: BN[]; // Assumption - Normalised weights must add to 10**18
  swapFeePercentage: BN;
  owner: string;
  swapEnabledOnStart: boolean;
  managementSwapFeePercentage: BN;
};

export type NewManagedPoolParams = {
  name: string;
  symbol: string;
  tokens: string[];
  normalizedWeights: BN[]; // Assumption - Normalised weights must add to 10**18
  assetManagers: string[];
  swapFeePercentage: BN;
  swapEnabledOnStart: boolean;
  mustAllowlistLPs: boolean;
  protocolSwapFeePercentage: BN;
  managementSwapFeePercentage: BN;
  managementAumFeePercentage: BN;
  aumProtocolFeesCollector: string;
};

export type BasePoolRights = {
  canTransferOwnership: boolean;
  canChangeSwapFee: boolean;
  canUpdateMetadata: boolean;
};

export type ManagedPoolRights = {
  canChangeWeights: boolean;
  canDisableSwaps: boolean;
  canSetMustAllowlistLPs: boolean;
  canSetCircuitBreakers: boolean;
  canChangeTokens: boolean;
  canChangeMgmtFees: boolean;
};

export type CreateManagedPoolArgs = [
  poolParams: NewManagedPoolParams,
  basePoolRights: BasePoolRights,
  managedPoolRights: ManagedPoolRights,
  minWeightChangeDuration: BigNumberish,
  manager: string
];

export type InvestmentPoolConstructorParams = {
  vault: string;
  name: string;
  symbol: string;
  tokens: string[];
  normalizedWeights: BN[]; // Assumption - Normalised weights must add to 10**18
  assetManagers: string[];
  swapFeePercentage: BN;
  pauseWindowDuration: BN;
  bufferPeriodDuration: BN;
  owner: string;
  swapEnabledOnStart: boolean;
  managementSwapFeePercentage: BN;
};
