import { message } from 'antd'
import { ErrorMsg } from '@/constants'

import './style.scss'

class Notification {
  static success(text) {
    message.success(text)
  }

  static warning(text) {
    message.warning(text)
  }

  static error(text) {
    message.error(!!ErrorMsg[text] ? ErrorMsg[text] : text)
  }
}

export default Notification
