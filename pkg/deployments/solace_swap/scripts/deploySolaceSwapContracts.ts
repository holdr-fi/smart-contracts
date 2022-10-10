import {
  deployToken,
  deployToken2,
  deployAuthorizer,
  deployVault,
  deployBalancerHelpers,
  deployBalancerQueries,
  deployProtocolFeePercentagesProvider,
  deployWeightedPoolFactoryV2,
  deployAuthorizerAdaptor,
  deployTokenAdmin,
  deployVotingEscrow,
  deployGaugeController,
  deployGaugeAdder,
  deployTokenMinter,
  deploySingleRecipientGaugeFactory,
  deployVotingEscrowDelegation,
  deployVotingEscrowDelegationProxy,
  deployFeeDistributor,
  deployBatchRelayer,
} from './deploy';
import { ContractDeployment, ContractDeploymentCollection } from '../types';

export const deploySolaceSwapContracts = async function deploySolaceSwapContracts(): Promise<ContractDeploymentCollection> {
  // Token deployment
  const tokenDeployment: ContractDeployment = await deployToken();
  const tokenDeployment2: ContractDeployment = await deployToken2();

  // DEX contracts deployments
  const authorizerDeployment: ContractDeployment = await deployAuthorizer();
  // Also deployed ProtocolFeesCollector which we can verify.
  const vaultDeployment: ContractDeployment = await deployVault(authorizerDeployment.address);
  const balancerHelpersDeployment: ContractDeployment = await deployBalancerHelpers(vaultDeployment.address);
  const balancerQueriesDeployment: ContractDeployment = await deployBalancerQueries(vaultDeployment.address);
  const protocolFeePercentagesProviderDeployment: ContractDeployment = await deployProtocolFeePercentagesProvider(
    vaultDeployment.address
  );

  const weightedPoolFactoryDeployment: ContractDeployment = await deployWeightedPoolFactoryV2(
    vaultDeployment.address,
    protocolFeePercentagesProviderDeployment.address
  );

  // veToken system deployments
  const authorizerAdaptorDeployment: ContractDeployment = await deployAuthorizerAdaptor(vaultDeployment.address);

  const tokenAdminDeployment: ContractDeployment = await deployTokenAdmin(
    vaultDeployment.address,
    tokenDeployment.address
  );
  const votingEscrowDeployment: ContractDeployment = await deployVotingEscrow(authorizerAdaptorDeployment.address);

  const gaugeControllerDeployment: ContractDeployment = await deployGaugeController(
    votingEscrowDeployment.address,
    authorizerAdaptorDeployment.address
  );

  const gaugeAdderDeployment: ContractDeployment = await deployGaugeAdder(gaugeControllerDeployment.address);

  const tokenMinterDeployment: ContractDeployment = await deployTokenMinter(
    tokenAdminDeployment.address,
    gaugeControllerDeployment.address
  );

  const singleRecipientGaugeFactoryDeployment: ContractDeployment = await deploySingleRecipientGaugeFactory(
    tokenMinterDeployment.address
  );

  const votingEscrowDelegationDeployment: ContractDeployment = await deployVotingEscrowDelegation(
    votingEscrowDeployment.address,
    authorizerAdaptorDeployment.address
  );

  const votingEscrowDelegationProxyDeployment: ContractDeployment = await deployVotingEscrowDelegationProxy(
    vaultDeployment.address,
    votingEscrowDeployment.address,
    votingEscrowDelegationDeployment.address
  );

  const feeDistributorDeployment: ContractDeployment = await deployFeeDistributor(votingEscrowDeployment.address);

  const batchRelayerDeployment: ContractDeployment = await deployBatchRelayer(
    vaultDeployment.address,
    tokenMinterDeployment.address
  );

  // Augmentation contract deployments

  // Create return object
  const contractDeploymentCollection: ContractDeploymentCollection = {};
  contractDeploymentCollection[tokenDeployment.name] = tokenDeployment;
  contractDeploymentCollection[tokenDeployment2.name] = tokenDeployment2;
  contractDeploymentCollection[authorizerDeployment.name] = authorizerDeployment;
  contractDeploymentCollection[vaultDeployment.name] = vaultDeployment;
  contractDeploymentCollection[balancerHelpersDeployment.name] = balancerHelpersDeployment;
  contractDeploymentCollection[balancerQueriesDeployment.name] = balancerQueriesDeployment;
  contractDeploymentCollection[
    protocolFeePercentagesProviderDeployment.name
  ] = protocolFeePercentagesProviderDeployment;
  contractDeploymentCollection[weightedPoolFactoryDeployment.name] = weightedPoolFactoryDeployment;
  contractDeploymentCollection[authorizerAdaptorDeployment.name] = authorizerAdaptorDeployment;
  contractDeploymentCollection[tokenAdminDeployment.name] = tokenAdminDeployment;
  contractDeploymentCollection[votingEscrowDeployment.name] = votingEscrowDeployment;
  contractDeploymentCollection[gaugeControllerDeployment.name] = gaugeControllerDeployment;
  contractDeploymentCollection[gaugeAdderDeployment.name] = gaugeAdderDeployment;
  contractDeploymentCollection[tokenMinterDeployment.name] = tokenMinterDeployment;
  contractDeploymentCollection[singleRecipientGaugeFactoryDeployment.name] = singleRecipientGaugeFactoryDeployment;
  contractDeploymentCollection[votingEscrowDelegationDeployment.name] = votingEscrowDelegationDeployment;
  contractDeploymentCollection[votingEscrowDelegationProxyDeployment.name] = votingEscrowDelegationProxyDeployment;
  contractDeploymentCollection[feeDistributorDeployment.name] = feeDistributorDeployment;
  contractDeploymentCollection[batchRelayerDeployment.name] = batchRelayerDeployment;

  return contractDeploymentCollection;
};
