import { MainApi } from './endpoint'

const url = '/user'

export function getDeposit(payload) {
  return MainApi.post(`${url}/presale/get-deposit`, payload)
}

export function getBuyer(payload) {
  return MainApi.post(`${url}/presale/get-buyer-data`, payload)
}

export function claimProject(payload) {
  return MainApi.post(`${url}/presale/claim`, payload)
}

export function refundProject(payload) {
  return MainApi.post(`${url}/presale/refund`, payload)
}

export function getAllowanceData(payload) {
  return MainApi.post(`${url}/presale/get-allowanced-data`, payload)
}

export function ownerClaimProject(payload) {
  return MainApi.post(`${url}/presale/get-owner-claim-data`, payload)
}

export function ownerRefundProject(payload) {
  return MainApi.post(`${url}/presale/get-owner-refund-data`, payload)
}

export function uniswapProject(payload) {
  return MainApi.post(`${url}/presale/get-list-on-uniswap-data`, payload)
}

export function updatePresaleStatus(payload) {
  return MainApi.put(`${url}/presale/update-status`, payload)
}
