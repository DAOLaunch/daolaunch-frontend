import React, { useState, Fragment, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Formik, Form } from 'formik'
import QueryString from 'query-string';
import BigNumber from "bignumber.js"
import moment from 'moment'

import { actions, TYPES } from '@/store/actions'
import { valuesTrim } from '@/utils/values-trim'
import { getETH } from '@/utils/ethereum'
import { isStringEmpty } from '@/utils/function'
import { errorForm, ErrorMsg, PRESALE_GENERATORS, DAOLAUNCH_FEE, TOKEN, USDT } from '../../../constants'
import { getCSV } from '@/utils/csv'

import Project from './project'
import Token from './token'
import Sales from './sales'
import StatusModal from './status-modal'
import { ProjectSchema, SalesSchema, TokenSchema } from './schema'

import { pushNotify } from '@/components/toast'

const CreateTokenSaleForm = ({ history }) => {
  // init data form
  const initDataProject = {
    project_logo: "",
    project_name: '',
    project_website: '',
    project_email: '',
    project_additional_info: ''
  }

  const initDataToken = {
    token_contract_address: "",
    token_name: "",
    payment_currency: "",
    list_amm: "",
    currency_pair: "UNISWAP"
  }

  const initDataSales = {
    sale_allocation: "",
    swap_ratio: "",
    hard_cap: '',
    soft_cap: "",
    max_allocation_wallet_limit: false,
    min_allocation_wallet_limit: false,
    max_allocation_wallet: "",
    min_allocation_wallet: "",
    access_type: '',
    whitelist_address: '',
    sale_start_time: '',
    sale_end_time: '',
    listing_rate: '2',
    initial_liquidity_per: 30,
    listing_time: '',
    lock_liquidity: "",
    est_funding: 1000
  }

  const [statusButton, setStatusButton] = useState(false);
  const [tokenDecimal, setTokenDecimal] = useState(0);
  const [isShowMaxAllocation, setIsShowMaxAllocation] = useState(false);
  const [isShowMinAllocation, setIsShowMinAllocation] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [createTokenComplete, setCreateTokenComplete] = useState(false);
  const [dataSubmit, setDataSubmit] = useState({});
  const [isOnUniswap, setIsOnUniswap] = useState(false)
  const [dataWhiteList, setDataWhiteList] = useState([])
  const [dataTokenAddress, setDataTokenAddress] = useState(null)
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [listingTime, setListingTime] = useState(null)
  const [initFormToken, setInitFormToken] = useState(initDataToken)
  const [currentTab, setCurrentTab] = useState(0)
  const [tokenBalance, setTokenBalance] = useState(0)
  const [handlingType, setHandlingType] = useState(null)
  const [handlingHash, setHandlingHash] = useState(null)
  const [tokenName, setTokenName] = useState('')
  const [projectData, setProjectData] = useState({});
  const [tokenData, setTokenData] = useState({});
  const [errorContractAddress, setErrorContractAddress] = useState(null);
  const [tokensApproved, setTokenApproved] = useState('0')

  // useState Func Reset Form
  const [resetProject, setResetProject] = useState(null);
  const [resetToken, setResetToken] = useState(null);
  const [resetSale, setResetSale] = useState(null);

  const dispatch = useDispatch();

  const projectRef = useRef();
  const tokenRef = useRef();
  const salesRef = useRef();

  // Store
  const { dataEthereum } = useSelector((state) => state.connect)

  // Re-set init data form
  useEffect(() => {
    if (window.location.search) {
      const a = QueryString.parse(window.location.search)
      if (a?.token) {
        const token_contract_address = a.token.trim()
        setInitFormToken({
          ...initFormToken,
          token_contract_address,
        })

        dispatch(actions.getInfoTokenAddress({
          address: token_contract_address,
          spender: PRESALE_GENERATORS[window.ethereum.networkVersion],
          is_valid_address: true
        }, (action, data, error) => {
          if (action === TYPES.GET_INFO_TOKEN_ADDRESS_SUCCESS) {
            setInitFormToken({
              ...initFormToken,
              token_name: data?.tokenName,
              token_symbol: data?.tokenSymbol,
              token_contract_address,
            })

            if (initFormToken?.token_contract_address && initFormToken?.payment_currency && initFormToken?.list_amm) {
              /** Check if is already on uniswap */
              checkPair({ sale_token: initFormToken?.token_contract_address, base_token: initFormToken?.payment_currency })
            }

            if (!!data.isSuccessOrLiveUpcoming) {
              setErrorContractAddress(errorForm.CONTRACT_ADDRESS_IS_LIVE_OR_UPCOMING)
            } else {
              setTokenName(data?.tokenName)
              setTokenDecimal(data?.decimal)
              setTokenBalance(data?.adjustedBalance)
            }

            setTokenApproved(data.tokens_approved)
            if (data.tokens_approved !== '0') {
              setDataTokenAddress(token_contract_address)
            }
          } else if (action === TYPES.GET_INFO_TOKEN_ADDRESS_FAILURE && error) {
            pushNotify('error', error?.code)
            setInitFormToken({
              ...initFormToken,
              token_name: ''
            })
          }
        }))
      }
    }
  }, [])

  const requestGetInfoTokenAddress = (address, setFieldValue, values, setValues) => {
    setFieldValue('token_contract_address', address)
    if (isStringEmpty(address)) {
      setIsOnUniswap(false)
      clearSaleData(setValues, values)
    } else {
      dispatch(actions.getInfoTokenAddress({
        address: address.trim(),
        spender: PRESALE_GENERATORS[window.ethereum.networkVersion],
        is_valid_address: true
      }, (action, data, error) => {
        if (action === TYPES.GET_INFO_TOKEN_ADDRESS_SUCCESS) {
          setFieldValue('token_name', data?.tokenName)
          setFieldValue('token_symbol', data?.tokenSymbol)
          if (values?.token_contract_address && values?.payment_currency && values?.list_amm) {
            /** Check if is already on uniswap */
            checkPair({ sale_token: values?.token_contract_address, base_token: values?.payment_currency })
          }
          if (!!data.isSuccessOrLiveUpcoming) {
            setErrorContractAddress(errorForm.CONTRACT_ADDRESS_IS_LIVE_OR_UPCOMING)
          } else {
            setErrorContractAddress(null)
            setTokenName(data?.tokenName)
            setTokenDecimal(data?.decimal)
            setTokenBalance(data?.adjustedBalance)
          }

          setTokenApproved(data.tokens_approved)
          if (data.tokens_approved !== '0') {
            setDataTokenAddress(address)
          }
        }
        if (action === TYPES.GET_INFO_TOKEN_ADDRESS_FAILURE) {
          setTokenApproved('0')
          clearSaleData(setValues, values)
          setDataTokenAddress(null)
        }
      }))
    }
  }

  const clearSaleData = (setValues, values) => {
    setValues({
      ...values,
      sale_allocation: '',
      swap_ratio: '',
      hard_cap: '',
      soft_cap: '',
      max_allocation_wallet_limit: false,
      min_allocation_wallet_limit: false,
      max_allocation_wallet: 0,
      min_allocation_wallet: 0,
      access_type: "public",
      whitelist_address: null,
      listing_rate: '2',
      initial_liquidity_per: 30,
      lock_liquidity: "ONE_MONTH",
      est_funding: 1000,
      token_name: ''
    })
  }

  const createTokenSaleResult = (action, data, error) => {
    if (action === TYPES.CREATE_TOKEN_SALE_SUCCESS) {
      resetProject(initDataProject)
      resetToken(initDataToken)
      resetSale(initDataSales)
      setTokenApproved('0')
    } else if (action === TYPES.CREATE_TOKEN_SALE_FAILURE) {
      setIsModalVisible(false)
      pushNotify('error', error?.code)
    }
  }

  const getTxHashFromTransaction = async (transactionParameters) => {
    try {
      return await ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      })
    } catch (error) {
      /** Transaction rejected */
      if (error.code === 4001) {
        setHandlingType('REJECTED');
      }
      return error
    }
  }

  const presaleGetAddressResult = (action, data, error, dataForm) => {
    const payload = {
      ...dataForm,
      sale_allocation: +dataForm.sale_allocation,
      hard_cap: +dataForm.hard_cap,
      soft_cap: +dataForm.soft_cap,
      max_allocation_wallet: dataForm.max_allocation_wallet,
      min_allocation_wallet: dataForm.min_allocation_wallet,
      swap_ratio: +dataForm.swap_ratio,
      whitelist: dataWhiteList,
      contract_address: data,
      token_decimal: +tokenDecimal,
      initial_liquidity_per: +dataForm.initial_liquidity_per,
    }
    dispatch(actions.createTokenSale(payload, createTokenSaleResult))
  }

  const postPresaleResult = (action, data, error, dataForm) => {
    if (action === TYPES.POST_PRESALE_SUCCESS) {
      dispatch(actions.getGasPrice(null, async (actionGas, dataGas) => {
        if (actionGas === TYPES.GET_GAS_PRICE_SUCCESS) {
          setCreateTokenComplete(true);
          const gasPrice = dataGas.result
          const transactionParameters = {
            nonce: '0x00', // ignored by MetaMask
            gasPrice, // customizable by user during MetaMask confirmation.
            gas: data.gas, // customizable by user during MetaMask confirmation.
            to: PRESALE_GENERATORS[ethereum.networkVersion], // Required except during contract publications.
            from: ethereum.selectedAddress, // must match user's active address.
            value: DAOLAUNCH_FEE[ethereum.networkVersion], // Only required to send ether to the recipient from the initiating external account.
            data: data.data, // Optional, but used for defining smart contract creation and interaction.
            chainId: '0x3', // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
          };
          // txHash is a hex string
          // As with any RPC call, it may throw an error
          const txHash = await getTxHashFromTransaction(transactionParameters);

          if (!txHash?.code) {
            setHandlingHash(txHash)
            setHandlingType('PENDING')
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

            window.ethereum && _setETH(window.ethereum.selectedAddress)

            if (tx && tx.blockHash) {
              const param = {
                log: tx.logs[2].data
              }
              setHandlingType('LAUNCHED')
              setStatusButton(false)
              setDataWhiteList([])
              setDataSubmit({})
              setDataTokenAddress(null)
              dispatch(actions.presaleGetAddress(param, (action, data, error) => presaleGetAddressResult(action, data, error, dataForm)))
            }
          }
        }
      }))
    } else if (action === TYPES.POST_PRESALE_FAILURE) {
      pushNotify('error', error?.code)
    }
  }

  const changeBaseToken = (e, setFieldValue, values) => {
    if (values?.token_contract_address && values.list_amm) {
      /** Check if is already on uniswap */
      checkPair({ sale_token: values?.token_contract_address, base_token: e.target.value })
    }
    if (e.target.value) {
      setFieldValue('payment_currency', `${e.target.value}`)
    }
  }

  const changeExchange = (e, values) => {
    if (values?.token_contract_address && values.payment_currency) {
      /** Check if is already on uniswap */
      checkPair({ sale_token: values?.token_contract_address, base_token: values.payment_currency })
    }
  }

  const checkPair = ({ sale_token, base_token }) => {
    const params = {
      sale_token: sale_token.trim(),
      base_token,
      network_id: window.ethereum?.networkVersion
    }
    dispatch(actions.getPair(params, (action, payload, err) => {
      if (action === TYPES.GET_PAIR_SUCCESS) {
        if (payload === '0x0000000000000000000000000000000000000000') {
          setIsOnUniswap(false)
        } else {
          setIsOnUniswap(true)
        }
      } else if (action === TYPES.GET_PAIR_FAILURE) {
        window.Sweetalert2.fire({
          title: 'Error!',
          text: ErrorMsg[err?.code] || err?.code,
          icon: 'error',
          confirmButtonText: 'Cool'
        })
      }
    }))
  }

  const tokenApproveDataResult = async (action, data, error, tokenAddress) => {
    if (action === TYPES.TOKEN_APPROVE_DATA_SUCCESS) {
      dispatch(actions.getGasPrice(null, async (actionGas, dataGas) => {
        if (actionGas === TYPES.GET_GAS_PRICE_SUCCESS) {
          const gasPrice = dataGas.result
          const transactionParameters = {
            nonce: '0x00', // ignored by MetaMask
            gasPrice, // customizable by user during MetaMask confirmation.
            gas: data.gas, // customizable by user during MetaMask confirmation.
            to: tokenAddress, // Required except during contract publications.
            from: ethereum.selectedAddress, // must match user's active address.
            value: '0x00', // Only required to send ether to the recipient from the initiating external account.
            data: data.data, // Optional, but used for defining smart contract creation and interaction.
            chainId: '0x3', // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
          };
          // txHash is a hex string
          // As with any RPC call, it may throw an error
          const txHash = await getTxHashFromTransaction(transactionParameters);
          if (!txHash?.code) {
            setHandlingHash(txHash)
            setHandlingType('PENDING')
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

            window.ethereum && _setETH(window.ethereum.selectedAddress)

            if (tx && tx.blockHash) {
              setHandlingHash(tokenAddress)
              setCreateTokenComplete(true)
              setStatusButton(true)
              setHandlingType('APPROVED')
            }
          }
        }
      }))
    }
    if (action === TYPES.TOKEN_APPROVE_DATA_FAILURE) {
      setIsModalVisible(false);
      pushNotify('error', error?.code)
    }
  }

  const _onSubmitProject = async (values, { resetForm }) => {
    const dataSubmit = {
      ...projectData,
      ...tokenData,
      ...values,
      sale_start_time: moment(values.sale_start_time).utc().format(),
      sale_end_time: moment(values.sale_end_time).utc().format(),
      listing_time: moment(values.listing_time).utc().format()
    }

    // Check token supply is enough
    const tokenSale = new BigNumber(dataSubmit.sale_allocation);
    const balance = new BigNumber(tokenBalance)

    if (!tokenSale.isLessThanOrEqualTo(balance)) {
      pushNotify('error', errorForm.NUMBER_MAX_TOKEN_SUPPLY)
      return;
    }

    // Check time is valid
    const currentTime = moment();
    const saleStartTime = moment(values.sale_start_time);
    const saleEndTime = moment(values.sale_end_time);
    const listingTime = moment(values.listing_time);
    if (currentTime.isSameOrAfter(saleStartTime)) {
      pushNotify('error', errorForm.START_TIME_AFTER)
      return;
    }
    if (saleStartTime.isSameOrAfter(saleEndTime)) {
      pushNotify('error', errorForm.INVALID_SALE_TIME)
      return;
    }
    if (saleEndTime.isSameOrAfter(listingTime)) {
      pushNotify('error', errorForm.INVALID_LISTING_TIME)
      return;
    }

    /** Convert time to international time */
    const dataForm = {
      sale_start_time: saleStartTime.toISOString(),
      sale_end_time: saleEndTime.toISOString(),
      listing_time: listingTime.toISOString(),
      ...dataSubmit
    }

    // Trim() values dataForm
    const params = valuesTrim(dataForm)

    setDataSubmit(params);
    setIsModalVisible(true);
    setHandlingType('APPROVE')
    const { whitelist_address, token_contract_address, sale_allocation } = params;
    let whiteList = [];
    if (whitelist_address) {
      const csvData = await getCSV(whitelist_address, 'whitelist_address');
      if (csvData && csvData.length) whiteList = csvData.filter(data => !isStringEmpty(data) || /\S/.test(data));
    }
    setDataWhiteList(whiteList)

    const tokenAddress = token_contract_address
    const saleAllocation = new BigNumber(sale_allocation)
    const power = new BigNumber(10).pow(tokenDecimal)
    const payload = {
      contractAddress: tokenAddress,
      networkId: ethereum.networkVersion,
      spender: PRESALE_GENERATORS[ethereum.networkVersion],
      amount: TOKEN.MAXIMUM_APPROVE,
      fromAddress: ethereum.selectedAddress
    }
    setDataTokenAddress(tokenAddress)
    dispatch(actions.tokenApproveData(payload, (action, data, error) => {
      tokenApproveDataResult(action, data, error, tokenAddress)
    }))
  }

  const handleCreateToken = async (values, resetForm) => {
    const errors = await SalesSchema.validate(values).catch(err => err)
    if (errors.errors && errors.errors.length > 0) {
      return pushNotify('error', `${errors.path}: ${errors.errors[0]}`)
    }
    const dataForm = {
      ...projectData,
      ...tokenData,
      ...values,
      sale_start_time: moment(values.sale_start_time).toISOString(),
      sale_end_time: moment(values.sale_end_time).toISOString(),
      listing_time: moment(values.listing_time).toISOString(),
    }

    // Trim() values dataForm
    const params = valuesTrim(dataForm)
    const {
      swap_ratio,
      max_allocation_wallet,
      hard_cap,
      min_allocation_wallet,
      soft_cap,
      initial_liquidity_per,
      listing_rate,
      lock_liquidity,
      payment_currency
    } = params

    if (+tokenDecimal < 0 || +tokenDecimal > 18) {
      pushNotify('error', errorForm.DECIMAL_INVALID);
      return;
    }

    if (dataSubmit && dataWhiteList) {
      // setStatusButton(true);
      let baseToken;
      let decimal;
      switch (payment_currency) {
        case 'ETH':
          baseToken = USDT.ETH_PRESALE[+window.ethereum?.networkVersion]
          decimal = 18;
          break;
        case 'USDT':
          baseToken = USDT.USDT_PRESALE[+window.ethereum?.networkVersion]
          decimal = 6;
          break;
        case 'BNB':
          baseToken = USDT.ETH_PRESALE[+window.ethereum?.networkVersion]
          decimal = 18;
          break;
        case 'BUSD':
          baseToken = USDT.USDT_PRESALE[+window.ethereum?.networkVersion]
          decimal = 18;
          break;
      }

      let liquidity = 1;
      switch (lock_liquidity) {
        case 'ONE_MONTH':
          liquidity = 1;
          break;
        case 'TWO_MONTHS':
          liquidity = 2;
          break;
        case 'THREE_MONTHS':
          liquidity = 3;
          break;
        case 'SIX_MONTHS':
          liquidity = 6;
          break;
        case 'ONE_YEAR':
          liquidity = 12;
          break;
        case 'TWO_YEARS':
          liquidity = 24;
          break;
      }

      const powerTokenDecimal = new BigNumber(10).pow(tokenDecimal);
      const powerDecimal = new BigNumber(10).pow(decimal);
      const presaleParams = {
        contract_address: PRESALE_GENERATORS[ethereum.networkVersion],
        presale_owner: ethereum.selectedAddress,
        presale_token: dataTokenAddress,
        base_token: baseToken,
        white_list: dataWhiteList,
        uint_params: [
          new BigNumber(hard_cap).multipliedBy(swap_ratio).multipliedBy(powerTokenDecimal).integerValue(BigNumber.ROUND_DOWN).toString(10),
          new BigNumber(swap_ratio).multipliedBy(powerTokenDecimal).integerValue(BigNumber.ROUND_DOWN).toString(10),
          !!isShowMaxAllocation ? new BigNumber(max_allocation_wallet).multipliedBy(powerDecimal).integerValue(BigNumber.ROUND_DOWN).toString(10) : new BigNumber(hard_cap).multipliedBy(powerDecimal).integerValue(BigNumber.ROUND_DOWN).toString(10),
          !!isShowMinAllocation ? new BigNumber(min_allocation_wallet).multipliedBy(powerDecimal).integerValue(BigNumber.ROUND_DOWN).toString(10) : 0,
          new BigNumber(hard_cap).multipliedBy(powerDecimal).integerValue(BigNumber.ROUND_DOWN).toString(10),
          new BigNumber(soft_cap).multipliedBy(powerDecimal).integerValue(BigNumber.ROUND_DOWN).toString(10),
          new BigNumber(10).multipliedBy(initial_liquidity_per).toString(10),
          new BigNumber(swap_ratio).multipliedBy(powerTokenDecimal).dividedBy(listing_rate).integerValue(BigNumber.ROUND_DOWN).toString(10),
          startTime,
          endTime,
          new BigNumber(2592000).multipliedBy(liquidity).integerValue(BigNumber.ROUND_DOWN).toString(10),
          listingTime
        ],
        network_id: ethereum.networkVersion
      }

      setIsModalVisible(true)
      setHandlingType('LAUNCH')
      dispatch(actions.postPresale(presaleParams, (action, data, error) => postPresaleResult(action, data, error, params)))
    }
  }

  const handleTabChange = async (type) => {
    const tab = $('.card-wizard').bootstrapWizard('currentIndex');

    if (type === 'next') {
      let ref = projectRef;
      switch (tab) {
        case 1:
          ref = tokenRef
          break
        case 2:
          ref = salesRef
          break
        default:
          ref = projectRef
          break;
      }

      if (ref.current) {
        // Check token is used
        if (tab === 1 && errorContractAddress) {
          await ref.current.validateForm()
            .then((result) => {
              if (!!Object.values(result).length) {
                Object.keys(result).forEach((x) => ref.current.setFieldTouched(x, true))
                ref.current.setFieldTouched('token_contract_address', true)
              }
              ref.current.setFieldTouched('token_contract_address', true)
              ref.current.setFieldError('token_contract_address', errorContractAddress)
            })
          return
        }
        if (tab === 1 && !errorContractAddress) {
          await ref.current.validateForm((result) => {
            if (!!Object.values(result).length || !ref.current.isValid) {
              Object.keys(result).forEach((x) => ref.current.setFieldTouched(x, true))
            }
          })
        }
        ref.current.handleSubmit()
      }
    } else setCurrentTab(tab);
  }

  const tabValidation = (values, errors = {}) => {
    const projectFields = [
      'project_logo',
      'project_name',
      'project_website',
      'project_twitter',
      'project_telegram',
      'project_medium',
      'project_discord',
      'project_email',
      'project_white_paper',
      'project_additional_info'
    ]
    const errorList = Object.keys(errors)
    const isError = projectFields.some(i => errorList.includes(i));
    if (currentTab === 0 && values.project_name && values.project_website && values.project_email && values.project_additional_info && !isError) return false;
    if (currentTab === 1 && values.token_name && values.payment_currency && values.list_amm) return false;
    if (currentTab === 2) return false;
    return true;
  }

  const _toggleTransactionModal = (isOpen) => {
    setIsModalVisible(!isOpen)
    // setHandlingType(null)
    setHandlingHash(null)
  }

  const _setETH = (address) => getETH(address).then(x => {
    dispatch(actions.setWalletBalance(x))
  })

  const nextStepProject = (values, { resetForm }) => {
    const tab = $('.card-wizard').bootstrapWizard('currentIndex');
    setCurrentTab(+tab + 1);
    setProjectData({ ...values })
    setResetProject(() => resetForm)
    $('.card-wizard').bootstrapWizard('next');
  }

  const nextStepToken = (values, { resetForm }) => {
    const tab = $('.card-wizard').bootstrapWizard('currentIndex');
    setCurrentTab(+tab + 1);
    setTokenData({ ...values })
    setResetToken(() => resetForm)
    $('.card-wizard').bootstrapWizard('next');
  }

  const handleNavigate = (location) => {
    history.push(location)
  }

  return (
    <Fragment>
      <div>
        <div className="card-header text-center">
          <h3 className="card-title">Create Token Sale</h3>
          <div className="wizard-navigation">
            <ul>
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="#projectinfo"
                  data-toggle="tab"
                  role="tab"
                  // onClick={handleTabChange}
                  aria-controls="projectinfo"
                  aria-selected="true"
                  disabled
                >
                  <i className="nc-icon nc-alert-circle-i"></i>Project</a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link`}
                  href="#tokeninfo"
                  data-toggle="tab"
                  role="tab"
                  aria-controls="tokeninfo"
                  // onClick={handleTabChange}
                  onClick={() => { }}
                  aria-selected="true"
                  disabled
                >
                  <i className="nc-icon nc-caps-small"></i>Token
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link`}
                  href="#salesdeatil"
                  data-toggle="tab"
                  role="tab"
                  aria-controls="salesdeatil"
                  // onClick={handleTabChange}
                  onClick={() => { }}
                  aria-selected="true"
                  disabled
                >
                  <i className="nc-icon nc-spaceship"></i>Sales
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="card-body">
          <div className="tab-content pt-0 custom-form">

            <div className="tab-pane show active" id="projectinfo">
              <Formik
                validateOnChange={true}
                validateOnBlur={false}
                initialValues={initDataProject}
                validationSchema={ProjectSchema}
                onSubmit={nextStepProject}
                enableReinitialize
                ref={projectRef}
              >
                {({ errors, touched, values, setFieldValue, handleSubmit, ...form }) => (
                  <Form>
                    <Project
                      errors={errors}
                      touched={touched}
                      values={values}
                      setFieldValue={setFieldValue}
                      createTokenComplete={createTokenComplete}
                      handleNavigate={handleNavigate}
                      currentTab={currentTab}
                      {...form}
                    />
                  </Form>
                )}
              </Formik>
            </div>

            <div className="tab-pane" id="tokeninfo">
              <Formik
                validateOnChange={true}
                validateOnBlur={false}
                initialValues={initFormToken}
                validationSchema={TokenSchema}
                onSubmit={nextStepToken}
                enableReinitialize
                ref={tokenRef}
              >
                {({ errors, touched, values, setFieldValue, handleSubmit, ...form }) => (
                  <Form>
                    <Token
                      setFieldValue={setFieldValue}
                      setFieldValueAddress={(address) => setFieldValue('token_contract_address', address)}
                      errors={errors}
                      touched={touched}
                      addressCreate={dataEthereum?.selectedAddress}
                      values={values}
                      getInfo={requestGetInfoTokenAddress}
                      changeBaseToken={changeBaseToken}
                      changeExchange={changeExchange}
                      isOnUniswap={isOnUniswap}
                      createTokenComplete={createTokenComplete}
                      // errorContractAddress={errorContractAddress}
                      handleNavigate={handleNavigate}
                      currentTab={currentTab}
                      {...form}
                    />
                  </Form>
                )}
              </Formik>
            </div>

            <div className="tab-pane" id="salesdeatil">
              <Formik
                validateOnChange={true}
                validateOnBlur={false}
                initialValues={initDataSales}
                validationSchema={SalesSchema}
                onSubmit={_onSubmitProject}
                enableReinitialize
                ref={salesRef}
              >
                {({ errors, touched, values, setFieldValue, setFieldError, setFieldTouched, handleSubmit, ...form }) => (
                  <Form>
                    <Sales
                      errors={errors}
                      touched={touched}
                      values={values}
                      setFieldValue={setFieldValue}
                      setFieldError={setFieldError}
                      setFieldTouched={setFieldTouched}
                      handleSubmit={handleSubmit}
                      statusButton={statusButton}
                      isShowMaxAllocation={isShowMaxAllocation}
                      setIsShowMaxAllocation={setIsShowMaxAllocation}
                      isShowMinAllocation={isShowMinAllocation}
                      setIsShowMinAllocation={setIsShowMinAllocation}
                      handleCreateToken={handleCreateToken}
                      isOnUniswap={isOnUniswap}
                      setStartTime={setStartTime}
                      setEndTime={setEndTime}
                      setListingTime={setListingTime}
                      dataEthereum={dataEthereum}
                      createTokenComplete={createTokenComplete}
                      tokenData={tokenData}
                      tokenBalance={tokenBalance}
                      handleNavigate={handleNavigate}
                      currentTab={currentTab}
                      handlingType={handlingType}
                      tokensApproved={tokensApproved}
                      setResetSale={setResetSale}
                      {...form}
                    />
                  </Form>
                )}
              </Formik>
            </div>

          </div>
        </div>

        <div className="card-footer">
          <div className="pull-right">
            <input type='button' className={`btn btn-fill btn-rose btn-wd ${currentTab === 2 ? 'disabled' : ''}`} name='next' value='Next' onClick={() => handleTabChange('next')} />
          </div>
          <div className="pull-left">
            <input type='button' className='btn btn-previous btn-fill btn-default btn-wd' name='previous'
              value='Previous' onClick={() => handleTabChange('prev')} />
          </div>
          <div className="clearfix"></div>
        </div>
      </div>

      <StatusModal
        isModalVisible={isModalVisible}
        toggleModal={_toggleTransactionModal}
        handlingHash={handlingHash}
        tokenName={tokenName}
        type={handlingType}
      />
    </Fragment>

  )
}

export default CreateTokenSaleForm
