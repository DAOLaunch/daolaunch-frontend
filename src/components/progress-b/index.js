import React from 'react'
import classNames from 'classnames'
import './style.scss'

export default ({ min, max, percent, className, height, ...props }) => (
  <div className="progress" style={{ height }}>
    <div 
      {...props}
      className={classNames('progress-bar', className)}
      role="progressbar"
      style={{ width: `${percent}%`}}
      aria-valuemin={min}
      aria-valuemax={max}
    >
    </div>
  </div>
)
