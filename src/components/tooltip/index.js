import React from 'react'
import { Tooltip } from 'antd'
import 'antd/es/tooltip/style/css'
import './style.scss'

export default ({ children, ...props }) => (
  <Tooltip {...props}>{children}</Tooltip>
)
