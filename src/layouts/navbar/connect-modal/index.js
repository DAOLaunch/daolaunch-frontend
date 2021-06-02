/* eslint-disable camelcase */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withLocalize } from 'react-localize-redux'

import Storage from '@/utils/storage'
import { forwardInnerRef } from '@/utils/high-order-functions'
import { TYPES, actions } from '@/store/actions'
import { SYSTEM } from '@/constants'
import { getETH } from '@/utils/ethereum'
import Request from '@/utils/request'
import { shortAddress } from '@/utils/format'
import moment from 'moment';
import system from '@/constants/system'
import { getParameterByName } from '@/utils/url'

/** component */
import Modal from '@/components/modal-rt'
import Table from '@/components/table'
import { Tooltip } from 'antd';

/** asset */
import LogoApp from '@/resources/images/token-symbol.png'
import MetaMask from '@/resources/images/metamask_logo-s.png'
import Wallet from '@/resources/images/walletconnect_logo-s.png'
import './style.scss'

@withLocalize
@connect((state) => ({
  tokenStore: state.connect
}), {
  connectWalletVerify: actions.connectWalletVerify,
  setEthereum: actions.setEthereum,
  getLastestTransactions: actions.getLastestTransactions,
  setWalletBalance: actions.setWalletBalance,
})

@forwardInnerRef
class ConnectModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      address: null
    }
  }

  open = () => {
    const { isToken, getLastestTransactions } = this.props;
    const projectId = getParameterByName('sale_id')
    if (isToken) {
      getLastestTransactions()
    }
    this.setState({
      visible: true,
      projectId
    })
  }

  close = () => this.setState({ visible: false })

  _setETH = (address) => getETH(address).then(x => {
    const { setWalletBalance } = this.props
    setWalletBalance(x)
  })

  _getToken = () => {
    const { connectWalletVerify, setEthereum } = this.props

    connectWalletVerify({
      wallet_address: ethereum.selectedAddress,
      chain_id: ethereum.chainId,
      network_id: parseInt(ethereum.chainId, 16),
    }, (action, data, error) => {
      if (action === TYPES.CONNECT_WALLET_VERIFY_SUCCESS) {
        this._setETH(ethereum.selectedAddress)
        setEthereum(ethereum)
        Storage.set('ACCESS_TOKEN', data)
        Request.setAccessToken(`Bearer ${data}`)
        Storage.set('NETWORK', parseInt(ethereum.chainId, 16))
        Storage.set('IS_DISCONNECT', false)
        location.reload();
      }
      if (action === TYPES.CONNECT_WALLET_VERIFY_FAILURE) {
        Storage.remove('ACCESS_TOKEN')
        this.forceUpdate()
        if (error?.code) {
          // Notification.error.bind(this.props)(error.code)
          //TODO alert
          // alert(error.code)
        }
      }
    })
  }

  // Connect MetaMask
  _connectMetaMask = async () => {
    const { isToken } = this.props

    if (isToken) {
      this.setState({ isSwitch: false })
    } else {
      if (typeof window.ethereum !== 'undefined' || ethereum?.selectedAddress === null) {
        ethereum = await window.ethereum
        const isDisconnect = Storage.get('IS_DISCONNECT')

        if (isDisconnect) {
          await ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }],
          }).then(() => {
            Storage.set('IS_DISCONNECT', false)
          })
        }
        else await ethereum.request({ method: 'eth_requestAccounts' })

        this._getToken()
      } else {
        //   Notification.error.bind(this.props)(ErrorMsg.METAMASK_NOT_INSTALLED)
        //TODO alert
        // alert(ErrorMsg.METAMASK_NOT_INSTALLED)
      }
    }
  }

  _switchAccount = () => {
    this.setState({ isSwitch: true })
  }

  _disconnectAccount = async () => {
    Storage.set('IS_DISCONNECT', true)
    Storage.remove('ACCESS_TOKEN')
    location.reload();
  }

  _copyText = () => {
    const el = document.createElement("textarea");
    el.value = ethereum.selectedAddress;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    el.setSelectionRange(0, 99999);
    document.execCommand("copy");
    document.body.removeChild(el);
    this.setState({ copied: true })
    setTimeout(() => {
      this.setState({ copied: false })
    }, 2000)
  }

  render() {
    const { visible, isSwitch, copied, projectId } = this.state
    const { isToken, tokenStore } = this.props
    const { lastestTransactions } = tokenStore;
    const netWork = system.NETWORKS[window.ethereum?.networkVersion]
    const scan = [56, 97].includes(+window.ethereum?.networkVersion)? 'Bscscan' : 'Etherscan';

    const cards = [{
      image: MetaMask,
      title: 'MetaMask',
      connect: this._connectMetaMask
    }, {
      image: Wallet,
      title: 'Wallet Connect'
    }]
    const renderCards = cards.map((card, index) => (
      <div className="card hovercard" key={index}>
        <div className="card-body img-container text-left">
          <img src={card?.image} className="mr-3" alt="DAOLaunch" />
          <h6>{card?.title}</h6>
          <a role="button" className="stretched-link" onClick={() => card.connect && card.connect()}></a>
        </div>
      </div>
    ))

    const columns = [
      {
        title: 'Recent Transactions',
        dataIndex: 'hash',
        key: 'hash',
        render: hash => (
          <>
            <span>{shortAddress(hash)}</span>
            <a href={`${SYSTEM.NETWORKS[+window.ethereum?.networkVersion]?.URL}${SYSTEM.TRANSACTION_URL}/${hash}`} className="badge badge-light px-1 py-1 ml-1 text-secondary" target="_blank">
              <i className="fas fa-external-link-alt pl-1"></i>
            </a>
          </>
        )
      }, {
        title: 'Timestamp',
        dataIndex: 'timeStamp',
        key: 'timeStamp',
        className: 'text-right ft08',
        render: (timeStamp) => <>{moment.unix(timeStamp).format('MMM-DD-YYYY hh:mm:ss A')}</>
      }
    ]

    return (
      <Modal
        isOpen={visible}
        toggle={() => !projectId && this.setState({ visible: !visible })}
        className="modal-dialog pt-60px"
      >
        {!isToken || isSwitch ? (
          <>
            <div className="modal-header">
              <div className="pb-2">
                <img src={LogoApp} className="rounded mx-auto d-block" alt="DAOLaunch" />
              </div>
              <p className="">https://daolaunch.net</p>
              <h5 className="modal-title" id="MetamaskModalLabel">Connect Your Wallet</h5>
            </div>
            <div className="modal-body">
              {renderCards}
            </div>
          </>
        ) : (
          <>
            <div className="modal-header justify-content-center border-0">
              <button type="button" className="close" onClick={() => this.setState({ visible: false })}>
                <i className="far fa-times-circle"></i>
              </button>
              <span className="ft12 font-weight-bold ml-5"><i className="fad fa-link ft12 mr-1"></i>Account</span>
            </div>
            <div className="modal-body text-center px-3">
              <span className="ft12 mr-2 font-weight-bold" ref={hash => this.hash = hash}>{ethereum.selectedAddress && shortAddress(ethereum.selectedAddress)}</span>
              <a
                href={`${netWork?.URL}${system.ETHERSCAN_ADDRESS_URL}/${ethereum.selectedAddress}`}
                className="badge badge-light px-2 py-1 ft07 text-secondary mr-1"
                target="blank"
              >
                <i className="fas fa-external-link-alt pr-1"></i>
                {scan}
              </a>
              <Tooltip trigger="click" title="Copied" visible={copied}>
                <a className="badge badge-light px-2 py-1 ft07 text-secondary" role="button" onClick={this._copyText}>
                  <i className="far fa-copy mr-1"></i>
                  Copy
                </a>
              </Tooltip>
              <div className="card-body">
                {lastestTransactions ? <Table columns={columns} dataSource={lastestTransactions} rowKey={record => record.hash} /> : <Loading />}
              </div>
            </div>

            <div className="modal-footer">
              <div className="left-side">
                <button
                  type="button"
                  className="btn btn-default btn-link ft07 text-capitalize"
                  onClick={this._switchAccount}
                >
                  <i className="fad fa-exchange ft12 mr-1"></i>
                  Switch Wallet
                </button>
              </div>
              <div className="divider"></div>
              <div className="right-side">
                <button
                  type="button"
                  className="btn btn-danger btn-link ft07 text-capitalize"
                  onClick={this._disconnectAccount}
                >
                  <i className="fad fa-unlink ft12 mr-1"></i>
                  Disconnect Wallet
                </button>
              </div>
            </div>
          </>
        )}
      </Modal>
    )
  }
}

export default ConnectModal
