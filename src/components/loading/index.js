import React from 'react'
import classNames from 'classnames'

import './style.scss'

const Loading = ({ className }) => (
  <div className={classNames('d-flex justify-content-center', className)}>
    <div className="spinner-border text-success" >
      <span className="sr-only">Loading...</span>
    </div>
  </div>
)

export default Loading
