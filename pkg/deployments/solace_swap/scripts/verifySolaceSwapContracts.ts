import { ContractDeploymentCollection } from '../types';
import {
  verifyAuthorizer,
  verifyVault,
  verifyToken,
  verifyBalancerHelpers,
  verifyBalancerQueries,
  verifyProtocolFeePercentagesProvider,
  verifyWeightedPoolFactoryV2,
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
} from './verify';

export const verifySolaceSwapContracts = async function verifySolaceSwapContracts(
  contractDeploymentCollection: ContractDeploymentCollection,
  force = false
): Promise<void> {
  await verifyAuthorizer(contractDeploymentCollection['Authorizer'], force);
  await verifyVault(contractDeploymentCollection['Vault'], force);
  await verifyToken(contractDeploymentCollection['TestBalancerToken'], force);
  await verifyBalancerHelpers(contractDeploymentCollection['BalancerHelpers'], force);
  await verifyBalancerQueries(contractDeploymentCollection['BalancerQueries'], force);
  await verifyProtocolFeePercentagesProvider(contractDeploymentCollection['ProtocolFeePercentagesProvider'], force);
  await verifyWeightedPoolFactoryV2(contractDeploymentCollection['WeightedPoolFactory'], force);
  await verifyAuthorizerAdaptor(contractDeploymentCollection['AuthorizerAdaptor'], force);
  await verifyTokenAdmin(contractDeploymentCollection['BalancerTokenAdmin'], force);
  await verifyVotingEscrow(contractDeploymentCollection['VotingEscrow'], force);
  await verifyGaugeController(contractDeploymentCollection['GaugeController'], force);
  await verifyTokenMinter(contractDeploymentCollection['BalancerMinter'], force);
  await verifyGaugeAdder(contractDeploymentCollection['GaugeAdder'], force);
  await verifySingleRecipientGaugeFactory(
    contractDeploymentCollection['SingleRecipientGaugeFactory'],
    contractDeploymentCollection['BalancerMinter'].address,
    force
  );
  await verifyVotingEscrowDelegation(contractDeploymentCollection['VotingEscrowDelegation'], force);
  await verifyVotingEscrowDelegationProxy(contractDeploymentCollection['VotingEscrowDelegationProxy'], force);
  await verifyFeeDistributor(contractDeploymentCollection['FeeDistributor'], force);
  await verifyBatchRelayer(
    contractDeploymentCollection['BatchRelayerLibrary'],
    contractDeploymentCollection['Vault'].address,
    force
  );
  await verifyLiquidityGaugeFactory(contractDeploymentCollection['LiquidityGaugeFactory'], force);
  await verifyTokenholderFactory(contractDeploymentCollection['BALTokenHolderFactory'], force);
};
