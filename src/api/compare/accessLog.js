import request from '@/utils/request'

export function listAccessLog(query) {
  return request({
    url: '/compare/accessLog/list',
    method: 'get',
    params: query
  })
}

export function getAccessLog(id) {
  return request({
    url: '/compare/accessLog/' + id,
    method: 'get'
  })
}

export function delAccessLog(ids) {
  return request({
    url: '/compare/accessLog/' + ids,
    method: 'delete'
  })
}
