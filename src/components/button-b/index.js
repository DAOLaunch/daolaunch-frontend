import React from 'react'
import classNames from 'classnames'
import './style.scss'

export default ({ children, className, iconLeft, ...props }) => (
  <button {...props} className={classNames('button', className)}>
    {iconLeft}{children}
  </button>
)
