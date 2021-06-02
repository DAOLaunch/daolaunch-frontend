'use strict'
import ErrorMsg from './error-messages'
import { errorForm } from './error-messages'
import SuccessMsg from './success-messages'
import Ethereum from './ethereum'
import SYSTEM from './system'
import ROUTE from './routes'
import TRANSACTION from './transaction'
import USDT from './usdt'
import TOKEN from './token'


const PROVIDERS = {
  1: 'https://mainnet.infura.io/v3/42a31ec94888451cba196647343f0ab0',
  3: 'https://ropsten.infura.io/v3/42a31ec94888451cba196647343f0ab0',
  4: 'https://kovan.infura.io/v3/42a31ec94888451cba196647343f0ab0',
  5: 'https://goerli.infura.io/v3/42a31ec94888451cba196647343f0ab0',
  42: 'https://kovan.infura.io/v3/42a31ec94888451cba196647343f0ab0',
  56: 'https://bsc-dataseed.binance.org/',
  97: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
}

const PRESALE_GENERATORS = {
  1: '0x72f26bbF32639479638E86FCC373599232E9f9c8',
  3: '',
  4: '',
  5: '',
  42: '0xD7e888594F303Cc35D1fFAC84b588F26ab921253',
  56: '0x0f5475405c120557A848971A65Ad0AfA088d8F2e',
  97: '0x7Da3bD61A57a773f65A25F4B8e601505fEb11a45',
}

const DAOLAUNCH_FEE = {
  1: '0x6F05B59D3B20000', // 0.5 eth
  3: '0x429D069189E0000', // 0.3 eth
  4: '0x429D069189E0000', // 0.3 eth
  5: '0x429D069189E0000', // 0.3 eth
  42: '0x429D069189E0000', // 0.3 eth
  56: '0x16345785D8A0000', // 0.1 bnb
  97: '0x16345785D8A0000', // 0.1 bnb
}

export {
  errorForm,
  ErrorMsg,
  SuccessMsg,
  Ethereum,
  SYSTEM,
  ROUTE,
  PROVIDERS,
  TRANSACTION,
  USDT,
  PRESALE_GENERATORS,
  DAOLAUNCH_FEE,
  TOKEN,
}
