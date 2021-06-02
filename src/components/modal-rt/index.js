import React from 'react'
import { Modal } from 'reactstrap';
import classNames from 'classnames'
import './style.scss'

export default ({ children, className, ...props }) => (
  <Modal
    {...props}
    className={classNames('modal-custom', className)}
  >
    {children}
  </Modal>
)
