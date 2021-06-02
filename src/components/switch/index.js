import React from 'react'
import { Switch } from 'antd'
import 'antd/es/switch/style/css'
import './style.scss'

export default ({ defaultChecked, onChange, ...props }) => (
  <Switch
    defaultChecked
    onChange={onChange}
    className="switch-custom"
    {...props}
  />
)
