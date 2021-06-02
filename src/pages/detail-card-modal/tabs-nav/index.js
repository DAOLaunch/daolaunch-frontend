import React, { Component } from 'react'
import copy from 'copy-to-clipboard'

import { getAccessTypeProject } from '@/utils/project'
import { dateTimeFormat } from '@/utils/datetime'
import { numberToString, bigNumber10Pow, shortAddress, shortText } from '@/utils/format'

import { SYSTEM, USDT } from '@/constants'
import Tooltip from '@/components/tooltip'

/** asset */
import './style.scss'

class InfoDetailCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tooltipCopy: null
    }

    this.timer = null
  }

  componentWillUnmount() {
    clearTimeout(this.timer)
  }

  render() {
    const { tooltipCopy } = this.state
    const { project, type, isSuccess, tokenByAddress, onUniswapProject } = this.props
    const accessType = getAccessTypeProject(project?.sale?.access_type)
    const softCap = +project?.sale?.soft_cap * +project?.sale?.swap_ratio
    const hardCap = +project?.sale?.hard_cap * +project?.sale?.swap_ratio
    const isNoLimit = !project?.sale?.min_allocation_wallet_limit && !project?.sale?.max_allocation_wallet_limit
    const max = project?.sale?.max_allocation_wallet_limit
      ? `Max.${project?.sale?.max_allocation_wallet}${project?.payment_currency}` 
      : 'Max.No limit'
    const min = project?.sale?.min_allocation_wallet_limit
      ? `Min.${project?.sale?.min_allocation_wallet}${project?.payment_currency}`
      : 'Min.No limit'

    const urlCopy = `${window.location.origin}?sale_id=${project?.project_id}`
    let outputCurrency
    if (['BNB', 'ETH'].includes(project?.payment_currency)) {
      outputCurrency = project?.payment_currency
    } else {
      outputCurrency = USDT.USDT_PRESALE[+window.ethereum.networkVersion]
    }

    const href = [56, 97].includes(project?.network_id) ? `https://exchange.pancakeswap.finance/#/swap?inputCurrency=${project?.token_contract_address}&outputCurrency=${outputCurrency}`: `https://app.uniswap.org/#/swap?inputCurrency=${project?.token_contract_address}&outputCurrency=${outputCurrency}&use=V2`;
    return (
      <>
        <div className="mt-4 tab-modal" style={{ width: "100%" }}>
          <div className="nav-tabs-navigation">
            <div className="nav-tabs-wrapper">
              <ul id="tabs" className="nav nav-tabs" role="tablist">
                <li className="nav-item px-3">
                  <a className="nav-link active" data-toggle="tab" href="#sale" role="tab" aria-expanded="true">Sale</a>
                </li>
                <li className="nav-item px-3">
                  <a className="nav-link" data-toggle="tab" href="#project" role="tab" aria-expanded="false">Project</a>
                </li>
                <li className="nav-item px-3">
                  <a className="nav-link" data-toggle="tab" href="#comments" role="tab" aria-expanded="false">Comments</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div id="my-tab-content" className="tab-content text-center">
          {/* Sale */}
          <div className="tab-pane active text-left" id="sale" role="tabpanel" aria-expanded="true">
            <div className="row">
              <div className="col-lg-6">
                <div className="card border_light">
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table">
                        <thead className="text-secondary">
                          <tr>
                            <th>
                              Sale Info
                            </th>
                            <th>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td >
                              Access Type
                              </td>
                            <td className="text-right text-capitalize">
                              {accessType} Sale
                              </td>
                          </tr>
                          <tr>
                            <td >
                              Start time
                              </td>
                            <td className="text-right">
                              {dateTimeFormat(project?.sale?.sale_start_time)}
                            </td>
                          </tr>
                          <tr>
                            <td >
                              End time
                              </td>
                            <td className="text-right">
                              {dateTimeFormat(project?.sale?.sale_end_time)}
                            </td>
                          </tr>
                          <tr>
                            <td >
                              Soft Cap
                              </td>
                            <td className="text-right">
                              {numberToString(softCap)} {project?.token_symbol}
                            </td>
                          </tr>
                          <tr>
                            <td >
                              Hard Cap
                              </td>
                            <td className="text-right">
                              {numberToString(hardCap)} {project?.token_symbol}
                            </td>
                          </tr>
                          <tr>
                            <td>
                              Buyers participate with
                              </td>
                            <td className="text-right">
                              {project?.payment_currency}
                            </td>
                          </tr>
                          <tr>
                            <td>
                              Swap Ratio
                              </td>
                            <td className="text-right">
                              1 {project?.payment_currency} = {numberToString(project?.sale?.swap_ratio)} {project?.token_symbol}
                            </td>
                          </tr>
                          <tr>
                            <td>
                              Allocation Per Wallet
                              </td>
                            <td className="text-right">
                              {isNoLimit ? 'No limit' : `${max} / ${min}`}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="card border_light">
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table">
                        <thead className="text-secondary">
                          <tr>
                            <th>
                              Listing Info
                            </th>
                            <th>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              Listing Date
                              </td>
                            <td className="text-right">
                              {dateTimeFormat(project?.sale?.listing_time)}
                            </td>
                          </tr>
                          <tr>
                            <td >
                              Listing Exchange
                            </td>
                            {type === SYSTEM.TOKEN_SALES_TIMES.LIVE ? (
                              <td className="text-right text-capitalize">
                                {project?.list_amm?.toLowerCase()}
                              </td>
                            ) : (
                              <td className="text-right">
                                <p
                                  type="button"
                                  className="btn btn-outline-success btn-sm text-capitalize"
                                  disabled={
                                    !project?.is_list_on_uniswap
                                  }
                                  onClick={() => window.open(href, '_blank')}
                                >
                                  Trade {project?.list_amm?.toLowerCase()}<i className="fas fa-external-link-alt pl-1"></i>
                                </p>
                              </td>
                            )}
                          </tr>
                          <tr>
                            <td>
                              Listing Rate
                            </td>
                            <td className="text-right">
                              1 {project?.payment_currency} = {numberToString(project?.sale?.swap_ratio / project?.sale?.listing_rate)} {project?.token_symbol} ({(project?.sale?.listing_rate + 'x') || ''})
                              </td>
                          </tr>
                          <tr>
                            <td>
                              Raised {project?.payment_currency} used for liquidity
                              </td>
                            <td className="text-right">
                              {project?.sale?.initial_liquidity_per}%
                              </td>
                          </tr>
                          <tr>
                            <td>
                              Liquidity lock
                              </td>
                            <td className="text-right text-capitalize">
                              {SYSTEM.LOCK_LIQUIDITY[project?.sale?.lock_liquidity].toLowerCase() || ''}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project */}
          <div className="tab-pane text-left" id="project" role="tabpanel" aria-expanded="false">
            <div className="row">
              <div className="col-lg-6">
                <div className="card border_light">
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table">
                        <thead className="text-secondary">
                          <tr>
                            <th>
                              Project Info
                            </th>
                            <th>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td >
                              Web Site
                              </td>
                            <td className="text-right">
                              <Tooltip title={project?.project_website}>
                                <a href={project?.project_website} className="url-website" target="_blank">
                                  {shortText(project?.project_website)}<i className="fad fa-external-link ml-2"></i>
                                </a>
                              </Tooltip>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan="2" className="text-right detail-share">
                              <a className="mr-3 share-link" onClick={() => {
                                copy(urlCopy)
                                this.setState({ tooltipCopy: 'copied' })
                                this.timer = setTimeout(() => {
                                  this.setState({ tooltipCopy: null })
                                }, 1000)
                              }}>
                                Share link<i className="far fa-copy ml-2"></i>
                                {tooltipCopy && <p className="copied">Copied</p>}
                              </a>
                              <a href={`mailto:${project?.project_email}`} className="mr-3" target="_blank">
                                Mail<i className="fad fa-external-link ml-2"></i>
                              </a>
                              {project?.project_white_paper && (
                                <a href={project?.project_white_paper} className="" target="_blank">
                                  Whitepaper<i className="fad fa-external-link ml-2"></i>
                                </a>
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td >
                              SNS
                              </td>
                            <td className="text-right">
                              {project?.project_twitter && (
                                <a href={project.project_twitter} className="" target="_blank">
                                  <i className="fab fa-twitter fa-2x mr-2 text-secondary"></i>
                                </a>
                              )}
                              {project?.project_telegram && (
                                <a href={project.project_telegram} className="" target="_blank">
                                  <i className="fab fa-telegram-plane fa-2x mr-2 text-secondary"></i>
                                </a>
                              )}
                              {project?.project_medium && (
                                <a href={project.project_medium} className="" target="_blank">
                                  <i className="fab fa-medium-m fa-2x mr-2 text-secondary"></i>
                                </a>
                              )}
                              {project?.project_discord && (
                                <a href={project.project_discord} className="" target="_blank">
                                  <i className="fab fa-youtube fa-2x text-secondary"></i>
                                </a>
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan="2" className="text-lerft content">
                              {project?.project_additional_info}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="card border_light">
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table">
                        <thead className="text-secondary">
                          <tr>
                            <th>
                              Token Info
                            </th>
                            <th>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              Contract Address
                              </td>
                            <td className="text-right">
                              <span>{shortAddress(project?.token_contract_address)}</span>
                            </td>
                          </tr>
                          <tr>
                            <td >
                              Token Name
                              </td>
                            <td className="text-right">
                              {project?.token_symbol} / <Tooltip title={project?.token_name}>{shortText(project?.token_name, 15)}</Tooltip>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              Max Total Supply
                              </td>
                            <td className="text-right">
                              {numberToString(bigNumber10Pow(tokenByAddress?.totalSupply, 0))} {project?.token_symbol}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comment */}
          <div className="tab-pane text-left" id="comments" role="tabpanel" aria-expanded="false">
            <p>Comming soon</p>
          </div>
        </div>
      </>
    )
  }
}

export default InfoDetailCard
