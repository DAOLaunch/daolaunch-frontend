import React, { Component } from 'react'
import CreateTokenSaleForm from './create-token-sale-form'
import { dismissNotify } from '@/components/toast'

import './style.scss'

class CreateTokenSale extends Component {

  componentDidMount() {
    window.demo.initWizard();
    window.demo.initDateTimePicker();
  }

  componentWillUnmount(){
    dismissNotify()
  }

  render() {
    const { history } = this.props
    return (
      <div className="content create-token-sale pt-4">
        <div className="col-xl-10-x col-sm-12 mr-auto ml-auto">
          <div className="wizard-container">
            <div className="card card-wizard active" data-color="primary" id="wizardProfile">
              <CreateTokenSaleForm history={history} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default CreateTokenSale
