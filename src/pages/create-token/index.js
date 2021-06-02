import React, { Component } from 'react'
import { Formik, Form } from 'formik'
import { object, string, number } from 'yup'
import { withLocalize } from 'react-localize-redux'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

import { errorForm, SuccessMsg, TRANSACTION } from '@/constants'
import { actions, TYPES } from '@/store/actions'
import { getETH } from '@/utils/ethereum'
import { valuesTrim } from '@/utils/values-trim'
import { validFormMinMaxNumber } from '@/utils/project'
import regex from '@/utils/regex'
import _ from 'lodash';

// Components
import Field from '@/components/field'
import Input from '@/components/input'
import Button from '@/components/button'
import TableToken from './table-token'
import TokenStatusModal from './token-status-modal'
import { pushNotify, dismissNotify } from '@/components/toast'

import './style.scss'

@withLocalize
@withRouter
@connect((state) => ({
  tokenStore: state.token,
}), {
  generateToken: actions.generateToken,
  createToken: actions.createToken,
  setWalletBalance: actions.setWalletBalance,
  getTokens: actions.getTokens,
  getGasPrice: actions.getGasPrice
})
class CreateToken extends Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.subString = _.debounce(this.subString, 700)
  }
  componentDidMount() {
    if (typeof window.ethereum !== 'undefined') {
      this.setState({ ethereum: window.ethereum })
    }
    const { getTokens } = this.props
    getTokens()
  }

  componentWillUnmount() {
    dismissNotify()
  }

  _onSubmit = async (values, { resetForm }) => {
    const { ethereum } = this.state
    const { createToken, generateToken, getTokens, getGasPrice } = this.props

    const params = valuesTrim(values)

    this.setState({ isModalVisible: true, modalHandlingType: 'CONFIRM', modalHandlingHash: null })
    generateToken(params, (action, data, error) => {
      if (action === TYPES.GENERATE_TOKEN_SUCCESS) {
        getGasPrice(null, async (actionGas, dataGas) => {
          if (actionGas === TYPES.GET_GAS_PRICE_SUCCESS) {
            const gasPrice = dataGas.result
            const transactionParameters = {
              nonce: '0x00', // ignored by MetaMask
              gasPrice, // customizable by user during MetaMask confirmation.
              gas: data.gas, // customizable by user during MetaMask confirmation.
              from: ethereum.selectedAddress, // must match user's active address.
              value: '0x00', // Only required to send ether to the recipient from the initiating external account.
              data: data.data, // Optional, but used for defining smart contract creation and interaction.
              chainId: ethereum.chainId, // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
            };

            // txHash is a hex string
            // As with any RPC call, it may throw an error
            const txHash = await this.getTxHashFromTransaction(transactionParameters);

            if (!txHash?.code) {
              this.setState({ modalHandlingType: 'PENDING', modalHandlingHash: txHash })
              const createTokenParams = {
                ...values,
                token_decimal_place: +values.token_decimal_place,
                token_transaction_hash: txHash,
              }

              createToken(createTokenParams, (act, source, err) => {
                if (act === TYPES.CREATE_TOKEN_FAILURE) {
                  // TODO error message did not appear
                  if (err?.code) {
                    pushNotify('error', err.code)
                  }
                };
              })

              let tx = await ethereum.request({
                method: 'eth_getTransactionReceipt',
                params: [txHash],
              })

              while (!tx || !tx.blockHash) {
                // TODO request timeout
                await new Promise(resolve => setTimeout(resolve, 1000));
                tx = await ethereum.request({
                  method: 'eth_getTransactionReceipt',
                  params: [txHash],
                })
              }

              window.ethereum && this._setETH(window.ethereum.selectedAddress)

              if (tx.status === TRANSACTION.TRANSACTION_STATUS.FAILED) {
                this.setState({ modalHandlingType: 'FAILED' })
                pushNotify('error', 'Transaction Failed')
              } else if (tx.contractAddress) {
                getTokens()
                this.setState({ modalHandlingType: 'COMPLETED' })
                resetForm({
                  token_sale: ethereum?.selectedAddress || '',
                  token_decimal_place: '18'
                })
              }
            }
          }
        })
      } else if (TYPES.GENERATE_TOKEN_FAILURE) {
        if (error?.code) {
          this.setState({ modalHandlingType: 'FAILED' })
          pushNotify('error', error.code)
        }
      }
    })
  }

  getTxHashFromTransaction = async (transactionParameters) => {
    try {
      return await ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      })
    } catch (error) {
      /** Transaction rejected */
      if (error.code === 4001) {
        this.setState({ modalHandlingType: 'REJECTED' })
      }
      return error
    }
  }

  closeModal = () => {
    this.setState({ isModalVisible: false })
  }

  changeTokenSupply = (e, form) => {
    const parts = e.target.value.split('.');
    const limit = Number(form.values.token_decimal_place);
    let decimal = '';
    if (parts[1]) {
      decimal = parts[1].slice(0, limit);
      e.target.value = parts[0] + '.' + decimal
    }
    // Valid min/max
    const errors = {
      min: errorForm.NUMBER_MIN_0,
      max: errorForm.NUMBER_MAX_999999999999
    }
    validFormMinMaxNumber(form, 'token_supply', e.target.value, 0, 999999999999, errors)
  }

  subString = (form, value) => {
    // Valid min/max
    const errors = {
      min: errorForm.NUMBER_MIN_0,
      max: errorForm.NUMBER_MAX_18
    }
    validFormMinMaxNumber(form, 'token_decimal_place', value, 0, 18, errors)
    form.setFieldValue('token_supply', form.values.token_supply ?
      form.values.token_supply.toString().match(new RegExp('^-?\\d+(?:\.\\d{0,' + (value || -1) + '})?'))[0] :
      null)
  }

  _setETH = (address) => getETH(address).then(x => {
    const { setWalletBalance } = this.props
    setWalletBalance(x)
  })

  _renderForm = ({ handleSubmit, ...form }) => {
    const { tokenStore } = this.props
    return (
      <Form className="form">
        <div className="card-header text-center">
          <h3 className="card-title">Create a Token</h3>
          <h5 className="description">You can easily create a native token for your project.</h5>
        </div>
        <div className="card-body pb-5">
          <div className="row justify-content-center">
            <div className="col-sm-6">
              <Field
                form={form}
                className="form-control"
                name="token_name"
                label="Token Name"
                placeholder="1 to 64 Characters"
                component={Input}
              />
              <Field
                form={form}
                className="form-control"
                name="token_symbol"
                label="Token Symbol"
                placeholder="1 to 16 Characters"
                component={Input}
              />
              <Field
                form={form}
                className="form-control"
                name="token_supply"
                label="Token Supply"
                placeholder="0 to 999,999,999,999"
                component={Input}
                onInput={(e) => this.changeTokenSupply(e, form)}
              />
              <Field
                form={form}
                className="form-control"
                name="token_decimal_place"
                label="Decimal Places"
                placeholder="0 to 18"
                component={Input}
                onChange={(e) => {
                  form.setFieldValue('token_decimal_place', e.target.value)
                  this.subString(form, e.target.value)
                }}
              />
              <Field
                form={form}
                name="token_sale"
                label="Token Sale Creator is"
                className="form-control bg-fff text-success font-weight-bold px-0 ft1"
                component={Input}
                disabled
              />
              <Button
                className="btn btn-success btn-lg btn-block"
                iconLeft={<i className="far fa-plus-circle ft12 mr-2"></i>}
                // htmlType="submit"
                loading={!!tokenStore.submitting}
                disabled={
                  !!tokenStore.submitting
                  // || !form.isValid
                }
                onClick={() => {
                  form.validateForm().then((ref) => {
                    if (!!Object.values(ref).length || !form.isValid) {
                      Object.keys(ref).forEach((x) => form.setFieldTouched(x, true))
                    } else {
                      handleSubmit()
                    }
                  })
                }}
              >Create</Button>
            </div>
          </div>
        </div>
      </Form>
    )
  }
  _toggleTransactionModal = (isOpen) => {
    const { isModalVisible, modalHandlingType } = this.state
    if (isModalVisible && modalHandlingType === 'COMPLETED') {
      pushNotify('success', SuccessMsg.CREATE_TOKEN_SUCCESS)
    }
    this.setState({ isModalVisible: !isOpen, modalHandlingHash: null })
  }

  render() {
    const validationSchema = object().shape({
      token_name: string().required(errorForm.REQUIRED).trim().max(255, errorForm.CHAR_MAX_255).nullable()
        .min(1, errorForm.CHAR_MIN_1).max(64, errorForm.CHAR_MAX_64),
      token_symbol: string().required(errorForm.REQUIRED).trim().max(255, errorForm.CHAR_MAX_255).nullable()
        .min(1, errorForm.CHAR_MIN_1).max(16, errorForm.CHAR_MAX_16),
      token_supply: string().matches(regex.decimal, errorForm.IS_NUMBER).required(errorForm.REQUIRED),
      token_decimal_place: string().matches(regex.integer, errorForm.INTEGER).required(errorForm.REQUIRED)
    })

    const { ethereum, isModalVisible, modalHandlingType, modalHandlingHash } = this.state

    const initialValues = {
      token_sale: ethereum?.selectedAddress || '',
      token_decimal_place: '18'
    }

    return (
      <div className="content create-token pt-4">
        <div className="col-xl-10-x col-sm-12 mr-auto ml-auto">
          <div className="card max1280">
            <Formik
              validateOnChange={true}
              validateOnBlur={false}
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={this._onSubmit}
              component={this._renderForm}
              enableReinitialize
            />
          </div>
          <TableToken />
          <TokenStatusModal
            isModalVisible={isModalVisible}
            toggleModal={this._toggleTransactionModal}
            handlingHash={modalHandlingHash}
            type={modalHandlingType}
          />
        </div>
      </div>
    )
  }
}

export default CreateToken
