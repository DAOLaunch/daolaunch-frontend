import { all, takeLatest } from 'redux-saga/effects'

import sagaHelper from '@/utils/saga-helper'
import { TYPES } from '@/store/actions'
import {
  generateToken,
  createToken,
  getTokens,
  getTokenByAddress,
  tokenApproveData,
  getUsdtBalance,
  presaleGetAddress,
  postPresale,
  getPair
} from '@/api/token'

export default function* watcher() {
  yield all([
    takeLatest(TYPES.GENERATE_TOKEN, sagaHelper({
      api: generateToken
    })),
    takeLatest(TYPES.CREATE_TOKEN, sagaHelper({
      api: createToken
    })),
    takeLatest(TYPES.GET_TOKENS, sagaHelper({
      api: getTokens
    })),
    takeLatest(TYPES.GET_TOKEN_BY_ADDRESS, sagaHelper({
      api: getTokenByAddress
    })),
    takeLatest(TYPES.TOKEN_APPROVE_DATA, sagaHelper({
      api: tokenApproveData
    })),
    takeLatest(TYPES.GET_USDT_BALANCE, sagaHelper({
      api: getUsdtBalance
    })),
    takeLatest(TYPES.PRESALE_GET_ADDRESS, sagaHelper({
      api: presaleGetAddress
    })),
    takeLatest(TYPES.POST_PRESALE, sagaHelper({
      api: postPresale
    })),
    takeLatest(TYPES.GET_PAIR, sagaHelper({
      api: getPair
    })),
  ])
}
