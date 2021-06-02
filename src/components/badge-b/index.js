import React from 'react'
import classNames from 'classnames'
import './style.scss'

export default ({ children, className, icon, ...props }) => (
  <span {...props} className={classNames('badge', className)}>
    {icon}{children}
  </span>
)
