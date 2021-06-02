import { TYPES } from '@/store/actions'

const INIT_STATE = {
  isSideBarOpen: true,
  isInfoUserOpen: false,
}

export default (state = INIT_STATE, action) => {
  switch (action.type) {
    case TYPES.TOGGLE_SIDE_BAR:
      return {
        ...state,
        isSideBarOpen: !state.isSideBarOpen
      }
    case TYPES.TOGGLE_INFO_USER:
      return {
        ...state,
        isInfoUserOpen: !state.isInfoUserOpen
      }
    default:
      return state
  }
}
