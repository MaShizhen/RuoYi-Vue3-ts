import request from '@/utils/request'

// 查询仓位列表
export function listStorage(query) {
    return request({
        url: '/wh/storage/list',
        method: 'post',
        data: query,
        CONTENT_TYPE: 'form'
    })
}
