import React, { Component } from 'react'
import './style.scss'

class Footer extends Component {

  render() {
    return (
        <footer className="footer footer-black  footer-white ">
            <div className="container-fluid">
            <div className="row">
                <nav className="footer-nav">
                <ul>
                    <li><a href="https://daolaunch.net/" target="_blank">DAOLaunch</a></li>
                </ul>
                </nav>
                <div className="credits ml-auto">
                <span className="copyright">
                    © 2021 DAO Launch. All Right Reserved.
                </span>
                </div>
            </div>
            </div>
        </footer>
    )
  }
}

export default Footer
