import React from 'react'
import classNames from 'classnames'
import { withLocalize } from 'react-localize-redux'
import lodash from 'lodash'
import { Field } from 'formik'

import './style.scss'

export default withLocalize(({
  component: Component,
  translate,
  form,
  name,
  value,
  label,
  error,
  require,
  note,
  inline,
  type,
  ...props
}) => {
  if (form.values[name] && /^\s+$/.test(form.values[name])) {
    form.values[name] = null
  }

  props = lodash.omit(props, [
    'activeLanguage',
    'addTranslation',
    'addTranslationForLanguage',
    'defaultLanguage',
    'ignoreTranslateChildren',
    'initialize',
    'languages',
    'setActiveLanguage',
    'renderToStaticMarkup'
  ])

  return (
    <div className={classNames('field', { inline })}>
      {label && (
        <p className="label">
          {label}
          {require && <span style={{ color: 'red' }}>*</span>}
          {note && <span className="note-label">{note}</span>}
        </p>
      )}
      <div className="field-content">
        <Field {...props} name={name} component={Component} type={type} />
        <p className="error-message">{(form?.errors[name] && form?.touched[name]) ? form.errors[name] : error}</p>
      </div>
    </div>
  )
})
