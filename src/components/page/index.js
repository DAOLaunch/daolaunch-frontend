import React, { Component } from 'react'
import classNames from 'classnames'
import './style.scss'

export default class extends Component {
  render() {
    const { children, sidebar, className, ...props } = this.props

    return (
      <>
        <div {...props} ref={(ref) => { this._div = ref }} className={classNames('page', className)}>
          {children}
        </div>
      </>
    )
  }
}
