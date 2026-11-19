import request from '@/utils/request'

export function listIpUser(query) {
  return request({
    url: '/compare/ipUser/list',
    method: 'get',
    params: query
  })
}

export function getIpUser(id) {
  return request({
    url: '/compare/ipUser/' + id,
    method: 'get'
  })
}

export function addIpUser(data) {
  return request({
    url: '/compare/ipUser',
    method: 'post',
    data: data
  })
}

export function updateIpUser(data) {
  return request({
    url: '/compare/ipUser',
    method: 'put',
    data: data
  })
}

export function delIpUser(ids) {
  return request({
    url: '/compare/ipUser/' + ids,
    method: 'delete'
  })
}

export function ipUserOptions() {
  return request({
    url: '/compare/ipUser/optionselect',
    method: 'get'
  })
}
