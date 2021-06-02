import moment from 'moment'
import React, { Component } from 'react'

// Components
import Countdown from '../../../components/countdown'

import { SYSTEM, USDT } from '../../../constants'
import { checkProjectStatus } from '../../../utils/project'

class ListingCountDownBox extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isCountDownEnded: false
    }
  }

  componentDidMount() {
    const { listingTimeLeft } = this.props
    if (listingTimeLeft >= 0) {
      this.timeOut = setTimeout(() => {
        this.forceUpdate()
      }, listingTimeLeft)
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeOut)
  }

  render() {
    const { project, uniswapProject } = this.props

    const status = checkProjectStatus(project)
    let outputCurrency
    if (['BNB', 'ETH'].includes(project?.payment_currency)) {
      outputCurrency = project?.payment_currency
    } else {
      outputCurrency = USDT.USDT_PRESALE[+window.ethereum.networkVersion]
    }
    const href = [56, 97].includes(project?.network_id) ? `https://exchange.pancakeswap.finance/#/swap?inputCurrency=${project?.token_contract_address}&outputCurrency=${outputCurrency}`: `https://app.uniswap.org/#/swap?inputCurrency=${project?.token_contract_address}&outputCurrency=${outputCurrency}&use=V2`;

    switch (status) {
      case SYSTEM.PROJECT_STATUS.LIVE:
        return (
          <div className="d-flex justify-content-center">
            <Countdown date={moment(project.sale.listing_time)} />
          </div>
        )
      case SYSTEM.PROJECT_STATUS.SUCCESS:
        if (moment(project.sale.listing_time).valueOf() <= moment().valueOf()) {
          return (
            <p
              type="button"
              className="btn btn-outline-success btn-sm text-capitalize"
              disabled={!project?.is_list_on_uniswap}
              onClick={() => window.open(href, '_blank')}
            >
              Trade {project?.list_amm?.toLowerCase()}<i className="fas fa-external-link-alt pl-1" aria-hidden="true" />
            </p>
          )
        } else {
          return (
            <div className="d-flex justify-content-center">
              <Countdown date={moment(project.sale.listing_time)} />
            </div>
          )
        }
      default:
        return ''
    }
  }
}

export default ListingCountDownBox
