'use strict'
import Web3 from 'web3'
import { PROVIDERS } from '@/constants'
const DEFAULT = 1000

const web3 = new Web3()

export const timestampToBlock = async (networkId, timestamp) => {
  timestamp = new Date(timestamp).getTime() / 1000
  const latestBlockNumber = await getLatestBlock(networkId)
  const [firstBlock, latestBlock] = await Promise.all([getBlock(networkId, latestBlockNumber - DEFAULT), getBlock(networkId, latestBlockNumber)])
  if (timestamp < firstBlock) throw new Error('INVALID_TIMESTAMP')
  const avgBlockTime = (latestBlock - firstBlock) / DEFAULT

  return Math.round((timestamp - firstBlock) / avgBlockTime) + latestBlockNumber - DEFAULT
}

export const getWeb3 = (networkId) => {
  const provider = PROVIDERS[networkId]
  if (!provider) throw new Error('INVALID_NETWORK')
  return new Web3(provider)
}

export const getBlock = async (networkId, blockNumber) => {
  const web3 = getWeb3(networkId)
  const block = await web3.eth.getBlock(blockNumber)
  return block && block.timestamp
}

export const getLatestBlock = async (networkId) => {
  const web3 = getWeb3(networkId)
  return await web3.eth.getBlockNumber()
}

export const isValidWalletAddress = (address) => {
  try {
    return !!web3.utils.toChecksumAddress(address);
  } catch (error) {
    return false;
  }
}
