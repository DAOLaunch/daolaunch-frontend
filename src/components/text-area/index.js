import React from 'react'
import { Input } from 'antd'
import classNames from 'classnames'
import 'antd/es/input/style/css'
import './style.scss'

const { TextArea } = Input

export default ({ field, form, className, ...props }) => (
  <TextArea
    {...field}
    {...props}
    className={classNames(className)}
  />
)
