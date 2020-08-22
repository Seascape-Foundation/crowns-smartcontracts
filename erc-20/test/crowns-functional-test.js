/* global artifacts, contract, it, config*/
import BigNumber from 'bn.js';
import {
  decimals,
  getAmountWithDecimalsMultiplier, zero,
} from './helpers/token-helper';
import {NOT_ENOUGH_BALANCE, ONLY_OWNER_CALLABLE} from './helpers/errors';
const Crowns = artifacts.require('Crowns');

config({
  contracts: {
    deploy: {
      Crowns: {
        args: [ '$accounts[0]' ],
      },
    }
  }
});

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BigNumber))
  .should();

contract('Crowns Token', ([
  owner,
  spender,
  nonOwner,
  sender,
  receiver,
]) => {
  describe('test functionality of Crowns token', () => {
    before(async function () {
      this.spendAmount = getAmountWithDecimalsMultiplier(new BigNumber(1000));
    });

    it('should not spend tokens if balance is insufficient', async function () {
      await Crowns.methods.spend(this.spendAmount).send({
        from: spender,
      }).should.be.rejectedWith(NOT_ENOUGH_BALANCE);
    });

    it('should successfully spend tokens', async function () {
      await Crowns.methods.transfer(spender, this.spendAmount).send({
        from: owner,
      }).should.be.fulfilled;

      const {
        events: {
          Transfer: {
            returnValues: {
              from,
              to,
              value,
            }
          }
        }
      } = await Crowns.methods.spend(this.spendAmount).send({
        from: spender,
      }).should.be.fulfilled;

      from.should.be.equal(spender);
      to.should.be.equal(zero);
      value.should.be.bignumber.equal(this.spendAmount);

      const spenderBalance = await Crowns.methods.balanceOf(spender).call();
      const unConfirmedDividends = await Crowns.methods.unConfirmedDividends().call();

      spenderBalance.should.be.bignumber.equal(
        new BigNumber(0),
      );

      unConfirmedDividends.should.be.bignumber.equal(
        this.spendAmount,
      );
    });

    it('non owner should not drop dividend', async function () {
      await Crowns.methods.dropDividend().send({
        from: nonOwner,
      }).should.be.rejectedWith(ONLY_OWNER_CALLABLE);
    });

    it('owner should be able to drop dividend', async function () {
      await Crowns.methods.spend(this.spendAmount).send({
        from: owner,
      });

      const totalDividendsBefore = new BigNumber(
        (await Crowns.methods.totalDividends().call())
      );
      const unClaimedDividendsBefore = new BigNumber(
        (await Crowns.methods.unClaimedDividends().call())
      );
      const unConfirmedDividendsBefore = new BigNumber(
        (await Crowns.methods.unConfirmedDividends().call())
      );

      const {
        events: {
          DividendDropped: {
            returnValues: {
              unclaimedDividends: unclaimedDividendsEmitted,
              totalDividends: totalDividendsEmitted,
            }
          }
        }
      } = await Crowns.methods.dropDividend().send({
        from: owner,
      }).should.be.fulfilled;

      const totalDividendsAfter = await Crowns.methods.totalDividends().call();
      const unClaimedDividendsAfter = await Crowns.methods.unClaimedDividends().call();
      const unConfirmedDividendsAfter = await Crowns.methods.unConfirmedDividends().call();

      totalDividendsAfter.should.be.bignumber.equal(
        totalDividendsBefore.add(unConfirmedDividendsBefore)
      );

      unClaimedDividendsAfter.should.be.bignumber.equal(
        unClaimedDividendsBefore.add(unConfirmedDividendsBefore)
      );

      unConfirmedDividendsAfter.should.be.bignumber.equal(
        new BigNumber(0)
      );

      unclaimedDividendsEmitted.should.be.bignumber.equal(
        unClaimedDividendsAfter
      );

      totalDividendsEmitted.should.be.bignumber.equal(
        totalDividendsAfter
      );
    });

    it.only('test dividends Owing for an address', async function () {
      await Crowns.methods.spend(this.spendAmount).send({
        from: owner,
      });

      await Crowns.methods.dropDividend().send({
        from: owner,
      });

      const balance = new BigNumber(
        (await Crowns.methods.balanceOf(owner).call())
      );
      const lastDividends = new BigNumber(
        (await Crowns.methods.getLastDividends(owner).call())
      );
      const totalDividends = new BigNumber(
        (await Crowns.methods.totalDividends().call())
      );
      const totalSupply = new BigNumber(
        (await Crowns.methods.totalSupply().call())
      );

      const newDividends = totalDividends.sub(lastDividends);
      const supply = totalSupply.sub(newDividends);
      const proportion = newDividends.mul(balance).div(supply);
      /**
       * round the value
       * @type {BN}
       */
      const dividendWant = proportion
        .div(new BigNumber(10).pow(decimals))
        .mul(new BigNumber(10).pow(decimals));

      const dividendGot = new BigNumber(
        (await Crowns.methods.dividendsOwing(owner).call())
      );

      dividendGot.should.be.bignumber.equal(
        dividendWant
      );
    });
    // it('sender/receiver should receive dividend upon transfer', async function () {
    //   await Crowns.methods.transfer(sender, this.spendAmount).send({
    //     from: owner,
    //   });
    //
    //   await Crowns.methods.transfer(receiver, this.spendAmount).send({
    //     from: owner,
    //   });
    //
    //   await Crowns.methods.spend(this.spendAmount).send({
    //     from: owner,
    //   });
    //
    //   await Crowns.methods.dropDividend().send({
    //     from: owner,
    //   });
    //
    //   const totalDividends = await Crowns.methods.totalDividends().call();
    //   const unClaimedDividends = await Crowns.methods.unClaimedDividends().call();
    //   const unConfirmedDividends = await Crowns.methods.unConfirmedDividends().call();
    //
    //   const senderBalanceBefore = await Crowns.methods.balanceOf(sender).call();
    //   const receiverBalanceBefore = await Crowns.methods.balanceOf(receiver).call();
    //
    //   const senderDividendsOwingBefore = await Crowns.methods.dividendsOwing(sender).call();
    //   const receiverDividensdOwingBefore = await Crowns.methods.dividendsOwing(receiver).call();
    //
    //   await Crowns.methods.transfer(receiver, this.spendAmount).send({
    //     from: sender,
    //   }).should.be.fulfilled;
    //
    //   const senderBalanceAfter = await Crowns.methods.balanceOf(sender).call();
    //   const receiverBalanceAfter = await Crowns.methods.balanceOf(receiver).call();
    //
    //   (await Crowns.methods.dividendsOwing(sender).call())
    //     .should.be.bignumber.equal(new BigNumber(0));
    //
    //   (await Crowns.methods.dividendsOwing(receiver).call())
    //     .should.be.bignumber.equal(new BigNumber(0));
    //
    //   senderBalanceAfter.should.be.bignumber.equal(
    //     new BigNumber(senderBalanceBefore)
    //       .minus(this.spendAmount)
    //       .plus(senderDividendsOwingBefore)
    //   );
    //
    //   receiverBalanceAfter.should.be.bignumber.equal(
    //     receiverBalanceBefore
    //       .plus(this.spendAmount)
    //       .plus(receiverDividensdOwingBefore)
    //   );
    // });
  });
});
