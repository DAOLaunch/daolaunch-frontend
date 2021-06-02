import { TYPES } from '@/store/actions'

const INIT_STATE = {
  submitting: null,
  error: null,
  tokenList: null,
  approveData: {},

  countProject: 0,

  tokenByAddress: {},

  usdtBalance: {}
}

export default (state = INIT_STATE, action) => {
  switch (action.type) {
    case TYPES.GENERATE_TOKEN_REQUEST:
    case TYPES.CREATE_TOKEN_REQUEST:
    case TYPES.GET_TOKEN_BY_ADDRESS_REQUEST:
    case TYPES.TOKEN_APPROVE_DATA_REQUEST:
    case TYPES.GET_USDT_BALANCE_REQUEST:
    case TYPES.PRESALE_GET_ADDRESS_REQUEST:
    case TYPES.POST_PRESALE_REQUEST:
    case TYPES.GET_PAIR_REQUEST:
      return {
        ...state,
        submitting: action.type
      }
    case TYPES.GET_TOKENS_REQUEST:
      return {
        ...state,
        tokenList: null,
        submitting: action.type
      }
    case TYPES.CREATE_TOKEN_SUCCESS:
    case TYPES.GENERATE_TOKEN_SUCCESS:
      return {
        ...state,
        submitting: null
      }
    case TYPES.GET_TOKENS_SUCCESS:
      return {
        ...state,
        tokenList: action.data.rows,
        submitting: null,
      }
    case TYPES.GET_TOKEN_BY_ADDRESS_SUCCESS:
      return {
        ...state,
        submitting: null,
        tokenByAddress: action.data,
      }
    case TYPES.GET_TOKEN_BY_ADDRESS_SUCCESS:
      return {
        ...state,
        submitting: null,
        tokenByAddress: action.data,
      }
    case TYPES.TOKEN_APPROVE_DATA_SUCCESS:
      return {
        ...state,
        approveData: action.data,
        submitting: null,
      }
    case TYPES.GET_USDT_BALANCE_SUCCESS:
      return {
        ...state,
        submitting: null,
        usdtBalance: action.data,
      }
    case TYPES.PRESALE_GET_ADDRESS_SUCCESS:
      return {
        ...state,
        submitting: null,
      }
    case TYPES.POST_PRESALE_SUCCESS:
      return {
        ...state,
        submitting: null,
      }
    case TYPES.GET_PAIR_SUCCESS:
      return {
        ...state,
        submitting: null,
      }
    case TYPES.GENERATE_TOKEN_FAILURE:
    case TYPES.CREATE_TOKEN_FAILURE:
    case TYPES.GET_TOKENS_FAILURE:
    case TYPES.GET_TOKEN_BY_ADDRESS_FAILURE:
    case TYPES.TOKEN_APPROVE_DATA_FAILURE:
    case TYPES.GET_USDT_BALANCE_FAILURE:
    case TYPES.PRESALE_GET_ADDRESS_FAILURE:
    case TYPES.POST_PRESALE_FAILURE:
    case TYPES.GET_PAIR_FAILURE:
      return {
        ...state,
        submitting: null,
        error: action.error,
      }
    default:
      return state
  }
}
