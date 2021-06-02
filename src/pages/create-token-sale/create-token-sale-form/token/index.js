import React, { useEffect, useState } from 'react'
import Field from '@/components/field'
import { useDebouncedCallback } from 'use-debounce'
import { useSelector } from "react-redux"

import RouteLeavingGuard from '../custom-prompt';

import './style.scss';

const Token = ({
  errors,
  touched,
  values,
  getInfo,
  setFieldValue,
  addressCreate,
  setFieldValueAddress,
  isOnUniswap,
  changeBaseToken,
  changeExchange,
  setValues,
  createTokenComplete,
  handleNavigate,
  currentTab,
  // errorContractAddress,
  ...form
}) => {
  const formObj = { errors, touched, values, getInfo, setFieldValue, addressCreate, setFieldValueAddress, isOnUniswap, setValues, ...form }
  useEffect(() => {
    // init bootstrap-tokentokenSelectPicker for this component
    if ($(".tokenSelectPicker").length != 0) {
      $(".tokenSelectPicker").selectpicker({
        iconBase: "nc-icon",
        tickIcon: "nc-check-2"
      });
    }
  }, []);

  const { infoTokenAddress } = useSelector((state) => state.project)

  const debounced = useDebouncedCallback((value) => {
    getInfo(value, setFieldValue, values, setValues);
  }, 1000);

  const preventOnChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
  }

  const ETH_PAYMENT = ['ETH', 'USDT']
  const BSC_PAYMENT = ['BNB', 'BUSD']
  const bscNetworkIds = [56, 97]
  const currentNetworkId = +ethereum.networkVersion;
  const isBscNetwork = bscNetworkIds.includes(+currentNetworkId);
  return (
    <>
      <RouteLeavingGuard
        when={currentTab === 1}
        navigate={handleNavigate}
      />
      <h5 className="info-text"> What kind of tokens do you sell? </h5>
      <div className="row justify-content-center">
        <div className="col-lg-5">
          <div className="form-group">
            <label>Enter Your Token Contract Address</label>
            <Field
              name="token_contract_address"
              type="text"
              placeholder="Token Contract Address"
              className="form-control"
              form={formObj}
              // error={errorContractAddress}
              onChange={(e) => {
                setFieldValue('token_name', null)
                setFieldValueAddress(e.target.value)
                debounced(e.target.value)
              }}
              readOnly={createTokenComplete} />
            {/* {errors.token_contract_address && touched.token_contract_address ? <div>{errors.token_contract_address}</div> : null} */}
          </div>
          {
            isOnUniswap && (values?.list_amm === 'Uniswap' || values?.list_amm === 'Pancakeswap') && (
              <div className="alert alert-info alert-with-icon alert-dismissible fade show" data-notify="container">
                <button type="button" aria-hidden="true" className="close" data-dismiss="alert" aria-label="Close">
                  <i className="nc-icon nc-simple-remove"></i>
                </button>
                <span data-notify="icon" className="nc-icon nc-bell-55"></span>
                <span className="message" data-notify="message">
                  <span className="bold-message">
                    {values?.payment_currency} / {infoTokenAddress?.tokenSymbol} pair
                    </span>
                  <br />
                  <span className="bold-message">
                    already has liqudity on {values?.list_amm}.
                    </span>
                  <br />
                  <span>
                    You cannot create a sale for this pair.
                    </span>
                </span>
              </div>
            )
          }
          <div className="form-group">
            <label>Token Name</label>
            <Field name="token_name" onChange={preventOnChange} type="text" className="form-control" disabled={true} form={formObj} />
            {/* {errors.token_name && touched.token_name ? <div>{errors.token_name}</div> : null} */}
          </div>
          <div className="row">
            <div className="col-lg-6 d-flex align-items-center">
              <div className="ft09">Buyers participate with</div>
            </div>
            <div className="col-lg-6">
              <div className={`form-group ${createTokenComplete ? 'pe-none' : ''}`}>
                <Field
                  name="payment_currency"
                  component="select"
                  className="tokenSelectPicker ft1"
                  data-style="select-with-transition"
                  title="Choose"
                  form={formObj}
                  onChange={e => { changeBaseToken(e, setFieldValue, values) }}
                >
                  {
                    isBscNetwork ?
                      BSC_PAYMENT.map((item, index) => (<option key={index} value={item}>{item}</option>))
                      :
                      ETH_PAYMENT.map((item, index) => (<option key={index} value={item}>{item}</option>))
                  }
                </Field>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-6 d-flex align-items-center pr-0">
              <div className="ft09">Which exchange will list on?</div>
            </div>
            <div className="col-lg-6">
              <div className={`form-group ${createTokenComplete ? 'pe-none' : ''}`}>
                <Field
                  name="list_amm"
                  component="select"
                  className="tokenSelectPicker ft1"
                  data-style="select-with-transition"
                  title="Choose"
                  id="list_amm"
                  form={formObj}
                  onChange={e => {
                    setFieldValue('list_amm', `${e.target.value}`)
                    changeExchange(e, values)
                  }}
                >
                  {
                    isBscNetwork ?
                      (<option value="Pancakeswap">Pancakeswap</option>)
                      :
                      (<option value="Uniswap">Uniswap</option>)
                  }
                </Field>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          {(infoTokenAddress?.tokenSymbol && values?.list_amm && values?.payment_currency && values?.token_name) && (
            <div className="form-group no-error">
              <div className="currency">
                <label>{values.list_amm} pair to be created</label>
                <input
                  type="text"
                  readOnly
                  className="form-control bg-fff font-weight-bold text-success valid"
                  value={`${values?.payment_currency} / ${infoTokenAddress.tokenSymbol}`}
                />
              </div>
            </div>
          )}
          <div className="form-group no-error">
            <div>
              <label>Token Sale Creator is</label>
              <input
                type="text"
                readOnly
                className="form-control bg-fff font-weight-bold text-success valid"
                value={addressCreate}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Token
