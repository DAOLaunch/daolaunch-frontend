import React, { Component, Fragment } from 'react';

import { SYSTEM } from '@/constants'
import { shortAddress } from '@/utils/format'

// Component
import Modal from '@/components/modal-rt'
import Loading from '@/components/loading'

import './style.scss'

class TransactionModal extends Component {
  render() {
    const {
      project,
      isModalVisible,
      toggleModal,
      transactionHash,
      type
    } = this.props
    const typeTransaction = {
      PENDING: 'PENDING',
      REQUEST: 'REQUEST',
      REJECTED: 'REJECTED',
      COMPLETED: 'COMPLETED',
      FAILED: 'FAILED',
    }
    const scan = ['BNB', 'BUSD'].includes(project?.payment_currency)? 'Bscscan': 'Etherscan';
    return (
      <Modal
        isOpen={isModalVisible}
        toggle={() => {
          if (type === typeTransaction.COMPLETED || type === typeTransaction.REJECTED)
            toggleModal(isModalVisible)
        }}
        className="modal-dialog pt-60px"
      >
        <div className="modal-header justify-content-center">
          <span className="h5 modal-title font-weight-bold">Transaction</span>
        </div>
        <div className="modal-body">
          {type === typeTransaction.FAILED && (
            <div className="d-flex justify-content-center">
              <p className="ft1 text-center mt-3">Transaction Failed.</p>
            </div>
          )}
          {type === typeTransaction.REQUEST && (
            <Fragment>
              <div className="d-flex justify-content-center">
                <Loading className="loading-3rem" />
              </div>
              <p className="ft1 text-center mt-3 mb-5">Please confirm your wallet</p>
            </Fragment>
          )}
          {
            type === typeTransaction.PENDING && (
              <Fragment>
                <Loading className="loading-3rem" />
                <p className="ft1 text-center mt-3">Pending:</p>
                <p className="ft08 text-center mt-3">
                  {shortAddress(project?.contract_address)}
                  <a
                    href={`${SYSTEM.NETWORKS[project?.network_id]?.URL}${SYSTEM.TRANSACTION_URL}/${transactionHash}`}
                    className="badge badge-light px-2 py-1 ml-1 text-secondary"
                    target="_blank"
                  >
                    {scan}<i className="fas fa-external-link-alt pl-1" aria-hidden="true"></i>
                  </a>
                </p>

              </Fragment>
            )
          }
          {
            type === typeTransaction.COMPLETED && (
              <Fragment>
                <div className="d-flex justify-content-center">
                  <i className="fas fa-check-circle fa-3x text-success" aria-hidden="true"></i>
                </div>
                <p className="ft1 text-center mt-3 text-success">Success:</p>
                <div className="text-center">
                  <a
                    type="button" className="btn btn-outline-success btn-sm text-capitalize"
                    target="_blank"
                    href={`${SYSTEM.NETWORKS[project.network_id].URL}${SYSTEM.TRANSACTION_URL}/${transactionHash}`}
                  >
                    {scan}<i className="fas fa-external-link-alt pl-1" aria-hidden="true"></i>
                  </a>
                </div>
              </Fragment>
            )
          }
          {
            type === typeTransaction.REJECTED && (
              <p className="ft1 text-center mt-3">Transaction rejected</p>
            )
          }
        </div>
      </Modal>
    );
  }
}

export default TransactionModal;
