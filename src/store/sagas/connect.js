import { all, takeLatest } from 'redux-saga/effects'

import sagaHelper from '@/utils/saga-helper'
import { TYPES } from '@/store/actions'
import { 
  connectWalletVerify,
  getLastestTransactions,
  getGasPrice
} from '@/api/connect'

export default function* watcher() {
  yield all([
    takeLatest(TYPES.CONNECT_WALLET_VERIFY, sagaHelper({
      api: connectWalletVerify
    })),
    takeLatest(TYPES.GET_LASTEST_TRANSACTIONS, sagaHelper({
      api: getLastestTransactions
    })),
    takeLatest(TYPES.GET_GAS_PRICE, sagaHelper({
      api: getGasPrice
    })),
  ])
}
