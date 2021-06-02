import { MainApi } from './endpoint'

const url = '/user'
const aws = '/aws'

export function getAllProject(payload) {
  return MainApi.get(`${url}/project`, payload)
}

export function createTokenSale(data) {
  return MainApi.post(`${url}/project`, data)
}

// Get info token address
export function getInfoTokenAddress(payload) {
  return MainApi.get(`${url}/token/${payload.address}`, payload)
}

// Upload Photo
export function getSignedProjectLogoURL({ type, name }) {
  return MainApi.get(`${aws}/signs3?file_type=${type}&file_name=${name}`)
}

export function getProjectById(payload) {
  return MainApi.get(`${url}/project/${payload.id}`, payload)
}

export function getProjectParticipated(payload) {
  return MainApi.get(`${url}/project/participated/list`, payload)
}

export function saveTransaction(payload) {
  return MainApi.post(`${url}/project/save-transaction`, payload)
}

export function getStatistic(payload) {
  return MainApi.get(`${url}/project/statistic`, payload)
}
