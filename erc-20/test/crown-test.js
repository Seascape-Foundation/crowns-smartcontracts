/* global artifacts, contract, it, config*/
import BigNumber from 'bignumber.js';
import {
  CrownToken,
  tokenSpecs,
  addressToPreAllocatedTokensMap,
  getAmountWithDecimalsMultiplier,
} from './helpers/token-helper';

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')())
  .should();

contract('Crowns', ([from, ...rest]) => {
  before(async function () {
    this.tokenInstance = CrownToken.instance;
    addressToPreAllocatedTokensMap[from] = getAmountWithDecimalsMultiplier(new BigNumber(1250000));
  });

  it('should get and match the token specs', async function () {
    const {
      totalSupply,
      name,
      decimals,
      symbol,
    } = tokenSpecs;

    const totalSupplyGot = await this.tokenInstance.methods.totalSupply().call();
    const nameGot = await this.tokenInstance.methods.name().call();
    const decimalsGot = await this.tokenInstance.methods.decimals().call();
    const symbolGot = await this.tokenInstance.methods.symbol().call();

    totalSupplyGot.should.be.bignumber.equal(totalSupply);
    nameGot.should.be.equal(name);
    decimalsGot.should.be.bignumber.equal(decimals);
    symbolGot.should.be.equal(symbol);
  });

  it('should assert the amounts for pre-allocated tokens', async function () {
    await Promise.all(
      Object.entries(addressToPreAllocatedTokensMap).map(
        async ([
          address,
          amountWant,
        ]) => {
          const amountGot = await this.tokenInstance.methods
            .balanceOf(address).call();

          amountGot.should.be.bignumber.equal(amountWant);
        }
      ));
  });

  it('sum of all pre-allocated tokens should be equal to total Supply', async function () {
    const sum = Object.values(addressToPreAllocatedTokensMap).reduce(
      (acc, amount) => (acc.plus(amount)),
      new BigNumber(0),
    );
    const totalSupply = await this.tokenInstance.methods.totalSupply().call();
    totalSupply.should.be.bignumber.equal(sum);
  });
});
