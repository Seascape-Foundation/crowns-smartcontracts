/* global artifacts, contract, it, config*/
import BigNumber from 'bignumber.js';
import {
  CrownToken,
  tokenSpecs,
} from './helpers/deploy-token';

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')())
  .should();

contract('Crowns', (accounts) => {
  before(async function () {
    this.tokenInstance = CrownToken.instance;
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

    new BigNumber(totalSupplyGot).should.be.bignumber.equal(totalSupply);
    nameGot.should.be.equal(name);
    decimalsGot.should.be.bignumber.equal(decimals);
    symbolGot.should.be.equal(symbol);
  });
});
