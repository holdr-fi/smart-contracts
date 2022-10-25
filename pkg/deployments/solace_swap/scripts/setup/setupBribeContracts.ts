// Deposit 100K SPT tokens into VotingEscrow contract, obtain veSPT
import { ZERO_ADDRESS, ONE_ETHER, ZERO } from '../../constants';
import { WEEK } from '@balancer-labs/v2-helpers/src/time';
import { ContractDeploymentCollection } from '../../types';
import { ethers, logger, task } from '../../input';
import { getCurrentTimestamp } from '../../utils';
import { Contract } from 'ethers';
import GaugeABI from '../../../tasks/2022xxxx-solace-swap/abi/LiquidityGaugeV5.json';
const { solidityKeccak256 } = ethers.utils;
const { MaxUint256 } = ethers.constants;

export const setupBribeContracts = async function setupBribeContracts(
  contractDeploymentCollection: ContractDeploymentCollection
): Promise<void> {
  const output = task.output({ ensure: false });
  const [deployer] = await ethers.getSigners();
  const bribeVault = contractDeploymentCollection['BribeVault'].instance;
  const rewardDistributor = contractDeploymentCollection['RewardDistributor'].instance;
  const balancerBribe = contractDeploymentCollection['BalancerBribe'].instance;
  const swpToken = contractDeploymentCollection['TestBalancerToken'].instance;
  const ethToken = contractDeploymentCollection['TestBalancerToken2'].instance;
  const rnd0Token = contractDeploymentCollection['TestBalancerToken3'].instance;
  const gauge = new Contract(output['RND0Gauge'], GaugeABI, deployer.provider);
  const gaugeProposal = solidityKeccak256(['address'], [gauge.address]);

  const [
    bribeVaultDistributorValue,
    bribeVaultDepositorRole,
    isSwpWhitelisted,
    isEthWhitelisted,
    isRnd0Whitelisted,
    gaugeProposalDeadline,
    currentTimestamp,
    bribeVaultEthApprovalAmount,
    bribeVaultRnd0ApprovalAmount,
  ] = await Promise.all([
    bribeVault.distributor(),
    bribeVault.DEPOSITOR_ROLE(),
    balancerBribe.isWhitelistedToken(swpToken.address),
    balancerBribe.isWhitelistedToken(ethToken.address),
    balancerBribe.isWhitelistedToken(ethToken.address),
    balancerBribe.proposalDeadlines(gaugeProposal),
    getCurrentTimestamp(deployer.provider),
    ethToken.allowance(deployer.address, bribeVault.address),
    rnd0Token.allowance(deployer.address, bribeVault.address),
  ]);

  // 1. BribeVault.setDistributor

  if (bribeVaultDistributorValue === ZERO_ADDRESS) {
    logger.info('Setting distributor for Bribe Vault');
    await bribeVault.connect(deployer).setDistributor(rewardDistributor.address);
  }

  // 2. BribeVault.grantDepositorRole

  if ((await bribeVault.hasRole(bribeVaultDepositorRole, balancerBribe.address)) === false) {
    logger.info('Granting depositor role for Bribe Vault to BalancerBribe.sol');
    await bribeVault.connect(deployer).grantDepositorRole(balancerBribe.address);
  }

  if ((await bribeVault.hasRole(bribeVaultDepositorRole, deployer.address)) === false) {
    logger.info('Granting depositor role for Bribe Vault to deployer');
    await bribeVault.connect(deployer).grantDepositorRole(deployer.address);
  }

  // 3. BalancerBribe.addWhitelistTokens

  if (isSwpWhitelisted === false) {
    logger.info('Adding SWP token to BalancerBribe.sol whitelist');
    await balancerBribe.connect(deployer).addWhitelistTokens([swpToken.address]);
  }

  if (isEthWhitelisted === false) {
    logger.info('Adding ETH token to BalancerBribe.sol whitelist');
    await balancerBribe.connect(deployer).addWhitelistTokens([ethToken.address]);
  }

  if (isRnd0Whitelisted === false) {
    logger.info('Adding RND0 token to BalancerBribe.sol whitelist');
    await balancerBribe.connect(deployer).addWhitelistTokens([rnd0Token.address]);
  }

  // 4. BalancerBribe.addWhitelistTokens.setGaugeProposal => BalancerBribe.depositBribeERC20
  if (gaugeProposalDeadline.lte(currentTimestamp)) {
    logger.info('Setting Bribe Proposal for RND0-ETH gauge');
    await balancerBribe.connect(deployer).setGaugeProposal(gauge.address, currentTimestamp + WEEK);
    if (bribeVaultRnd0ApprovalAmount.eq(ZERO)) {
      await swpToken.connect(deployer).approve(bribeVault.address, MaxUint256);
    }
    if (bribeVaultEthApprovalAmount.eq(ZERO)) {
      await ethToken.connect(deployer).approve(bribeVault.address, MaxUint256);
    }
    logger.info('Depositing 10K SWP as a bribe for RND0-ETH gauge');
    await balancerBribe.connect(deployer).depositBribeERC20(gaugeProposal, swpToken.address, ONE_ETHER.mul(10000));
    logger.info('Depositing 10K ETH as a bribe for RND0-ETH gauge');
    await balancerBribe.connect(deployer).depositBribeERC20(gaugeProposal, ethToken.address, ONE_ETHER.mul(10000));
  }
};
