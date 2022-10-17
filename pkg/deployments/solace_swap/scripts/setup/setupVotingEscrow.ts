// https://etherscan.deth.net/address/0xeb151668006CD04DAdD098AFd0a82e78F77076c3#code
import { ethers, logger, task } from './../../input';
import { ZERO_ADDRESS, ZERO, ONE_HUNDRED_PERCENT } from './../../constants';
import { VotingEscrowDeploymentHelper, solidityRequire, consoleLog } from './../../utils';
import { constants } from 'ethers';
const { HashZero } = constants;
import { ContractDeploymentCollection } from './../../types';
import LiquidityGaugeV5ABI from '../../../tasks/2022xxxx-solace-swap/abi/LiquidityGaugeV5.json';

export const setupVotingEscrow = async function setupVotingEscrow(
  contractDeploymentCollection: ContractDeploymentCollection
): Promise<void> {
  const [deployer] = await ethers.getSigners();
  const authorizer = contractDeploymentCollection['Authorizer'].instance;
  const authorizerAdaptor = contractDeploymentCollection['AuthorizerAdaptor'].instance;
  const token = contractDeploymentCollection['TestBalancerToken'].instance;
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

  const gaugeTypes: { [id: number]: string } = { [0]: 'veSWP' };
  const output = task.output({ ensure: false });

  // Preselected pools to create gauges for
  const initialPools = [output['SPT']];

  /**
   * CHECKS
   */

  solidityRequire(await authorizer.canPerform(HashZero, deployer.address, ZERO_ADDRESS), 'Not Authorizer admin');

  // Ensure that governance holds relevant admin rights

  // prettier-ignore
  solidityRequire((await gaugeController.voting_escrow()) == votingEscrow.address, 
  'gaugeController.voting_escrow != votingEscrow instance address');

  // prettier-ignore
  solidityRequire((await votingEscrow.admin()) === authorizerAdaptor.address, 
  'VotingEscrow not owned by AuthorizerAdaptor');

  // prettier-ignore
  solidityRequire((await gaugeController.admin()) === authorizerAdaptor.address, 
  'GaugeController not owned by AuthorizerAdaptor');

  /**
   * 1. Handover token admin role to tokenAdmin contract, and setup token inflation schedule.
   */

  const tokenDefaultAdminRole = await token.DEFAULT_ADMIN_ROLE();

  if (await token.hasRole(tokenDefaultAdminRole, deployer.address)) {
    logger.info('Handing over token admin role from deployer to TokenAdmin contract');
    await token.connect(deployer).grantRole(tokenDefaultAdminRole, tokenAdmin.address);

    logger.info('Granting deployer permission to call activate() on TokenAdmin contract');
    await helper.grantRole(deployer.address, tokenAdmin, tokenAdmin.interface, 'activate');

    logger.info(
      'Assigning TokenAdmin contract the sole MINTER and SNAPSHOTTER role for token. Removing all admin roles from token. Initial inflation set at 145K tokens per week.'
    );
    await tokenAdmin.connect(deployer).activate();

    // UNSURE: What do the following variables mean in the context of the TokenAdmin contract?
    // uint256 public constant override RATE_REDUCTION_TIME = 365 days;
    // uint256 public constant override RATE_REDUCTION_COEFFICIENT = 1189207115002721024; // 2 ** (1/4) * 1e18
    // uint256 public constant override RATE_DENOMINATOR = 1e18;

    logger.info('Granting TokenMinter permission to call TokenAdmin.mint()');
    await helper.grantRole(tokenMinter.address, tokenAdmin, tokenAdmin.interface, 'mint');
  }

  /**
   * 2. Create gauge types and set weight
   */

  if ((await gaugeController.n_gauge_types()).eq(ZERO)) {
    logger.info('Creating gauge types');
    await helper.grantRole(deployer.address, authorizerAdaptor, gaugeController.interface, 'add_type(string,uint256)');
    // Create single gauge type with 100% weight.
    await helper.performAction(gaugeController, 'add_type(string,uint256)', [gaugeTypes[0], ONE_HUNDRED_PERCENT]);
    await helper.revokeRole(deployer.address, authorizerAdaptor, gaugeController.interface, 'add_type(string,uint256)');
  }

  /**
   * 3. Setup GaugeAdder permissions
   */

  // GaugeAdder performs checks to ensure added gauges have been deployed by a correct factory contract.
  if (
    !(await helper.hasRole(
      gaugeAdder.address,
      authorizerAdaptor,
      gaugeController.interface,
      'add_gauge(address,int128,uint256)'
    ))
  ) {
    logger.info('Enabling GaugeAdder to call GaugeController.add_gauge');
    await helper.grantRole(
      gaugeAdder.address,
      authorizerAdaptor,
      gaugeController.interface,
      'add_gauge(address,int128)'
    );
    await helper.grantRole(
      gaugeAdder.address,
      authorizerAdaptor,
      gaugeController.interface,
      'add_gauge(address,int128,uint256)'
    );
  }

  /**
   * 4. Create and setup single recipient gauge
   */

  // Intended to be temporary, and migrated to gauge implementation that automate distribution of BAL to BPT stakers on other networks and veBAL holders.

  if (output['SingleRecipientGauge'] === undefined) {
    logger.info('Creating single recipient gauge');
    await helper.grantRole(deployer.address, authorizerAdaptor, gaugeController.interface, 'add_gauge(address,int128)');
    await helper.createSingleRecipientGauge(Object.keys(gaugeTypes)[0], 'OG Gauge', deployer.address);
    await helper.revokeRole(
      deployer.address,
      authorizerAdaptor,
      gaugeController.interface,
      'add_gauge(address,int128)'
    );
  }

  /**
   * 5. Create and setup liquidity gauge
   */

  if (output['MainnetGauge'] === undefined) {
    const liquidityGaugeInterface = new ethers.utils.Interface(LiquidityGaugeV5ABI);

    logger.info('Granting permission for deployer to add_reward and set_reward_distributor for liquidity gauge');
    await helper.grantRole(deployer.address, authorizerAdaptor, liquidityGaugeInterface, 'add_reward');
    await helper.grantRole(deployer.address, authorizerAdaptor, liquidityGaugeInterface, 'set_reward_distributor');

    if ((await gaugeAdder.getFactoryForGaugeType(Object.keys(gaugeTypes)[0], 0)) !== mainnetGaugeFactory.address) {
      logger.info('Adding liquidityGaugeFactory as permitted factory to GaugeAdder');
      await helper.grantRole(deployer.address, gaugeAdder, gaugeAdder.interface, 'addGaugeFactory');
      await gaugeAdder.connect(deployer).addGaugeFactory(mainnetGaugeFactory.address, Object.keys(gaugeTypes)[0]);
      await helper.revokeRole(deployer.address, gaugeAdder, gaugeAdder.interface, 'addGaugeFactory');
    }

    logger.info('Creating new liquidity gauge and adding to GaugeController');
    await helper.grantRole(deployer.address, gaugeAdder, gaugeAdder.interface, 'addEthereumGauge');
    for (let i = 0; i < initialPools.length; i++) {
      await helper.createMainnetGauge(initialPools[i]);
    }
    await helper.revokeRole(deployer.address, gaugeAdder, gaugeAdder.interface, 'addEthereumGauge');
  }

  /**
   * Setup complete, renounce permissions over the Authorizer
   */

  // logger.info('setup complete, revoking deployer permissions over Authorizer');
  // const authorizerDefaultAdminRole = await authorizer.DEFAULT_ADMIN_ROLE();
  // await authorizer.connect(deployer).revokeRole(authorizerDefaultAdminRole, deployer.address);
  logger.success('setupVotingEscrow script complete');
};
