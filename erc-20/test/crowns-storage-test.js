/* global artifacts, contract, it, config*/
import BigNumber from 'bn.js';
import {
  tokenSpecs,
  addressToPreAllocatedTokensMap,
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

contract('Crowns Token', ([owner]) => {
  describe('test Crowns token storage', () => {
    it('should get and match the token specs', async () => {
      const {
        totalSupply,
        name,
        decimals,
        symbol,
      } = tokenSpecs;

      const totalSupplyGot = await Crowns.methods.totalSupply().call();
      const nameGot = await Crowns.methods.name().call();
      const decimalsGot = await Crowns.methods.decimals().call();
      const symbolGot = await Crowns.methods.symbol().call();

      totalSupplyGot.should.be.bignumber.equal(totalSupply);
      nameGot.should.be.equal(name);
      decimalsGot.should.be.bignumber.equal(decimals);
      symbolGot.should.be.equal(symbol);
    });

    // it('should assert the amounts for pre-allocated tokens', async () => {
    //   addressToPreAllocatedTokensMap[owner] = getAmountWithDecimalsMultiplier(new BigNumber(1250000));
    //
    //   await Promise.all(
    //     Object.entries(addressToPreAllocatedTokensMap).map(
    //       async ([
    //         address,
    //         amountWant,
    //       ]) => {
    //         const amountGot = await Crowns.methods
    //           .balanceOf(address).call();
    //
    //         amountGot.should.be.bignumber.equal(amountWant);
    //       }
    //     ));
    // });
    //
    // it('sum of all pre-allocated tokens should be equal to total Supply', async () => {
    //   addressToPreAllocatedTokensMap[owner] = getAmountWithDecimalsMultiplier(new BigNumber(1250000));
    //
    //   const sum = Object.values(addressToPreAllocatedTokensMap).reduce(
    //     (acc, amount) => (acc.add(amount)),
    //     new BigNumber(0),
    //   );
    //   const totalSupply = await Crowns.methods.totalSupply().call();
    //   totalSupply.should.be.bignumber.equal(sum);
    // });
  });
});
