import BigNumber from "bignumber.js"

export const formatCurrency = ((money) => {
  const arrMoney = String(money).split('.')
  if (arrMoney.length > 1) {
    return `${bigNumber10Pow(arrMoney[0]).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}.${arrMoney[1]}`
  } else {
    return bigNumber10Pow(money).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  }
})

export const numberToString = (value) => {
  return formatCurrency(Number(String(value).split(',').map((x) => x.replace(',', '')).join('')))
}

// Big number 10pow(n)
export const bigNumber10Pow = (number, pow = 0, type = 10) => {
  return new BigNumber(number).multipliedBy(new BigNumber(10).pow(pow)).toString(type)
}

export const bigNumber10PowFloorRounded = (number, round = 6, pow = 0, type = 10) => {
  return new BigNumber(number).multipliedBy(new BigNumber(10).pow(pow)).toFixed(round, BigNumber.ROUND_FLOOR).toString(type)
}

// Address token
export const shortAddress = (value, n = 6) => {
  if (value.length <= n) { return value }
  const subString = value.substr(0, n)
  const lastSubString = value.substr(value.length - n, value.length)
  return subString + "..." + lastSubString
}

// Short String
export const shortText = (value, n = 22) => {
  if (value.length <= n) { return value }
  const text = value.substr(0, n)
  return text + "..."
}
