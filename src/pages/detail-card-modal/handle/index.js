import React, { Component, Fragment } from 'react'
import { Formik, Form } from 'formik'
import { object, string } from 'yup'
import { connect } from 'react-redux'
import moment from 'moment'

import { floorToNearestFraction } from '@/utils/calc'
import { bigNumber10PowFloorRounded, bigNumber10Pow, numberToString } from '../../../utils/format'
import regex from "@/utils/regex"
import { checkProjectType, convertBaseCurrency, validFormMinMaxNumber } from '../../../utils/project'
import { errorForm, SYSTEM } from '../../../constants'

/** component */
import Field from '@/components/field'
import Input from '@/components/input'
import { pushNotify, dismissNotify } from '@/components/toast'

/** asset */
import './style.scss'
import BigNumber from 'bignumber.js'

@connect((state) => ({
  presaleStore: state.presale,
}))
class InfoDetailCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isSafetyAlert: true
    }
  }

  componentWillUnmount() {
    dismissNotify()
  }

  _isWhiteList = (project, dataEthereum) => {
    const isInWhiteList = Array.isArray(project?.sale?.white_lists)
      ? project.sale.white_lists.some((x) => x.whitelist_wallet_address.toUpperCase() === dataEthereum?.selectedAddress?.toUpperCase())
      : false
    return project?.sale?.access_type?.toUpperCase() === SYSTEM.ACCESS_TYPE.PRIVATE && isInWhiteList
  }

  _isStart = (time) => {
    const startTime = new moment(time)
    const currentTime = new moment()
    if (currentTime.isAfter(startTime)) return false
    return true
  }

  _handleChangeAmount = (e, setFieldValue) => {
    if (regex.decimalNumber.test((e.target.value))) {
      setFieldValue('amount', e.target.value)
    } else if (!e.target.value) {
      setFieldValue('amount', '')
    }
  }

  _checkMinMax = (form, value) => {
    const { project, presaleStore } = this.props
    const { buyer } = presaleStore
    const deposited = convertBaseCurrency(project?.payment_currency, buyer?.baseDeposited)
    const maxCap = new BigNumber(project?.sale?.max_allocation_wallet).minus(deposited).toString(10)
    const errors = {
      min: errorForm.IS_NUMBER_MIN,
      max: errorForm.IS_NUMBER_MAX
    }
    validFormMinMaxNumber(
      form,
      'amount',
      value,
      project?.sale?.min_allocation_wallet_limit ? project?.sale?.min_allocation_wallet : null,
      project?.sale?.max_allocation_wallet_limit ? maxCap : null,
      errors
    )
  }

  _renderForm = ({ handleSubmit, ...form }) => {
    const { isSafetyAlert } = this.state
    const { balanceForm, dataEthereum, project } = this.props

    const { type } = checkProjectType(project)
    const isWhiteList = this._isWhiteList(project, dataEthereum)
    const isStart = this._isStart(project?.sale?.sale_start_time)
    const isDisabledSubmit = !isWhiteList && project?.sale?.access_type?.toUpperCase() !== SYSTEM.ACCESS_TYPE.PUBLIC
    return (
      <Form className="form">
        <div className="swap-wrapper">
          <div className="row">
            <div className="col-12 text-right ft07 pr-5">
              <a
                style={{ cursor: 'pointer' }}
                className="badge badge-light badge-btn px-2 py-1 text-secondary"
                onClick={() => {
                  form.setFieldValue('amount', bigNumber10PowFloorRounded(balanceForm))
                  this._checkMinMax(form, bigNumber10Pow(balanceForm))
                }}
              >
                Balance: <span className="font-weight-bold">{floorToNearestFraction(balanceForm, 2)}</span>
              </a>
            </div>
            <div className="col-2"></div>
            <div className="col-7">
              <Field
                form={form}
                className="form-control swap-input custom-swap-input"
                name="amount"
                placeholder="0.0"
                component={Input}
                disabled={!!isDisabledSubmit || !!isSafetyAlert || isStart}
                onChange={(e) => {
                  this._handleChangeAmount(e, form.setFieldValue)
                  this._checkMinMax(form, bigNumber10Pow(e.target.value))
                }}
              />
            </div>
            <div className="col-3">
              <div className="form-group pt-2">
                <Field
                  form={form}
                  className="form-control bg-fff"
                  readOnly
                  name="unit"
                  component={Input}
                />
              </div>
            </div>
            <div className={`col-12 text-center ${form.errors?.amount ? 'mt-3' : 'mt-2'}`}>
              <button
                type="button"
                className="btn btn-light"
                disabled={!!isDisabledSubmit || !!isSafetyAlert || isStart}
                onClick={() => {
                  form.setFieldValue('amount', bigNumber10PowFloorRounded(balanceForm / 4))
                  this._checkMinMax(form, bigNumber10Pow(balanceForm / 4))
                }}
              >25%</button>
              <button
                type="button"
                className="btn btn-light"
                disabled={!!isDisabledSubmit || !!isSafetyAlert || isStart}
                onClick={() => {
                  form.setFieldValue('amount', bigNumber10PowFloorRounded(balanceForm / 2))
                  this._checkMinMax(form, bigNumber10Pow(balanceForm / 2))
                }}
              >50%</button>
              <button
                type="button"
                className="btn btn-light"
                disabled={!!isDisabledSubmit || !!isSafetyAlert || isStart}
                onClick={() => {
                  form.setFieldValue('amount', bigNumber10PowFloorRounded(balanceForm * 3 / 4))
                  this._checkMinMax(form, bigNumber10Pow(balanceForm * 3 / 4))
                }}
              >75%</button>
              <button
                type="button"
                className="btn btn-light"
                disabled={!!isDisabledSubmit || !!isSafetyAlert || isStart}
                onClick={() => {
                  form.setFieldValue('amount', bigNumber10PowFloorRounded(balanceForm))
                  this._checkMinMax(form, bigNumber10Pow(balanceForm))
                }}
              >100%</button>
            </div>
          </div>
        </div>
        <div className="text-center">
          <i className="fal fa-angle-double-down fa-2x"></i>
          <p className="font-weight-bold mb-0">You get</p>
          <p className="font-weight-bold">
            <span className="h4 pr-2">{numberToString(bigNumber10Pow((form.values.amount || 0) * Number(project?.sale?.swap_ratio)))}</span>
            <span>{project?.token_symbol}</span>
          </p>
        </div>
        <div className="col-12 text-center">
          <button
            type="button"
            className="btn btn-success btn-lg btn-block"
            disabled={
              !!isDisabledSubmit
              || !!isSafetyAlert
              || type !== SYSTEM.TOKEN_SALES_TIMES.LIVE
              || isStart
              // || !form.isValid
            }
            onClick={() => !!form.isValid && handleSubmit()}
          >Purchase</button>
          <span className="ft06">Please read the safety alert carefully and click the "Understand" button.</span>
        </div>
      </Form>
    )
  }

  _onSubmit = (values, { resetForm }) => {
    const { onHandle, project } = this.props
    if (moment(project.sale.sale_end_time) <= moment()) {
      pushNotify('error', errorForm.TIME_HAS_PASSED)
    } else {
      onHandle(values, resetForm)
    }
  }

  render() {
    const { fieldAmount, project, dataEthereum, presaleStore } = this.props
    const { buyer } = presaleStore

    const deposited = convertBaseCurrency(project?.payment_currency, buyer?.baseDeposited)

    const maxCap = new BigNumber(project?.sale?.max_allocation_wallet).minus(deposited).toString(10)
    const alreadyParticipateIn = deposited !== '0'

    const isWhiteList = this._isWhiteList(project, dataEthereum)
    let buyAbout
    if (project?.sale?.min_allocation_wallet_limit && project?.sale?.max_allocation_wallet_limit) {
      buyAbout = !alreadyParticipateIn ? (
        <span className="ft08 font-weight-bold"><u>
          {`can buy from ${project?.sale?.min_allocation_wallet} to ${maxCap} ${project?.payment_currency}`}
        </u></span>
      ) : (
        <span className="ft08 font-weight-bold"><u>
          {`already spent ${deposited}, still can buy up to ${maxCap} ${project?.payment_currency} more`}
        </u></span>
      )
    } else if (!project?.sale?.min_allocation_wallet_limit && project?.sale?.max_allocation_wallet_limit) {
      buyAbout = !alreadyParticipateIn ? (
        <span className="ft08 font-weight-bold"><u>
          {`can buy up to ${maxCap} ${project?.payment_currency}`}
        </u></span>
      ) : (
        <span className="ft08 font-weight-bold"><u>
          {`already spent ${deposited}, still ${maxCap} ${project?.payment_currency} left till reach the limit`}
        </u></span>
      )
    } else if (project?.sale?.min_allocation_wallet_limit && !project?.sale?.max_allocation_wallet_limit) {
      buyAbout = (
        <span className="ft08 font-weight-bold"><u>
          {`can buy from ${project?.sale?.min_allocation_wallet} to no limit ${project?.payment_currency}`}
        </u></span>
      )
    }

    const validationSchema = object().shape({
      amount: string().matches(regex.decimal0, errorForm.GREATER_THAN_0).required(errorForm.REQUIRED).nullable()
    })

    return (
      <Fragment>
        <div className="col-lg-6 handle-detail-card">
          <div className="alert alert-warning alert-dismissible safety-alert fade show">
            <div className="img-container text-left">
              <i className="fas fa-exclamation-triangle fa-2x mr-2"></i>
              <span className="font-weight-bold">Safety Alert</span>
            </div>
            <p className="ft08 mb-0">
              This is a decentralised and open tokensale platform. Anyone can create and name a presale freely including fake versions of existing tokens. It is also possible for developers of a token to mint near infinite tokens and dump them on locked liquidity. Please do your own research before using this platform.
          </p>
            <div className="text-right">
              <button type="button" aria-hidden="true" className="btn btn-warning btn-link" data-dismiss="alert" aria-label="Close" onClick={() => this.setState({ isSafetyAlert: false })}>
                Understand
            </button>
            </div>
          </div>

          <div className="card card-stats border_light">
            <div className="card-body">
              <div className="text-center py-3">
                <span className="font-weight-bold h5">Spend how much {project?.payment_currency}?</span>
              </div>
              {!!isWhiteList && (
                <div className="img-container text-secondary mb-2">
                  <i className="fad fa-user-check ft12 pr-2"></i>
                  <span className="ft08 pr-2">You have the right to participate in the sale.(Whitelist)</span>
                </div>
              )}
              <div className="img-container text-secondary">
                <i className="fad fa-wallet ft12 pr-2"></i>
                <span className="ft08 pr-2">You </span>
                {buyAbout ? buyAbout : <span className="ft08 font-weight-bold"><u>can buy no limit</u></span>}
              </div>
              <Formik
                validateOnChange={true}
                validateOnBlur={false}
                initialValues={{ amount: fieldAmount, unit: project?.payment_currency }}
                validationSchema={validationSchema}
                onSubmit={this._onSubmit}
                component={this._renderForm}
                enableReinitialize
              />
            </div>
            <div className="card-footer ">
              <hr />
              <div>
                <p className="mb-0">
                  <i className="fad fa-siren-on ft12 pr-2"></i>
                  <span className="ft06">
                    If do not reach the soft cap, will be refund.
                  <br />Your tokens will be locked in the contract until the presale has concluded.
                </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Fragment>

    )
  }
}

export default InfoDetailCard
