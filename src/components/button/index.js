import React from 'react'
import { Button } from 'antd'
import classNames from 'classnames'
import 'antd/es/button/style/css'
import './style.scss'

export default ({ children, className, iconLeft,...props }) => (
  <Button {...props} className={classNames('button-custom', className)}>
    {iconLeft}{children}
  </Button>
)
