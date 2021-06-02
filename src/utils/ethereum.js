import Web3 from 'web3'

// Get ETH
export const getETH = async (selectedAddress) => {
  let web3js
  if (typeof web3 !== 'undefined') {
    web3js = await new Web3(web3.currentProvider)
  } else {
    web3js = await new Web3(new Web3.providers.HttpProvider(window._CONFIG.API_URL));
  }
  let price
  // Get Eth Balance of an Ethereum Address
  await web3js.eth.getBalance(selectedAddress, function (err, result) {
    price = web3js.utils.fromWei(result, "ether")
  })
  return price
}
