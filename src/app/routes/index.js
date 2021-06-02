import React, { Suspense, lazy, useEffect, useState, Fragment } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'
import { withLocalize } from 'react-localize-redux'

import Storage from '@/utils/storage'
import Request from '@/utils/request'

/** Languages */
import errorJP from '@/languages/error-messages/jp.json'
import errorEN from '@/languages/error-messages/en.json'
import EN from '@/languages/app/en.json'
import JP from '@/languages/app/jp.json'

/** Layout */
import SideBar from '@/layouts/sidebar'
import NavBar from '@/layouts/navbar'
import Footer from '@/layouts/footer'
/** component */
import Loading from '@/components/loading'
import Page from '@/components/page'

import { PATH_NAME, PATH_NAME_CONNECTED } from './urls'

/** page */
const Home = lazy(() => import('@/pages/home'))
const MyAsset = lazy(() => import('@/pages/my-asset'))
const Live = lazy(() => import('@/pages/live'))
const Upcoming = lazy(() => import('@/pages/upcoming'))
const Closed = lazy(() => import('@/pages/closed'))

// For Project
const CreateToken = lazy(() => import('@/pages/create-token'))
const CreateTokenSale = lazy(() => import('@/pages/create-token-sale'))
const LaunchedSales = lazy(() => import('@/pages/launched-sales'))

const NotFound = lazy(() => import('@/pages/not-found'))

const PrivateRoute = ({ condition, redirect, ...props }) => {
  condition = condition()

  if (condition) return <Route {...props} />
  return <Redirect to={redirect} />
}

const HandleRoutes = ({ redirect, ...props }) => {
  const { pathname } = window.location
  const isToken = Storage.has('ACCESS_TOKEN')
  if (
    (isToken && PATH_NAME_CONNECTED.includes(pathname))
    || (!isToken && PATH_NAME.includes(pathname))
  ) {
    return <Route {...props} />
  }
  return <Redirect to={redirect} />  
}

const Routes = (props) => {
  const [finishInitialize, setFinishInitialize] = useState(false)

  useEffect(() => {
    const { initialize, addTranslationForLanguage: add } = props
    if (Storage.get('LANGUAGE') === 'en') {
      initialize({
        languages: [{
          name: 'English',
          code: 'en'
        }, {
          name: 'Japanese',
          code: 'jp'
        }],
        options: {
          renderToStaticMarkup
        }
      })
    }

    if (!Storage.has('LANGUAGE') || Storage.get('LANGUAGE') === 'jp') {
      initialize({
        languages: [{
          name: 'Japanese',
          code: 'jp'
        }, {
          name: 'English',
          code: 'en'
        }],
        options: {
          renderToStaticMarkup
        }
      })
    }

    add(errorEN, 'en')
    add(errorJP, 'jp')
    add(EN, 'en')
    add(JP, 'jp')

    const token = Storage.get('ACCESS_TOKEN')
    if (token) {
      Request.setAccessToken(`Bearer ${token}`)
    }

    window.onReady();

    setFinishInitialize(true)
  }, [])

  const _renderLazyComponent = (LazyComponent, params) => (props) => <LazyComponent {...props} {...params} />

  const _renderRoutes = () => {
    return (
      <Fragment>
        <Route exact path="/" component={_renderLazyComponent(Live)} />
        <Route exact path="/live" component={_renderLazyComponent(Live)} />
        <Route exact path="/upcoming" component={_renderLazyComponent(Upcoming)} />
        <Route exact path="/closed" component={_renderLazyComponent(Closed)} />
        <Route path="/not-found" component={_renderLazyComponent(NotFound)} />
        {
          Storage.has('ACCESS_TOKEN') && (
            <Fragment>
              <Route exact path="/my-asset" component={_renderLazyComponent(MyAsset)} />
              <Route exact path="/create-token" component={_renderLazyComponent(CreateToken)} />
              <Route exact path="/create-token-sale" component={_renderLazyComponent(CreateTokenSale)} />
              <Route exact path="/launched-sales" component={_renderLazyComponent(LaunchedSales)} />
              <Route path="/not-found" component={_renderLazyComponent(NotFound)} />
            </Fragment>
          )
        }
      </Fragment>
    )
  }

  return (
    <Router>
      {
        finishInitialize && <Suspense fallback={<Page><Loading /></Page>}>
          <SideBar />
          <div className="main-panel">
            <NavBar />
            <Switch>
              <HandleRoutes
                redirect="/"
                path="/"
                component={_renderRoutes}
              />
              <Redirect to="/" />
            </Switch>
            <Footer />
          </div>
        </Suspense>
      }
    </Router>
  )
}

export default withLocalize(Routes)
