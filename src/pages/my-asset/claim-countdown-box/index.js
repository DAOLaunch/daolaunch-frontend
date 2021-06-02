import moment from 'moment'

// Components
import Countdown from '../../../components/countdown'
import React, { Component, Fragment } from 'react'

//utils and constants
import { checkProjectStatus } from '../../../utils/project'
import { SYSTEM } from '../../../constants'

class ClaimCountDownBox extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isCountDownEnded: false
    }
  }

  componentDidMount() {
    const { saleTimeLeft } = this.props
    if (saleTimeLeft >= 0) {
      this.timeOut = setTimeout(() => {
        this.forceUpdate()
      }, saleTimeLeft)
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeOut)
  }

  render() {
    const { project, claimProject, refundProject } = this.props

    const status = checkProjectStatus(project)

    return (
      <Fragment>
        {
          status === SYSTEM.PROJECT_STATUS.LIVE && (
            <div className="d-flex justify-content-center">
              <Countdown date={moment(project.sale.sale_end_time)} />
            </div>
          )
        }
        {
          status === SYSTEM.PROJECT_STATUS.SUCCESS && (
            <Fragment>
              {
                !!project?.buyer?.isWithdrawn ? (
                  <button
                    type="button"
                    className="btn btn-outline-success btn-sm"
                    disabled
                  >
                    <i className="fas fa-check mr-1" aria-hidden="true"></i>Complete
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-outline-success btn-sm"
                    disabled={project?.buyer?.isWithdrawn}
                    onClick={() => claimProject(project)}
                  >
                    <i className="fas fa-arrow-from-bottom mr-2" aria-hidden="true" />Claim
                  </button>
                )
              }
            </Fragment>
          )
        }
        {
          status === SYSTEM.PROJECT_STATUS.FAILED && (
            < Fragment >
              {
                !!project?.buyer?.isWithdrawn ? (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    disabled
                  >
                    <i className="fas fa-check mr-1" aria-hidden="true"></i>Complete
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => refundProject(project)}
                  >
                    Refund
                  </button>
                )
              }
            </Fragment >
          )
        }
      </Fragment>
    )
  }
}

export default ClaimCountDownBox
