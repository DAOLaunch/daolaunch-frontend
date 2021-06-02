import { all, takeEvery, takeLatest } from 'redux-saga/effects'

import sagaHelper from '@/utils/saga-helper'
import { TYPES } from '@/store/actions'
import {
  getAllProject,
  createTokenSale,
  getInfoTokenAddress,
  getProjectById,
  saveTransaction,
  getProjectParticipated,
  getStatistic
} from '@/api/project'

export default function* watcher() {
  yield all([
    takeLatest(TYPES.GET_ALL_PROJECT, sagaHelper({
      api: getAllProject
    })),
    takeLatest(TYPES.CREATE_TOKEN_SALE, sagaHelper({
      api: createTokenSale
    })),
    takeLatest(TYPES.GET_INFO_TOKEN_ADDRESS, sagaHelper({
      api: getInfoTokenAddress
    })),
    takeLatest(TYPES.GET_PROJECT_BY_ID, sagaHelper({
      api: getProjectById
    })),
    takeLatest(TYPES.GET_PROJECT_PARTICIPATED, sagaHelper({
      api: getProjectParticipated
    })),
    takeEvery(TYPES.SAVE_TRANSACTION, sagaHelper({
      api: saveTransaction
    })),
    takeEvery(TYPES.GET_STATISTIC, sagaHelper({
      api: getStatistic
    })),
  ])
}
