import {
  deployToken,
  deployTestToken,
  deployTestToken2,
  deployAuthorizer,
  deployVault,
  deployBalancerHelpers,
  deployBalancerQueries,
  deployProtocolFeePercentagesProvider,
  deployWeightedPoolFactoryV2,
  deployAuthorizerAdaptor,
  deployTokenAdmin,
  deployWeightedPoolCore,
  deployWeightedPoolNew,
  deployVotingEscrow,
  deployGaugeController,
  deployGaugeAdder,
  deployTokenMinter,
  deploySingleRecipientGaugeFactory,
  deployVotingEscrowDelegation,
  deployVotingEscrowDelegationProxy,
  deployFeeDistributor,
  deployWstETH,
  deployBatchRelayerLibrary,
  deployMainnetGauge,
  deployMainnetGaugeFactory,
  deployTokenholderFactory,
  deployBribeVault,
  deployRewardDistributor,
  deployBalancerBribe,
  deployMulticall,
  deployGaugeControllerQuerier,
  deployLBPFactory,
  deployStablePoolFactory,
} from './deploy';
import { ContractDeployment, ContractDeploymentCollection } from '../types';

export const deployHoldrContracts = async function deployHoldrContracts(
  skip = false
): Promise<ContractDeploymentCollection> {
  if (skip === true) {
    return {};
  }

  /*
   * Token deployment
   */

  const holdrDeployment: ContractDeployment = await deployToken();
  const testTokenDeployment: ContractDeployment = await deployTestToken();
  const testToken2Deployment: ContractDeployment = await deployTestToken2();

  /*
   * DEX contracts
   */
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

  const LBPFactoryDeployment: ContractDeployment = await deployLBPFactory(vaultDeployment.address);
  const stablePoolFactoryDeployment: ContractDeployment = await deployStablePoolFactory(
    vaultDeployment.address,
    protocolFeePercentagesProviderDeployment.address
  );

  const multicallDeployment: ContractDeployment = await deployMulticall();
  const WstETHDeployment: ContractDeployment = await deployWstETH();

  /*
   * veTokenomics contracts
   */

  const authorizerAdaptorDeployment: ContractDeployment = await deployAuthorizerAdaptor(vaultDeployment.address);

  const tokenAdminDeployment: ContractDeployment = await deployTokenAdmin(
    vaultDeployment.address,
    holdrDeployment.address
  );

  // Need HDLR-wNEAR 80-20 pool before this step.
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

  const batchRelayerLibraryDeployment: ContractDeployment = await deployBatchRelayerLibrary(
    vaultDeployment.address,
    WstETHDeployment.address,
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
    holdrDeployment.address,
    vaultDeployment.address
  );

  const gaugeControllerQuerierDeployment: ContractDeployment = await deployGaugeControllerQuerier(
    gaugeControllerDeployment.address
  );

  // Require non-zero total supply for veHLDR
  // const feeDistributorDeployment: ContractDeployment = await deployFeeDistributor(votingEscrowDeployment.address);

  /*
   * Bribe contracts
   */
  // const bribeVaultDeployment: ContractDeployment = await deployBribeVault();
  // const rewardDistributorDeployment: ContractDeployment = await deployRewardDistributor(bribeVaultDeployment.address);
  // const balancerBribeDeployment: ContractDeployment = await deployBalancerBribe(bribeVaultDeployment.address);

  // Create return object
  const contractDeploymentCollection: ContractDeploymentCollection = {};
  contractDeploymentCollection[holdrDeployment.name] = holdrDeployment;
  contractDeploymentCollection[testTokenDeployment.name] = testTokenDeployment;
  contractDeploymentCollection[testToken2Deployment.name] = testToken2Deployment;
  contractDeploymentCollection[authorizerDeployment.name] = authorizerDeployment;
  contractDeploymentCollection[vaultDeployment.name] = vaultDeployment;
  contractDeploymentCollection[balancerHelpersDeployment.name] = balancerHelpersDeployment;
  contractDeploymentCollection[balancerQueriesDeployment.name] = balancerQueriesDeployment;
  contractDeploymentCollection[
    protocolFeePercentagesProviderDeployment.name
  ] = protocolFeePercentagesProviderDeployment;
  contractDeploymentCollection[weightedPoolFactoryDeployment.name] = weightedPoolFactoryDeployment;
  contractDeploymentCollection[LBPFactoryDeployment.name] = LBPFactoryDeployment;
  contractDeploymentCollection[stablePoolFactoryDeployment.name] = stablePoolFactoryDeployment;
  contractDeploymentCollection[multicallDeployment.name] = multicallDeployment;
  contractDeploymentCollection[WstETHDeployment.name] = WstETHDeployment;
  contractDeploymentCollection[authorizerAdaptorDeployment.name] = authorizerAdaptorDeployment;
  contractDeploymentCollection[tokenAdminDeployment.name] = tokenAdminDeployment;
  contractDeploymentCollection[votingEscrowDeployment.name] = votingEscrowDeployment;
  contractDeploymentCollection[gaugeControllerDeployment.name] = gaugeControllerDeployment;
  contractDeploymentCollection[gaugeAdderDeployment.name] = gaugeAdderDeployment;
  contractDeploymentCollection[tokenMinterDeployment.name] = tokenMinterDeployment;
  contractDeploymentCollection[singleRecipientGaugeFactoryDeployment.name] = singleRecipientGaugeFactoryDeployment;
  contractDeploymentCollection[votingEscrowDelegationDeployment.name] = votingEscrowDelegationDeployment;
  contractDeploymentCollection[votingEscrowDelegationProxyDeployment.name] = votingEscrowDelegationProxyDeployment;
  contractDeploymentCollection[batchRelayerLibraryDeployment.name] = batchRelayerLibraryDeployment;
  contractDeploymentCollection[mainnetGaugeDeployment.name] = mainnetGaugeDeployment;
  contractDeploymentCollection[mainnetGaugeFactoryDeployment.name] = mainnetGaugeFactoryDeployment;
  contractDeploymentCollection[tokenholderFactoryDeployment.name] = tokenholderFactoryDeployment;
  contractDeploymentCollection[gaugeControllerQuerierDeployment.name] = gaugeControllerQuerierDeployment;

  // contractDeploymentCollection[feeDistributorDeployment.name] = feeDistributorDeployment;
  // contractDeploymentCollection[bribeVaultDeployment.name] = bribeVaultDeployment;
  // contractDeploymentCollection[rewardDistributorDeployment.name] = rewardDistributorDeployment;
  // contractDeploymentCollection[balancerBribeDeployment.name] = balancerBribeDeployment;

  return contractDeploymentCollection;
};
