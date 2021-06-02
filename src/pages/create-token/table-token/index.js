import React, { Component } from 'react'
import { withLocalize } from 'react-localize-redux'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

import system from '@/constants/system'
import { shortAddress, numberToString, shortText } from '@/utils/format'

// Components
import Loading from '@/components/loading'
import Table from '@/components/table'
import Tooltip from '@/components/tooltip'

import './style.scss'

@withLocalize
@withRouter
@connect((state) => ({
  tokenStore: state.token,
}))
class TableToken extends Component {
  componentDidMount() {
  }


  render() {
    const { tokenStore } = this.props
    const { tokenList } = tokenStore

    const columns = [
      {
        title: 'TokenName',
        dataIndex: 'token_name',
        key: 'token_name',
        render: (name) => (
          <Tooltip title={name}>
            {shortText(name, 15)}
          </Tooltip>
        ) 
      }, {
        title: 'Contract',
        dataIndex: 'token_contract_address',
        key: 'token_contract_address',
        className: 'contract',
        render: (contract, data) => {
          const netWork = system.NETWORKS[data.network_id]
          return (
            <>
              <span>{shortAddress(contract)} </span>
              <a
                href={`${netWork?.URL}${system.ETHERSCAN_URL}/${contract}`}
                className="badge badge-light px-2 py-1 text-secondary"
                target="blank"
              >{netWork?.domain}<i className="fas fa-external-link-alt pl-1"></i>
              </a>
            </>
          )
        }
      }, {
        title: 'TotalSupply',
        dataIndex: 'total_supply',
        key: 'total_supply',
        className: 'text-right',
        render: tokenSupply => <span>{numberToString(tokenSupply)}</span>
      }, {
        title: 'UniswapList',
        dataIndex: 'uniswap_list',
        key: 'uniswap_list',
        className: 'text-right',
        render: ({ token_symbol, uniswap_list }) =>
          uniswap_list ? uniswap_list.split(',').map(item => (
              item && <div>Listed {token_symbol}/{item}</div>
            ))
            :
            <div>No</div>
      }, {
        title: 'Actions',
        dataIndex: 'actions',
        key: 'actions',
        className: 'text-right',
        render: (item) => {
          return (
            <Link to={`/create-token-sale?token=${item?.token_contract_address}`}
                  className="badge badge-light text-success px-2">
              Create Sale<i className="fas fa-external-link-alt pl-1"/>
            </Link>
          )
        }
      },
    ]

    const data = Array.isArray(tokenList) ? tokenList.map(x => {
      return {
        key: x.id,
        token_name: x.token_name,
        token_contract_address: x?.token_contract_address,
        total_supply: x.token_supply,
        network_id: x.network_id,
        uniswap_list: x,
        actions: x,
      }
    }) : []
    return (
      <div className="card max1280">
        <div className="card-header text-center">
          <h4 className="card-title"> My Token List</h4>
        </div>
        <div className="card-body px-5sp">
          <div className="table-responsive mytokenlist table-tokens">
            {tokenList ? <Table columns={columns} dataSource={data} rowKey={record => record.token_contract_address}/> :
              <Loading/>}
          </div>
        </div>
      </div>
    )
  }
}

export default TableToken
