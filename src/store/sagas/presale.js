import { all, takeLatest } from 'redux-saga/effects'

import sagaHelper from '@/utils/saga-helper'
import { TYPES } from '@/store/actions'
import {
  getDeposit,
  getBuyer,
  claimProject,
  refundProject,
  getAllowanceData,
  ownerClaimProject,
  ownerRefundProject,
  uniswapProject,
  updatePresaleStatus,
} from '../../api/presale'

export default function* watcher() {
  yield all([
    takeLatest(TYPES.GET_DEPOSIT, sagaHelper({
      api: getDeposit
    })),
    takeLatest(TYPES.GET_BUYER, sagaHelper({
      api: getBuyer
    })),
    takeLatest(TYPES.CLAIM_PROJECT, sagaHelper({
      api: claimProject
    })),
    takeLatest(TYPES.REFUND_PROJECT, sagaHelper({
      api: refundProject
    })),
    takeLatest(TYPES.GET_ALLOWANCE_DATA, sagaHelper({
      api: getAllowanceData
    })),
    takeLatest(TYPES.OWNER_CLAIM_PROJECT, sagaHelper({
      api: ownerClaimProject
    })),
    takeLatest(TYPES.OWNER_REFUND_PROJECT, sagaHelper({
      api: ownerRefundProject
    })),
    takeLatest(TYPES.UNISWAP_PROJECT, sagaHelper({
      api: uniswapProject
    })),
    takeLatest(TYPES.UPDATE_PRESALE_STATUS, sagaHelper({
      api: updatePresaleStatus
    })),
  ])
}
