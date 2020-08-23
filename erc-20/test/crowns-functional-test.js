/* global artifacts, contract, it, config*/
import BigNumber from 'bn.js';
import {
  getAmountWithDecimalsMultiplier,
  zero,
  calculateDividend,
} from './helpers/token-helper';
import {NOT_ENOUGH_BALANCE, ONLY_OWNER_CALLABLE} from './helpers/errors';
const Crowns = artifacts.require('Crowns');

config({
  contracts: {
    deploy: {
      Crowns: {
        args: [
          '$accounts[0]',
          '$accounts[7]',
          '$accounts[8]',
          '$accounts[9]'
        ],
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
  sender1,
  receiver1,
  approvedSender,
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

    it('test dividends Owing for an address', async function () {
      await Crowns.methods.spend(this.spendAmount).send({
        from: owner,
      });

      await Crowns.methods.dropDividend().send({
        from: owner,
      });

      const dividendWant = await calculateDividend({
        token: Crowns,
        address: owner
      });

      const dividendGot = await Crowns.methods.dividendsOwing(owner).call();

      dividendGot.should.be.bignumber.equal(
        dividendWant
      );
    });

    it('sender/receiver should receive dividend upon transfer', async function () {
      await Crowns.methods.transfer(sender, this.spendAmount).send({
        from: owner,
      });

      await Crowns.methods.transfer(receiver, this.spendAmount).send({
        from: owner,
      });

      await Crowns.methods.spend(this.spendAmount).send({
        from: owner,
      });

      await Crowns.methods.dropDividend().send({
        from: owner,
      });

      const senderDividendsOwingBefore = await calculateDividend({
        token: Crowns,
        address: sender
      });

      const receiverDividendsOwingBefore = await calculateDividend({
        token: Crowns,
        address: receiver
      });


      const senderBalanceBefore = new BigNumber(
        (await Crowns.methods.balanceOf(sender).call())
      ).sub(senderDividendsOwingBefore);

      const receiverBalanceBefore = new BigNumber(
        (await Crowns.methods.balanceOf(receiver).call())
      ).sub(receiverDividendsOwingBefore);


      const {
        events: {
          Transfer: Transfers
        }
      } = await Crowns.methods.transfer(receiver, this.spendAmount).send({
        from: sender,
      }).should.be.fulfilled;

      const transferredAmounts = [
        senderDividendsOwingBefore,
        receiverDividendsOwingBefore,
        this.spendAmount,
      ];

      Transfers.forEach(
        (
          {
            returnValues: {
              value
            }
          },
          idx
        ) => {
          value.should.be.bignumber.equal(
            transferredAmounts[idx],
          );
        }
      );

      const senderBalanceAfter = await Crowns.methods.balanceOf(sender).call();
      const receiverBalanceAfter = await Crowns.methods.balanceOf(receiver).call();

      (await Crowns.methods.dividendsOwing(sender).call())
        .should.be.bignumber.equal(new BigNumber(0));

      (await Crowns.methods.dividendsOwing(receiver).call())
        .should.be.bignumber.equal(new BigNumber(0));

      senderBalanceAfter.should.be.bignumber.equal(
        new BigNumber(senderBalanceBefore)
          .sub(this.spendAmount)
          .add(senderDividendsOwingBefore)
      );

      receiverBalanceAfter.should.be.bignumber.equal(
        receiverBalanceBefore
          .add(this.spendAmount)
          .add(receiverDividendsOwingBefore)
      );
    });

    it('sender1/receiver1 should receive dividend upon transferFrom', async function () {
      await Crowns.methods.transfer(sender1, this.spendAmount).send({
        from: owner,
      });

      await Crowns.methods.transfer(receiver1, this.spendAmount).send({
        from: owner,
      });

      await Crowns.methods.spend(this.spendAmount).send({
        from: owner,
      });

      await Crowns.methods.dropDividend().send({
        from: owner,
      });

      const senderDividendsOwingBefore = await calculateDividend({
        token: Crowns,
        address: sender1
      });

      const receiverDividendsOwingBefore = await calculateDividend({
        token: Crowns,
        address: receiver1
      });


      const senderBalanceBefore = new BigNumber(
        (await Crowns.methods.balanceOf(sender1).call())
      ).sub(senderDividendsOwingBefore);

      const receiverBalanceBefore = new BigNumber(
        (await Crowns.methods.balanceOf(receiver1).call())
      ).sub(receiverDividendsOwingBefore);


      await Crowns.methods.approve(approvedSender, this.spendAmount).send({
        from: sender1,
      });

      const {
        events: {
          Transfer: Transfers
        }
      } = await Crowns.methods.transferFrom(sender1, receiver1, this.spendAmount).send({
        from: approvedSender,
      }).should.be.fulfilled;

      const transferredAmounts = [
        senderDividendsOwingBefore,
        receiverDividendsOwingBefore,
        this.spendAmount,
      ];

      Transfers.forEach(
        (
          {
            returnValues: {
              value
            }
          },
          idx
        ) => {
          value.should.be.bignumber.equal(
            transferredAmounts[idx],
          );
        }
      );

      const senderBalanceAfter = await Crowns.methods.balanceOf(sender1).call();
      const receiverBalanceAfter = await Crowns.methods.balanceOf(receiver1).call();

      (await Crowns.methods.dividendsOwing(sender1).call())
        .should.be.bignumber.equal(new BigNumber(0));

      (await Crowns.methods.dividendsOwing(receiver1).call())
        .should.be.bignumber.equal(new BigNumber(0));

      senderBalanceAfter.should.be.bignumber.equal(
        new BigNumber(senderBalanceBefore)
          .sub(this.spendAmount)
          .add(senderDividendsOwingBefore)
      );

      receiverBalanceAfter.should.be.bignumber.equal(
        receiverBalanceBefore
          .add(this.spendAmount)
          .add(receiverDividendsOwingBefore)
      );
    });
  });
});
