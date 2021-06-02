import { MainApi, ExternalApi } from './endpoint'

export function getSigns3Url(payload) {
  return MainApi.get('/aws/signs3', payload)
}

export function putSigns3Url(payload) {
  return ExternalApi.put(`${payload.signedRequest}`, payload.file)
}
