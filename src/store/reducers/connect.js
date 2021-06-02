import { TYPES } from '@/store/actions'

const INIT_STATE = {
  loaded: [],
  authorized: false,
  submitting: null,
  error: null,
  lastestTransactions: [],
  walletBalance: null,
  isChangeAccount: false,

  dataEthereum: null,
  gasPrice: 0
}

export default (state = INIT_STATE, action) => {
  switch (action.type) {
    case TYPES.CONNECT_WALLET_VERIFY_REQUEST:
    case TYPES.GET_LASTEST_TRANSACTIONS_REQUEST:
    case TYPES.GET_GAS_PRICE_REQUEST:
      return {
        ...state,
        submitting: action.type
      }
    case TYPES.CONNECT_WALLET_VERIFY_SUCCESS:
      return {
        ...state,
        authorized: true,
        submitting: null,
        isChangeAccount: !!action.payload?.isChangeAccount
      }
    case TYPES.GET_LASTEST_TRANSACTIONS_SUCCESS:
      return {
        ...state,
        lastestTransactions: action.data,
        submitting: null
      }
    case TYPES.GET_GAS_PRICE_SUCCESS:
      return {
        ...state,
        submitting: null,
        gasPrice: action.data
      }
    case TYPES.CONNECT_WALLET_VERIFY_FAILURE:
    case TYPES.GET_LASTEST_TRANSACTIONS_FAILURE:
    case TYPES.GET_GAS_PRICE_FAILURE:
      return {
        ...state,
        submitting: null,
        error: action.error
      }
    case TYPES.SET_ETHEREUM:
      return {
        ...state,
        submitting: null,
        dataEthereum: action.data
      }
    case TYPES.SET_WALLET_BALANCE:
      return {
        ...state,
        submitting: null,
        walletBalance: action.data
      }
    default:
      return state
  }
}
