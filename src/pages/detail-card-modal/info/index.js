/* eslint-disable camelcase */
import React, { Component, Fragment } from 'react'
import moment from 'moment'

import {
  getAccessTypeProject,
  getSoftCapPer,
  getBaseCollected,
  getBaseSoftCapPercent,
  checkProjectType,
  decimalNumber
} from '@/utils/project'
import { SYSTEM } from '@/constants'
import { bigNumber10Pow, numberToString } from '@/utils/format';

/** component */
import Progress from '@/components/progress-b'
import Badge from '@/components/badge-b'

/** asset */
import './style.scss'

class InfoDetailCard extends Component {
  formatListingTime(time) {
    return time ? moment(time).format('HH:mm on MMMM D, YYYY') : ''
  }

  getCountDownText(type) {
    if (type === SYSTEM.TOKEN_SALES_TIMES.LIVE) {
      return 'Ends in'
    }
    if (type === SYSTEM.TOKEN_SALES_TIMES.UPCOMING) {
      return 'Until Sale starts ...'
    }
    return 'Finished'
  }

  render() {
    const { project, componentCountdown, countDown, isSuccess } = this.props
    const accessType = getAccessTypeProject(project?.sale?.access_type).toUpperCase()
    const softCapPer = getBaseSoftCapPercent(project?.payment_currency, project?.sale?.soft_cap, project?.sale?.hard_cap)
    const hardCapPer = getSoftCapPer(project?.payment_currency, project?.presale?.total_base_collected, project?.sale?.hard_cap)
    const baseCollected = getBaseCollected(project?.presale?.total_base_collected, project?.payment_currency)
    const scan = ['BNB', 'BUSD'].includes(project?.payment_currency)? 'Bscscan': 'Etherscan';

    const softCap = +project?.sale?.soft_cap * project?.sale?.swap_ratio
    let totalTokenSold
    switch (project?.payment_currency) {
      case SYSTEM.PAYMENT_CURRENCY.ETH:
          totalTokenSold = bigNumber10Pow(bigNumber10Pow(+project?.presale?.total_tokens_sold) / bigNumber10Pow(1, 18))
        break;
      case SYSTEM.PAYMENT_CURRENCY.USDT:
          totalTokenSold = bigNumber10Pow(bigNumber10Pow(+project?.presale?.total_tokens_sold) / bigNumber10Pow(1, 6))
        break;
      case SYSTEM.PAYMENT_CURRENCY.BNB:
          totalTokenSold = bigNumber10Pow(bigNumber10Pow(+project?.presale?.total_tokens_sold) / bigNumber10Pow(1, 18))
        break;
      case SYSTEM.PAYMENT_CURRENCY.BUSD:
          totalTokenSold = bigNumber10Pow(bigNumber10Pow(+project?.presale?.total_tokens_sold) / bigNumber10Pow(1, 18))
        break;
    }

    const { type } = checkProjectType(project)

    return (
      <div className="col-lg-6 detail-info-project">
        <div className="text-right">
          <Badge className={`badge-pill badge-${accessType === SYSTEM.ACCESS_TYPE.PUBLIC ? 'primary' : 'success'} text-uppercase ft08 px-3`}>
            {accessType}
          </Badge>
        </div>
        <div className="img-container text-left mb-3">
          <img src={project?.project_logo || "/assets/img/sample_logo-3.png"} className="pj_logo mr-3" alt="DAOLaunch" />
          <div className="pjname">
            <p className="ellipsis" title={project?.project_name}>{project?.project_name}</p>
            <p className="contract">
              <span className="mr-2 ellipsis">{project?.token_contract_address}</span>
              <a
                href={`${SYSTEM.NETWORKS[project.network_id].URL}${SYSTEM.ETHERSCAN_URL}/${project?.token_contract_address}`}
                className="badge badge-light px-2 py-1 text-secondary"
                target="_blank"
              >
                <i className="fas fa-external-link-alt pr-1"></i>{scan}
              </a>
            </p>
          </div>
        </div>

        <div className="text-left">
          <p className="list-ratio-title">{`Ratio Per 1 ${project?.payment_currency}`}</p>
          <p className="list-ratio">{`${numberToString(project?.sale?.swap_ratio)} ${project?.token_symbol}`}</p>
        </div>

        <hr />
        <div className="row justify-content-md-center mt-3">
          <div className="col"></div>
          <div className="col-auto text-center ft07 text-success">{this.getCountDownText(type)}
            {!(isSuccess && window.location.pathname === '/launched-sales') && componentCountdown(countDown)}
          </div>
          <div className="col"></div>
        </div>
        <div className="text-center mt-3">
          <span className="h3 text-success">
            {numberToString(baseCollected)}
          </span>
          <span className="px-2">/</span>
          <span className="">{numberToString(project?.sale?.hard_cap)} {project?.payment_currency}</span>
        </div>
        <Progress
          className="bg-success font-weight-bold"
          min={0}
          max={100}
          height={15}
          percent={hardCapPer}
        />

        <div className="row">
          <div className="col-6 pt-2 soft-cap">
            <span className="h6 text-success pr-2 pl-2">{decimalNumber(hardCapPer)}%</span>
            <span className="ft08">(</span>
            <span className="ft08 px-2">SoftCap {decimalNumber(softCapPer)}%</span>
            <span className="ft08">)</span>
          </div>
          <div className="col-6">
          </div>
        </div>

        <div className="row my-4">
          <div className="col-3 text-secondary text-center">
            <i className="fad fa-swimming-pool fa-3x"></i>
            <p className="ft06 mb-0">for Liquidity</p>
            <p className="h4 text-success my-0 feature-list">{`${project?.sale?.initial_liquidity_per || ''}%`}</p>
          </div>
          <div className="col-3 text-secondary text-center">
            <i className="fad fa-lock-alt fa-3x"></i>
            <p className="ft06 mb-0">Liquidity Lock</p>
            <p className="h4 text-success my-0 feature-list text-capitalize">{SYSTEM.LOCK_LIQUIDITY[project?.sale?.lock_liquidity].toLowerCase() || ''}</p>
          </div>
          <div className="col-3 text-secondary text-center">
            <i className="fas fa-rocket fa-3x"></i>
            <p className="ft06 mb-0">List Price</p>
            <p className="h4 text-success my-0 feature-list">{(project?.sale?.listing_rate + 'x') || ''}</p>
          </div>
          <div className="col-3 text-secondary text-center">
            <i className="fad fa-users fa-3x"></i>
            <p className="ft06 mb-0">Participants</p>
            <p className="h4 text-success my-0 feature-list">{project?.presale?.number_buyers || ''}</p>
          </div>
        </div>
        <div className="img-container text-left mb-4">
          {
            totalTokenSold >= softCap && (
              <Fragment>
                <i className="fad fa-glass-cheers fa-3x mr-2 "></i>
                <span>
                  Congrats! Cleared the soft cap.
                <br />It will be <span className="ft1 font-weight-bold text-success">listed on <span className="text-capitalize">{project?.list_amm?.toLowerCase()}</span> at {this.formatListingTime(project?.sale?.listing_time)}.</span>
                </span>
              </Fragment>
            )
          }
        </div>
      </div>
    )
  }
}

export default InfoDetailCard
