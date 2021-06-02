import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { withLocalize } from 'react-localize-redux'
import * as moment from 'moment'
import BigNumber from 'bignumber.js'

import { SYSTEM } from '@/constants'
import { shortAddress, shortText, numberToString } from '@/utils/format'
import { actions, TYPES } from '@/store/actions'
import { convertBaseCurrency } from '../../utils/project'
import { TRANSACTION } from '../../constants'
import { getETH } from '@/utils/ethereum'

// Components
import Loading from '@/components/loading'
import Table from '@/components/table'
import Tooltip from '@/components/tooltip'
import { pushNotify, dismissNotify } from '@/components/toast'

import TransactionModal from './transaction-modal'
import DetailModal from '@/pages/detail-card-modal'
import ClaimCountDownBox from './claim-countdown-box'
import StatusCountDownBox from './status-countdown-box'

/** asset */
import './style.scss'
import ListingCountDownBox from './listing-countdown-box'

const projectStatus = {
  LIVE: 'LIVE',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
}

@withLocalize
@withRouter
@connect((state) => ({
  projectStore: state.project,
  connectStore: state.connect
}), {
  getProjectParticipated: actions.getProjectParticipated,
  claimProject: actions.claimProject,
  refundProject: actions.refundProject,
  uniswapProject: actions.uniswapProject,
  setWalletBalance: actions.setWalletBalance,
  getGasPrice: actions.getGasPrice
})

class MyAsset extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: true,
      isModalVisible: false,
      projectActive: null,
      typeTransaction: null
    }
  }

  componentDidMount() {
    const { getProjectParticipated } = this.props
    getProjectParticipated()
  }

  componentWillUnmount() {
    dismissNotify()
  }

  // Set open/hide modal transaction
  _toggleTransactionModal = (isOpen) => this.setState({ isModalVisible: !isOpen, typeTransaction: null, handlingHash: null })

  _getProjectParticipated = () => {
    const { getProjectParticipated } = this.props
    getProjectParticipated()
  }

  // Transaction action
  getTxHashFromTransaction = async (transactionParameters) => {
    const { connectStore } = this.props
    const { dataEthereum } = connectStore
    try {
      return await dataEthereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      })
    } catch (error) {
      /** Transaction rejected */
      if (error.code === 4001) {
        this.setState({ typeTransaction: 'REJECTED' })
      }
      return error
    }
  }

  // Open modal detail card project
  _clickCard = (projectId) => this._detailModal.open(projectId)

  // claim project
  _claimProject = (project) => {
    const { claimProject } = this.props
    const params = {
      // contract_address: project.contract_address,
      // network_id: project.network_id.toString(),
      project_id: project.project_id,
    }
    claimProject(params, (action, data, error) => {
      if (action === TYPES.CLAIM_PROJECT_SUCCESS) {
        this._onTransaction(project, data)
      }
      if (action === TYPES.CLAIM_PROJECT_FAILURE) {
        if (error?.code) {
          pushNotify('error', error.code)
        }
      }
    })
  }

  // refund project
  _refundProject = (project) => {
    const { refundProject } = this.props
    const params = {
      // contract_address: project.contract_address,
      // network_id: project.network_id.toString()
      project_id: project.project_id,
    }
    refundProject(params, (action, data, error) => {
      if (action === TYPES.REFUND_PROJECT_SUCCESS) {
        this._onTransaction(project, data)
      }
      if (action === TYPES.REFUND_PROJECT_FAILURE) {
        if (error?.code) {
          pushNotify('error', error.code)
        }
      }
    })
  }

  _uniswapProject = (project) => {
    const { uniswapProject } = this.props
    const params = {
      // contract_address: project.contract_address,
      // network_id: project.network_id.toString(),
      project_id: project.project_id,
    }
    uniswapProject(params, (action, data, error) => {
      if (action === TYPES.UNISWAP_PROJECT_SUCCESS) {
        this._onTransaction(project, data)
      }
      if (action === TYPES.UNISWAP_PROJECT_FAILURE) {
        if (error?.code) {
          pushNotify('error', error.code)
        }
      }
    })
  }

  // Transaction function
  _onTransaction = (project, data) => {
    const { connectStore, getGasPrice } = this.props
    const { dataEthereum } = connectStore

    // Notification transaction request
    this.setState({
      projectActive: project,
      isModalVisible: true,
      typeTransaction: 'REQUEST'
    })

    getGasPrice(null, async (actionGas, dataGas, error) => {
      if (actionGas === TYPES.GET_GAS_PRICE_SUCCESS) {
        const gasPrice = dataGas.result
        // -----------> TO DO
        const transactionParameters = {
          to: project.contract_address,
          nonce: '0x00', // ignored by MetaMask
          gasPrice, // customizable by user during MetaMask confirmation.
          gas: data.gas, // customizable by user during MetaMask confirmation.
          from: dataEthereum.selectedAddress, // must match user's active address.
          value: '0x00', // Only required to send ether to the recipient from the initiating external account.
          data: data.data, // Optional, but used for defining smart contract creation and interaction.
          chainId: dataEthereum.chainId, // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
        };

        // txHash is a hex string
        // As with any RPC call, it may throw an error
        const txHash = await this.getTxHashFromTransaction(transactionParameters);

        if (!txHash?.code) {
          this.setState({ typeTransaction: 'PENDING', handlingHash: txHash })
          let tx = await dataEthereum.request({
            method: 'eth_getTransactionReceipt',
            params: [txHash],
          })

          while (!tx || !tx.blockHash) {
            // TODO request timeout
            await new Promise(resolve => setTimeout(resolve, 1000));
            tx = await dataEthereum.request({
              method: 'eth_getTransactionReceipt',
              params: [txHash],
            })
          }

          window.ethereum && this._setETH(window.ethereum.selectedAddress)

          if (tx.status === TRANSACTION.TRANSACTION_STATUS.FAILED) {
            // Transaction Failed todo
            alert('TRANSACTION_STATUS_FAILED')
          } else {
            // Notification transaction success
            this.setState({ typeTransaction: 'COMPLETED' })
            this._getProjectParticipated()
          }
        }
      }
    })
  }

  _setETH = (address) => getETH(address).then(x => {
    const { setWalletBalance } = this.props
    setWalletBalance(x)
  })

  render() {
    const { isModalVisible, projectActive, typeTransaction, handlingHash } = this.state
    const { projectStore } = this.props
    const { projectParticipated, totalProjectParticipated } = projectStore
    const columns = [
      {
        title: 'Project Name',
        dataIndex: 'project_name',
        key: 'project_name',
        className: 'project_name',
        render: (item) => {
          return (
            <>
              {item.project_name}<br />
              <a
                className="badge badge-light px-2 py-1 text-secondary"
                onClick={() => this._clickCard(item.project_id)}
              >
                Sale info<i className="fas fa-external-link-alt pl-1" aria-hidden="true" />
              </a>
            </>
          )
        }
      }, {
        title: 'Token Name',
        dataIndex: 'token_info',
        key: 'token_info',
        className: 'token_info',
        render: (item) => {
          return (
            <>
              {item?.token_symbol} / <Tooltip title={item?.token_name}>{shortText(item?.token_name, 15)}</Tooltip><br />
              <span className="ft07">{shortAddress(item?.token_contract_address)} </span>
              <a
                href={`${SYSTEM.NETWORKS[item.network_id].URL}${SYSTEM.ETHERSCAN_URL}/${item?.token_contract_address}`}
                className="badge badge-light px-2 py-1 text-secondary"
                target="_blank"
              >
                {['BNB', 'BUSD'].includes(item?.payment_currency) ? 'Bscscan' : 'Etherscan'}<i className="fas fa-external-link-alt pl-1" aria-hidden="true" />
              </a>
            </>
          )
        }
      }, {
        title: 'Tokens you get',
        dataIndex: 'tokens_you_get',
        key: 'tokens_you_get',
        className: 'text-right'
      }, {
        title: 'Amount paid',
        dataIndex: 'amount_paid',
        key: 'amount_paid',
        className: 'text-right'
      }, {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        className: 'text-right',
        render: (item) =>
          <StatusCountDownBox
            project={item}
            saleTimeLeft={item?.saleTimeLeft}
          />
      }, {
        title: 'Claim Tokens',
        dataIndex: 'claim_tokens',
        key: 'claim_tokens',
        className: 'text-center',
        render: (project) =>
          <ClaimCountDownBox
            project={project}
            saleTimeLeft={project?.saleTimeLeft}
            claimProject={this._claimProject}
            refundProject={this._refundProject}
          />
      }, {
        title: 'Listing',
        dataIndex: 'listing',
        key: 'listing',
        className: 'text-center',
        render: (project) =>
          <ListingCountDownBox
            project={project}
            listingTimeLeft={project?.listingTimeLeft}
            uniswapProject={this._uniswapProject}
          />
      }
    ]

    const now = new Date()

    // const data = Array.isArray(dataProject.result.rows) ? dataProject.result.rows.map((item) => {
    const data = Array.isArray(projectParticipated) ? projectParticipated.map((item) => {
      const amountPaid = numberToString(convertBaseCurrency(item.payment_currency, +item.buyer.baseDeposited))
      const saleTimeLeft = moment(item.sale?.sale_end_time).diff(now, 'milliseconds')
      const listingTimeLeft = moment(item.sale?.listing_time).diff(now, 'milliseconds')

      return {
        key: item.project_id,
        project_name: item,
        token_info: item,
        tokens_you_get: `${numberToString(new BigNumber(+item.buyer.tokensOwed).dividedBy(new BigNumber(10).pow(item?.token_decimal)).toString(10))} ${item.token_symbol}`,
        amount_paid: `${amountPaid} ${item.payment_currency}`,
        status: { ...item, saleTimeLeft: saleTimeLeft >= 0 && saleTimeLeft },
        claim_tokens: { ...item, saleTimeLeft: saleTimeLeft >= 0 && saleTimeLeft },
        listing: { ...item, listingTimeLeft: listingTimeLeft >= 0 && listingTimeLeft }
      }
    }) : []

    return (
      <>
        <div className="content pt-4">
          <div className="col-sm-12 col-xl-10-x mr-auto ml-auto">
            {!projectParticipated ? <Loading className="w-100" /> : (
              <div className="card max1280">
                <div className="card-header text-center">
                  <h4 className="card-title">Participated Token Sale</h4>
                </div>
                <div className="card-body px-5sp">
                  <div className="table-responsive mytokenlist">
                    <Table columns={columns} dataSource={data} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal detail project */}
        <DetailModal innerRef={(ref) => { this._detailModal = ref }} />

        {/* Modal transaction action */}
        {projectActive && !!isModalVisible && (
          <TransactionModal
            project={projectActive}
            isModalVisible={isModalVisible}
            toggleModal={this._toggleTransactionModal}
            transactionHash={handlingHash}
            type={typeTransaction}
          />
        )}
      </>
    )
  }
}

export default MyAsset
