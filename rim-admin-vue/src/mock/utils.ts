import Mock from 'mockjs'

export const setupMock = (mocks: Record<string, any>) => {
    Object.keys(mocks).forEach(key => {
      const [method, url] = key.split(' ')
      Mock.mock(new RegExp(url), method.toLowerCase(), mocks[key])
    })
  }