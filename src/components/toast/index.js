import React from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './style.scss';

const Message = ({ type, message }) => (
  <div className="toast-content">
    <i className={`${type === 'success' ? 'far fa-check-circle' : 'fa fa-times-circle-o'} toast-icon`}></i>
    <div className="toast-text">
      <p className="toast-title">{type}</p>
      <p>{message}</p>
    </div>
  </div>
)

toast.configure();
export const pushNotify = (type, message) => {
  switch (type) {
    case 'success':
      return toast.success(<Message message={message} type="success" />, {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 1500,
        hideProgressBar: true,
        className: 'col-11 col-md-4',
        toastId: message
      });
    case 'error':
      return toast.error(<Message message={message} type="error" />, {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 1500,
        hideProgressBar: true,
        className: 'col-11 col-md-4',
        toastId: message
      });
    case 'warn':
      return toast.warn(<Message message={message} type="warn" />, {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 1500,
        hideProgressBar: true,
        className: 'col-11 col-md-4',
        toastId: message
      });
    case 'info':
      return toast.info(<Message message={message} type="info" />, {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 1500,
        hideProgressBar: true,
        className: 'col-11 col-md-4',
        toastId: message
      });
    default:
      return toast(message);
  }
};

export const dismissNotify = () => {
  return toast.dismiss();
}