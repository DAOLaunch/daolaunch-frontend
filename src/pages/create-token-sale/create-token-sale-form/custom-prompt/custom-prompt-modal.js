// Component
import Modal from '@/components/modal-rt';
import React, { Component } from 'react';

import './custom-prompt-modal.scss';

class CustomPromptModal extends Component {
  render() {
    const { visible, setVisible, onConfirm, isPreventLaunch } = this.props
    return (
      <Modal
        isOpen={visible}
        toggle={() => { setVisible(!visible) }}
        className="custom-prompt"
      >
        {isPreventLaunch ? (
          <div className="modal-content">
            <div className="modal-header justify-content-center border-0">
              <button type="button" onClick={e => setVisible(!visible)} className="close" data-dismiss="modal" aria-label="Close">
                <i className="far fa-times-circle" aria-hidden="true"></i>
              </button>
            </div>
            <div className="modal-body ft1 text-center">
              The launch of the token sale has not been completed yet.
              <br />If you move the screen, you need to Approve again, is that okay?
            </div>
            <div className="modal-footer justify-content-center">
              <button type="button" onClick={e => setVisible(!visible)} className="btn" data-dismiss="modal">Cancel</button>
              <button type="button" onClick={() => onConfirm()} className="btn px-4">OK</button>
            </div>
          </div>
        ) : (
          <div className="modal-content">
            <div className="modal-header justify-content-center border-0">
              <button onClick={e => setVisible(!visible)} className="close" data-dismiss="modal" aria-label="Close">
                <i className="far fa-times-circle" aria-hidden="true"></i>
              </button>
            </div>
            <div className="modal-body ft1 text-center">
              The entered items disappear, is that okay?
            </div>
            <div className="modal-footer justify-content-center">
              <button type="button" onClick={e => setVisible(!visible)} className="btn" data-dismiss="modal">Cancel</button>
              <button type="button" onClick={() => onConfirm()} className="btn px-4">OK</button>
            </div>
          </div>
        )}
      </Modal>
    );
  }
}

export default CustomPromptModal;
