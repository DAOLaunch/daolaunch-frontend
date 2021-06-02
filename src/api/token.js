import { MainApi } from './endpoint'

const url = '/user'

export function generateToken(payload) {
  return MainApi.post(`${url}/token/token-data`, payload)
}

export function createToken(payload) {
  return MainApi.post(`${url}/token`, payload)
}

export function getTokens(payload) {
  return MainApi.get(`${url}/token`, payload)
}

export function getTokenByAddress(payload) {
  return MainApi.get(`${url}/token/${payload.address}`, payload)
}

export function tokenApproveData(payload) {
  return MainApi.post(`${url}/token/approve/data`, payload)
}

export function getUsdtBalance(payload) {
  return MainApi.get(`${url}/token/balance/usdt`, payload)
}

export function presaleGetAddress(payload) {
  return MainApi.post(`${url}/presale/get-address`, payload)
}

export function postPresale(payload) {
  return MainApi.post(`${url}/presale`, payload)
}

export function getPair(payload) {
  return MainApi.post(`${url}/exchange/uniswap/fair`, payload)
}
