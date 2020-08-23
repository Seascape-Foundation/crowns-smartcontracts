/* global config, artifacts */
import BigNumber from 'bn.js';


export const decimals = new BigNumber(18);

export const getAmountWithDecimalsMultiplier = (amount) =>
  (amount.mul(new BigNumber(10).pow(decimals))
  );

export const zero = '0x0000000000000000000000000000000000000000';

export const tokenSpecs = {
  name: 'Crowns',
  decimals,
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

export const calculateDividend = async ({
  token,
  address,
}) => {
  const balance = new BigNumber(
    (await token.methods.balanceOf(address).call())
  );
  const dividend = new BigNumber(
    (await token.methods.dividendsOwing(address).call())
  );
  const balanceWithoutDividend = balance.sub(dividend);
  const lastDividends = new BigNumber(
    (await token.methods.getLastDividends(address).call())
  );
  const totalDividends = new BigNumber(
    (await token.methods.totalDividends().call())
  );
  const totalSupply = new BigNumber(
    (await token.methods.totalSupply().call())
  );

  const newDividends = totalDividends.sub(lastDividends);
  const supply = totalSupply.sub(newDividends);
  return newDividends.mul(balanceWithoutDividend)
    .mul(new BigNumber(10).pow(decimals))
    .div(supply)
    .div(new BigNumber(10).pow(decimals));
};
