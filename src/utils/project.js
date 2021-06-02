import * as moment from 'moment'

import { bigNumber10Pow } from '@/utils/format'
import BigNumber from 'bignumber.js'
import { SYSTEM } from '../constants'

export const getAccessTypeProject = (type) => {
  switch (type) {
    case 'public':
      return type
    case 'private':
      return type
    default:
      return ''
  }
}

export const getSoftCapPer = (payment_currency, total_base_collected, hard_cap) => {
  switch (payment_currency) {
    case 'ETH':
      return new BigNumber(total_base_collected).dividedBy(bigNumber10Pow(1, 18)).multipliedBy(100).dividedBy(hard_cap).toString(10);
    case 'USDT':
      return new BigNumber(total_base_collected).dividedBy(bigNumber10Pow(1, 6)).multipliedBy(100).dividedBy(hard_cap).toString(10);
    case 'BNB':
      return new BigNumber(total_base_collected).dividedBy(bigNumber10Pow(1, 18)).multipliedBy(100).dividedBy(hard_cap).toString(10);
    case 'BUSD':
      return new BigNumber(total_base_collected).dividedBy(bigNumber10Pow(1, 18)).multipliedBy(100).dividedBy(hard_cap).toString(10);
  }
}

export const convertBaseCurrency = (payment_currency, total_base) => {
  switch (payment_currency) {
    case 'ETH':
      return new BigNumber(total_base).dividedBy(bigNumber10Pow(1, 18)).toString(10);
    case 'USDT':
      return new BigNumber(total_base).dividedBy(bigNumber10Pow(1, 6)).toString(10);
    case 'BNB':
      return new BigNumber(total_base).dividedBy(bigNumber10Pow(1, 18)).toString(10);
    case 'BUSD':
      return new BigNumber(total_base).dividedBy(bigNumber10Pow(1, 18)).toString(10);
  }
}

export const getBaseSoftCapPercent = (payment_currency, soft_cap, hard_cap) => {
  switch (payment_currency) {
    case 'ETH':
      return new BigNumber(soft_cap).multipliedBy(100).dividedBy(hard_cap).toString(10);
    case 'USDT':
      return new BigNumber(soft_cap).multipliedBy(100).dividedBy(hard_cap).toString(10);
    case 'BNB':
      return new BigNumber(soft_cap).multipliedBy(100).dividedBy(hard_cap).toString(10);
    case 'BUSD':
      return new BigNumber(soft_cap).multipliedBy(100).dividedBy(hard_cap).toString(10);
  }
}

export const getBaseCollected = (value, currency) => {
  switch (currency) {
    case SYSTEM.PAYMENT_CURRENCY.ETH:
      return bigNumber10Pow(bigNumber10Pow(value) / bigNumber10Pow(1, 18))
    case SYSTEM.PAYMENT_CURRENCY.USDT:
      return bigNumber10Pow(bigNumber10Pow(value) / bigNumber10Pow(1, 6))
    case SYSTEM.PAYMENT_CURRENCY.BNB:
      return bigNumber10Pow(bigNumber10Pow(value) / bigNumber10Pow(1, 18))
    case SYSTEM.PAYMENT_CURRENCY.BUSD:
      return bigNumber10Pow(bigNumber10Pow(value) / bigNumber10Pow(1, 18))
  }
}

export const getEndTime = (end_time) => {
  const now = moment()
  const end = moment(end_time)
  const hours = end.diff(now, 'hour')
  if (end.valueOf() - now.valueOf() <= 0) {
    return 'End'
  }
  if (hours <= 24) {
    return `Ends in ${hours} hours`
  } else {
    const days = end.diff(now, 'day')
    return `Ends in ${days} days ${hours % 24} hours`
  }
}

export const checkProjectType = (project = {}) => {
  const now = new Date()
  const start_time_cap = moment(project?.sale?.sale_start_time).diff(moment(now), 'milliseconds')
  const end_time_cap = moment(project?.sale?.sale_end_time).diff(now, 'milliseconds')

  let type = SYSTEM.TOKEN_SALES_TIMES.LIVE
  if (end_time_cap <= 0) {
    type = SYSTEM.TOKEN_SALES_TIMES.CLOSED
  } else if (start_time_cap >= 0) {
    type = SYSTEM.TOKEN_SALES_TIMES.UPCOMING
  }

  return { type }
}

export const decimalNumber = (value, decimal = 3) => {
  const number = Number(parseFloat(value).toFixed(decimal))
  if (number === 0) return 0
  if (number - Math.floor(number) === 0) return Math.floor(number)
  return number
}

export const checkProjectStatus = (project) => {
  const softCap = +project?.sale?.soft_cap
  let totalTokenSold
  const now = moment().valueOf()

  switch (project?.payment_currency) {
    case SYSTEM.PAYMENT_CURRENCY.ETH:
      totalTokenSold = bigNumber10Pow(bigNumber10Pow(project?.presale?.total_base_collected) / bigNumber10Pow(1, 18))
      break;
    case SYSTEM.PAYMENT_CURRENCY.USDT:
      totalTokenSold = bigNumber10Pow(bigNumber10Pow(project?.presale?.total_base_collected) / bigNumber10Pow(1, 6))
      break;
    case SYSTEM.PAYMENT_CURRENCY.BNB:
      totalTokenSold = bigNumber10Pow(bigNumber10Pow(project?.presale?.total_base_collected) / bigNumber10Pow(1, 18))
      break;
    case SYSTEM.PAYMENT_CURRENCY.BUSD:
      totalTokenSold = bigNumber10Pow(bigNumber10Pow(project?.presale?.total_base_collected) / bigNumber10Pow(1, 18))
      break;
  }
  let status
  if (totalTokenSold >= softCap) {
    status = moment().valueOf() >= moment(project.sale.sale_end_time).valueOf() ? SYSTEM.PROJECT_STATUS.SUCCESS : SYSTEM.PROJECT_STATUS.LIVE
  } else {
    status = moment().valueOf() >= moment(project.sale.sale_end_time).valueOf() ? SYSTEM.PROJECT_STATUS.FAILED : SYSTEM.PROJECT_STATUS.LIVE
  }

  return status
}

export const validFormMinMaxNumber = (form, field, value, min, max, errors) => {
  if (!min && !max) {
    return form.validateForm().then(() => form.setFieldError(field, undefined))
  }
  if (max && Number(value) > max) {
    return form.validateForm().then(() => form.setFieldError(field, errors.max))
  }
  if ((min || min === 0) && Number(value) < min) {
    form.validateForm().then(() => form.setFieldError(field, errors.min))
  }
}

export const getPrecision = (a) => (a + "")?.split(".")[1]?.length || 0
