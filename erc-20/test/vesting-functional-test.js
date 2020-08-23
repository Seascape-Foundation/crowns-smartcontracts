/* global artifacts, contract, it, config, increaseTime*/
import BigNumber from 'bn.js';
import {
  getAmountWithDecimalsMultiplier,
  calculateDividend, decimals,
} from './helpers/token-helper';
import { ONLY_OWNER_CALLABLE} from './helpers/errors';
const Crowns = artifacts.require('Crowns');
const VestingContract = artifacts.require('VestingContract');

config({
  contracts: {
    deploy: {
      Crowns: {
        args: [
          '$accounts[0]',
          '$accounts[1]',
          '$accounts[2]',
          '$accounts[3]'
        ],
      },
      VestingContract: {
        args: [ '$Crowns', '$accounts[0]' ]
      }
    }
  }
});

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BigNumber))
  .should();

contract('Vesting', ([
  owner,
  nonOwner,
  beneficiary,
  beneficiary1,
  beneficiary2,
]) => {
  describe('test functionality of Crowns token', () => {
    before(async function () {
      this.spendAmount = getAmountWithDecimalsMultiplier(new BigNumber(1000));
    });

    it('non owner should not be able to grant tokens', async function () {
      const releaseTime = Math.ceil(new Date() / 1000);

      await VestingContract.methods.lock(beneficiary, this.spendAmount, releaseTime).send({
        from: nonOwner
      }).should.be.rejectedWith(ONLY_OWNER_CALLABLE);
    });

    it('owner should be able to grant tokens', async function () {
      const releaseTime = Math.ceil(new Date() / 1000) + 1000;

      await Crowns.methods.transfer(VestingContract.address, this.spendAmount).send({
        from: owner,
      });

      await VestingContract.methods.lock(beneficiary, this.spendAmount, releaseTime).send({
        from: owner
      }).should.be.fulfilled;

      const lockedAmount = await VestingContract.methods.lockedAmount(beneficiary).call();
      lockedAmount.should.be.bignumber.equal(
        this.spendAmount,
      );
    });

    it('grant tokens and check locked amount with dividends existing', async function () {
      const releaseTime = Math.ceil(new Date() / 1000) + 1000;

      await Crowns.methods.transfer(VestingContract.address, this.spendAmount).send({
        from: owner,
      });

      await Crowns.methods.spend(this.spendAmount).send({
        from: owner,
      });

      await Crowns.methods.dropDividend().send({
        from: owner,
      });

      await VestingContract.methods.lock(beneficiary1, this.spendAmount, releaseTime).send({
        from: owner
      }).should.be.fulfilled;

      const vestingContractDividend = await calculateDividend({
        token: Crowns,
        address: VestingContract.address
      });

      const vestingContractTotalBalance = new BigNumber(
        (await Crowns.methods.balanceOf(VestingContract.address).call())
      );
      const vestingContractBalance = vestingContractTotalBalance.sub(vestingContractDividend);

      const grantPercents = this.spendAmount.mul(
        new BigNumber(10).pow(decimals)
      ).div(vestingContractBalance);

      const totalLockedAmountWant = vestingContractTotalBalance.mul(grantPercents).div(
        new BigNumber(10).pow(decimals)
      );

      const lockedAmountGot = new BigNumber(
        (await VestingContract.methods.lockedAmount(beneficiary1).call())
      );

      lockedAmountGot.should.be.bignumber.equal(
        totalLockedAmountWant,
      );
    });

    it('grant tokens and release with dividends existing', async function () {
      const releaseTime = Math.ceil(new Date() / 1000) + 1000;

      await Crowns.methods.transfer(VestingContract.address, this.spendAmount).send({
        from: owner,
      });

      await Crowns.methods.spend(this.spendAmount).send({
        from: owner,
      });

      await Crowns.methods.dropDividend().send({
        from: owner,
      });

      const beneficiaryBalanceBefore = new BigNumber(
        (await Crowns.methods.balanceOf(beneficiary2).call())
      );

      await VestingContract.methods.lock(beneficiary2, this.spendAmount, releaseTime).send({
        from: owner
      }).should.be.fulfilled;

      await increaseTime(2000);

      const vestingContractDividend = await calculateDividend({
        token: Crowns,
        address: VestingContract.address
      });

      const vestingContractTotalBalance = new BigNumber(
        (await Crowns.methods.balanceOf(VestingContract.address).call())
      );
      const vestingContractBalance = vestingContractTotalBalance.sub(vestingContractDividend);

      const grantPercents = this.spendAmount.mul(
        new BigNumber(10).pow(decimals)
      ).div(vestingContractBalance);

      const totalLockedAmount = vestingContractTotalBalance.mul(grantPercents).div(
        new BigNumber(10).pow(decimals)
      );

      await VestingContract.methods.release(beneficiary2).send({
        from: owner,
      }).should.be.fulfilled;

      const beneficiaryBalanceAfter = new BigNumber(
        (await Crowns.methods.balanceOf(beneficiary2).call())
      );

      beneficiaryBalanceAfter.should.be.bignumber.equal(
        beneficiaryBalanceBefore.add(
          totalLockedAmount
        )
      );
    });
  });
});
