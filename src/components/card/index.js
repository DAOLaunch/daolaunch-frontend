import React, { Component, Fragment } from 'react'

import { SYSTEM } from '@/constants'
import { getAccessTypeProject, getBaseCollected, getSoftCapPer, getBaseSoftCapPercent, decimalNumber } from '@/utils/project'
import { bigNumber10Pow, numberToString } from '../../utils/format'
import moment from 'moment'

// Components
import Badge from '@/components/badge-b'
import Image from '@/components/image-b'
import Progress from '@/components/progress-b'
import './style.scss'


const FeatureItem = ({ title, value }) => (
  <div className="col text-center">
    <span className="ft06">{title}</span>
    <p className="feature-list text-capitalize">{value}</p>
  </div>
)

const StatusBadge = ({ type, timeString, isSuccess }) => {
  if (type === 'live') {
    return (
      <Badge
        className="badge-pill badge-pink ft06 py-1 px-2"
        icon={<i className="far fa-alarm-clock mr-1"></i>}
      >
        {`Ends in  ${timeString}`}
      </Badge>
    )
  }
  if (type === 'upcoming') {
    return (
      <Badge
        className="badge-pill badge-pink ft06 py-1 px-2"
        icon={<i className="far fa-alarm-clock mr-1"></i>}
      >
        {`In  ${timeString}`}
      </Badge >
    )
  }
  if (type === 'closed') {
    if (isSuccess) {
      return (
        <Badge
          className="badge badge-pill badge-success ft06 py-1 px-2"
          icon={<i className="fas fa-check mr-1"></i>}
        >
          {`Success`}
        </Badge>
      )
    }
    return (
      <Badge
        className="badge badge-pill badge-danger ft06 py-1 px-2"
        icon={<i className="fas fa-times mr-1"></i>}
      >
        {`Failed`}
      </Badge>
    )
  }
  return <Fragment />
}

class Card extends Component {
  render() {
    const {
      project,
      clickCard,
    } = this.props
    const now = moment()
    const start_time_cap = moment(project?.sale?.sale_start_time).diff(moment(now), 'milliseconds')
    const end_time_cap = moment(project?.sale?.sale_end_time).diff(now, 'milliseconds')
    const softCap = project?.sale?.soft_cap
    let totalTokenSold
    switch (project?.payment_currency) {
      case SYSTEM.PAYMENT_CURRENCY.ETH:
        totalTokenSold = bigNumber10Pow(bigNumber10Pow(+project?.presale?.total_base_collected) / bigNumber10Pow(1, 18))
        break;
      case SYSTEM.PAYMENT_CURRENCY.USDT:
        totalTokenSold = bigNumber10Pow(bigNumber10Pow(+project?.presale?.total_base_collected) / bigNumber10Pow(1, 6))
        break;
      case SYSTEM.PAYMENT_CURRENCY.BNB:
        totalTokenSold = bigNumber10Pow(bigNumber10Pow(+project?.presale?.total_base_collected) / bigNumber10Pow(1, 18))
        break;
      case SYSTEM.PAYMENT_CURRENCY.BUSD:
        totalTokenSold = bigNumber10Pow(bigNumber10Pow(+project?.presale?.total_base_collected) / bigNumber10Pow(1, 18))
        break;
    }
    const isSuccess = totalTokenSold >= softCap

    let type = SYSTEM.TOKEN_SALES_TIMES.LIVE
    if (end_time_cap <= 0) {
      type = SYSTEM.TOKEN_SALES_TIMES.CLOSED
    } else if (start_time_cap >= 0) {
      type = SYSTEM.TOKEN_SALES_TIMES.UPCOMING
    }

    let timeString
    const progressTime = start_time_cap > 0 ? project?.sale?.sale_start_time : project?.sale?.sale_end_time
    const hours = moment(progressTime).diff(now, 'hour')
    if (hours <= 24) {
      timeString = `${hours} hours`
    } else {
      const days = moment(progressTime).diff(now, 'day')
      timeString = `${days} days ${hours % 24} hours`
    }

    const baseCollected = getBaseCollected(project?.presale?.total_base_collected, project?.payment_currency)
    const softCapPer = getBaseSoftCapPercent(project?.payment_currency, project?.sale?.soft_cap, project?.sale?.hard_cap)
    const hardCapPer = getSoftCapPer(project?.payment_currency, project?.presale?.total_base_collected, project?.sale?.hard_cap)
    const accessType = getAccessTypeProject(project?.sale?.access_type).toUpperCase()
    return (
      <div className="col-xl-3-x col-lg-4-x col-sm-6-x card-project">
        <div className="card card-stats hovercard" onClick={clickCard}>
          <div className="card-body ">
            <div className="row mb-2">
              <div className="col">
                <Badge className={`badge-pill badge-${accessType === SYSTEM.ACCESS_TYPE.PUBLIC ? 'primary' : 'success'} text-uppercase ft06 py-1 px-2`}>
                  {project?.sale?.access_type}
                </Badge>
              </div>
              <div className="col text-right">
                <StatusBadge type={type} timeString={timeString} isSuccess={isSuccess} />
              </div>
            </div>
            <div className="img-container text-left mb-3">
              <Image src={project?.project_logo || "/assets/img/sample_logo-3.png"} className="pj_logo-list mr-3 photo-upload" alt="DAOLaunch" />
              <div className="pjname">
                <p className="ellipsis" title={project?.project_name}>{project?.project_name}</p>
                <p className="contract font-weight-normal">
                  <span className="mr-2">{project?.token_contract_address}</span>
                </p>
              </div>
            </div>
            <div className="text-left">
              <p className="list-ratio-title">
                {`Ratio Per 1 ${project?.payment_currency}`}
              </p>
              <p className="list-ratio">
                {`${numberToString(project?.sale?.swap_ratio)} ${project?.token_symbol}`}
              </p>
            </div>
            <div className="text-left mt-1">
              <span className="h5 text-success">{numberToString(baseCollected)}</span>
              <span className="px-2">/</span>
              <span className="ft08">{numberToString(project?.sale?.hard_cap)} {project?.payment_currency}</span>
            </div>
            <Progress
              className="bg-success font-weight-bold"
              min={0}
              max={100}
              height={10}
              percent={hardCapPer}
            />
            <div className="">
              <span className="h6 text-success pr-2">{decimalNumber(hardCapPer)}%</span>
              <span className="ft08">(</span>
              <span className="ft07 px-2">SoftCap {decimalNumber(softCapPer)}%</span>
              <span className="ft08">)</span>
            </div>
          </div>
          <div className="card-footer ">
            <hr />
            <div className="row">
              <FeatureItem title={'for Liquidity'} value={`${project?.sale?.initial_liquidity_per || ''}%`} />
              <FeatureItem title={'Liquidity Lock'} value={SYSTEM.LOCK_LIQUIDITY[project?.sale?.lock_liquidity]?.toLowerCase() || ''} />
              <FeatureItem title={'List Price'} value={(project?.sale?.listing_rate + 'x') || ''} />
            </div>
          </div>
        </div>
      </div >
    )
  }
}

export default Card
