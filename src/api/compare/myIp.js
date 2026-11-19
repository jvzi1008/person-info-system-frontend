import request from '@/utils/request'

// 我的 IP 授权列表
export function listMyIps() {
  return request({
    url: '/compare/my/ip',
    method: 'get'
  })
}

// 添加我的 IP
export function addMyIp(data) {
  return request({
    url: '/compare/my/ip',
    method: 'post',
    data: data
  })
}

// 删除我的 IP
export function delMyIp(id) {
  return request({
    url: '/compare/my/ip/' + id,
    method: 'delete'
  })
}
