import React from 'react'
import { Modal } from 'antd'
import 'antd/es/modal/style/css'
import './style.scss'

export default ({ children, ...props }) => (
  <Modal
    centered
    footer={null}
    {...props}
  >
    {children}
  </Modal>
)
