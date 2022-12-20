import { ContractDeploymentCollection } from '../types';
import {
  verifyAuthorizer,
  verifyVault,
  verifyToken,
  verifyTestToken,
  verifyBalancerHelpers,
  verifyBalancerQueries,
  verifyProtocolFeePercentagesProvider,
  verifyWeightedPoolFactoryV2,
  verifyLBPFactory,
  verifyStablePoolFactory,
  verifyAuthorizerAdaptor,
  verifyTokenAdmin,
  verifyVotingEscrow,
  verifyGaugeController,
  verifyGaugeAdder,
  verifyTokenMinter,
  verifySingleRecipientGaugeFactory,
  verifyVotingEscrowDelegation,
  verifyVotingEscrowDelegationProxy,
  verifyFeeDistributor,
  verifyBatchRelayer,
  verifyLiquidityGaugeFactory,
  verifyTokenholderFactory,
  verifyBribeVault,
  verifyRewardDistributor,
  verifyBalancerBribe,
  verifyMulticall,
  verifyGaugeControllerQuerier,
} from './verify';

export const verifyHoldrContracts = async function verifyHoldrContracts(
  contractDeploymentCollection: ContractDeploymentCollection,
  force = false
): Promise<void> {
  // VERIFIED ON AURORA
  // await verifyToken(contractDeploymentCollection['HoldrGovernanceToken'], force);
  // await verifyTestToken(contractDeploymentCollection['TestBalancerToken'], force);
  // await verifyAuthorizer(contractDeploymentCollection['Authorizer'], force);
  // await verifyVault(contractDeploymentCollection['Vault'], force);
  // await verifyBalancerHelpers(contractDeploymentCollection['BalancerHelpers'], force);
  // await verifyBalancerQueries(contractDeploymentCollection['BalancerQueries'], force);
  // await verifyWeightedPoolFactoryV2(contractDeploymentCollection['WeightedPoolFactory'], force);
  // await verifyLBPFactory(contractDeploymentCollection['NoProtocolFeeLiquidityBootstrappingPoolFactory'], force);
  // await verifyStablePoolFactory(contractDeploymentCollection['ComposableStablePoolFactory'], force);
  // await verifyMulticall(contractDeploymentCollection['Multicall2'], force);
  // await verifyAuthorizerAdaptor(contractDeploymentCollection['AuthorizerAdaptor'], force);
  // await verifyTokenAdmin(contractDeploymentCollection['BalancerTokenAdmin'], force);
  // await verifyTokenMinter(contractDeploymentCollection['BalancerMinter'], force);
  // await verifyGaugeAdder(contractDeploymentCollection['GaugeAdder'], force);
  // await verifySingleRecipientGaugeFactory(
  //   contractDeploymentCollection['SingleRecipientGaugeFactory'],
  //   contractDeploymentCollection['BalancerMinter'].address,
  //   force
  // );
  // await verifyVotingEscrowDelegationProxy(contractDeploymentCollection['VotingEscrowDelegationProxy'], force);
  // await verifyBatchRelayer(
  //   contractDeploymentCollection['BatchRelayerLibrary'],
  //   contractDeploymentCollection['Vault'].address,
  //   force
  // );
  // await verifyLiquidityGaugeFactory(contractDeploymentCollection['LiquidityGaugeFactory'], force);
  // await verifyTokenholderFactory(contractDeploymentCollection['BALTokenHolderFactory'], force);
  // await verifyGaugeControllerQuerier(contractDeploymentCollection['GaugeControllerQuerier'], force);
  
  // VERIFIED MANUALLY

  // await verifyVotingEscrow(contractDeploymentCollection['VotingEscrow'], force);
  // await verifyGaugeController(contractDeploymentCollection['GaugeController'], force);
  // await verifyVotingEscrowDelegation(contractDeploymentCollection['VotingEscrowDelegation'], force);

  // NOT YET VERIFIED

  // ProtocolFeesCollector
  // BalancerRelayer
  // await verifyProtocolFeePercentagesProvider(contractDeploymentCollection['ProtocolFeePercentagesProvider'], force);

  // TO DEPLOY

  // await verifyFeeDistributor(contractDeploymentCollection['FeeDistributor'], force);
  // await verifyBribeVault(contractDeploymentCollection['BribeVault'], force);
  // await verifyRewardDistributor(contractDeploymentCollection['RewardDistributor'], force);
  // await verifyBalancerBribe(contractDeploymentCollection['BalancerBribe'], force);
};
