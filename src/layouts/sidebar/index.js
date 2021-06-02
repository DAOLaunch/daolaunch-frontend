import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { withLocalize } from 'react-localize-redux'
import { connect } from 'react-redux'
import { ROUTE, SYSTEM } from '../../constants'
import actions from '../../store/actions'
import Storage from '@/utils/storage'

import './style.scss'
@withLocalize
@connect((state) => ({
  connectStore: state.connect,
}), {
  reRenderRoute: actions.reRenderRoute
})
class SideBar extends Component {
  constructor(props) {
    super(props)
  }

  getCollapseGroupClass(barName, group) {
    let currentUrl = this.formatBarName(barName)
    if (ROUTE.ROUTE_GROUP[group].AVAILABLE_ROUTES?.includes(currentUrl)) {
      return 'active'
    }

    return ''
  }

  getActiveSidebarClass(barName, group) {
    let currentUrl = this.formatBarName(barName)
    if (ROUTE.ROUTE_GROUP[group].AVAILABLE_ROUTES?.includes(currentUrl)) {
      return 'collapse show'
    }

    return 'collapse'
  }

  getActiveRoute(currentBar, bar_name) {
    if (window.innerWidth < 992) {
      this.toggleNav()
    }
    let currentUrl = this.formatBarName(currentBar)
    return currentUrl && currentUrl === bar_name ? "active" : ''
  }

  formatBarName(barName) {
    if (barName.includes('?')) return barName.split('?')[0]
    return barName
  }

  profileLogoPath(dataEthereum) {
    const prefix = '/assets/img'
    let subFix = '/doge-deal-with-it.jpg'
    if (dataEthereum) {
      if (SYSTEM.NETWORK_TYPES.ETH.includes(dataEthereum.networkVersion)) {
        subFix = '/eth_logo_500.png'
      } else if (SYSTEM.NETWORK_TYPES.BNB.includes(dataEthereum.networkVersion)) {
        subFix = '/bsc_logo_500.png'
      }
    }
    return prefix + subFix
  }

  toggleNav() {
    if (paperDashboard.misc.navbar_menu_visible == 1) {
      $('html').removeClass('nav-open');
      paperDashboard.misc.navbar_menu_visible = 0;
      setTimeout(function () {
        $toggle.removeClass('toggled');
        $('#bodyClick').remove();
      }, 550);
    }
  }

  handleNavigateLocation() {
    if (window.innerWidth < 992) {
      this.toggleNav()
    }
  }

  render() {
    const { connectStore } = this.props
    const { authorized, dataEthereum } = connectStore

    const isToken = Storage.has('ACCESS_TOKEN')
    const address = isToken && dataEthereum?.selectedAddress
    const shortedAddress = isToken && address && address.substr(0, 14) + '...'

    const profileLogoPath = this.profileLogoPath(dataEthereum)

    const barName = `/${window.location.href.split('/')[3]}`
    return (
      <div className="sidebar" data-color="default" data-active-color="warning">
        <div className="logo">
          <div onClick={() => this.handleNavigateLocation()}  >
            <Link to="/" className="simple-text logo-mini">
              <div className="logo-image-small">
                <img src="/assets/img/token-symbol-light.png" />
              </div>
            </Link>
          </div>
          <div onClick={() => this.handleNavigateLocation()}  >
            <Link to="/" className="simple-text logo-normal">
              DAOLaunch
            </Link>
          </div>
        </div>
        <div className="sidebar-wrapper">
          <ul className="nav">
            <li onClick={() => this.handleNavigateLocation()} className={`user ${this.getCollapseGroupClass(barName, 'ACCOUNT')}`}>
              <a
                data-toggle="collapse"
                href="#SidebarUser"
                aria-expanded={`${this.getCollapseGroupClass(barName, 'ACCOUNT') === 'active' ? "true" : "false"}`}
              >
                <div className="photo ml-0">
                  <img src={profileLogoPath} />
                </div>
                <p className="text-capitalize ft1">{shortedAddress ? shortedAddress : 'No connect'}<b className="caret"></b></p></a>
              <div className={this.getActiveSidebarClass(barName, 'ACCOUNT')} id="SidebarUser">
                <ul className="nav">
                  <li className={this.getActiveRoute(barName, ROUTE.ROUTES_PREFIX.MY_ASSET.ROUTE)}>
                    <Link to={authorized ? "/my-asset" : "#"}>
                      <span className="sidebar-mini-icon">MA</span>
                      <span className="sidebar-normal"> My Asset </span>
                    </Link>
                  </li>
                  <li>
                    <a>
                      <span className="sidebar-mini-icon">MN</span>
                      <span className="sidebar-normal">My NFTs<span className="comingsoon">(coming soon)</span></span>
                    </a>
                  </li>
                </ul>
              </div>
            </li>
            <li onClick={() => this.handleNavigateLocation()} className={this.getCollapseGroupClass(barName, 'TOKEN_SALES')}>
              <a
                data-toggle="collapse"
                href="#SidebarTokenSale"
                aria-expanded={`${this.getCollapseGroupClass(barName, 'TOKEN_SALES') === 'active' ? "true" : "false"}`}
              >
                <i className="nc-icon nc-bank"></i>
                <p>Token Sales<b className="caret"></b></p>
              </a>
              <div className={this.getActiveSidebarClass(barName, 'TOKEN_SALES')} id="SidebarTokenSale">
                <ul className="nav">
                  <li onClick={() => this.handleNavigateLocation()} className={window.location.pathname === '/' ? 'active' : this.getActiveRoute(barName, ROUTE.ROUTES_PREFIX.LIVE.ROUTE)} >
                    <Link to="/live"><span className="sidebar-mini-icon">L</span><span className="sidebar-normal">
                      Live </span></Link>
                  </li>
                  <li onClick={() => this.handleNavigateLocation()} className={this.getActiveRoute(barName, ROUTE.ROUTES_PREFIX.UPCOMING.ROUTE)} >
                    <Link to="/upcoming"><span className="sidebar-mini-icon">U</span><span className="sidebar-normal">
                      Upcoming </span></Link>
                  </li>
                  <li onClick={() => this.handleNavigateLocation()} className={this.getActiveRoute(barName, ROUTE.ROUTES_PREFIX.CLOSED.ROUTE)} >
                    <Link to="/closed"><span className="sidebar-mini-icon">C</span><span className="sidebar-normal">
                      Closed </span></Link>
                  </li>
                </ul>
              </div>
            </li>

            <li className={this.getCollapseGroupClass(barName, 'STAKING')}>
              <a
                data-toggle="collapse"
                href="#SidebarStaking"
                aria-expanded={`${this.getCollapseGroupClass(barName, 'STAKING') === 'active' ? "true" : "false"}`}
              >
                <i className="nc-icon nc-cloud-download-93"></i>
                <p>Staking<b className="caret"></b></p>
              </a>
              <div className={this.getActiveSidebarClass(barName, 'STAKING')} id="SidebarStaking">
                <ul className="nav">
                  <li onClick={() => this.handleNavigateLocation()} className={this.getActiveRoute(barName, ROUTE.ROUTES_PREFIX.DAL_STAKING.ROUTE)} >
                    <a><span className="sidebar-mini-icon">DS</span><span
                      className="sidebar-normal"> DAL Staking<span className="comingsoon">(coming soon)</span></span></a>
                  </li>
                  <li onClick={() => this.handleNavigateLocation()} className={this.getActiveRoute(barName, ROUTE.ROUTES_PREFIX.MINTING_NFTS.ROUTE)} >
                    <a><span className="sidebar-mini-icon">MN</span><span
                      className="sidebar-normal"> Minting NFTs<span className="comingsoon">(coming soon)</span></span></a>
                  </li>
                </ul>
              </div>
            </li>

            {authorized && (
              <li className={this.getCollapseGroupClass(barName, 'FOR_PROJECT')}>
                <a
                  data-toggle="collapse"
                  href="#SidebarForProject"
                  aria-expanded={`${this.getCollapseGroupClass(barName, 'FOR_PROJECT') === 'active' ? "true" : "false"}`}
                >
                  <i className="nc-icon nc-spaceship"></i>
                  <p>for Project<b className="caret"></b></p>
                </a>
                <div className={this.getActiveSidebarClass(barName, 'FOR_PROJECT')} id="SidebarForProject">
                  <ul className="nav">
                    <li onClick={() => this.handleNavigateLocation()} className={this.getActiveRoute(barName, ROUTE.ROUTES_PREFIX.CREATE_TOKEN.ROUTE)} >
                      <Link to="/create-token"><span className="sidebar-mini-icon">CT</span><span
                        className="sidebar-normal"> Create Token </span></Link>
                    </li>
                    <li onClick={() => this.handleNavigateLocation()} className={this.getActiveRoute(barName, ROUTE.ROUTES_PREFIX.CREATE_TOKEN_SALE.ROUTE)} >
                      <Link to="/create-token-sale"><span className="sidebar-mini-icon">CN</span><span
                        className="sidebar-normal"> Create Token Sale </span></Link>
                    </li>
                    <li onClick={() => this.handleNavigateLocation()} className={this.getActiveRoute(barName, ROUTE.ROUTES_PREFIX.LAUNCHED_SALES.ROUTE)} >
                      <Link to="/launched-sales"><span className="sidebar-mini-icon">LS</span><span
                        className="sidebar-normal"> Launched Sales </span></Link>
                    </li>
                  </ul>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    )
  }
}

export default withRouter(SideBar)
