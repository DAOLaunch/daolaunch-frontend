import { TYPES } from '@/store/actions'

const INIT_STATE = {
  loaded: [],
  submitting: null,
  error: null,

  allProject: null,
  countProject: 0,
  project: {},

  infoTokenAddress: null,

  projectParticipated: null,
  totalProjectParticipated: 0,

  statistic: null
}

export default (state = INIT_STATE, action) => {
  switch (action.type) {
    case TYPES.GET_ALL_PROJECT_REQUEST:
    case TYPES.GET_STATISTIC_REQUEST:
      return {
        ...state,
        allProject: null,
        countProject: 0,
        submitting: action.type
      }
    case TYPES.CREATE_TOKEN_SALE_REQUEST:
    case TYPES.SAVE_TRANSACTION_REQUEST:
    case TYPES.GET_INFO_TOKEN_ADDRESS_REQUEST:
    case TYPES.GET_PROJECT_BY_ID_REQUEST:
      return {
        ...state,
        submitting: action.type
      }
    case TYPES.GET_PROJECT_PARTICIPATED_REQUEST:
      return {
        ...state,
        projectParticipated: null,
        submitting: action.type
      }
    case TYPES.GET_ALL_PROJECT_SUCCESS:
      return {
        ...state,
        submitting: null,
        allProject: action.data.rows,
        countProject: action.data.count
      }
    case TYPES.CREATE_TOKEN_SALE_SUCCESS:
    case TYPES.SAVE_TRANSACTION_SUCCESS:
      return {
        ...state,
        submitting: null,
      }
    case TYPES.GET_INFO_TOKEN_ADDRESS_SUCCESS:
      return {
        ...state,
        submitting: null,
        infoTokenAddress: action.data
      }
    case TYPES.GET_PROJECT_BY_ID_SUCCESS:
      return {
        ...state,
        submitting: null,
        project: action.data
      }
    case TYPES.GET_PROJECT_PARTICIPATED_SUCCESS:
      return {
        ...state,
        submitting: null,
        projectParticipated: action.data.rows,
        totalProjectParticipated: action.data.count
      }
    case TYPES.GET_STATISTIC_SUCCESS:
      return {
        ...state,
        submitting: null,
        statistic: action.data
      }
    case TYPES.GET_ALL_PROJECT_FAILURE:
    case TYPES.CREATE_TOKEN_SALE_FAILURE:
    case TYPES.GET_INFO_TOKEN_ADDRESS_FAILURE:
    case TYPES.GET_PROJECT_BY_ID_FAILURE:
    case TYPES.GET_PROJECT_PARTICIPATED_FAILURE:
    case TYPES.SAVE_TRANSACTION_FAILURE:
    case TYPES.GET_STATISTIC_FAILURE:
      return {
        ...state,
        submitting: null,
        error: action.error
      }
    default:
      return state
  }
}
