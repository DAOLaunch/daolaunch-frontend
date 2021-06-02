import { push } from 'connected-react-router'
import { put, select } from 'redux-saga/effects'

import Storage from '@/utils/storage'
import Misc from '@/utils/misc'
import Notification from '@/components/notification'
import { actions } from '@/store/actions'

export default ({ api, successMessage, errorHandler }) => function* ({ type, data, callback }) {
  const successType = `${type}_SUCCESS`
  const failureType = `${type}_FAILURE`

  const localize = yield select((state) => state.localize)
  const languageIndex = localize.languages[0].active ? 0 : 1
  const getLocalizeErrorMessages = (name) => (localize.translations[`error-messages.${name}`] || [])[languageIndex]

  try {
    yield put({ type: `${type}_REQUEST`, payload: data })

    const { success, result, error } = yield api(data)

    if (success) {
      yield put({ type: successType, data: result, payload: data })

      if (successMessage) Notification.success(successMessage)

      if (callback) callback(successType, result)
    }

    if (error) {
      if (['TOKEN_EXPIRED', 'INVALID_TOKEN'].includes(error.code)) {
        Storage.clear()
        yield put(push('/login'))
        yield put(actions.clearStore())
      }

      yield put({ type: failureType, error })
      if (callback) callback(failureType, result, error)
    }

    if (!error && !success) {
      throw result
    }
  } catch (e) {
    if (e) {
      const error = yield Misc.getErrorJsonBody(e)
      yield put({ type: failureType, error })

      const errorMessage = error && error.message

      if (['TOKEN_EXPIRED', 'INVALID_TOKEN'].includes(errorMessage)) {
        Storage.clear()
        yield put(push('/login'))
        yield put(actions.clearStore())
      }

      if (errorHandler) {
        errorHandler(error, getLocalizeErrorMessages)
      } else {
        Notification.error(getLocalizeErrorMessages(errorMessage) || errorMessage)
      }

      if (callback) callback(failureType, error)
    }
  }
}
