import React, { Component, Fragment } from 'react'

import { bigNumber10Pow, numberToString } from '@/utils/format'
import { decimalNumber } from '@/utils/project'
import { SYSTEM } from '@/constants'

/** asset */
import './style.scss'
import BigNumber from 'bignumber.js'

class DetailTokenSales extends Component {
  render() {
    const {
      title,
      isLaunched,
      project,
      type,
      isSuccess,
      onClaimProject,
      onRefundProject
    } = this.props

    let totalCollection
    let totalTokenSold = new BigNumber(project?.presale?.total_tokens_sold).dividedBy(bigNumber10Pow(1, project?.token_decimal))
    switch (project?.payment_currency) {
      case SYSTEM.PAYMENT_CURRENCY.ETH:
          totalCollection = bigNumber10Pow(bigNumber10Pow(+project?.presale?.total_base_collected) / bigNumber10Pow(1, 18))
        break;
      case SYSTEM.PAYMENT_CURRENCY.USDT:
          totalCollection = bigNumber10Pow(bigNumber10Pow(+project?.presale?.total_base_collected) / bigNumber10Pow(1, 6))
        break;
      case SYSTEM.PAYMENT_CURRENCY.BNB:
          totalCollection = bigNumber10Pow(bigNumber10Pow(+project?.presale?.total_base_collected) / bigNumber10Pow(1, 18))
        break;
      case SYSTEM.PAYMENT_CURRENCY.BUSD:
          totalCollection = bigNumber10Pow(bigNumber10Pow(+project?.presale?.total_base_collected) / bigNumber10Pow(1, 18))
        break;
    }

    const percentCollection = new BigNumber(totalCollection).dividedBy(project?.sale?.hard_cap).multipliedBy(100).toString(10)

    let labelStatus
    if (type === SYSTEM.TOKEN_SALES_TIMES.LIVE || type === SYSTEM.TOKEN_SALES_TIMES.UPCOMING) {
      labelStatus = (
        <span className="badge badge-pill badge-pink ft08 py-2 px-3">
          <i className="far fa-alarm-clock mr-1"></i>Live
        </span>
      )
    } else {
      labelStatus = (
        <span className={`badge badge-pill badge-${isSuccess ? 'success' : 'danger'} ft08 py-2 px-3`}>
          {isSuccess ? <><i className="fas fa-check mr-1"></i> Success</> : <><i className="fas fa-times mr-1"></i> Failed</>}
        </span>
      )
    }

    return (
      <Fragment>
        <div className="col-lg-6 handle-detail-card">
          <div className="card border_light">
            <div className="card-body">
              <div className="text-center py-3 mb-4">
                <span className="font-weight-bold h5">{title}</span>
              </div>
              <div className="table-responsive">
                <table className="table">
                  <tbody>
                    <tr>
                      <td>Status</td>
                      <td className="text-right">
                        {labelStatus}
                      </td>
                    </tr>
                    <tr>
                      <td>Total amount</td>
                      <td className="text-right">
                        <span className="ft12 font-weight-bold">
                          {numberToString(totalCollection)} {project?.payment_currency}
                        </span><br />( {decimalNumber(percentCollection)} % )
                      </td>
                    </tr>
                    <tr>
                      <td>Soft Cap</td>
                      <td className="text-right">
                        <span className="ft12 font-weight-bold">{numberToString(project?.sale?.soft_cap)} {project?.payment_currency}</span><br />( {isSuccess ? 'Reached' : 'Failed'} )
                          </td>
                    </tr>
                    <tr>
                      <td>Raised Amount</td>
                      <td className="text-right">
                        <span className="ft12 font-weight-bold text-success">{numberToString(totalCollection)} {project?.payment_currency}</span><br />
                        <span className="font-weight-bold">( {`${numberToString(totalTokenSold)} ${project?.token_symbol}`} )</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Button handle for Launched Sales page */}
              {(!!isLaunched && type !== SYSTEM.TOKEN_SALES_TIMES.LIVE && !!isSuccess) && (
                <div className="col-12 pb-3 text-center">
                  <button
                    type="button"
                    className="btn btn-outline-success text-capitalize w-75"
                    onClick={() => onClaimProject(project)}
                    disabled={project?.presale?.is_owner_withdrawn}
                  >
                    {!!project?.presale?.is_owner_withdrawn ? (
                      <><i className="fas fa-check mr-1" aria-hidden="true"></i>Complete</>
                    ) : (
                      <><i className="fas fa-arrow-from-bottom mr-2" aria-hidden="true" />Claim Funds</>
                    )}
                  </button>
                  <p className="ft06 text-success">Unsold token also withdrawals to your wallet.</p>
                </div>
              )}
              {(!!isLaunched && type !== SYSTEM.TOKEN_SALES_TIMES.LIVE && type !== SYSTEM.TOKEN_SALES_TIMES.UPCOMING && !isSuccess) && (
                <div className="col-12 pb-3 text-center">
                  <button
                    type="button"
                    className="btn btn-outline-danger text-capitalize w-75"
                    onClick={() => onRefundProject(project)}
                    disabled={project?.presale?.is_owner_withdrawn}
                  >
                    {!!project?.presale?.is_owner_withdrawn ? (
                      <><i className="fas fa-check mr-1" aria-hidden="true"></i>Complete</>
                    ) : (
                      <><i className="fas fa-arrow-from-bottom mr-2" aria-hidden="true" />Claim Unsold Tokens</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Fragment>
    )
  }
}

export default DetailTokenSales
