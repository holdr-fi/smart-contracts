import { ContractDeploymentCollection } from '../../types';
import { ethers, logger, task } from '../../input';
import { ZERO } from '../../constants';

export const voteForGauge = async function voteForGauge(
  contractDeploymentCollection: ContractDeploymentCollection
): Promise<void> {
  const [deployer] = await ethers.getSigners();
  const gaugeController = contractDeploymentCollection['GaugeController'].instance;
  const output = task.output({ ensure: false });
  const gauge = output['RND0Gauge'];

  // 1. VOTE FOR GAUGE WITH 100% WEIGHT
  const [gaugeExists, voteForGauge] = await Promise.all([
    gaugeController.gauge_exists(gauge),
    gaugeController.vote_user_slopes(deployer.address, gauge),
  ]);
  if (!gaugeExists) {
    throw new Error(`gauge ${gauge} not yet added to GaugeController`);
  }
  if (voteForGauge.power.eq(ZERO)) {
    logger.info('Voting for gauge with 100% weight');
    await gaugeController.connect(deployer).vote_for_gauge_weights(output['RND0Gauge'], 10000);
  }
};
