import {IntPretty} from '@keplr-wallet/unit';

export const formatAprString = (apr?: IntPretty, maxDecimals?: number) => {
  if (apr === undefined) {
    return '-';
  }

  const aprRate = apr?.maxDecimals(maxDecimals ?? 2).toString() ?? '0';
  return Number(aprRate) === 0 ? '-' : aprRate;
};
