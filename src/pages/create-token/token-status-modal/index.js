import React, { Component, Fragment } from 'react';


// Component
import Modal from '@/components/modal-rt'
import Loading from '@/components/loading'
import { SYSTEM } from '../../../constants';
import { shortAddress } from '../../../utils/format';

const typeTransaction = {
  CONFIRM: 'CONFIRM',
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
  FAILED: 'FAILED',
}
class TokenStatusModal extends Component {
  handleMessage() {
    return 'Please Confirm This Transaction in your Wallet.'
  }

  render() {
    const {
      isModalVisible,
      toggleModal,
      handlingHash,
      type
    } = this.props
    const href = `${SYSTEM.NETWORKS[+ethereum.networkVersion]?.URL}${SYSTEM.TRANSACTION_URL}/${handlingHash}`
    const shortenAddress = handlingHash && shortAddress(handlingHash)
    const scan = [56, 97].includes(+ethereum.networkVersion) ? 'Bscscan': 'Etherscan';
    
    return (
      <Modal
        isOpen={isModalVisible}
        toggle={() => (
            type === typeTransaction.COMPLETED
            || type === typeTransaction.REJECTED
            || type === typeTransaction.FAILED
          ) && toggleModal(isModalVisible)}
        className="modal-dialog pt-60px"
      >
        <div className="modal-header justify-content-center">
          <span className="h5 modal-title font-weight-bold">{'Transaction'}</span>
        </div>
        <div className="modal-body">
          {type === typeTransaction.CONFIRM && (
            <Fragment>
              <div className="d-flex justify-content-center">
                <Loading className="loading-3rem" />
              </div>
              <p className="ft1 text-center mt-3 mb-5">{this.handleMessage()}</p>
            </Fragment>
          )}
          {
            type === typeTransaction.PENDING && (
              <Fragment>
                <Loading className="loading-3rem" />
                <p className="ft1 text-center mt-3">Pending:</p>
                <p className="ft08 text-center mt-3">
                  {shortenAddress}
                  <a
                    href={href}
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
                <div className="text-center">
                  <p class="ft1 text-center mt-3 text-success">Success:</p>
                  <button
                    type="button"
                    className="btn btn-outline-success text-capitalize w-50"
                    data-dismiss="modal"
                    aria-label="Close"
                    onClick={(e) => {
                      toggleModal(isModalVisible)
                    }}
                  >OK</button>
                </div>
              </Fragment>
            )
          }
          {
            type === typeTransaction.REJECTED && (
              <p className="ft1 text-center mt-3">Transaction Rejected</p>
            )
          }
          {
            type === typeTransaction.FAILED && (
              <p className="ft1 text-center mt-3">Transaction Failed.</p>
            )
          }
        </div>
      </Modal>
    );
  }
}

export default TokenStatusModal;
