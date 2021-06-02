import Request from '@/utils/request'
import Configs from '@/configs'

const endpoint = `${Configs.API_URL}`

const ExternalApi = Request.create({
  endpoint: ''
})

const MainApi = Request.create({
  endpoint,
  handleToken: true
})

export { MainApi, ExternalApi }
