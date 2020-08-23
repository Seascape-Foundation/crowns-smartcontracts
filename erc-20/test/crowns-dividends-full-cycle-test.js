/* global artifacts, contract, it, config*/
import BigNumber from 'bn.js';
import {
  getAmountWithDecimalsMultiplier,
} from './helpers/token-helper';
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

contract('Crowns Token: Full Cycle test', (accounts) => {
  describe('test functionality of Crowns token', () => {
    before(async function () {
      this.spendAmount = getAmountWithDecimalsMultiplier(new BigNumber(100000));
    });

    it('run full cycle test for dividends', async function () {
      const [
        addr1,
        ,
        ,
        ,
        ,
        ,
        ,
        addr2,
        addr3,
        addr4,
      ] = accounts;
      await Crowns.methods.spend(this.spendAmount).send({
        from: addr1,
      });

      await Crowns.methods.dropDividend().send({
        from: addr1,
      });

      const addresses = [
        addr1,
        addr2,
        addr3,
        addr4,
      ];

      await addresses.reduce(
        async (
          acc,
          addr
        ) => {
          await acc;
          await Crowns.methods.explicitlyUpdate(addr).send({
            from: addr1,
          });
        },
        null,
      );

      const unClaimedDividends = new BigNumber(
        (await Crowns.methods.unClaimedDividends().call())
      );
      const unConfirmedDividends = new BigNumber(
        (await Crowns.methods.unConfirmedDividends().call())
      );
      const totalDividends = new BigNumber(
        (await Crowns.methods.totalDividends().call())
      );

      unClaimedDividends.should.be.bignumber.lt(
        new BigNumber(10),
      );

      unConfirmedDividends.should.be.bignumber.equal(
        new BigNumber(0)
      );

      totalDividends.should.be.bignumber.equal(
        this.spendAmount,
      );
    });
  });
});


