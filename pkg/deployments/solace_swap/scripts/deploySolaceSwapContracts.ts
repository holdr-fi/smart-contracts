import {
  deployToken,
  deployToken2,
  deployToken3,
  deployAuthorizer,
  deployVault,
  deployBalancerHelpers,
  deployBalancerQueries,
  deployProtocolFeePercentagesProvider,
  deployWeightedPoolFactoryV2,
  deployAuthorizerAdaptor,
  deployTokenAdmin,
  deployCoreWeightedPool,
  deployNewWeightedPool,
  deployVotingEscrow,
  deployGaugeController,
  deployGaugeAdder,
  deployTokenMinter,
  deploySingleRecipientGaugeFactory,
  deployVotingEscrowDelegation,
  deployVotingEscrowDelegationProxy,
  deployFeeDistributor,
  deployWstETH,
  deployBatchRelayer,
  deployMainnetGauge,
  deployMainnetGaugeFactory,
  deployTokenholderFactory,
  deployBribeVault,
  deployRewardDistributor,
  deployBalancerBribe,
  deployMulticall,
} from './deploy';
import { ContractDeployment, ContractDeploymentCollection } from '../types';

export const deploySolaceSwapContracts = async function deploySolaceSwapContracts(
  skip = false
): Promise<ContractDeploymentCollection> {
  if (skip === true) {
    return {};
  }

  // Token deployment
  const tokenDeployment: ContractDeployment = await deployToken();
  const tokenDeployment2: ContractDeployment = await deployToken2();
  const tokenDeployment3: ContractDeployment = await deployToken3();

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

  const coreWeightedPoolDeployment: ContractDeployment = await deployCoreWeightedPool(
    tokenDeployment.instance,
    tokenDeployment2.instance,
    weightedPoolFactoryDeployment.instance,
    vaultDeployment.instance
  );

  const newWeightedPoolDeployment: ContractDeployment = await deployNewWeightedPool(
    tokenDeployment2.instance,
    tokenDeployment3.instance,
    weightedPoolFactoryDeployment.instance,
    vaultDeployment.instance
  );

  // Require SPT token setup
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

  const WstETHDeployment: ContractDeployment = await deployWstETH();

  const batchRelayerDeployment: ContractDeployment = await deployBatchRelayer(
    vaultDeployment.address,
    tokenMinterDeployment.address
  );

  const mainnetGaugeDeployment: ContractDeployment = await deployMainnetGauge(
    tokenMinterDeployment.address,
    votingEscrowDelegationProxyDeployment.address,
    authorizerAdaptorDeployment.address
  );

  const mainnetGaugeFactoryDeployment: ContractDeployment = await deployMainnetGaugeFactory(
    mainnetGaugeDeployment.address
  );

  const tokenholderFactoryDeployment: ContractDeployment = await deployTokenholderFactory(
    tokenDeployment.address,
    vaultDeployment.address
  );

  // Deploy Hidden Hand Bribe contracts

  const bribeVaultDeployment: ContractDeployment = await deployBribeVault();
  const rewardDistributorDeployment: ContractDeployment = await deployRewardDistributor(bribeVaultDeployment.address);
  const balancerBribeDeployment: ContractDeployment = await deployBalancerBribe(bribeVaultDeployment.address);

  const multicallDeployment: ContractDeployment = await deployMulticall();

  // Create return object
  const contractDeploymentCollection: ContractDeploymentCollection = {};
  contractDeploymentCollection[tokenDeployment.name] = tokenDeployment;
  contractDeploymentCollection[tokenDeployment2.name] = tokenDeployment2;
  contractDeploymentCollection[tokenDeployment3.name] = tokenDeployment3;
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
  contractDeploymentCollection[coreWeightedPoolDeployment.name] = coreWeightedPoolDeployment;
  contractDeploymentCollection[newWeightedPoolDeployment.name] = newWeightedPoolDeployment;
  contractDeploymentCollection[votingEscrowDeployment.name] = votingEscrowDeployment;
  contractDeploymentCollection[gaugeControllerDeployment.name] = gaugeControllerDeployment;
  contractDeploymentCollection[gaugeAdderDeployment.name] = gaugeAdderDeployment;
  contractDeploymentCollection[tokenMinterDeployment.name] = tokenMinterDeployment;
  contractDeploymentCollection[singleRecipientGaugeFactoryDeployment.name] = singleRecipientGaugeFactoryDeployment;
  contractDeploymentCollection[votingEscrowDelegationDeployment.name] = votingEscrowDelegationDeployment;
  contractDeploymentCollection[votingEscrowDelegationProxyDeployment.name] = votingEscrowDelegationProxyDeployment;
  contractDeploymentCollection[feeDistributorDeployment.name] = feeDistributorDeployment;
  contractDeploymentCollection[WstETHDeployment.name] = WstETHDeployment;
  contractDeploymentCollection[batchRelayerDeployment.name] = batchRelayerDeployment;
  contractDeploymentCollection[mainnetGaugeDeployment.name] = mainnetGaugeDeployment;
  contractDeploymentCollection[mainnetGaugeFactoryDeployment.name] = mainnetGaugeFactoryDeployment;
  contractDeploymentCollection[tokenholderFactoryDeployment.name] = tokenholderFactoryDeployment;
  contractDeploymentCollection[bribeVaultDeployment.name] = bribeVaultDeployment;
  contractDeploymentCollection[rewardDistributorDeployment.name] = rewardDistributorDeployment;
  contractDeploymentCollection[balancerBribeDeployment.name] = balancerBribeDeployment;
  contractDeploymentCollection[multicallDeployment.name] = multicallDeployment;

  return contractDeploymentCollection;
};
