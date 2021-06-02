import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { withLocalize } from 'react-localize-redux'

import { actions, TYPES } from '@/store/actions'
import { decimalNumber } from '@/utils/project'

// Components
import Loading from '@/components/loading'
import Card from '@/components/card'

import DetailModal from '@/pages/detail-card-modal'

/** asset */
import './style.scss'

@withLocalize
@withRouter
@connect((state) => ({
  projectStore: state.project
}), {
  getAllProject: actions.getAllProject,
  getStatistic: actions.getStatistic
})

class MyAsset extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: true
    }
  }

  componentDidMount() {
    const { getAllProject, getStatistic } = this.props

    this.setState({ isLoading: true })
    getStatistic()
    getAllProject({
      get_my_project: true
    }, () => this.setState({ isLoading: false }))
  }

  // Open modal detail card
  _clickCard = (projectId) => this._detailModal.open(projectId)

  render() {
    const { isLoading } = this.state
    const { projectStore } = this.props
    const { statistic, allProject, countProject } = projectStore

    const allCard = Array.isArray(allProject) ? allProject.map((project, index) => {
      return (
        <Card
          key={index}
          project={project}
          clickCard={() => this._clickCard(project?.project_id)}
        />
      )
    }) : []

    // Percent success
    const totalProject = statistic?.totalProjects?.liveAndUpcoming + statistic?.totalProjects?.closed
    const percentSuccess = !!totalProject ? (statistic?.totalProjects?.success / totalProject) * 100 : 0
    return (
      <>
        <div className="content pt-4">
          <div className="col-sm-12 col-xl-10-x mr-auto ml-auto">
            {!!isLoading ? <Loading className="w-100" /> : (
              <>
                <div className="card max1280 bg-side fff">
                  <div className="card-body text-center pb-5">
                    <div className="row">
                      <div className="col">
                      </div>
                      <div className="col-sm-6">
                        <div className="title_copy"> You have completed<br />the funding!</div>
                        <div className="text_copy"> $ {statistic?.totalFunding ? decimalNumber(statistic?.totalFunding, 0) : 0}</div>
                        <span className="note_copy my-0">*Rate at the end of the sale</span>
                        <div className="row mt-4">
                          <div className="col text-secondary text-center">
                            <i className="fad fa-users fa-3x" />
                            <p className="ft08 mb-0">Participants</p>
                            <p className="h4 text-success my-0">{statistic?.participants}</p>
                          </div>
                          <div className="col text-secondary text-center">
                            <i className="fad fa-check-square fa-3x" />
                            <p className="ft08 mb-0">Succeed</p>
                            <p className="h4 text-success my-0">{decimalNumber(percentSuccess, 0)}%</p>
                          </div>
                          <div className="col text-secondary text-center">
                            <i className="fad fa-door-open fa-3x" />
                            <p className="ft08 mb-0">Live&amp;Upcoming</p>
                            <p className="h4 text-success my-0">{statistic?.totalProjects?.liveAndUpcoming}</p>
                          </div>
                          <div className="col text-secondary text-center">
                            <i className="fad fa-door-closed fa-3x" />
                            <p className="ft08 mb-0">Closed</p>
                            <p className="h4 text-success my-0">{statistic?.totalProjects?.closed}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col"></div>
                    </div>
                  </div>
                </div>

                <div className="row pt-4">
                  {allCard}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modal detail project */}
        <DetailModal innerRef={(ref) => { this._detailModal = ref }} />
      </>
    )
  }
}

export default MyAsset
