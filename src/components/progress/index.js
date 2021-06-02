import React from 'react'
import { Progress } from 'antd'
import 'antd/es/progress/style/css'
import classNames from 'classnames'
import './style.scss'

export default ({ className, ...props }) => (
  <Progress  {...props} className={classNames('progress-custom', className)} />
)
