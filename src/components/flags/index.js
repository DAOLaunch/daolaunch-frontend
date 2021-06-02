import React, { Component } from 'react'
import { withLocalize } from 'react-localize-redux'

import Storage from '@/utils/storage'

/** asset */
import { Images } from '@/theme'
import './style.scss'

@withLocalize

class Flags extends Component {
  constructor(props) {
    super(props)
    this.state = {
      imageFlag: { name: 'Japanese', code: 'jp', active: true }
    }
  }

  componentDidMount() {
    if (Storage.get('LANGUAGE') === 'en') {
      this.setState({
        imageFlag: { name: 'English', code: 'en', active: true }
      })
    }

    if (!Storage.has('LANGUAGE') || Storage.get('LANGUAGE') === 'jp') {
      this.setState({
        imageFlag: { name: 'Japanese', code: 'jp', active: true }
      })
    }
  }

  render() {
    const { languages, setActiveLanguage } = this.props
    const { imageFlag } = this.state

    return (
      <div className="flags">
        <img src={Images[`${imageFlag.code.toUpperCase()}_FLAG`]} className="flag" alt="" />
        <div className="dropdown-flags">
          {languages.map((language) => !language.active && (
            <img
              onClick={() => {
                setActiveLanguage(language.code)
                Storage.set('LANGUAGE', language.code)
                this.setState({
                  imageFlag: language
                })
              }}
              key={language.code}
              src={Images[`${language.code.toUpperCase()}_FLAG`]}
              className={language.active ? 'flag active' : 'flag'}
              alt=""
            />
          ))}
        </div>

      </div>
    )
  }
}

export default Flags
