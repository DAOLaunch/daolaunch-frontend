import { all } from 'redux-saga/effects'

import uploadFile from './upload-file'
import connect from './connect'
import project from './project'
import token from './token'
import presale from './presale'

export default function* sagas() {
  yield all([
    uploadFile(),
    connect(),
    token(),
    project(),
    presale()
  ])
}
