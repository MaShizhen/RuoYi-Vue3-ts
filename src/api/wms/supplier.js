import request from '@/utils/request'

// 查询供应商列表
export function listSupplier(query) {
    return request({
        url: '/basis/supplier/list',
        method: 'post',
        data: query,
        CONTENT_TYPE: 'form'
    })
}

// 查询供应商详细
export function getSupplier(postId) {
    return request({
        url: '/basis/supplier/' + postId,
        method: 'get'
    })
}

// 新增供应商
export function addSupplier(data) {
    return request({
        url: '/basis/supplier/add',
        method: 'post',
        data: data,
        CONTENT_TYPE: 'form'
    })
}

// 修改供应商
export function updateSupplier(data) {
    return request({
        url: '/basis/supplier/edit',
        method: 'post',
        data: data,
        CONTENT_TYPE: 'form'
    })
}

// 删除供应商
export function delSupplier(ids) {
    return request({
        url: '/basis/supplier/remove',
        method: 'post',
        data: {
            ids: ids.toString()
        },
        CONTENT_TYPE: 'form'
    })
}
