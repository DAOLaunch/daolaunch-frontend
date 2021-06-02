import { all, takeLatest, takeEvery } from 'redux-saga/effects'

import sagaHelper from '@/utils/saga-helper'
import { TYPES } from '@/store/actions'
import {
  getSigns3Url,
  putSigns3Url
} from '@/api/upload-file'

export default function* watcher() {
  yield all([
    takeLatest(TYPES.GET_SIGNS3_URL, sagaHelper({
      api: getSigns3Url
    })),
    takeEvery(TYPES.PUT_SIGNS3_URL, sagaHelper({
      api: putSigns3Url
    }))
  ])
}
