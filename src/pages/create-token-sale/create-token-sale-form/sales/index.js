import React, { useState, useEffect } from 'react'
import { useSelector } from "react-redux"
import BigNumber from 'bignumber.js'
import * as moment from 'moment'

import { calculateFund } from '@/utils/calc'
import regex from "@/utils/regex"
import { timestampToBlock, isValidWalletAddress } from '@/utils/web3'
import { numberToString, bigNumber10Pow } from '@/utils/format'
import { getPrecision } from '@/utils/project'
import { errorForm, SYSTEM } from '@/constants'
import { getCSV } from '@/utils/csv'
import { isStringEmpty } from '@/utils/function'

// components
import Field from '@/components/field'
import { pushNotify } from '@/components/toast'
import RouteLeavingGuard from '../custom-prompt';

const Sales = ({
  errors,
  touched,
  values,
  setFieldValue,
  setFieldError,
  setFieldTouched,
  handleSubmit,
  statusButton,
  isShowMaxAllocation,
  setIsShowMaxAllocation,
  isShowMinAllocation,
  setIsShowMinAllocation,
  handleCreateToken,
  isOnUniswap,
  setStartTime,
  setEndTime,
  setListingTime,
  dataEthereum,
  createTokenComplete,
  tokenData,
  tokenBalance,
  handleNavigate,
  currentTab,
  handlingType,
  tokensApproved,
  resetForm,
  setResetSale,
  ...form
}) => {
  const formObj = { errors, touched, values, setFieldValue }

  const [isShowCSVWhitelist, setIsShowCSVWhitelist] = useState(false);
  const [csvFileName, setCsvFileName] = useState('Choose CSV file');

  const [salePrediction, setSalePrediction] = useState(0);
  const [ethLiquidity, setEthLiquidity] = useState(0);
  const [yourETH, setYourETH] = useState(0);
  const [fortLiquidity, setFortLiquidity] = useState(0);
  const [fortSold, setFortSold] = useState(0);
  const [daoLaunchFee, setDaoLaunchFee] = useState(0);
  const [customErrors, setCustomErrors] = useState({});

  const handleChangeSalePrediction = (newSalePrediction, field, fieldValue) => {
    const {
      calcDaoLaunchFee,
      calcEthLiquidity,
      calcFortLiquidity,
      calcYourETH,
      calcFortSold,
    } = calculateFund(newSalePrediction, field ? { ...values, [field]: fieldValue } : values);

    setDaoLaunchFee(calcDaoLaunchFee);
    setEthLiquidity(calcEthLiquidity);
    setFortLiquidity(calcFortLiquidity);
    setYourETH(calcYourETH);
    setFortSold(calcFortSold);

    if (field) setFieldValue(field, fieldValue);
    else setSalePrediction(newSalePrediction);
  }

  const { infoTokenAddress } = useSelector((state) => state.project)

  useEffect(() => {
    // init bootstrap-select for this component
    setResetSale(() => resetForm)
    if ($(".saleSelectPicker").length != 0) {
      $(".saleSelectPicker").selectpicker({
        iconBase: "nc-icon",
        tickIcon: "nc-check-2"
      });
    }

    const saleStartTimeElm = $('#sale_start_time');
    const saleEndTimeElm = $('#sale_end_time');
    const listingTimeElm = $('#listing_time');
    saleStartTimeElm.on('dp.change', (e) => setFieldValue('sale_start_time', e.target.value));
    saleEndTimeElm.on('dp.change', (e) => setFieldValue('sale_end_time', e.target.value));
    listingTimeElm.on('dp.change', (e) => setFieldValue('listing_time', e.target.value));

    return function cleanup() {
      saleStartTimeElm.off('dp.change');
      saleEndTimeElm.off('dp.change');
      listingTimeElm.off('dp.change');
    }
  }, []);

  useEffect(() => {
    if (values.sale_allocation && values.swap_ratio && values.listing_rate && values.initial_liquidity_per) {
      const part = new BigNumber(1).minus(SYSTEM.DAOLaunchFee).multipliedBy(values.initial_liquidity_per).dividedBy(100).plus(values.listing_rate)
      const hardCap = new BigNumber(values.sale_allocation).multipliedBy(values.listing_rate).dividedBy(values.swap_ratio).dividedBy(part)
      const softCap = new BigNumber(values.soft_cap)
      const maxAllocation = new BigNumber(values.max_allocation_wallet)
      setFieldValue('hard_cap', hardCap.decimalPlaces(0, 1).toString())

      handleErrors(hardCap.isLessThan(softCap), 'soft_cap', errorForm.SOFT_CAP_ERROR)
      handleErrors(hardCap.isLessThan(maxAllocation), 'max_allocation_wallet', errorForm.MAX_ALLOCATION_INVALID)
    } else {
      setFieldValue('hard_cap', '')
    }
  }, [values.sale_allocation, values.swap_ratio, values.listing_rate, values.initial_liquidity_per])

  const setSoftCap = (e) => {
    if (regex.decimalNumber.test((e.target.value))) {
      const hardCap = new BigNumber(values.hard_cap);
      const softCap = new BigNumber(e.target.value);

      handleErrors(hardCap.isLessThan(softCap), 'soft_cap', errorForm.SOFT_CAP_ERROR)
      setFieldValue('soft_cap', e.target.value)
      handleChangeSalePrediction(e.target.value)
    } else if (!e.target.value) {
      setFieldValue('soft_cap', '')
      handleChangeSalePrediction(0)
    }
  }

  const setSwapRatio = (e) => {
    if (regex.decimalNumber.test((e.target.value))) {
      setFieldValue('swap_ratio', e.target.value)
    } else if (!e.target.value) {
      setFieldValue('swap_ratio', '')
    }
  }

  const handleChangeFile = async (e) => {
    const selectedFile = e.target.files[0];
    let isError = false
    let listAddress
    if (selectedFile) {
      const extension = selectedFile.name.split('.').pop();
      if (extension !== "csv") {
        setFieldValue('whitelist_address', null);
        setCsvFileName('Choose CSV file')
        pushNotify('error', errorForm.INVALID_CSV_FILE);
        return;
      }

      const csvData = await getCSV(selectedFile, 'whitelist_address');
      if (csvData && csvData.length) {
        listAddress = csvData.filter(data => !isStringEmpty(data) || /\S/.test(data));
        isError = listAddress.some((x) => !isValidWalletAddress(x))
      } else {
        isError = true
      }

      if (!!isError) {
        setFieldValue('whitelist_address', null);
        setCsvFileName('Choose CSV file')
        pushNotify('error', errorForm.INVALID_WHITELIST);
        return;
      }

      if (extension === "csv" && !isError) {
        setCsvFileName(selectedFile.name);
        setFieldValue('whitelist_address', selectedFile);
      }
    }
  }

  const handleChangeMaxAllocation = (e) => {
    const value = e.target.value;
    if (regex.decimalNumber.test((value))) {
      setFieldValue('max_allocation_wallet', value)
      const hardCap = new BigNumber(values.hard_cap);
      handleErrors(hardCap.isLessThan(value), 'max_allocation_wallet', errorForm.MAX_ALLOCATION_INVALID)

      const minAllocation = new BigNumber(values.min_allocation_wallet)
      handleErrors(minAllocation.isGreaterThanOrEqualTo(value), 'min_allocation_wallet', errorForm.MIN_ALLOCATION_INVALID)
    } else if (!value) {
      setFieldValue('max_allocation_wallet', '')
    }
  }

  const handleChangeMinAllocation = (e) => {
    const value = e.target.value;
    if (regex.decimalNumber.test((value))) {
      setFieldValue('min_allocation_wallet', value)
      const maxAllocation = new BigNumber(values.max_allocation_wallet);
      handleErrors(maxAllocation.isLessThanOrEqualTo(value), 'min_allocation_wallet', errorForm.MIN_ALLOCATION_INVALID)
    } else if (!value) {
      setFieldValue('min_allocation_wallet', '')
    }
  }

  const handleErrors = (condition, field, error) => {
    if (condition) {
      setCustomErrors(prevStates => ({
        ...prevStates,
        [field]: error
      }))
    } else if (customErrors[field]) {
      const newErrors = customErrors;
      delete newErrors[field]
      setCustomErrors({ ...newErrors })
    }
  }

  const isValidStartTime = (value) => {
    if (!value) return
    let error
    if (moment(value).valueOf() < moment().valueOf()) {
      error = errorForm.INVALID_TIME_NOW
    }
    if (moment(value).valueOf() >= moment(values.sale_end_time).valueOf()) {
      error = errorForm.INVALID_START_TIME
    }
    form.validateForm().then(() => {
      setFieldTouched('sale_start_time', true)
      if (error) {
        setFieldError('sale_start_time', error)
      }
    })
    return !!error
  }

  const isValidEndTime = (value) => {
    if (!value) return
    let error
    if (moment(value).valueOf() < moment().valueOf()) {
      error = errorForm.INVALID_TIME_NOW
    }
    if (moment(value).valueOf() >= moment(values.listing_time).valueOf()) {
      error = errorForm.INVALID_END_TIME
    }
    if (moment(value).valueOf() < moment(values.sale_start_time).valueOf()) {
      error = errorForm.INVALID_SALE_TIME
    }
    form.validateForm().then(() => {
      setFieldTouched('sale_end_time', true)
      if (error) {
        setFieldError('sale_end_time', error)
      }
    })
    return !!error
  }

  const isValidListingDate = (value) => {
    if (!value) return
    let error
    if (moment(value).valueOf() < moment().valueOf()) {
      error = errorForm.INVALID_TIME_NOW
    }
    if (moment(value).valueOf() < moment(values.sale_end_time).valueOf()) {
      error = errorForm.INVALID_LISTING_TIME
    }
    form.validateForm().then(() => {
      setFieldTouched('listing_time', true)
      if (error) {
        setFieldError('listing_time', error)
      }
    })
    return !!error
  }

  const countNumber = values?.soft_cap ? getPrecision(values.soft_cap) : 0
  const rateSalePrediction = 1 / bigNumber10Pow(1, countNumber)

  const disableApprove = tokensApproved === '0' ? statusButton : new BigNumber(tokensApproved).isGreaterThan(values?.sale_allocation)
  return (
    <>
      <RouteLeavingGuard
        when={currentTab === 2 && handlingType !== 'LAUNCHED'}
        navigate={handleNavigate}
        isPreventLaunch={statusButton}
      />
      <div className="row justify-content-center">
        <div className="col-sm-12">
          <h5 className="info-text">Please set the sale outline </h5>
        </div>
        <div className="col-sm-12">
          <div className="card card-nav-tabs card-plain">
            <div className="tab-pane active">
              <div className="row justify-content-center">
                <div className="col-lg-5">

                  <div className="row">
                    <div className="col-9 pr-0">
                      <div className="d-flex flex-wrap">
                        <label>How many tokens do you sell?</label>
                        <div className="text-right balance-custom">
                          <a className="badge badge-light badge-btn px-2 py-1 text-secondary" onClick={() => setFieldValue('sale_allocation', bigNumber10Pow(tokenBalance))}>
                            Balance: <span className="font-weight-bold">{numberToString(tokenBalance)}</span>
                          </a>
                        </div>
                      </div>
                      <div className="form-group">
                        <Field
                          name="sale_allocation"
                          type="text"
                          placeholder="Sale Allocation"
                          className="form-control"
                          onChange={(e) => {
                            if (regex.decimalNumber.test(e.target.value)) {
                              setFieldValue('sale_allocation', e.target.value)
                            } else if (!e.target.value) setFieldValue('sale_allocation', '')
                          }}
                          form={formObj}
                          readOnly={createTokenComplete}
                        />
                      </div>
                    </div>
                    <div className="col-3 px-0">
                      <div className="form-group">
                        <label>　</label>
                        <input type="text" readOnly className="form-control bg-fff" defaultValue={infoTokenAddress?.tokenSymbol || ''} />
                      </div>
                    </div>
                    {/* {errors.sale_allocation && touched.sale_allocation ? <div>{errors.sale_allocation}</div> : null} */}
                  </div>

                  <div className="row">
                    <div className="col-12">
                      <label>Decide Swap Ratio</label>
                    </div>
                    <div className="col-3 pr-0">
                      <div className="form-group">
                        <input type="text" readOnly className="form-control bg-fff pl-0" value={`1 ${tokenData?.payment_currency}=`} />
                      </div>
                    </div>
                    <div className="col-6 px-0">
                      <div className="form-group">
                        <Field
                          name="swap_ratio"
                          type="text"
                          placeholder="Swap Ratio"
                          className="form-control"
                          onChange={setSwapRatio}
                          form={formObj}
                          readOnly={createTokenComplete}
                        />
                      </div>
                    </div>
                    <div className="col-3 px-0">
                      <div className="form-group">
                        <input type="text" readOnly className="form-control bg-fff" defaultValue={infoTokenAddress?.tokenSymbol || ''} />
                      </div>
                    </div>
                    {/* {errors.swap_ratio && touched.swap_ratio ? <div>{errors.swap_ratio}</div> : null} */}
                  </div>

                  <div className="row">
                    <div className="col-9 pr-0">
                      <label>Hard Cap</label>
                      <div className="form-group">
                        <Field readOnly name="hard_cap" type="text" placeholder="Hard Cap" className="form-control" form={formObj} />
                      </div>
                    </div>
                    <div className="col-3 px-0">
                      <div className="form-group">
                        <label>　</label>
                        <input type="text" readOnly className="form-control bg-fff" defaultValue={tokenData?.payment_currency} />
                      </div>
                    </div>
                    {errors.hard_cap && touched.hard_cap ? <div>{errors.hard_cap}</div> : null}
                  </div>

                  <div className="row">
                    <div className="col-9 pr-0">
                      <label>Soft Cap</label>
                      <div className="form-group">
                        <Field
                          name="soft_cap"
                          type="text"
                          placeholder="Soft Cap"
                          className="form-control"
                          onChange={setSoftCap}
                          form={formObj}
                          error={customErrors.soft_cap}
                          readOnly={createTokenComplete}
                        />
                      </div>
                    </div>
                    <div className="col-3 px-0">
                      <div className="form-group">
                        <label>　</label>
                        <input type="text" readOnly className="form-control bg-fff" defaultValue={tokenData?.payment_currency} />
                      </div>
                    </div>
                    {/* {errors.soft_cap && touched.soft_cap ? <div>{errors.soft_cap}</div> : null} */}
                  </div>

                  <div className="row">
                    <div className="col-12">
                      <label>Max. Allocation Per Wallet</label>
                    </div>
                    <div className="col-lg-5">
                      <div className={`form-group ${createTokenComplete ? 'pe-none' : ''}`}>
                        <select
                          name="max_allocation_wallet_limit"
                          className="saleSelectPicker"
                          data-style="select-with-transition"
                          id="max_allocation_wallet"
                          onChange={(e) => {
                            setFieldValue('max_allocation_wallet_limit', e.target.value === 'true' ? true : false)
                            setIsShowMaxAllocation(e.target.value === 'true' ? true : false)
                            setFieldValue('max_allocation_wallet', '')
                            if (e.target.value === 'false') {
                              setFieldError('max_allocation_wallet', undefined)
                              handleErrors(null, 'max_allocation_wallet', undefined)
                              if (customErrors.min_allocation_wallet === errorForm.MIN_ALLOCATION_INVALID) {
                                handleErrors(null, 'min_allocation_wallet', undefined)
                              }
                            }
                          }}>
                          <option value="false">No Limit</option>
                          <option value="true">Set Limits</option>
                        </select>
                      </div>
                    </div>
                    {isShowMaxAllocation && (
                      <>
                        <div className="col px-0sp" id="mx_hideswitch1">
                          <div className="form-group no-wrap">
                            <Field
                              name="max_allocation_wallet"
                              type="text"
                              placeholder="Max. Allocation"
                              className="form-control"
                              form={formObj}
                              readOnly={createTokenComplete}
                              onChange={handleChangeMaxAllocation}
                              error={customErrors.max_allocation_wallet}
                            />
                          </div>
                        </div>
                        <div className="col-3 px-0" id="mx_hideswitch2">
                          <div className="form-group">
                            <input type="text" readOnly className="form-control bg-fff" value={tokenData?.payment_currency} />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="row">
                    <div className="col-12">
                      <label>Min. Allocation Per Wallet</label>
                    </div>
                    <div className="col-lg-5">
                      <div className={`form-group ${createTokenComplete ? 'pe-none' : ''}`}>
                        <select
                          name="min_allocation_wallet_limit"
                          className="saleSelectPicker"
                          data-style="select-with-transition"
                          id="min_allocation_wallet"
                          onChange={(e) => {
                            setFieldValue('min_allocation_wallet_limit', e.target.value === 'true' ? true : false)
                            setIsShowMinAllocation(e.target.value === 'true' ? true : false)
                            setFieldValue('min_allocation_wallet', '')
                            if (e.target.value === 'false') {
                              setFieldError('min_allocation_wallet', undefined)
                              handleErrors(null, 'min_allocation_wallet', undefined)
                            }
                          }}>
                          <option value="false">No Limit</option>
                          <option value="true">Set Limits</option>
                        </select>
                      </div>
                    </div>
                    {isShowMinAllocation && (
                      <>
                        <div className="col px-0sp" id="min_hideswitch1">
                          <div className="form-group no-wrap">
                            <Field
                              name="min_allocation_wallet"
                              type="text"
                              placeholder="Min. Allocation"
                              className="form-control"
                              form={formObj}
                              readOnly={createTokenComplete}
                              onChange={handleChangeMinAllocation}
                              error={customErrors.min_allocation_wallet}
                            />
                          </div>
                        </div>
                        <div className="col-3 px-0" id="min_hideswitch2">
                          <div className="form-group">
                            <input type="text" readOnly className="form-control bg-fff" value={tokenData?.payment_currency} />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <label>Access Type</label>
                  <div className={`form-group ${createTokenComplete ? 'pe-none' : ''}`}>
                    <Field name="access_type" component="select" className="saleSelectPicker" title="Choose Access" data-style="select-with-transition" form={formObj}
                      onChange={(e) => {
                        setFieldValue('access_type', e.target.value)
                        setIsShowCSVWhitelist(e.target.value === 'private' ? true : false)
                      }}>
                      <option value="private">Private</option>
                      <option value="public">Public</option>
                    </Field>
                  </div>
                  {/* {errors.access_type && touched.access_type ? <div>{errors.access_type}</div> : null} */}

                  {isShowCSVWhitelist && (
                    <div id="csv_hideswitch1">
                      <label>Whitelist Address CSV Import</label>
                      <div className="custom-file mb-4">
                        <input
                          name="whitelist_address"
                          type="file"
                          className="custom-file-input"
                          id="customFile"
                          accept={SYSTEM.WHITE_LIST_ACCEPT_TYPE.join()}
                          onClick={() => {
                            setCsvFileName('Choose CSV file');
                          }}
                          onChange={handleChangeFile}
                        />
                        <label className="custom-file-label" htmlFor="customFile">{csvFileName}</label>
                      </div>
                      {errors.whitelist_address ? <div className="error-message">{errors.whitelist_address}</div> : null}
                      <div className="alert alert-info alert-with-icon alert-dismissible fade show"
                        data-notify="container">
                        <button type="button" aria-hidden="true" className="close" data-dismiss="alert"
                          aria-label="Close">
                          <i className="nc-icon nc-simple-remove"></i>
                        </button>
                        <span data-notify="icon" className="nc-icon nc-bell-55"></span>
                        <span data-notify="message">First, download the sample csv from <a
                          href="https://drive.google.com/uc?export=download&id=11VwrdZc7RZrCbjWG5_Zke1qk-Aj8IMKk">here.</a></span>
                      </div>
                    </div>
                  )}

                  <div className="row">
                    <div className="col-lg-6">
                      <label>Start Time</label>
                      <div className="form-group">
                        <Field
                          name="sale_start_time"
                          type="text"
                          className="form-control datetimepicker"
                          id="sale_start_time"
                          onBlur={async (e) => {
                            const { value } = e.target
                            isValidEndTime(values.sale_end_time)
                            isValidListingDate(values.listing_time)
                            const error = isValidStartTime(value)
                            if (!error) {
                              const block = await timestampToBlock(`${dataEthereum.networkVersion}`, value)
                              setStartTime(block)
                            }
                          }}
                          form={formObj}
                          readOnly={createTokenComplete}
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-group">
                        <label>End Time</label>
                        <Field
                          name="sale_end_time"
                          type="text"
                          className="form-control datetimepicker"
                          id="sale_end_time"
                          onBlur={async (e) => {
                            const { value } = e.target
                            isValidStartTime(values.sale_start_time)
                            isValidListingDate(values.listing_time)
                            const error = isValidEndTime(value)
                            if (!error) {
                              const block = await timestampToBlock(`${dataEthereum.networkVersion}`, value)
                              setEndTime(block)
                            }
                          }}
                          form={formObj}
                          readOnly={createTokenComplete}
                        />
                      </div>
                      {/* {errors.sale_end_time && touched.sale_end_time ? <div>{errors.sale_end_time}</div> : null} */}
                    </div>
                  </div>

                </div>

                <div className="col-lg-5">
                  <div className={`form-group mb-5 range mh-90 ${createTokenComplete ? 'pe-none' : ''}`}>
                    <label>Uniswap Listing Rate</label>
                    <div className="ft2"><span>{values.listing_rate}</span>x</div>
                    <Field
                      name="listing_rate"
                      type="range"
                      className="form-control-range"
                      min="1"
                      max="3"
                      id="listing_rate_range"
                      step="0.1"
                      form={formObj}
                      onChange={(e) => handleChangeSalePrediction(salePrediction, 'listing_rate', e.target.value)}
                    />
                    {errors.listing_rate && touched.listing_rate ? <div>{errors.listing_rate}</div> : null}
                  </div>

                  <div className={`form-group mb-4 range mh-90 ${createTokenComplete ? 'pe-none' : ''}`}>
                    <label>Percent of raised ETH used for liquidity</label>
                    <div className="ft2"><span>{values.initial_liquidity_per}</span>%</div>
                    <Field
                      name="initial_liquidity_per"
                      type="range"
                      className="form-control-range"
                      min="30"
                      max="100"
                      id="Initial_liquidity_per"
                      step="5"
                      form={formObj}
                      onChange={e => handleChangeSalePrediction(salePrediction, 'initial_liquidity_per', e.target.value)}
                    />
                    {errors.initial_liquidity_per && touched.initial_liquidity_per ? <div>{errors.initial_liquidity_per}</div> : null}
                  </div>

                  <div className="row mb-4">
                    <div className="col-lg-6">
                      <label>Listing Date</label>
                      <div className="form-group">
                        <Field
                          name="listing_time"
                          type="text"
                          className="form-control datetimepicker"
                          id="listing_time"
                          onBlur={async (e) => {
                            const { value } = e.target
                            isValidStartTime(values.sale_start_time)
                            isValidEndTime(values.sale_end_time)
                            const error = isValidListingDate(value)
                            if (!error) {
                              const block = await timestampToBlock(`${dataEthereum.networkVersion}`, e.target.value)
                              setListingTime(block)
                            }
                          }}
                          form={formObj}
                          readOnly={createTokenComplete}
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <label>Lock Liquidity for</label>
                      <div className={`form-group ${createTokenComplete ? 'pe-none' : ''}`}>
                        <Field name="lock_liquidity" component="select" className="saleSelectPicker" title="Choose" data-style="select-with-transition" form={formObj}>
                          <option value="ONE_MONTH">1 Months</option>
                          <option value="TWO_MONTHS">2 Months</option>
                          <option value="THREE_MONTHS">3 Months</option>
                          <option value="SIX_MONTHS">6 Months</option>
                          <option value="ONE_YEAR">1 Year</option>
                          <option value="TWO_YEARS">2 Years</option>
                        </Field>
                      </div>
                      {/* {errors.lock_liquidity && touched.lock_liquidity ? <div>{errors.lock_liquidity}</div> : null} */}
                    </div>
                  </div>

                  <div className="card card-prediction">
                    <div className="card-body ">
                      <h4 className="card-title text-center mt-2 title-sale-prediction">Sale Prediction</h4>
                      <p className="card-description text-center text-dark">
                        Use the slider to check fees and Liquidity, depending on raised amounts in
                        tokensale.
                      </p>

                      <div className={`form-group mb-3 range ${createTokenComplete ? 'pe-none' : ''}`}>
                        <div className="ft2 text-center"><span>{new BigNumber(salePrediction).toString(10)}</span>{tokenData?.payment_currency}</div>
                        <input
                          disabled={!values.soft_cap || !values.hard_cap}
                          name="sale_prediction"
                          type="range"
                          className="form-control-range"
                          min={values.soft_cap}
                          max={values.hard_cap}
                          id="sale_prediction"
                          step={rateSalePrediction}
                          value={salePrediction}
                          onChange={(e) => handleChangeSalePrediction(e.target.value)}
                          readOnly={createTokenComplete}
                        />
                      </div>

                      <div className="row">
                        <div className="col-6">
                          <label>{tokenData?.payment_currency} Liquidity</label>
                          <div className="form-group">
                            <input type="text" readOnly className="form-control bg-fff" value={`${ethLiquidity} ${tokenData?.payment_currency}`} />
                          </div>
                        </div>
                        <div className="col-6">
                          <label>Your {tokenData?.payment_currency}</label>
                          <div className="form-group">
                            <input type="text" readOnly className="form-control bg-fff text-success valid"
                              value={`${yourETH} ${tokenData?.payment_currency}`} />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-6">
                          <label>{infoTokenAddress?.tokenSymbol || ''} Liquidity</label>
                          <div className="form-group">
                            <input type="text" readOnly className="form-control bg-fff" value={`${fortLiquidity} ${infoTokenAddress?.tokenSymbol || ''}`} />
                          </div>
                        </div>
                        <div className="col-6">
                          <label>{infoTokenAddress?.tokenSymbol || ''} Sold</label>
                          <div className="form-group">
                            <input type="text" readOnly className="form-control bg-fff" value={`${fortSold} ${infoTokenAddress?.tokenSymbol || ''}`} />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-6">
                          <label>DAOLaunch Fee</label>
                          <div className="form-group">
                            <input type="text" readOnly className="form-control bg-fff" value={`${daoLaunchFee} ${tokenData?.payment_currency}`} />
                          </div>
                        </div>
                        <div className="col-6">
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-lg-6">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="btn btn-success btn-lg btn-block"
                        data-toggle="modal"
                        data-target="#createtokensale"
                        disabled={
                          disableApprove
                          // || isOnUniswap
                          // || !!Object.keys(customErrors).length
                          // || (isShowMinAllocation && !isShowMaxAllocation)
                        }
                      >
                        <i className="far fa-check-circle ft12 mr-2"></i>Approve
                      </button>
                    </div>
                    <div className="col-lg-6">
                      <button
                        type="button"
                        onClick={() => handleCreateToken(values, resetForm)}
                        className="btn btn-primary btn-lg btn-block"
                        data-toggle="modal"
                        data-target="#createtokensale"
                        disabled={!disableApprove}
                      >
                        <i className="fal fa-rocket-launch ft12 mr-2"></i>Launch
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sales
