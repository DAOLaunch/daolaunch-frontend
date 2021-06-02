import React from 'react'
import { Col } from 'antd'
import 'antd/es/col/style/css'
import './style.scss'

export default ({ children, ...props }) => (
  <Col {...props} >{children}</Col>
)
