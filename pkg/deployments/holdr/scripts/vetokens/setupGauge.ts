import { ContractDeploymentCollection } from '../../types';
import { ethers, task } from '../../input';
import { VotingEscrowDeploymentHelper } from '../../utils';

export const setupGauge = async function setupGauge(
  contractDeploymentCollection: ContractDeploymentCollection,
  poolAddress: string
): Promise<void> {
  const [deployer] = await ethers.getSigners();
  const authorizer = contractDeploymentCollection['Authorizer'].instance;
  const authorizerAdaptor = contractDeploymentCollection['AuthorizerAdaptor'].instance;
  const tokenHolderFactory = contractDeploymentCollection['BALTokenHolderFactory'].instance;
  const gaugeController = contractDeploymentCollection['GaugeController'].instance;
  const gaugeAdder = contractDeploymentCollection['GaugeAdder'].instance;
  const singleRecipientGaugeFactory = contractDeploymentCollection['SingleRecipientGaugeFactory'].instance;
  const mainnetGaugeFactory = contractDeploymentCollection['LiquidityGaugeFactory'].instance;

  const helper = new VotingEscrowDeploymentHelper(
    tokenHolderFactory,
    singleRecipientGaugeFactory,
    mainnetGaugeFactory,
    gaugeController,
    gaugeAdder,
    authorizer,
    authorizerAdaptor,
    deployer,
    task
  );

  try {
    await helper.createMainnetGauge_noSave(poolAddress);
  } catch (e) {
    console.error(e);
  }
};
