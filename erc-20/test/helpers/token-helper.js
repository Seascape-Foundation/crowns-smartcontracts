/* global config, artifacts */
import BigNumber from 'bignumber.js';
// eslint-disable-next-line no-unused-vars
const Crowns = artifacts.require('Crowns');

const decimals = new BigNumber(18);
export const getAmountWithDecimalsMultiplier = (amount) =>
  (amount.multipliedBy(new BigNumber(10).pow(decimals))
  );

export const tokenSpecs = {
  name: 'Crowns',
  decimals: new BigNumber(18),
  totalSupply: getAmountWithDecimalsMultiplier(new BigNumber(10000000)),
  symbol: 'CWS',
};

export const addressToPreAllocatedTokensMap = {
  ['0xFa4D7D1AC9b7a7454D09B8eAdc35aA70599329EA']: getAmountWithDecimalsMultiplier(new BigNumber(3000000)),
  ['0x53bd91aEF5e84A61F9B87781A024ee648733f973']: getAmountWithDecimalsMultiplier(new BigNumber(3000000)),
  ['0xB5de2b5186E1Edc947B73019F3102EF53c2Ac691']: getAmountWithDecimalsMultiplier(new BigNumber(1000000)),
  ['0x1D3Db9BCA5aa2CE931cE13B7B51f8E14F5895368']: getAmountWithDecimalsMultiplier(new BigNumber(1000000)),
  ['0x0811e2DFb6482507461ca2Ab583844313f2549B5']: getAmountWithDecimalsMultiplier(new BigNumber(750000)),
};

export const CrownToken = {};

config({
  contracts: {
    deploy: {
      Crowns: {
        args: [ '$accounts[0]' ],
        onDeploy: ({ contracts }) => {
          CrownToken.instance = contracts.Crowns;
        }
      },
    }
  }
});
