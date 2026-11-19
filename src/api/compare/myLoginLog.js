import request from '@/utils/request'

// 我的登录日志
export function listMyLoginLog(query) {
  return request({
    url: '/compare/my/loginLog',
    method: 'get',
    params: query
  })
}
