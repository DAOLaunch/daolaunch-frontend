import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { withLocalize } from 'react-localize-redux'
import Storage from '@/utils/storage'
import BigNumber from 'bignumber.js'
import { actions, TYPES } from '@/store/actions'
import { Ethereum } from '@/constants'
import { floorToNearestFraction } from '../../utils/calc'
import Request from '@/utils/request'
import { getETH } from '@/utils/ethereum'
import system from '../../constants/system'

import ConnectModal from './connect-modal'

/** components */

import Tooltip from '@/components/tooltip';
import BreadCrumb from '@/components/bread-crump';

/** asset */
import './style.scss'

@withLocalize
@connect((state) => ({
  uiStore: state.ui,
  connectStore: state.connect
}), {
  toggleSideBar: actions.toggleSideBar,
  toggleInfoUser: actions.toggleInfoUser,
  connectWalletVerify: actions.connectWalletVerify,
  getTokens: actions.getTokens,
  getProjectParticipated: actions.getProjectParticipated,
  setWalletBalance: actions.setWalletBalance,
  setEthereum: actions.setEthereum
})

class NavBar extends Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.handleChangeAccount = this.handleChangeAccount.bind(this)
    this.handleChangeChainId = this.handleChangeChainId.bind(this)
  }

  componentDidMount() {
    this.verifyWallet()
    this.removeListeners()
    this.listenChangeAccount()
  }

  componentWillUnmount() {
    this.removeListeners()
  }

  componentDidUpdate(prevProp) {
    const prevChangeAccount = prevProp.connectStore?.isChangeAccount
    const currentChangeAccount = this.props.connectStore?.isChangeAccount
    if (prevChangeAccount !== currentChangeAccount && !!currentChangeAccount)
      window.location.reload()
  }

  listenChangeAccount() {
    window.ethereum?.on('accountsChanged', this.handleChangeAccount)
    window.ethereum?.on('chainChanged', this.handleChangeChainId)
  }

  verifyWallet = (isChangeAccount) => {
    const { connectWalletVerify, setEthereum } = this.props
    const isDisconnect = Storage.get('IS_DISCONNECT');

    if ((typeof window.ethereum !== 'undefined' || window.ethereum?.selectedAddress === null) && !isDisconnect) {
      ethereum = window.ethereum
      connectWalletVerify({
        wallet_address: ethereum.selectedAddress,
        chain_id: ethereum.chainId,
        network_id: parseInt(ethereum.chainId, 16),
        isChangeAccount
      }, (action, data, error) => {
        if (action === TYPES.CONNECT_WALLET_VERIFY_SUCCESS) {
          Storage.set('ACCESS_TOKEN', data)
          Request.setAccessToken(`Bearer ${data}`)
          this._setETH(ethereum.selectedAddress)
          setEthereum(ethereum)
        }
        if (action === TYPES.CONNECT_WALLET_VERIFY_FAILURE) {
          Storage.remove('ACCESS_TOKEN')
          this.forceUpdate()
        }
      })
    }
  }

  handleChangeAccount() {
    this.reloadDataAfterChangeNetId()
  }

  handleChangeChainId() {
    this.reloadDataAfterChangeNetId()
  }

  removeListeners() {
    window.ethereum?.removeListener('accountsChanged', this.handleChangeAccount)
    window.ethereum?.removeListener('chainChanged', this.handleChangeChainId)
  }

  reloadDataAfterChangeNetId() {
    const isChangeAccount = true
    this.verifyWallet(isChangeAccount)
  }

  _setETH = (address) => getETH(address).then(x => {
    const { setWalletBalance } = this.props
    setWalletBalance(x)
  })

  render() {
    const { connectStore } = this.props
    const { dataEthereum, walletBalance } = connectStore
    const isToken = Storage.has('ACCESS_TOKEN')

    const address = isToken && dataEthereum?.selectedAddress
    const flooredEthBalance = isToken && walletBalance && floorToNearestFraction(walletBalance, 2);
    const shortedAddress = isToken && address && address.substr(0, 7)
    const networkVersion = window.ethereum && new BigNumber(window.ethereum.networkVersion).toNumber()

    return (
      <nav className="navbar navbar-expand-lg navbar-absolute fixed-top navbar-transparent">
        <div className="container-fluid">
          <div className="navbar-wrapper">
            <div className="navbar-minimize">
              <button id="minimizeSidebar" className="btn btn-icon btn-round nav_table-contents-icon">
                <i className="nc-icon nc-minimal-right text-center visible-on-sidebar-mini"></i>
                <i className="nc-icon nc-minimal-left text-center visible-on-sidebar-regular"></i>
              </button>
            </div>
            <div className="navbar-toggle">
              <button type="button" className="navbar-toggler">
                <span className="navbar-toggler-bar bar1"></span>
                <span className="navbar-toggler-bar bar2"></span>
                <span className="navbar-toggler-bar bar3"></span>
              </button>
            </div>
            <BreadCrumb />
          </div>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navigation"
            aria-controls="navigation-index" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-bar navbar-kebab"></span>
            <span className="navbar-toggler-bar navbar-kebab"></span>
            <span className="navbar-toggler-bar navbar-kebab"></span>
          </button>
          <div className="collapse navbar-collapse justify-content-end" id="navigation">
            <ul className="navbar-nav">
              <li className="nav-item">
                {isToken ? (
                  <button className="btn btn-outline-success btn-round ft07" onClick={() => this._connectModal.open()}>
                    <i className="fad fa-link ft09 mr-1" aria-hidden="true"></i>
                    <Tooltip title={walletBalance} >{flooredEthBalance}</Tooltip>
                    <span>{' '}{system.NETWORKS[networkVersion]?.currency} | {Ethereum[`HEX_${dataEthereum?.chainId}`]} |{' '}</span>
                    <Tooltip title={address} >{shortedAddress}...</Tooltip>
                  </button>
                ) : (
                  <button className="btn btn-outline-success btn-round ft07" onClick={() => this._connectModal.open()}>
                    <i className="fad fa-link ft09 mr-1" aria-hidden="true"></i>Connect Wallet
                  </button>
                )}
              </li>
            </ul>
          </div>
        </div>

        <ConnectModal
          innerRef={(ref) => { this._connectModal = ref }}
          verifyWallet={this.verifyWallet}
          isToken={isToken}
        />
      </nav>
    )
  }
}

export default withRouter(NavBar)
