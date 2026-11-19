import request from '@/utils/request'

export function comparePerson(data) {
  return request({
    url: '/compare/person',
    method: 'post',
    data: data
  })
}
