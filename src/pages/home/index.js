import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { withLocalize } from 'react-localize-redux'

/** component */
import Page from '@/components/page'

/** asset */
import './style.scss'

@withLocalize

class Home extends Component {
  render() {
    return (
      <Page className="home">
        <div className="content">
          Home page
        </div>
      </Page>
    )
  }
}

export default withRouter(Home)
