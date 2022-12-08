import request from '@/utils/request'

// 查询入仓单列表
export function listMaterialStorein(query) {
    return request({
        url: '/material/storein/list',
        method: 'post',
        data: query
    })
}

// 查询入仓单详细
export function getMaterialStorein(postId) {
    return request({
        url: 'material/type/' + postId,
        method: 'get'
    })
}

// 新增入仓单
export function addMaterialStorein(data) {
    return request({
        url: '/material/storein/add',
        method: 'post',
        data: data
    })
}

// 修改入仓单
export function updateMaterialStorein(data) {
    return request({
        url: '/material/type/update',
        method: 'post',
        data: data
    })
}

// 删除入仓单
export function delMaterialStorein(ids) {
    return request({
        url: '/material/storein/batchDelete',
        method: 'post',
        data: {
            minIds: ids
        }
    })
}

// 生成入仓单号
export function generateStoreinNo() {
    return request({
        url: '/material/storein/generateNo',
        method: 'post'
    })
}

// 入仓单明细内部批次号
export function generateBarcodeId(purId) {
    return request({
        url: '/material/storein/generateBarcodeId',
        method: 'post',
        data: {
            purIds: [purId]
        }
    })
}

// 入仓单明细内部批次号
export function storeinDetails(minId) {
    return request({
        url: `/material/storein/details/${minId}`,
        method: 'post'
    })
}
