const ROUTES_PREFIX = {
  MY_ASSET: {
    ROUTE: '/my-asset',
    NAME: 'My asset',
  },
  LIVE: {
    ROUTE: '/live',
    NAME: 'Live',
  },
  UPCOMING: {
    ROUTE: '/upcoming',
    NAME: 'Upcoming',
  },
  CLOSED: {
    ROUTE: '/closed',
    NAME: 'Closed',
  },
  DAL_STAKING: {
    ROUTE: '/dal-staking',
    NAME: 'DAL staking',
  },
  MINTING_NFTS: {
    ROUTE: '/minting-nfts',
    NAME: 'Minting NFTs',
  },
  CREATE_TOKEN: {
    ROUTE: '/create-token',
    NAME: 'Create token',
  },
  CREATE_TOKEN_SALE: {
    ROUTE: '/create-token-sale',
    NAME: 'create token sale',
  },
  LAUNCHED_SALES: {
    ROUTE: '/launched-sales',
    NAME: 'Launched sales',
  },
}

const ROUTE_GROUP = {
  ACCOUNT: {
    AVAILABLE_ROUTES: ['/my-asset'],
    NAME: 'Account'
  },
  TOKEN_SALES: {
    AVAILABLE_ROUTES: ['/', '/live', '/upcoming', '/closed'],
    NAME: 'Token sales'
  },
  STAKING: {
    AVAILABLE_ROUTES: ['/dal-staking', '/minting-nfts'],
    NAME: 'Staking'
  },
  FOR_PROJECT: {
    AVAILABLE_ROUTES: ['/create-token', '/create-token-sale', '/launched-sales'],
    NAME: 'For project'
  },
}

export default {
  ROUTES_PREFIX,
  ROUTE_GROUP,
}