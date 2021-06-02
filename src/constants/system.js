const LOCK_LIQUIDITY = {
  ONE_MONTH: '1 MONTH',
  TWO_MONTHS: '2 MONTHS',
  THREE_MONTHS: '3 MONTHS',
  SIX_MONTHS: '6 MONTHS',
  ONE_YEAR: '1 YEAR',
  TWO_YEARS: '2 YEARS',
}

const NETWORKS = {
  1: {
    URL: 'https://etherscan.io/',
    name: 'ETH MAINNET',
    currency: 'ETH',
    domain: 'Etherscan',
  },
  3: {
    URL: 'https://ropsten.etherscan.io/',
    name: 'ETH ROPSTEN',
    currency: 'ETH',
    domain: 'Etherscan',
  },
  4: {
    URL: 'https://rinkeby.etherscan.io/',
    name: 'ETH RINKEBY',
    currency: 'ETH',
    domain: 'Etherscan',
  },
  42: {
    URL: 'https://kovan.etherscan.io/',
    name: 'ETH KOVAN',
    currency: 'ETH',
    domain: 'Etherscan',
  },
  5: {
    URL: 'https://goerli.etherscan.io/',
    name: 'ETH GOERLI',
    currency: 'ETH',
    domain: 'Etherscan',
  },
  56: {
    URL: 'https://bscscan.com/',
    name: 'BINANCE SMART CHAIN MAINNET',
    currency: 'BNB',
    domain: 'Bscscan',
  },
  97: {
    URL: 'https://testnet.bscscan.com/',
    name: 'BINANCE SMART CHAIN TESTNET',
    currency: 'BNB',
    domain: 'Bscscan',
  },
}

const LCL_S3_IMAGE_TYPE = [
  'image/jpeg',
  'image/gif',
  'image/png'
]

const IMAGE_MAX_SIZE = 10485760 // 10MB
const IMAGE_MIN_SIZE = 256000

const ACCESS_TYPE = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE'
}

const PAYMENT_CURRENCY = {
  ETH: 'ETH',
  USDT: 'USDT',
  BNB: 'BNB',
  BUSD: 'BUSD',
}

const TOKEN_SALES_TIMES = {
  LIVE: 'live',
  UPCOMING: 'upcoming',
  CLOSED: 'closed'
}

const PROJECT_STATUS = {
  LIVE: 'LIVE',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
}

const WHITE_LIST_ACCEPT_TYPE = [
  ".csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv"
];

const ETHERSCAN_URL = "token"
const TRANSACTION_URL = "tx"
const ETHERSCAN_ADDRESS_URL = "address"

const DAOLaunchFee = 0.01 // 1%

const NETWORK_TYPES = {
  ETH: ['1', '3', '4', '5', '42'],
  BNB: ['56', '97'],
}

export default {
  LOCK_LIQUIDITY,
  NETWORKS,
  LCL_S3_IMAGE_TYPE,
  IMAGE_MAX_SIZE,
  IMAGE_MIN_SIZE,
  ACCESS_TYPE,
  TOKEN_SALES_TIMES,
  PAYMENT_CURRENCY,
  WHITE_LIST_ACCEPT_TYPE,
  TRANSACTION_URL,
  ETHERSCAN_URL,
  ETHERSCAN_ADDRESS_URL,
  PROJECT_STATUS,
  NETWORK_TYPES,
  DAOLaunchFee
}