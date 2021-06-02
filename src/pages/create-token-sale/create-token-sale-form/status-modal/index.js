import React, { Component, Fragment } from 'react';

// Component
import Modal from '@/components/modal-rt'
import Loading from '@/components/loading'
import { SYSTEM } from '../../../../constants';
import { shortAddress, shortText } from '../../../../utils/format';

import Tooltip from '@/components/tooltip'

const typeTransaction = {
  APPROVE: 'APPROVE',
  LAUNCH: 'LAUNCH',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  LAUNCHED: 'LAUNCHED',
  REJECTED: 'REJECTED',
}
class StatusModal extends Component {

  handleMessage() {
    const { type, tokenName } = this.props
    let message = 'Please Confirm This Transaction in your Wallet.'
    if (type === typeTransaction.APPROVE) {
      message = (
        <>
         Please Approve <Tooltip title={tokenName}>{shortText(tokenName, 15)}</Tooltip>  in your wallet.
        </>
      )
    }
    return message
  }

  render() {
    const {
      isModalVisible,
      toggleModal,
      handlingHash,
      tokenName,
      type
    } = this.props
    const href = `${SYSTEM.NETWORKS[+ethereum.networkVersion]?.URL}${type === typeTransaction.APPROVED ? SYSTEM.ETHERSCAN_ADDRESS_URL : SYSTEM.TRANSACTION_URL}/${handlingHash}`
    const shortenAddress = handlingHash && shortAddress(handlingHash)
    const scan = [56, 97].includes(+ethereum.networkVersion)? 'Bscscan' : 'Etherscan'
    return (
      <Modal
        isOpen={isModalVisible}
        toggle={() => (
            type === typeTransaction.REJECTED
            || type === typeTransaction.LAUNCHED
            || type === typeTransaction.APPROVED
          ) && toggleModal(isModalVisible)}
        className="modal-dialog pt-60px"
      >
        <div className="modal-header justify-content-center">
          <span className="h5 modal-title font-weight-bold">{type === typeTransaction.APPROVE ? 'Approve' : 'Transaction'}</span>
        </div>
        <div className="modal-body">
          {(type === typeTransaction.APPROVE || type === typeTransaction.LAUNCH) && (
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
            (type === typeTransaction.APPROVED || type === typeTransaction.LAUNCHED) && (
              <Fragment>
                <div className="d-flex justify-content-center">
                  <i className="fas fa-check-circle fa-3x text-success" aria-hidden="true"></i>
                </div>
                {type === typeTransaction.APPROVED && (
                  <div className="text-center">
                    <p className="ft1 mt-3 text-success">
                      Approved <Tooltip title={tokenName}>{shortText(tokenName, 15)}</Tooltip>:
                    </p>
                    <p className="ft08 mt-3">
                      {shortenAddress}
                      <a href={href} className="badge badge-light px-2 py-1 ml-1 text-secondary" target="_blank">
                        {scan}<i className="fas fa-external-link-alt pl-1" aria-hidden="true" />
                      </a>
                    </p>
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
                )}
                {type === typeTransaction.LAUNCHED && (
                  <div className="text-center">
                    <p class="ft1 text-center mt-3 text-success">Success:</p>
                    <button
                      type="button"
                      className="btn btn-outline-success text-capitalize"
                      onClick={() => window.open('/launched-sales')}
                    >Launched Token Sale <i className="fas fa-external-link-alt pl-1" /></button>
                  </div>
                )}
              </Fragment>
            )
          }
          {
            type === typeTransaction.REJECTED && (
              <p className="ft1 text-center mt-3 mb-5">Transaction rejected</p>
            )
          }
        </div>
      </Modal>
    );
  }
}

export default StatusModal;
