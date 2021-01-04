import { ethers } from 'hardhat';
import { expect } from 'chai';
import { Contract, BigNumber } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { MAX_UINT256 } from '../helpers/constants';
import { deployTokens, mintTokens, TokenList } from '../helpers/tokens';
import { expectBalanceChange } from '../helpers/tokenBalance';
import { deploy } from '../../scripts/helpers/deploy';
import * as expectEvent from '../helpers/expectEvent';
import { PairTS, TradingStrategyType, TupleTS, TwoTokenTS } from '../../scripts/helpers/pools';

describe('InvestmentManager', function () {
  let tokens: TokenList;
  let otherToken: Contract;
  let vault: Contract;

  let admin: SignerWithAddress;
  let pool: SignerWithAddress;
  let investmentManager: SignerWithAddress;
  let other: SignerWithAddress;

  before('deploy base contracts', async () => {
    [, admin, pool, investmentManager, other] = await ethers.getSigners();
  });

  beforeEach('set up investment manager', async () => {
    vault = await deploy('Vault', { args: [admin.address] });
    tokens = await deployTokens(['DAI', 'USDT'], [18, 18]);

    otherToken = await deploy('TestToken', { args: ['OTHER', 'OTHER', 18] });
  });

  context('with two token pool', () => {
    itManagesInvestmentsCorrectly(TwoTokenTS);
  });

  context('with pair trading strategy pool', () => {
    itManagesInvestmentsCorrectly(PairTS);
  });

  context('with tuple trading strategy pool', () => {
    itManagesInvestmentsCorrectly(TupleTS);
  });

  function itManagesInvestmentsCorrectly(poolType: TradingStrategyType) {
    let poolId: string;
    const tokenInitialBalance = BigNumber.from((200e18).toString());

    beforeEach(async () => {
      const receipt = await (await vault.newPool(pool.address, poolType)).wait();

      const event = expectEvent.inReceipt(receipt, 'PoolCreated');
      poolId = event.args.poolId;

      const tokenAddresses = [];
      const tokenAmounts = [];
      for (const symbol in tokens) {
        // Mint tokens for the pool to add liquidity with
        await mintTokens(tokens, symbol, pool, tokenInitialBalance);

        tokenAddresses.push(tokens[symbol].address);
        tokenAmounts.push(tokenInitialBalance);

        await tokens[symbol].connect(pool).approve(vault.address, MAX_UINT256);

        await tokens[symbol].connect(investmentManager).approve(vault.address, MAX_UINT256);
        await vault
          .connect(pool)
          .authorizePoolInvestmentManager(poolId, tokens[symbol].address, investmentManager.address);
      }

      await vault.connect(pool).addLiquidity(poolId, pool.address, tokenAddresses, tokenAmounts, false);
    });

    describe('invest', () => {
      context('when the sender the manager', () => {
        context('when trying to invest less than the vault balance', () => {
          const amount = BigNumber.from((10e18).toString());

          it('transfers only the requested token from the vault to the manager', async () => {
            await expectBalanceChange(
              () => vault.connect(investmentManager).investPoolBalance(poolId, tokens.DAI.address, amount),
              tokens,
              [
                { account: investmentManager, changes: { DAI: amount } },
                { account: vault, changes: { DAI: -amount } },
              ]
            );
          });

          it('does not affect the balance of the pools', async () => {
            const tokenAddresses = [tokens.DAI.address, tokens.USDT.address];
            const [previousBalanceDAI, previousBalanceUSDT] = await vault.getPoolTokenBalances(poolId, tokenAddresses);

            await vault.connect(investmentManager).investPoolBalance(poolId, tokens.DAI.address, amount);

            const [currentBalanceDAI, currentBalanceUSDT] = await vault.getPoolTokenBalances(poolId, tokenAddresses);
            expect(currentBalanceDAI).to.equal(previousBalanceDAI);
            expect(currentBalanceUSDT).to.equal(previousBalanceUSDT);
          });
        });

        it('reverts when investing a token not in the pool', async () => {
          await vault
            .connect(pool)
            .authorizePoolInvestmentManager(poolId, otherToken.address, investmentManager.address);

          await expect(
            vault.connect(investmentManager).investPoolBalance(poolId, otherToken.address, 0)
          ).to.be.revertedWith('Token not in pool');
        });

        it('reverts when investing more than the pool balance', async () => {
          await expect(
            vault.connect(investmentManager).investPoolBalance(poolId, tokens.DAI.address, tokenInitialBalance.add(1))
          ).to.be.revertedWith('ERR_SUB_UNDERFLOW');
        });
      });

      it('reverts if the sender is not the manager', async () => {
        await expect(vault.connect(other).investPoolBalance(poolId, tokens.DAI.address, 0)).to.be.revertedWith(
          'SENDER_NOT_INVESTMENT_MANAGER'
        );
      });
    });

    describe('divest', () => {
      context('when the sender is an allowed manager', () => {
        context('when trying to divest less than the invested balance', () => {
          const investedAmount = BigNumber.from((75e18).toString());
          const amount = investedAmount.div(2);

          beforeEach('invest', async () => {
            await vault.connect(investmentManager).investPoolBalance(poolId, tokens.DAI.address, investedAmount);
          });

          it('transfers only the requested token from the manager to the vault', async () => {
            await expectBalanceChange(
              () => vault.connect(investmentManager).divestPoolBalance(poolId, tokens.DAI.address, amount),
              tokens,
              [
                { account: investmentManager, changes: { DAI: -amount } },
                { account: vault, changes: { DAI: amount } },
              ]
            );
          });

          it('does not affect the balance of the pools', async () => {
            const tokenAddresses = [tokens.DAI.address, tokens.USDT.address];
            const [previousBalanceDAI, previousBalanceUSDT] = await vault.getPoolTokenBalances(poolId, tokenAddresses);

            await vault.connect(investmentManager).divestPoolBalance(poolId, tokens.DAI.address, amount);

            const [currentBalanceDAI, currentBalanceUSDT] = await vault.getPoolTokenBalances(poolId, tokenAddresses);
            expect(currentBalanceDAI).to.equal(previousBalanceDAI);
            expect(currentBalanceUSDT).to.equal(previousBalanceUSDT);
          });
        });

        it('does nothing when divesting zero tokens', async () => {
          await expectBalanceChange(
            () => vault.connect(investmentManager).divestPoolBalance(poolId, tokens.DAI.address, 0),
            tokens,
            { account: vault.address }
          );
        });

        it('reverts when divesting more than the invested balance', async () => {
          await expect(
            vault.connect(investmentManager).divestPoolBalance(poolId, tokens.DAI.address, 1)
          ).to.be.revertedWith('ERC20: transfer amount exceeds balance');
        });

        it('reverts when divesting a token not in the pool', async () => {
          await vault
            .connect(pool)
            .authorizePoolInvestmentManager(poolId, otherToken.address, investmentManager.address);

          await expect(
            vault.connect(investmentManager).divestPoolBalance(poolId, otherToken.address, 0)
          ).to.be.revertedWith('Token not in pool');
        });
      });

      it('reverts if the sender is not the manager', async () => {
        await expect(vault.connect(other).divestPoolBalance(poolId, tokens.DAI.address, 0)).to.be.revertedWith(
          'SENDER_NOT_INVESTMENT_MANAGER'
        );
      });
    });

    describe('update', () => {
      context('when the sender is an allowed manager', () => {
        const investedAmount = BigNumber.from((10e18).toString());

        beforeEach('invest', async () => {
          await vault.connect(investmentManager).investPoolBalance(poolId, tokens.DAI.address, investedAmount);
        });

        context('with gains', () => {
          const amount = investedAmount.add(1);

          it('does not affect token balances', async () => {
            await expectBalanceChange(
              () => vault.connect(investmentManager).updateInvested(poolId, tokens.DAI.address, amount),
              tokens,
              [{ account: investmentManager }, { account: vault }]
            );
          });

          it('updates the balance of the pool', async () => {
            const tokenAddresses = [tokens.DAI.address, tokens.USDT.address];
            const [previousBalanceDAI, previousBalanceUSDT] = await vault.getPoolTokenBalances(poolId, tokenAddresses);

            await vault.connect(investmentManager).updateInvested(poolId, tokens.DAI.address, amount);

            const [currentBalanceDAI, currentBalanceUSDT] = await vault.getPoolTokenBalances(poolId, tokenAddresses);
            expect(currentBalanceDAI).to.equal(previousBalanceDAI.add(1));
            expect(currentBalanceUSDT).to.equal(previousBalanceUSDT);
          });
        });

        context('with losses', () => {
          const amount = investedAmount.sub(1);

          it('does not affect token balances', async () => {
            await expectBalanceChange(
              () => vault.connect(investmentManager).updateInvested(poolId, tokens.DAI.address, amount),
              tokens,
              [{ account: investmentManager }, { account: vault }]
            );
          });

          it('updates the balance of the pool', async () => {
            const tokenAddresses = [tokens.DAI.address, tokens.USDT.address];
            const [previousBalanceDAI, previousBalanceUSDT] = await vault.getPoolTokenBalances(poolId, tokenAddresses);

            await vault.connect(investmentManager).updateInvested(poolId, tokens.DAI.address, amount);

            const [currentBalanceDAI, currentBalanceUSDT] = await vault.getPoolTokenBalances(poolId, tokenAddresses);
            expect(currentBalanceDAI).to.equal(previousBalanceDAI.sub(1));
            expect(currentBalanceUSDT).to.equal(previousBalanceUSDT);
          });
        });
      });

      it('revert if setting a token not in the pool', async () => {
        await vault.connect(pool).authorizePoolInvestmentManager(poolId, otherToken.address, investmentManager.address);

        await expect(vault.connect(investmentManager).updateInvested(poolId, otherToken.address, 0)).to.be.revertedWith(
          'Token not in pool'
        );
      });

      it('revert if the sender is not the manager', async () => {
        await expect(vault.connect(other).updateInvested(poolId, tokens.DAI.address, 0)).to.be.revertedWith(
          'SENDER_NOT_INVESTMENT_MANAGER'
        );
      });
    });
  }
});