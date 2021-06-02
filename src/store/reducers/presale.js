import { TYPES } from '@/store/actions'

const INIT_STATE = {
  loaded: [],
  submitting: null,
  error: null,

  deposit: {},

  buyer: {}
}

export default (state = INIT_STATE, action) => {
  switch (action.type) {
    case TYPES.GET_DEPOSIT_REQUEST:
    case TYPES.GET_BUYER_REQUEST:
    case TYPES.CLAIM_PROJECT_REQUEST:
    case TYPES.REFUND_PROJECT_REQUEST:
    case TYPES.OWNER_CLAIM_PROJECT_REQUEST:
    case TYPES.OWNER_REFUND_PROJECT_REQUEST:
    case TYPES.UNISWAP_PROJECT_REQUEST:
    case TYPES.UPDATE_PRESALE_STATUS_REQUEST:
      return {
        ...state,
        submitting: action.type
      }
    case TYPES.GET_DEPOSIT_SUCCESS:
      return {
        ...state,
        submitting: null,
        deposit: action.data
      }
    case TYPES.GET_BUYER_SUCCESS:
      return {
        ...state,
        submitting: null,
        buyer: action.data
      }
    case TYPES.CLAIM_PROJECT_SUCCESS:
    case TYPES.REFUND_PROJECT_SUCCESS:
    case TYPES.OWNER_CLAIM_PROJECT_SUCCESS:
    case TYPES.OWNER_REFUND_PROJECT_SUCCESS:
    case TYPES.UNISWAP_PROJECT_SUCCESS:
    case TYPES.UPDATE_PRESALE_STATUS_SUCCESS:
      return {
        ...state,
        submitting: null
      }
    case TYPES.GET_ALLOWANCE_DATA_SUCCESS:
      return {
        ...state,
        submitting: null,
      }
    case TYPES.GET_ALLOWANCE_DATA_FAILURE:
    case TYPES.GET_DEPOSIT_FAILURE:
    case TYPES.GET_BUYER_FAILURE:
    case TYPES.CLAIM_PROJECT_FAILURE:
    case TYPES.REFUND_PROJECT_FAILURE:
    case TYPES.OWNER_CLAIM_PROJECT_FAILURE:
    case TYPES.OWNER_REFUND_PROJECT_FAILURE:
    case TYPES.UNISWAP_PROJECT_FAILURE:
    case TYPES.UPDATE_PRESALE_STATUS_FAILURE:
      return {
        ...state,
        submitting: null,
        error: action.error
      }
    default:
      return state
  }
}
