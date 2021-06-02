import { TYPES } from '@/store/actions'

const INIT_STATE = {
  loaded: [],
  submitting: null,
  error: null
}

export default (state = INIT_STATE, action) => {
  switch (action.type) {
    case TYPES.GET_SIGNS3_URL_REQUEST:
    case TYPES.PUT_SIGNS3_URL_REQUEST:
      return {
        ...state,
        submitting: action.type
      }
    case TYPES.GET_SIGNS3_URL_SUCCESS:
    case TYPES.PUT_SIGNS3_URL_SUCCESS:
      return {
        ...state,
        submitting: null
      }
    case TYPES.GET_SIGNS3_URL_FAILURE:
    case TYPES.PUT_SIGNS3_URL_FAILURE:
      return {
        ...state,
        submitting: null,
        error: action.error
      }
    default:
      return state
  }
}
