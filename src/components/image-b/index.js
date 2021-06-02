import React from 'react'
import classNames from 'classnames'
import './style.scss'

export default ({ src, className, icon, ...props }) => (
  <img
    {...props}
    src={src} 
    className={classNames('image', className)}
  />
)
