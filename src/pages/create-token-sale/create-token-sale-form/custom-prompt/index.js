import React, { Component } from 'react';
import { Prompt } from 'react-router-dom'
import CustomPromptModal from './custom-prompt-modal'

export class RouteLeavingGuard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modalVisible: false,
      lastLocation: null,
      confirmedNavigation: false,
    }
  }

  setVisible = (modalState) => this.setState({
    modalVisible: modalState,
  })

  showModal = (location) => this.setState({
    modalVisible: true,
    lastLocation: location,
  })

  closeModal = (callback) => this.setState({
    modalVisible: false
  }, callback)

  handleBlockedNavigation = (nextLocation) => {
    const { confirmedNavigation } = this.state
    if (!confirmedNavigation) {
      this.showModal(nextLocation)
      return false
    }

    return true
  }

  handleConfirmNavigationClick = () => this.closeModal(() => {
    const { navigate } = this.props
    const { lastLocation } = this.state
    if (lastLocation) {
      this.setState({
        confirmedNavigation: true
      }, () => {
        // Navigate to the previous blocked location with your navigate function     
        navigate(lastLocation.pathname)
      })
    }
  })

  render() {
    const { when, isPreventLaunch } = this.props
    const { modalVisible } = this.state
    return (
      <>
        <Prompt
          when={when}
          message={this.handleBlockedNavigation} />
        <CustomPromptModal
          visible={modalVisible}
          isPreventLaunch={isPreventLaunch}
          onCancel={this.closeModal}
          setVisible={this.setVisible}
          onConfirm={this.handleConfirmNavigationClick} />
      </>
    )
  }
}
export default RouteLeavingGuard