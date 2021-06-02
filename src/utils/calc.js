import BigNumber from "bignumber.js";
import { SYSTEM } from '@/constants'

/** create_token_sale page */
export const calculateFund = (newSalePrediction, { initial_liquidity_per, swap_ratio, listing_rate }) => {
  const calcDaoLaunchFee = floatingPoint(new BigNumber(newSalePrediction).multipliedBy(SYSTEM.DAOLaunchFee));
  const calcEthLiquidity = floatingPoint(new BigNumber(newSalePrediction).minus(calcDaoLaunchFee).multipliedBy(initial_liquidity_per).dividedBy(100));
  const calcFortLiquidity = floatingPoint(new BigNumber(calcEthLiquidity).multipliedBy(swap_ratio).dividedBy(listing_rate));
  const calcYourETH = floatingPoint(new BigNumber(newSalePrediction).minus(calcDaoLaunchFee).minus(calcEthLiquidity));
  const calcFortSold = floatingPoint(new BigNumber(newSalePrediction).multipliedBy(swap_ratio));

  return {
    calcDaoLaunchFee,
    calcEthLiquidity,
    calcFortLiquidity,
    calcYourETH,
    calcFortSold,
  }
}

export const floorToNearestFraction = (number, fraction = 0) => {
  // const exponentPower = Math.pow(10, fraction)
  // return 1.0 / exponentPower * Math.floor(exponentPower * number);
  return new BigNumber(number).toFormat(fraction, BigNumber.ROUND_FLOOR);
}

export const floatingPoint = (number) => {
  return parseFloat(number.toFixed(3));
}
/** create_token_sale page */