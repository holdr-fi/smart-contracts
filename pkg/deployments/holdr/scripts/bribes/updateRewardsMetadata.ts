import { ContractDeploymentCollection } from '../../types';
import axios from 'axios';
import { ethers, logger } from '../../input';
import { constants } from 'ethers';
const { HashZero } = constants;

export const updateRewardsMetadata = async function updateRewardsMetadata(
  contractDeploymentCollection: ContractDeploymentCollection
): Promise<void> {
  const [deployer] = await ethers.getSigners();
  const API_URL = `${process.env.BRIBE_API_URL}rewardsmetadata`;
  const resp = await axios.get(API_URL);
  const rewardsMetadataParams: { identifier: string; token: string; merkleRoot: string; proof: string }[] = resp?.data;
  const rewardDistributor = contractDeploymentCollection['RewardDistributor'].instance;

  if (rewardsMetadataParams.length > 0) {
    logger.info('Calling RewardDistributor.updateRewardsMetadata()');
    await rewardDistributor.connect(deployer).updateRewardsMetadata(
      rewardsMetadataParams.map((params) => {
        return {
          identifier: params.identifier,
          token: params.token,
          merkleRoot: params.merkleRoot === '0x' ? HashZero : params.merkleRoot,
          proof: params.proof === '0x' ? HashZero : params.proof,
        };
      })
    );
  }
};
