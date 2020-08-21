/* global config, artifacts */
import BigNumber from 'bignumber.js';
// eslint-disable-next-line no-unused-vars
const Crowns = artifacts.require('Crowns');

export const tokenSpecs = {
  name: 'Crowns',
  decimals: new BigNumber(18),
  totalSupply: new BigNumber(10000000).multipliedBy(
    new BigNumber(10).pow(new BigNumber(18)),
  ),
  symbol: 'CWS',
};

export const CrownToken = {};

config({
  contracts: {
    deploy: {
      Crowns: {
        onDeploy: ({ contracts }) => {
          CrownToken.instance = contracts.Crowns;
        }
      },
    }
  }
});
