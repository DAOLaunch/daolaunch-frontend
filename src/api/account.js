import mockData from '@/utils/mock-data'

export function login() {
  return mockData({
    success: true,
    result: {
      token: 'SH6643HDHJSGFJSD73475674856'
    }
  })
}
