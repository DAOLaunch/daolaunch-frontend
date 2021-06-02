import React from 'react'
import classNames from 'classnames'

/** asset */
import './style.scss'

export default ({ tabs, activeTab, onChange, ...props }) => {
  tabs = tabs.filter((item) => !item.hide)

  return (
    <div className="tab-bar" {...props}>
      {tabs.map((item) => (
        <div
          key={item.key}
          onClick={() => onChange(item.key)}
          className={classNames('tab-item', { active: activeTab === item.key })}
        >
          <p>{item.name}</p>
        </div>
      ))}
    </div>
  )
}
