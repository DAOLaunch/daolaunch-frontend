import React from 'react'
import { Pagination } from 'antd'
import 'antd/es/pagination/style/css'
import './style.scss'

export default ({ ...props }) => (
  <Pagination
    {...props}
  />
)
