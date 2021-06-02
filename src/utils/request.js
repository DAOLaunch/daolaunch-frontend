import lodash from 'lodash'

// eslint-disable-next-line no-underscore-dangle
let _requests = 0
// eslint-disable-next-line no-underscore-dangle
let _interceptors = {}
let accessToken = null

const triggerInterceptors = (event, data = {}) => {
  lodash.forEach(_interceptors, (interceptor) => {
    interceptor(event, data)
  })
}

class Request {
  static create = (options) => new Request(options)

  static registerInterceptor = (name, interceptor) => {
    _interceptors[name] = interceptor
  }

  static unregisterInterceptor = (name) => {
    _interceptors = lodash.omit(_interceptors, name)
  }

  static setAccessToken = (token) => {
    accessToken = token
  }

  static getAccessToken = () => accessToken

  static removeAccessToken = () => {
    accessToken = null
  }

  constructor(options) {
    this._options = options
  }

  get = (url, params, headers) => this.request({ method: 'GET', url, params, headers })

  post = (url, data, params, headers) => this.request({ method: 'POST', url, params, data, headers })

  put = (url, data, params, headers) => this.request({ method: 'PUT', url, params, data, headers })

  delete = (url, data, params, headers) => this.request({ method: 'DELETE', url, params, data, headers })

  request = async (...args) => {
    _requests += 1

    triggerInterceptors('request:start', { requests: _requests })

    try {
      return await this._request(...args)
    } finally {
      triggerInterceptors('request:done', { requests: _requests })

      _requests -= 1
    }
  }

  _request = async (requestOptions) => {
    const { method = 'GET', data = null, headers } = requestOptions
    let { url, params = null } = requestOptions

    url = this._options.endpoint + url

    if (this._options.handleToken && accessToken) {
      this._authorization = accessToken
      // if (!params) params = {}
      // params.access_token = token
    }

    if (params) {
      url += this._getQueryString(params)
    }

    const options = {
      method,
      headers: {}
    }

    if (this._authorization) {
      options.headers.Authorization = this._authorization
    }

    if (this._options.apiKey) {
      options.headers.ApiKey = this._options.apiKey
    }

    options.headers = lodash.merge(options.headers, headers)

    if (['POST', 'PUT', 'DELETE'].includes(method)) {
      if (data) {
        const serializable = lodash.isPlainObject(data) || lodash.isArray(data)

        options.body = serializable ? JSON.stringify(data) : data

        let contentType = null

        if (serializable) {
          contentType = 'application/json'
        }

        if (contentType) {
          options.headers['Content-Type'] = contentType
        }
      }
    }

    // eslint-disable-next-line
    console.log('%c --API REQUEST-- ', 'background: #222; color: #bada55', url, options)

    const res = await fetch(url, options)

    if (!res.ok) {
      triggerInterceptors('response:error', { response: res })
      throw res
    }
    let responseData = res.clone()
    const text = await res.text()

    try {
      if (res.headers.get('Content-Type') && res.headers.get('Content-Type').indexOf('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') > -1) {
        const blob = await responseData.blob()

        // 1. Get filename
        const contentDisposition = res.headers.get('Content-Disposition')
        const match = contentDisposition && contentDisposition.match(/(filename=|filename\*='')(.*)$/)
        const filename = (match && match[2]) || `${Date.now()}`

        // 2. Create blob link to download
        const tempUrl = window.URL.createObjectURL(new Blob([blob]))
        const link = document.createElement('a')
        link.href = tempUrl
        link.setAttribute('download', filename)

        // 3. Append to html page
        document.body.appendChild(link)

        // 4. Force download
        link.click()

        // 5. Clean up and remove the link
        link.parentNode.removeChild(link)

        return responseData
      }

      responseData = text !== '' ? JSON.parse(text) : ''

      return responseData
    } catch (error) {
      triggerInterceptors('response:error.json', { error, response: res })
      /* eslint-disable no-console */
      console.error('[request] parse JSON response error:', method, url, data, params, text, error)
      throw error
    }
  }

  _getQueryString = (params) => {
    const parts = []

    lodash.forEach(params, (value, key) => {
      const values = lodash.isArray(value) ? value : [value]
      const operator = lodash.isArray(value) ? '[]=' : '='

      lodash.forEach(values, (v) => {
        parts.push(key + operator + encodeURIComponent(v))
      })
    })

    const queryString = parts.join('&')

    return queryString ? `?${queryString}` : ''
  }
}

export default Request
