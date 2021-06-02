import React, { useEffect, useState } from 'react'
import { getSignedProjectLogoURL } from '@/api/project'

import { SYSTEM, errorForm } from '@/constants'

// Components
import Field from '@/components/field'
import { pushNotify, dismissNotify } from '@/components/toast'
import RouteLeavingGuard from '../custom-prompt'

const Project = ({ errors, handleNavigate, touched, values, setFieldValue, createTokenComplete, currentTab, ...form }) => {
  const [isFormValuesChanged, setIsFormValuesChanged] = useState(false)
  const formObj = { errors, touched, values, setFieldValue, ...form }
  const { initialValues } = form

  useEffect(() => {
    const keys = Object.keys(initialValues)
    let valueHasChanged = false

    keys.forEach(key => {
      if (initialValues[key] !== values[key]) {
        valueHasChanged = true
      }
    })

    if (valueHasChanged) {
      setIsFormValuesChanged(true)
    }
    return dismissNotify()
  }, [values])

  const uploadLogo = async (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      const { type, name, size } = selectedFile
      if (size >= SYSTEM.IMAGE_MAX_SIZE) {
        e.target.value = null
        return pushNotify('error', errorForm.INVALID_IMAGE)
      } else if (!SYSTEM.LCL_S3_IMAGE_TYPE.includes(type)) {
        e.target.value = null
        return pushNotify('error', errorForm.INVALID_FILE_TYPE)
      } else {
        const { result } = await getSignedProjectLogoURL({ type, name });
        const { signedRequest, url } = result;

        fetch(signedRequest, {
          method: 'PUT',
          body: selectedFile
        })
          .then(() => setFieldValue('project_logo', url))
      }
    }
  }

  return (
    <>
      {currentTab === 0 && (
        <RouteLeavingGuard
          when={isFormValuesChanged}
          navigate={handleNavigate}
        />
      )}
      <h5 className="info-text">Please tell me your project information.</h5>
      <div className="row justify-content-center">
        <div className="col-sm-4">
          <div className="picture-container">
            <div className={`picture ${createTokenComplete ? 'pe-none' : ''} ${(!!errors.project_logo && !!touched.project_logo) && 'error'}`}>
              {values?.project_logo && (
                <img src={values.project_logo} className="picture-src photo-upload" title="" />
              )}
              <input
                type="file"
                accept="image/*"
                id="wizard-picture"
                onChange={(e) => uploadLogo(e)}
              />
            </div>
            <h6 className="description">Project Logo</h6>
          </div>
        </div>
        <div className="col-sm-6">
          <div className="form-group">
            <Field
              name="project_name"
              type="text"
              placeholder="Project Name(required)"
              className="form-control"
              form={formObj}
              label="Project Name"
              readOnly={createTokenComplete}
              // value={values.project_name}
            />
          </div>
          <div className="form-group">
            <Field
              name="project_website"
              type="text"
              placeholder="Project Website(required)"
              className="form-control"
              form={formObj}
              label="Project Website"
              readOnly={createTokenComplete}
            />
          </div>
        </div>
        <div className="col-lg-4">
          <div className="form-group">
            <label><i className="fab fa-twitter text-secondary ft12 mr-2"></i>Twitter</label>
            <Field
              name="project_twitter"
              type="text"
              placeholder="https://twitter.com/xxx"
              className="form-control"
              form={formObj}
              readOnly={createTokenComplete}
            />
          </div>
          <div className="form-group">
            <label><i className="fab fa-telegram-plane text-secondary ft12 mr-2"></i>Telegram</label>
            <Field
              name="project_telegram"
              type="text"
              placeholder="https://t.me/xxx"
              className="form-control"
              form={formObj}
              readOnly={createTokenComplete}
            />
          </div>
          <div className="form-group">
            <label><i className="fab fa-medium-m text-secondary ft12 mr-2"></i>Medium</label>
            <Field
              name="project_medium"
              type="text"
              placeholder="https://xxx.medium.com/"
              className="form-control"
              form={formObj}
              readOnly={createTokenComplete}
            />
          </div>
          <div className="form-group">
            <label><i className="fab fa-discord text-secondary ft12 mr-2"></i>Discord</label>
            <Field
              name="project_discord"
              type="text"
              placeholder="https://discord.com/channels/xxx"
              className="form-control"
              form={formObj}
              readOnly={createTokenComplete}
            />
          </div>
        </div>
        <div className="col-lg-6 mt-3">
          <div className="form-group">
            <Field
              name="project_email"
              type="text"
              placeholder="Email (required)"
              className="form-control"
              form={formObj}
              label="Contact Email"
              readOnly={createTokenComplete}
            />
          </div>
          <div className="form-group">
            <Field
              name="project_white_paper"
              type="text"
              placeholder="Whitepaper Link"
              className="form-control"
              form={formObj}
              label="Whitepaper Link"
              readOnly={createTokenComplete}
            />
          </div>
          <div className="form-group">
            <Field
              name="project_additional_info"
              component="textarea"
              placeholder="Additional Information(required)"
              className="form-control additional"
              rows="5"
              form={formObj}
              label="Additional Information"
              readOnly={createTokenComplete}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default Project
