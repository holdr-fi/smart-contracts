// https://etherscan.deth.net/address/0xeb151668006CD04DAdD098AFd0a82e78F77076c3#code
import { ethers, logger, task } from '../../input';
import { ZERO_ADDRESS, ONE_HUNDRED_PERCENT, MULTISIG_ADDRESS } from '../../constants';
import { VotingEscrowDeploymentHelper, solidityRequire } from '../../utils';
import { constants, BigNumber } from 'ethers';
const { HashZero } = constants;
import { ContractDeploymentCollection } from '../../types';
import LiquidityGaugeV5ABI from '../../../tasks/2022xxxx-holdr/abi/LiquidityGaugeV5.json';
import SingleRecipientGaugeABI from '../../../tasks/2022xxxx-holdr/abi/SingleRecipientGauge.json';
import { stringify } from 'querystring';

export const setupVotingEscrow = async function setupVotingEscrow(
  contractDeploymentCollection: ContractDeploymentCollection
): Promise<void> {
  const [deployer] = await ethers.getSigners();
  const authorizer = contractDeploymentCollection['Authorizer'].instance;
  const authorizerAdaptor = contractDeploymentCollection['AuthorizerAdaptor'].instance;
  const token = contractDeploymentCollection['HoldrGovernanceToken'].instance;
  const tokenAdmin = contractDeploymentCollection['BalancerTokenAdmin'].instance;
  const tokenMinter = contractDeploymentCollection['BalancerMinter'].instance;
  const tokenHolderFactory = contractDeploymentCollection['BALTokenHolderFactory'].instance;
  const gaugeController = contractDeploymentCollection['GaugeController'].instance;
  const gaugeAdder = contractDeploymentCollection['GaugeAdder'].instance;
  const singleRecipientGaugeFactory = contractDeploymentCollection['SingleRecipientGaugeFactory'].instance;
  const mainnetGaugeFactory = contractDeploymentCollection['LiquidityGaugeFactory'].instance;
  const votingEscrow = contractDeploymentCollection['VotingEscrow'].instance;

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

  // const gaugeTypes: { [id: number]: string } = {
  //   [0]: 'LiquidityMiningCommittee',
  //   [1]: 'veHLDR',
  //   [2]: 'Aurora',
  //   [3]: 'Polygon',
  //   [4]: 'Arbitrum',
  // };

  // const output = task.output({ ensure: false });

  // /**
  //  * CHECKS
  //  */

  // solidityRequire(await authorizer.canPerform(HashZero, deployer.address, ZERO_ADDRESS), 'Not Authorizer admin');

  // // Ensure that governance holds relevant admin rights

  // // prettier-ignore
  // solidityRequire((await gaugeController.voting_escrow()) == votingEscrow.address,
  // 'gaugeController.voting_escrow != votingEscrow instance address');

  // // prettier-ignore
  // solidityRequire((await votingEscrow.admin()) === authorizerAdaptor.address,
  // 'VotingEscrow not owned by AuthorizerAdaptor');

  // // prettier-ignore
  // solidityRequire((await gaugeController.admin()) === authorizerAdaptor.address,
  // 'GaugeController not owned by AuthorizerAdaptor');

  // /**
  //  * 1. Handover token admin role to tokenAdmin contract, and setup token inflation schedule.
  //  */

  // const tokenDefaultAdminRole = await token.DEFAULT_ADMIN_ROLE();

  // if (await token.hasRole(tokenDefaultAdminRole, deployer.address)) {
  //   logger.info('Handing over token admin role from deployer to TokenAdmin contract');
  //   await token.connect(deployer).grantRole(tokenDefaultAdminRole, tokenAdmin.address);

  //   logger.info('Granting deployer permission to call activate() on TokenAdmin contract');
  //   await helper.grantRole(deployer.address, tokenAdmin, tokenAdmin.interface, 'activate');

  //   logger.info(
  //     'Assigning TokenAdmin contract the sole MINTER and SNAPSHOTTER role for token. Removing all admin roles from token. Initial inflation set at 145K tokens per week.'
  //   );
  //   await tokenAdmin.connect(deployer).activate();

  //   logger.info('Granting TokenMinter permission to call TokenAdmin.mint()');
  //   await helper.grantRole(tokenMinter.address, tokenAdmin, tokenAdmin.interface, 'mint');
  // }

  // /**
  //  * 2. Create gauge types and set weight
  //  */

  // if ((await gaugeController.n_gauge_types()).lt(5)) {
  //   logger.info('Creating gauge types');

  //   const gaugeWeights: Map<string, BigNumber> = new Map();
  //   // LM_COMMITTEE_WEIGHT = 10%
  //   gaugeWeights.set(gaugeTypes[0], ONE_HUNDRED_PERCENT.div(10));
  //   // VEBAL_WEIGHT = 10%
  //   gaugeWeights.set(gaugeTypes[1], ONE_HUNDRED_PERCENT.div(10));
  //   // AURORA_WEIGHT = 80%
  //   gaugeWeights.set(gaugeTypes[2], ONE_HUNDRED_PERCENT.div(10).mul(8));
  //   gaugeWeights.set(gaugeTypes[3], ONE_HUNDRED_PERCENT.mul(0));
  //   gaugeWeights.set(gaugeTypes[4], ONE_HUNDRED_PERCENT.mul(0));

  //   await helper.grantRole(deployer.address, authorizerAdaptor, gaugeController.interface, 'add_type(string,uint256)');

  //   for (const gaugeType in gaugeTypes) {
  //     await helper.performAction(gaugeController, 'add_type(string,uint256)', [
  //       gaugeTypes[gaugeType],
  //       gaugeWeights.get(gaugeTypes[gaugeType]),
  //     ]);
  //   }

  //   await helper.revokeRole(deployer.address, authorizerAdaptor, gaugeController.interface, 'add_type(string,uint256)');
  // }

  // /**
  //  * 3. Setup GaugeAdder permissions
  //  */

  // // GaugeAdder performs checks to ensure added gauges have been deployed by a correct factory contract.
  // if (
  //   !(await helper.hasRole(
  //     gaugeAdder.address,
  //     authorizerAdaptor,
  //     gaugeController.interface,
  //     'add_gauge(address,int128,uint256)'
  //   ))
  // ) {
  //   logger.info('Enabling GaugeAdder to call GaugeController.add_gauge');
  //   await helper.grantRole(
  //     gaugeAdder.address,
  //     authorizerAdaptor,
  //     gaugeController.interface,
  //     'add_gauge(address,int128)'
  //   );
  //   await helper.grantRole(
  //     gaugeAdder.address,
  //     authorizerAdaptor,
  //     gaugeController.interface,
  //     'add_gauge(address,int128,uint256)'
  //   );
  // }

  // /**
  //  * 4. Create and setup single recipient gauge
  //  */

  // // Intended to be temporary, and migrated to gauge implementation that automate distribution of BAL to BPT stakers on other networks and veBAL holders.

  // // Creates SingleRecipientGauge, unique Type 1 gauge that receives HLDR minting emissions
  // // To obtain funds, Multisig needs to call withdrawFunds(address recipient, uint256 amount) on BALTokenHolder
  // // But on mainnet, they deployed BALTokenHolderFactory, but never used it, and specified a multisig as the Recipient of SingleRecipientGauge instead?

  // // This is the core pool/gauge
  // if (output['SingleRecipientGauge'] === undefined) {
  //   logger.info('Creating single recipient gauge');
  //   await helper.grantRole(deployer.address, authorizerAdaptor, gaugeController.interface, 'add_gauge(address,int128)');
  //   await helper.createSingleRecipientGauge(
  //     Object.keys(gaugeTypes)[1],
  //     'veHLDR Liquidity Mining HLDR Holder',
  //     MULTISIG_ADDRESS
  //   );
  //   await helper.revokeRole(
  //     deployer.address,
  //     authorizerAdaptor,
  //     gaugeController.interface,
  //     'add_gauge(address,int128)'
  //   );
  // }

  // /**
  //  * 5. Create and setup main gauges
  //  */

  // // Setup GaugeFactory

  // // Try-catch because this view function throws an error if invalid query.
  // // Need to use type 2 for 'gaugeAdder.addEthereumGauge' function, this is a gauge that can be bribed on and cannot be the core pool/gauge
  // try {
  //   await gaugeAdder.getFactoryForGaugeType(2, 0);
  // } catch {
  //   const liquidityGaugeInterface = new ethers.utils.Interface(LiquidityGaugeV5ABI);
  //   logger.info('Granting permission for deployer to add_reward and set_reward_distributor for liquidity gauge');
  //   await helper.grantRole(deployer.address, authorizerAdaptor, liquidityGaugeInterface, 'add_reward');
  //   await helper.grantRole(deployer.address, authorizerAdaptor, liquidityGaugeInterface, 'set_reward_distributor');

  //   logger.info('Adding liquidityGaugeFactory as permitted factory for type 2 gauge to GaugeAdder');
  //   await helper.grantRole(deployer.address, gaugeAdder, gaugeAdder.interface, 'addGaugeFactory');
  //   await gaugeAdder.connect(deployer).addGaugeFactory(mainnetGaugeFactory.address, 2);
  //   await helper.revokeRole(deployer.address, gaugeAdder, gaugeAdder.interface, 'addGaugeFactory');
  // }

  // // Setup gauges

  // const POOLS = [
  //   '0x190185164382d388ef829a3ad67998ab5792eea3', // HLDR80-20wNEAR
  //   '0x00055c916d93bb1809552430119149af858fbf06', // HLDR50-USDC25-WETH25
  //   '0x89bdd5d6b426c535127819abab51c4c2724d4e03', // 40USDC-40USDT-20wNEAR
  //   '0x9eeebb9184031fbb78a4959ef820d8119d433979', // 80wNEAR-20wETH
  //   '0xdb6b3d53d6f1087eac3f51dd803ccce54f607a6e', // 80wNEAR-20wBTC
  //   '0x2524a4d5588d15e10b7495edd548cc53b18db780', // 80wNEAR-20AURORA
  //   '0x4ab6f40241f01c9f6dcf8cc154d54b05477551c7', // AURORA25-BSTN25-PLY25-TRI25
  //   '0x480edf7ecb52ef9eace2346b84f29795429aa9c9', // USDT-USDC Stablepool
  // ];

  // for (let i = 0; i < POOLS.length; i++) {
  //   await helper.grantRole(deployer.address, gaugeAdder, gaugeAdder.interface, 'addEthereumGauge');
  //   if (output[`Gauge_${i}`] === undefined) {
  //     logger.info(`Creating liquidity gauge ${i} for ${POOLS[i]}`);
  //     await helper.createMainnetGauge(POOLS[i], `Gauge_${i}`);
  //   }
  //   await helper.revokeRole(deployer.address, gaugeAdder, gaugeAdder.interface, 'addEthereumGauge');
  // }

  /**
   * Setup complete, renounce permissions over the Authorizer
   */

  // logger.info('setup complete, revoking deployer permissions over Authorizer');
  // const authorizerDefaultAdminRole = await authorizer.DEFAULT_ADMIN_ROLE();
  // await authorizer.connect(deployer).revokeRole(authorizerDefaultAdminRole, deployer.address);
  logger.success('setupVotingEscrow script complete');
};
