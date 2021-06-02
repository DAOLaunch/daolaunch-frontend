import React, { Component } from 'react'
import { SYSTEM } from '../../../constants'
import { checkProjectStatus } from '../../../utils/project'

class StatusCountDownBox extends Component {
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
    const { project } = this.props

    const status = checkProjectStatus(project)


    if (status === SYSTEM.PROJECT_STATUS.LIVE) {
      return (
        <span className="badge badge-pill badge-pink ft07 py-1 px-2">
          <i className="far fa-alarm-clock mr-1" aria-hidden="true" />LIVE
        </span>
      )
    } else if (status === SYSTEM.PROJECT_STATUS.SUCCESS) {
      return (
        <span className="badge badge-pill badge-success ft07 py-1 px-2">
          <i className="fas fa-check mr-1" aria-hidden="true" />SUCCESS
        </span>
      )
    } else if (status === SYSTEM.PROJECT_STATUS.FAILED) {
      return (
        <span className="badge badge-pill badge-danger ft07 py-1 px-2">
          <i className="fas fa-times mr-1" aria-hidden="true" />FAILED
        </span>
      )
    }

    return ''
  }
}

export default StatusCountDownBox
