import React, { Component } from 'react'
import { TimePicker } from 'antd'
import 'antd/es/time-picker/style/css'
import classNames from 'classnames'
import lodash from 'lodash'
import './style.scss'

export default class extends Component {
  _onChange = (value) => {
    const { field, onChange, name } = this.props

    if (onChange) onChange({ target: { value, name: field?.name || name } })
    if (!lodash.isEmpty(field)) field.onChange({ target: { value, name: field.name } })
  }

  render() {
    const { field, form, className, value, ...props } = this.props
    return (
      <TimePicker
        {...field}
        {...props}
        onBlur={null}
        onChange={this._onChange}
        className={classNames(className)}
      />
    )
  }
}
