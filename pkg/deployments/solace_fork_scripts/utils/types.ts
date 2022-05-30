import { BigNumber as BN, BigNumberish } from 'ethers';

export type NewPoolParams = {
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

// struct NewPoolParams {
//   string name;
//   string symbol;
//   IERC20[] tokens;
//   uint256[] normalizedWeights;
//   address[] assetManagers;
//   uint256 swapFeePercentage;
//   bool swapEnabledOnStart;
//   bool mustAllowlistLPs;
//   uint256 protocolSwapFeePercentage;
//   uint256 managementSwapFeePercentage;
//   uint256 managementAumFeePercentage;
//   IAumProtocolFeesCollector aumProtocolFeesCollector;
// }

export type BasePoolRights = {
  canTransferOwnership: boolean;
  canChangeSwapFee: boolean;
  canUpdateMetadata: boolean;
};

// struct BasePoolRights {
//   bool canTransferOwnership;
//   bool canChangeSwapFee;
//   bool canUpdateMetadata;
// }

export type ManagedPoolRights = {
  canChangeWeights: boolean;
  canDisableSwaps: boolean;
  canSetMustAllowlistLPs: boolean;
  canSetCircuitBreakers: boolean;
  canChangeTokens: boolean;
  canChangeMgmtFees: boolean;
};

// struct ManagedPoolRights {
//   bool canChangeWeights;
//   bool canDisableSwaps;
//   bool canSetMustAllowlistLPs;
//   bool canSetCircuitBreakers;
//   bool canChangeTokens;
//   bool canChangeMgmtFees;
// }

export type CreateManagedPoolArgs = [
  poolParams: NewPoolParams,
  basePoolRights: BasePoolRights,
  managedPoolRights: ManagedPoolRights,
  minWeightChangeDuration: BigNumberish,
  manager: string
];
