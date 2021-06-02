import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { withLocalize } from 'react-localize-redux'
import { Link, Redirect } from 'react-router-dom'
import moment from 'moment'
import BigNumber from 'bignumber.js'

import { actions, TYPES } from '@/store/actions'
import { forwardInnerRef } from '@/utils/high-order-functions'
import { checkProjectType } from '@/utils/project'
import { getETH } from '@/utils/ethereum'
import { bigNumber10Pow } from '../../utils/format'
import { errorForm, ErrorMsg, USDT, SYSTEM, TRANSACTION, TOKEN } from '../../constants'
import { convertBaseCurrency } from '../../utils/project'
import system from '../../constants/system'

/** component */
import Modal from '@/components/modal-rt'
import Loading from '@/components/loading'
import { pushNotify, dismissNotify } from '@/components/toast'
import Info from './info'
import Handle from './handle'
import TokenSales from './token-sales'
import TabsNav from './tabs-nav'
import TransactionModal from '@/pages/my-asset/transaction-modal'

/** asset */
import './style.scss'

@withLocalize
@connect((state) => ({
  projectStore: state.project,
  tokenStore: state.token,
  connectStore: state.connect
}), {
  getProjectById: actions.getProjectById,
  getTokenByAddress: actions.getTokenByAddress,
  getDeposit: actions.getDeposit,
  tokenApproveData: actions.tokenApproveData,
  getAllowanceData: actions.getAllowanceData,
  saveTransaction: actions.saveTransaction,
  getUsdtBalance: actions.getUsdtBalance,
  ownerClaimProject: actions.ownerClaimProject,
  ownerRefundProject: actions.ownerRefundProject,
  uniswapProject: actions.uniswapProject,
  setWalletBalance: actions.setWalletBalance,
  updatePresaleStatus: actions.updatePresaleStatus,
  getBuyer: actions.getBuyer,
  getGasPrice: actions.getGasPrice
})

@forwardInnerRef
class DisplayItemModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      isModalTransaction: false,
      isLoading: false,
      transactionRejected: false,
      balanceForm: 0,
      elementId: null,
      countDown: {
        days: 0,
        hours: 0,
        min: 0,
        sec: 0,
      },
      pathUrl: null,
      typeTransaction: null
    }
  }

  _getDataProject = (projectId) => {
    const { getProjectById, getTokenByAddress, getUsdtBalance, connectStore, getBuyer } = this.props
    const { dataEthereum } = connectStore
    getBuyer({ project_id: +projectId })
    getProjectById({ id: +projectId }, async (action, data, err) => {
      if (action === TYPES.GET_PROJECT_BY_ID_SUCCESS) {
        // Countdown
        const checkUpcoming = await moment(data?.sale?.sale_start_time).diff(moment(new Date), 'milliseconds')
        this.interval = await setInterval(() => {
          const date = this.calculateCountdown(checkUpcoming >= 0 ? data?.sale?.sale_start_time : data?.sale?.sale_end_time);
          date ? this.setState({ countDown: date }) : this.stop();
        }, 100);
        // Get token info
        await getTokenByAddress({ address: data?.token_contract_address })
        // Get balance
        switch (data?.payment_currency) {
          // eth balance number form
          case SYSTEM.PAYMENT_CURRENCY.ETH:
            await getETH(dataEthereum?.selectedAddress)
              .then((ref) => this.setState({ balanceForm: ref, isLoading: false }))
            break;
          // usdt balance number form
          case SYSTEM.PAYMENT_CURRENCY.USDT:
            await getUsdtBalance(null, (action, data, err) => {
              if (action === TYPES.GET_USDT_BALANCE_SUCCESS) {
                this.setState({ balanceForm: data?.adjustedBalance, isLoading: false })
              }
            })
            break;
          // get bnb balance
          case SYSTEM.PAYMENT_CURRENCY.BNB:
            await getETH(dataEthereum?.selectedAddress)
              .then((ref) => this.setState({ balanceForm: ref, isLoading: false }))
            break;
          // get busd balance
          case SYSTEM.PAYMENT_CURRENCY.BUSD:
            await getUsdtBalance(null, (action, data, err) => {
              if (action === TYPES.GET_USDT_BALANCE_SUCCESS) {
                this.setState({ balanceForm: data?.adjustedBalance, isLoading: false })
              }
            })
            break;
        }
      }
      if (action === TYPES.GET_PROJECT_BY_ID_FAILURE) {
        if (err?.code) {
          pushNotify('error', error.code)
        }
      }
    })
  }

  componentWillUnmount() {
    this.stop()
  }

  componentWillUnmount() {
    dismissNotify()
  }

  open = (projectId) => {
    this.stop()
    this.setState({
      visible: true,
      isLoading: true,
      fieldAmount: null,
      pathUrl: window.location.pathname
    })
    this._getDataProject(projectId)
  }

  close = () => {
    this.stop()
    this.setState({
      visible: false,
      countDown: {
        days: 0,
        hours: 0,
        min: 0,
        sec: 0,
      }
    })
  }

  // Set open/hide modal transaction
  _toggleTransactionModal = (isOpen) => this.setState({ isModalTransaction: !isOpen, typeTransaction: null, handlingHash: null })

  //----------------------------> Countdown
  calculateCountdown = (endDate) => {
    let diff = (Date.parse(new Date(endDate)) - Date.parse(new Date())) / 1000;

    // clear countdown when date is reached
    if (diff <= 0) return false;

    const timeLeft = {
      years: 0,
      days: 0,
      hours: 0,
      min: 0,
      sec: 0
    };

    // calculate time difference between now and expected date
    if (diff >= (365.25 * 86400)) { // 365.25 * 24 * 60 * 60
      timeLeft.years = Math.floor(diff / (365.25 * 86400));
      diff -= timeLeft.years * 365.25 * 86400;
    }
    if (diff >= 86400) { // 24 * 60 * 60
      timeLeft.days = Math.floor(diff / 86400);
      diff -= timeLeft.days * 86400;
    }
    if (diff >= 3600) { // 60 * 60
      timeLeft.hours = Math.floor(diff / 3600);
      diff -= timeLeft.hours * 3600;
    }
    if (diff >= 60) {
      timeLeft.min = Math.floor(diff / 60);
      diff -= timeLeft.min * 60;
    }
    timeLeft.sec = diff;

    return timeLeft;
  }

  stop = () => clearInterval(this.interval)

  addLeadingZeros = (value) => {
    value = String(value);
    while (value.length < 2) {
      value = '0' + value;
    }
    return value;
  }

  componentCountdown = (countDown) => {
    return (
      <div className="Countdown">
        <span className="Countdown-col">
          <span className="Countdown-col-element">
            <strong>{this.addLeadingZeros(countDown.days)}</strong>
            {/* <span>{countDown.days === 1 ? 'Day' : 'Days'}</span> */}
            <span>Day</span>
          </span>
        </span>
        <span className="Countdown-col">
          <span className="Countdown-col-element">
            <strong>{this.addLeadingZeros(countDown.hours)}</strong>
            <span>Hour</span>
          </span>
        </span>
        <span className="Countdown-col">
          <span className="Countdown-col-element">
            <strong>{this.addLeadingZeros(countDown.min)}</strong>
            <span>Min</span>
          </span>
        </span>
        <span className="Countdown-col">
          <span className="Countdown-col-element">
            <strong>{this.addLeadingZeros(countDown.sec)}</strong>
            <span>Sec</span>
          </span>
        </span>
      </div>
    )
  }

  //----------------------> End Countdown

  getTxHashFromTransaction = async (transactionParameters) => {
    try {
      return await ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      })
    } catch (error) {
      /** Transaction rejected */
      if (error.code === 4001) {
        this.setState({ isPaymentRejected: true })
      }
      return error
    }
  }

  onHandlePurchase = (values, resetForm) => {
    const { projectStore, connectStore } = this.props
    const { project } = projectStore
    const { dataEthereum } = connectStore
    const { balanceForm } = this.state
    const params = {
      contract_address: project?.contract_address,
      network_id: dataEthereum.networkVersion,
      caller: dataEthereum.selectedAddress
    }

    // Check if amount is greater than hard cap
    const { amount } = values
    const amountBigNumber = new BigNumber(amount)
    const hardCapBigNumber = new BigNumber(project?.sale?.hard_cap)

    const totalSold = convertBaseCurrency(project?.payment_currency, project?.presale?.total_base_collected)

    if (new BigNumber(totalSold).isGreaterThanOrEqualTo(hardCapBigNumber)) {
      pushNotify('error', errorForm.TOKEN_HAS_BEEN_SOLD_OUT)
      return
    }

    if (amountBigNumber.isGreaterThan(hardCapBigNumber)) {
      pushNotify('error', errorForm.AMOUNT_LESS_THAN_HARD_CAP)
      return
    }

    // Check if amount is greater than balance
    const balanceBigNumber = new BigNumber(balanceForm);
    if (amountBigNumber.isGreaterThan(balanceBigNumber)) {
      pushNotify('error', errorForm.NOT_ENOUGH_BALANCE)
      return
    }

    let valueBigNumber
    switch (project?.payment_currency) {
      case SYSTEM.PAYMENT_CURRENCY.ETH:
        params.token_amount = "0"
        params.eth = bigNumber10Pow(values?.amount)
        valueBigNumber = bigNumber10Pow(values.amount, 18, 16)
        params.payment_currency = SYSTEM.PAYMENT_CURRENCY.ETH
        break
      case SYSTEM.PAYMENT_CURRENCY.USDT:
        params.token_amount = bigNumber10Pow(values.amount, 6)
        params.eth = "0"
        valueBigNumber = "0x0"
        params.payment_currency = SYSTEM.PAYMENT_CURRENCY.USDT
        break
      case SYSTEM.PAYMENT_CURRENCY.BNB:
        params.token_amount = "0"
        params.eth = bigNumber10Pow(values?.amount)
        valueBigNumber = bigNumber10Pow(values.amount, 18, 16)
        params.payment_currency = SYSTEM.PAYMENT_CURRENCY.BNB
        break
      case SYSTEM.PAYMENT_CURRENCY.BUSD:
        params.token_amount = bigNumber10Pow(values.amount, 18)
        params.eth = "0"
        valueBigNumber = "0x0"
        params.payment_currency = SYSTEM.PAYMENT_CURRENCY.BUSD
        break
    }

    const { type } = checkProjectType(project)

    if (type === SYSTEM.TOKEN_SALES_TIMES.LIVE) {
      if (balanceForm === '0' && (project?.payment_currency === SYSTEM.PAYMENT_CURRENCY.USDT || project?.payment_currency === SYSTEM.PAYMENT_CURRENCY.BUSD)) {
        pushNotify('error', `${errorForm.NOT_ENOUGH} ${project?.payment_currency}`)
      } else {
        this.resetPaymentState()
        if (project?.payment_currency === SYSTEM.PAYMENT_CURRENCY.ETH || project?.payment_currency === SYSTEM.PAYMENT_CURRENCY.BNB) {
          this.handleDeposit({ params, to: project?.contract_address, value: valueBigNumber, resetForm })
        } else if (project?.payment_currency === SYSTEM.PAYMENT_CURRENCY.USDT || project?.payment_currency === SYSTEM.PAYMENT_CURRENCY.BUSD) {
          this.checkBeforeHandleUSDT({ params, project, resetForm, valueBigNumber })
        }
      }
    } else if (type === SYSTEM.TOKEN_SALES_TIMES.CLOSED) {
      pushNotify('error', 'TOKEN_SALE_CLOSED')
    } else if (type === SYSTEM.TOKEN_SALES_TIMES.UPCOMING) {
      pushNotify('error', 'NOT_IN_TIME')
    }
  }

  resetPaymentState = () => this.setState({
    isPaymentLoading: true,
    pendingTransactionHash: null,
    isPendingApprove: false,
    isApproved: false,
    isConfirmWallet: false,
    isCompletedPayment: false,
    isPaymentRejected: false,
    isTransaction: false,
    isPaymentFailed: false,
    isApprovedLoading: false
  })

  checkBeforeHandleUSDT = ({ params, project, resetForm, valueBigNumber }) => {
    const { getAllowanceData } = this.props
    getAllowanceData({
      contract_address: USDT.USDT_PRESALE[+window.ethereum?.networkVersion],
      spender: project?.contract_address,
      network_id: ethereum.networkVersion
    }, (action, data, error) => {
      if (action === TYPES.GET_ALLOWANCE_DATA_SUCCESS) {
        if (data === 0 || data === '0') {
          this.handleUSDTPayment({ params, project, resetForm })
        } else if (params.token_amount <= +data) {
          this.handleDeposit({ params, to: project?.contract_address, value: valueBigNumber, resetForm })
        } else if (params.token_amount > +data) {
          pushNotify('error', `CANNOT PAY MORE THAN ${convertBaseCurrency(system.PAYMENT_CURRENCY.USDT, +data)} APPROVED USDT. 
          USE ALL BEFORE MAKING A NEW ALLOWANCE!`)
        }
      } else if (action === TYPES.GET_ALLOWANCE_DATA_FAILURE) {
        pushNotify('error', error)
      }

    })
  }

  handleUSDTPayment = async ({ params, project, resetForm }) => {
    const { token_amount } = params
    const { tokenApproveData } = this.props

    const payload = {
      contractAddress: USDT.USDT_PRESALE[+window.ethereum?.networkVersion],
      networkId: ethereum.networkVersion,
      spender: project?.contract_address,
      amount: TOKEN.MAXIMUM_APPROVE,
      fromAddress: ethereum.selectedAddress
    }

    this.setState({ visible: true, visiblePayment: true })
    tokenApproveData(payload, (action, data, error) => {
      this.tokenApproveDataResult({ action, data, error, project, resetForm, params })
    })
  }

  tokenApproveDataResult = ({ action, data, error, project, resetForm, params }) => {
    const { getGasPrice } = this.props
    if (action === TYPES.TOKEN_APPROVE_DATA_SUCCESS) {
      getGasPrice(null, async (actionGas, dataGas) => {
        if (actionGas === TYPES.GET_GAS_PRICE_SUCCESS) {
          const gasPrice = dataGas.result
          const transactionParameters = {
            nonce: '0x00',
            gasPrice,
            gas: data.gas,
            to: USDT.USDT_PRESALE[+window.ethereum?.networkVersion],
            from: ethereum.selectedAddress,
            value: '0x00',
            data: data.data,
            chainId: '0x3',
          };

          // txHash is a hex string
          // As with any RPC call, it may throw an error
          const txHash = await this.getTxHashFromTransaction(transactionParameters);

          if (!txHash?.code) {
            this.setState({ isPendingApprove: true, pendingTransactionHash: txHash })
            let tx = await ethereum.request({
              method: 'eth_getTransactionReceipt',
              params: [txHash],
            });

            while (!tx || !tx.blockHash) {
              // TODO request timeout
              await new Promise(resolve => setTimeout(resolve, 1000));
              tx = await ethereum.request({
                method: 'eth_getTransactionReceipt',
                params: [txHash],
              })
            }

            if (tx?.status === TRANSACTION.TRANSACTION_STATUS.FAILED) {
              this.setState({ isPaymentFailed: true, isPaymentRejected: true })
            } else {
              window.ethereum && this._setETH(window.ethereum.selectedAddress)

              this.setState({ isPendingApprove: false, isApproved: true, isApprovedLoading: true })
              this.handleDeposit({
                params,
                to: project?.contract_address,
                value: '0x0',
                resetForm
              })
            }
          }
        }
      })
    } else if (action === TYPES.TOKEN_APPROVE_DATA_FAILURE) {
      pushNotify('error', ErrorMsg[error?.code] || error?.code)
    }
  }

  handleDeposit({ params, to, value, resetForm }) {
    const { getDeposit, connectStore, projectStore, saveTransaction, getGasPrice } = this.props
    const { dataEthereum } = connectStore
    const { project } = projectStore

    this.setState({ isTransaction: true, visiblePayment: true })
    getDeposit(params, (action, data, err) => {
      if (action === TYPES.GET_DEPOSIT_SUCCESS) {
        getGasPrice(null, async (actionGas, dataGas) => {
          if (actionGas === TYPES.GET_GAS_PRICE_SUCCESS) {
            const gasPrice = dataGas.result
            // this.setState({ transactionRejected: false })
            const transactionParameters = {
              nonce: '0x00', // ignored by MetaMask
              gasPrice, // customizable by user during MetaMask confirmation.
              gas: data.gas, // customizable by user during MetaMask confirmation.
              to, // Required except during contract publications.
              from: dataEthereum.selectedAddress, // must match user's active address.
              value, // Only required to send ether to the recipient from the initiating external account.
              data: data.data, // Optional, but used for defining smart contract creation and interaction.
              chainId: dataEthereum.chainId, // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
            }

            // txHash is a hex string
            // As with any RPC call, it may throw an error
            const txHash = await this.getTxHashFromTransaction(transactionParameters)

            if (!txHash?.code) {
              this.setState({ isApproved: false, isPaymentLoading: true, isApprovedLoading: false, isConfirmWallet: true, pendingTransactionHash: txHash })
              saveTransaction({ project_id: project?.project_id }, async (action, returnData, error) => {
                if (action === TYPES.SAVE_TRANSACTION_SUCCESS) {
                  let tx = await ethereum.request({
                    method: 'eth_getTransactionReceipt',
                    params: [txHash],
                  });

                  while (!tx || !tx.blockHash) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    tx = await ethereum.request({
                      method: 'eth_getTransactionReceipt',
                      params: [txHash],
                    })
                  }

                  if (tx?.status === TRANSACTION.TRANSACTION_STATUS.FAILED) {
                    this.setState({ isPaymentRejected: true, isPaymentFailed: true })
                  } else {
                    window.ethereum && this._setETH(window.ethereum.selectedAddress)
                    this._getDataProject(project?.project_id )
                    this.setState({ isPaymentLoading: false, isCompletedPayment: true })
                  }
                } else if (action === TYPES.SAVE_TRANSACTION_FAILURE) {
                  pushNotify('error', error?.code)
                }
              })

              // Reset form.
              resetForm()
            }
          }
        })
      }
      if (action === TYPES.GET_DEPOSIT_FAILURE) {
        this.setState({ isPaymentFailed: true })
        if (err?.code) {
          pushNotify('error', err.code)
        }
      }
    })
  }

  paymentMessage(project) {
    const { isPendingApprove, isConfirmWallet, isTransaction } = this.state
    let message = <p className="ft1 text-center mt-3 mb-5">Please Approve {project.payment_currency} in your wallet.</p>
    if (isTransaction && !(isPendingApprove || isConfirmWallet)) {
      message = <p className="ft1 text-center mt-3 mb-5">Please confirm you wallet.</p>
    } else if (isPendingApprove || isConfirmWallet) {
      message = <p className="ft1 text-center mt-3">Pending:</p>
    }
    return message
  }

  completedMessage(project) {
    const { isApproved, isCompletedPayment } = this.state
    let message = ''
    if (isApproved) {
      message = `Approved ${project.payment_currency}:`
    } else if (isCompletedPayment) {
      message = 'Success'
    }
    return message
  }

  // Check type project (Live/Success/Failed)
  checkTypeAndSuccess = () => {
    const { projectStore } = this.props
    const { project } = projectStore
    const now = moment()
    const start_time_cap = moment(project?.sale?.sale_start_time).diff(moment(now), 'milliseconds')
    const end_time_cap = moment(project?.sale?.sale_end_time).diff(now, 'milliseconds')

    const softCap = project?.sale?.soft_cap
    let totalTokenSold
    switch (project?.payment_currency) {
      case SYSTEM.PAYMENT_CURRENCY.ETH:
        totalTokenSold = bigNumber10Pow(bigNumber10Pow(project?.presale?.total_base_collected) / bigNumber10Pow(1, 18))
        break;
      case SYSTEM.PAYMENT_CURRENCY.USDT:
        totalTokenSold = bigNumber10Pow(bigNumber10Pow(project?.presale?.total_base_collected) / bigNumber10Pow(1, 6))
        break;
      case SYSTEM.PAYMENT_CURRENCY.BNB:
        totalTokenSold = bigNumber10Pow(bigNumber10Pow(project?.presale?.total_base_collected) / bigNumber10Pow(1, 18))
        break;
      case SYSTEM.PAYMENT_CURRENCY.BUSD:
        totalTokenSold = bigNumber10Pow(bigNumber10Pow(project?.presale?.total_base_collected) / bigNumber10Pow(1, 18))
        break;
    }
    const isSuccess = totalTokenSold >= softCap

    let type = SYSTEM.TOKEN_SALES_TIMES.LIVE
    if (end_time_cap <= 0) {
      type = SYSTEM.TOKEN_SALES_TIMES.CLOSED
    } else if (start_time_cap >= 0) {
      type = SYSTEM.TOKEN_SALES_TIMES.UPCOMING
    }
    return { isSuccess, type }
  }

  // claim project
  _claimProject = (project) => {
    const { ownerClaimProject } = this.props
    const params = {
      // contract_address: project.contract_address,
      // network_id: project.network_id.toString(),
      project_id: project.project_id
    }
    ownerClaimProject(params, (action, data, error) => {
      if (action === TYPES.OWNER_CLAIM_PROJECT_SUCCESS) {
        this._onTransaction(project, data, true)
      }
      if (action === TYPES.OWNER_CLAIM_PROJECT_FAILURE) {
        if (error?.code) {
          pushNotify('error', error.code)
        }
      }
    })
  }

  // refund project
  _refundProject = (project) => {
    const { ownerRefundProject } = this.props
    const params = {
      // contract_address: project.contract_address,
      // network_id: project.network_id.toString()
      project_id: project.project_id,
    }
    ownerRefundProject(params, (action, data, error) => {
      if (action === TYPES.OWNER_REFUND_PROJECT_SUCCESS) {
        this._onTransaction(project, data, true)
      }
      if (action === TYPES.OWNER_REFUND_PROJECT_FAILURE) {
        if (error?.code) {
          pushNotify('error', error.code)
        }
      }
    })
  }

  // uniswap project
  _uniswapProject = (project) => {
    const { uniswapProject } = this.props
    const params = {
      // contract_address: project.contract_address,
      // network_id: project.network_id.toString()
      project_id: project.project_id,
    }
    uniswapProject(params, (action, data, error) => {
      if (action === TYPES.UNISWAP_PROJECT_SUCCESS) {
        this._onTransaction(project, data, false)
      }
      if (action === TYPES.UNISWAP_PROJECT_FAILURE) {
        if (error?.code) {
          pushNotify('error', error.code)
        }
      }
    })
  }

  // Transaction function
  // isClaimOrRefund is true if called "claim/refund" function, is false if called by "list on uniswap" function
  _onTransaction = async (project, data, isClaimOrRefund) => {
    const { connectStore, updatePresaleStatus, getGasPrice } = this.props
    const { dataEthereum } = connectStore
    // Notification transaction request
    this.setState({
      projectActive: project,
      isModalTransaction: true,
      typeTransaction: 'REQUEST'
    })

    getGasPrice(null, async (actionGas, dataGas) => {
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
            // Update presale status
            const payload = isClaimOrRefund ? { is_owner_withdrawn: true } : { is_list_on_uniswap: true };
            payload.project_id = project.project_id;
            // isClaimOrRefund
            updatePresaleStatus(payload, (action, data, error) => {
              if (action === TYPES.UPDATE_PRESALE_STATUS_SUCCESS) {
                // Notification transaction success
                this.setState({ typeTransaction: 'COMPLETED' })
                // re-get project
                this._getDataProject(project.project_id)
              } else if (action === TYPES.UPDATE_PRESALE_STATUS_FAILURE) {
                alert('UPDATE_PRESALE_FAILED');
              }
            })
          }
        } else {
          this.setState({ typeTransaction: 'REJECTED' })
        }
      }
    })
  }

  _setETH = (address) => getETH(address).then(x => {
    const { setWalletBalance } = this.props
    setWalletBalance(x)
  })

  render() {
    const {
      visible,
      isModalTransaction,
      isLoading,
      pathUrl,
      balanceForm,
      countDown,
      fieldAmount,
      visiblePayment,
      isPendingApprove,
      isPaymentLoading,
      isApprovedLoading,
      pendingTransactionHash,
      isPaymentRejected,
      isApproved,
      isCompletedPayment,
      isTransaction,
      typeTransaction,
      isPaymentFailed,
      handlingHash
    } = this.state
    const { projectStore, tokenStore, connectStore } = this.props
    const { project } = projectStore
    const { tokenByAddress } = tokenStore
    const { dataEthereum } = connectStore
    const network = +window.ethereum?.networkVersion

    const { isSuccess, type } = this.checkTypeAndSuccess()
    let LayoutRight
    if (pathUrl === '/launched-sales') {
      LayoutRight = <TokenSales
        title={'Your token sale progress'}
        isLaunched={true}
        project={project}
        type={type}
        isSuccess={isSuccess}
        onClaimProject={this._claimProject}
        onRefundProject={this._refundProject}
      />
    } else if (type === SYSTEM.TOKEN_SALES_TIMES.CLOSED) {
      LayoutRight = <TokenSales
        title={'Token sales Ended'}
        project={project}
        isSuccess={isSuccess}
      />
    } else {
      LayoutRight = <Handle
        fieldAmount={fieldAmount}
        project={project}
        balanceForm={balanceForm}
        dataEthereum={dataEthereum}
        onHandle={this.onHandlePurchase}
      />
    }

    return !!isLoading ? <Loading className="loading-screen" /> : (
      <Fragment>
        <Modal
          isOpen={visible}
          toggle={() => {
            this.stop()
            this.setState({ visible: !visible })
          }}
          className="modal-dialog sale_modal modal-xl pt-1 card-detail-modal"
        >
          <div className="modal-header modalheader_border-none pb-0">
            <button type="button" className="close" onClick={this.close}>
              <i className="far fa-times-circle"></i>
            </button>
          </div>
          <div className="pt-0 modal-body">
            <div className="row">
              <Info
                onClose={this.close}
                project={project}
                isSuccess={isSuccess}
                componentCountdown={this.componentCountdown}
                countDown={countDown}
              />
              {LayoutRight}
              {/* Tabs nav */}
              <TabsNav
                project={project}
                type={type}
                isSuccess={isSuccess}
                tokenByAddress={tokenByAddress}
                onUniswapProject={this._uniswapProject}
              />
            </div>
          </div>
        </Modal>
        <Modal
          isOpen={visiblePayment}
          toggle={() => (isPaymentRejected || isCompletedPayment) && this.setState({ visiblePayment: !visiblePayment })}
          className="modal-dialog pt-60px"
        >
          <div className="modal-header justify-content-center">
            <span className="h5 modal-title font-weight-bold">{isTransaction ? 'Transaction' : 'Approve'}</span>
          </div>
          <div className="modal-body">
            {isPaymentRejected ?
              (
                <p className="ft1 text-center mt-3 mb-5">{isPaymentFailed ? 'Payment failed.' : 'Payment rejected.'}</p>
              )
              : (
                <Fragment>
                  {(isPaymentLoading && !isApprovedLoading && !isPaymentFailed) && <Loading className="loading-3rem" />}
                  {
                    (isApprovedLoading || isCompletedPayment) && (
                      <div className="d-flex justify-content-center">
                        <i className="fas fa-check-circle fa-3x text-success"></i>
                      </div>
                    )
                  }
                  {
                    (isApproved || isCompletedPayment) ? (
                      <p className="ft1 text-center mt-3 text-success">{this.completedMessage(project)}</p>) : this.paymentMessage(project)
                  }
                  {(isPendingApprove || isApprovedLoading || isPaymentLoading) && pendingTransactionHash && (
                    <p className="ft08 text-center mt-3">{pendingTransactionHash?.slice(0, 6) + '...' + pendingTransactionHash?.slice(pendingTransactionHash.length - 7, pendingTransactionHash.length - 1) + ' '}
                      <a
                        href={`${system.NETWORKS[network]?.URL}${system.TRANSACTION_URL}/${pendingTransactionHash}`}
                        className="badge badge-light px-2 py-1 text-secondary"
                        target="_blank"
                      >{system.NETWORKS[network]?.domain}<i className="fas fa-external-link-alt pl-1"></i>
                      </a>
                    </p>
                  )}
                  {isApprovedLoading && (
                    <Fragment>
                      <p className="ft1 text-center my-3"><i className="fas fa-chevron-double-down"></i></p>
                      <div className="d-flex justify-content-center">
                        <div className="spinner-border text-success" style={{ width: '3rem', height: '3rem' }} role="status">
                          <span className="sr-only">Loading...</span>
                        </div>
                      </div>
                      <p className="ft1 text-center mt-3 mb-5">Please Confirm This Transaction in your Wallet.</p>
                    </Fragment>
                  )}
                  {isCompletedPayment && (
                    <div className="text-center"  >
                      <Link to='/my-asset' children={
                        (
                          <button type="button" className="btn btn-outline-success text-capitalize" >My Asset
                            <i className="fas fa-external-link-alt pl-1" aria-hidden="true"></i>
                          </button>
                        )
                      } />
                    </div>
                  )}
                </Fragment>
              )
            }
          </div>
        </Modal>

        {/* Modal transaction action */}
        {project && !!isModalTransaction && (
          <TransactionModal
            project={project}
            isModalVisible={isModalTransaction}
            toggleModal={this._toggleTransactionModal}
            transactionHash={handlingHash}
            type={typeTransaction}
          />
        )}
      </Fragment>
    )
  }
}

export default DisplayItemModal
