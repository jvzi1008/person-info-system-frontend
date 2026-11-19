import request from '@/utils/request'

export function listIpAuth(query) {
  return request({
    url: '/compare/ipAuth/list',
    method: 'get',
    params: query
  })
}

export function getIpAuth(id) {
  return request({
    url: '/compare/ipAuth/' + id,
    method: 'get'
  })
}

export function addIpAuth(data) {
  return request({
    url: '/compare/ipAuth',
    method: 'post',
    data: data
  })
}

export function updateIpAuth(data) {
  return request({
    url: '/compare/ipAuth',
    method: 'put',
    data: data
  })
}

export function auditIpAuth(data) {
  return request({
    url: '/compare/ipAuth/audit',
    method: 'put',
    data: data
  })
}

export function ipAuthUserOptions() {
  return request({
    url: '/compare/ipAuth/userOptions',
    method: 'get'
  })
}

export function delIpAuth(ids) {
  return request({
    url: '/compare/ipAuth/' + ids,
    method: 'delete'
  })
}
