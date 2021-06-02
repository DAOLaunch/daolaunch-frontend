import React from 'react'
import { Row } from 'antd'
import 'antd/es/row/style/css'
import './style.scss'

export default ({ children, ...props }) => (
  <Row {...props} >{children}</Row>
)
