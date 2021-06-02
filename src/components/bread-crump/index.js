import React from 'react';
import { Breadcrumb } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { ROUTE } from '@/constants'
import './style.scss';

const breadcrumbNameMap = {
  '/my-asset': 'My Asset',
  '/live': 'Live',
  '/upcoming': 'Upcoming',
  '/closed': 'closed',
  '/dal-staking': 'Dal taking',
  '/minting-nfts': 'Minting NFTs',
  '/create-token': 'Create token',
  '/create-token-sale': 'Create token sale',
  '/launched-sales': 'Launched token sales',
}

export default withRouter((props) => {
  const { location } = props;
  const pathSnippets = location.pathname.split('/').filter(i => i);
  let extraBreadcrumbItems
  if (!pathSnippets?.length) {
    extraBreadcrumbItems = (
      <Breadcrumb.Item key={'/'}>
        <Link to={'/'} className="text-capitalize">Live</Link>
      </Breadcrumb.Item>
    )
  } else {
    extraBreadcrumbItems = pathSnippets.map((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      return (
        <Breadcrumb.Item key={url}>
          <Link to={url} className="text-capitalize">{breadcrumbNameMap[url]}</Link>
        </Breadcrumb.Item>
      );
    });
  }

  // TODO refactor
  const currentRoute = window.location.pathname
  const routeGroups = Object.keys(ROUTE.ROUTE_GROUP)
  let baseName = ''
  routeGroups.forEach(x => {
    if (ROUTE.ROUTE_GROUP[x].AVAILABLE_ROUTES.includes(`${currentRoute}`)) {
      baseName = ROUTE.ROUTE_GROUP[x].NAME
    }
  })
  const breadcrumbItems = [
    <Breadcrumb.Item key="home">
      <Link to="/" className="text-capitalize">{baseName}</Link>
    </Breadcrumb.Item>,
  ].concat(extraBreadcrumbItems);

  return (
    <div className="bread-crump">
      <Breadcrumb separator={<i className="fas fa-angle-right bread-crump-angle-right" />}>{breadcrumbItems}</Breadcrumb>
    </div>
  );
});
