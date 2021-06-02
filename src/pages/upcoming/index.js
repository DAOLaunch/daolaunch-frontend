import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { withLocalize } from 'react-localize-redux'
import { SYSTEM } from '@/constants'

import { actions, TYPES } from '@/store/actions'
import { getParameterByName } from '@/utils/url'
import { checkProjectType } from '@/utils/project'

/** component */
import Loading from '@/components/loading'
import Card from '@/components/card'
import NotData from '@/components/not-data'
import DetailModal from '@/pages/detail-card-modal'

/** asset */
import './style.scss'

@withLocalize
@withRouter
@connect((state) => ({
  projectStore: state.project
}), {
  getAllProject: actions.getAllProject,
  getProjectById: actions.getProjectById
})

class Upcoming extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: true
    }
  }

  componentDidMount() {
    const { getProjectById, history } = this.props
    // Get project_id from url query
    const projectId = getParameterByName('sale_id')

    if (!!projectId) {
      getProjectById({ id: +projectId }, async (action, data) => {
        if (action === TYPES.GET_PROJECT_BY_ID_SUCCESS) {
          const { type } = checkProjectType(data)
          if (type === SYSTEM.TOKEN_SALES_TIMES.UPCOMING) {
            this._detailModal.open(projectId)
          } else {
            history.push(`/${type}?sale_id=${projectId}`)
          }
          await this._getAllProject()
        }

        if (action === TYPES.GET_PROJECT_BY_ID_FAILURE) {
          history.push('/')
        }
      })
    } else {
      this._getAllProject()
    }
  }

  _getAllProject = () => {
    const { getAllProject } = this.props
    getAllProject({
      time: SYSTEM.TOKEN_SALES_TIMES.UPCOMING,
    }, () => this.setState({ isLoading: false }))
  }

  // Open modal detail card
  _clickCard = (projectId) => this._detailModal.open(projectId)

  render() {
    const { isLoading } = this.state
    const { projectStore } = this.props
    const { allProject } = projectStore
    const allCard = Array.isArray(allProject) ? allProject.map((project, index) => {
      return (
        <Card
          key={index}
          project={project}
          clickCard={() => this._clickCard(project?.project_id)}
        />
      )
    }) : []

    return (
      <>
        <div className="content">
          <div className="col-sm-12 col-xl-10-x mr-auto ml-auto">
            {isLoading
              ? <Loading className="w-100" />
              : (
                allCard.length
                  ? (
                    <div className="row pt-4">
                      {allCard}
                    </div>
                  )
                  : <NotData />
              )
            }
          </div>
        </div>
        <DetailModal innerRef={(ref) => { this._detailModal = ref }} />
      </>
    )
  }
}

export default Upcoming
