import React from 'react'
import { Input } from 'antd'
import classNames from 'classnames'
import 'antd/es/input/style/css'
import './style.scss'

export default ({ field, form, className, ...props }) => (
  <Input
    {...field}
    {...props}
    className={classNames('input-custom', className)}
  />
)
