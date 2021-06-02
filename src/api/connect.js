import { MainApi } from './endpoint'

const url = '/user'

export function connectWalletVerify(payload) {
  return MainApi.post(`${url}/wallet/verify`, payload)
}

export function getLastestTransactions(payload) {
  return MainApi.get(`${url}/exchange/latest-transactions`, payload)
}

// Gas price
export function getGasPrice(payload) {
  return MainApi.get(`${url}/exchange/gas-price`, payload)
}
