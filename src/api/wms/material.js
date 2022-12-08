import request from '@/utils/request'

// 采购单，选择物料弹窗
export function materialSeletorList(data) {
    return request({
        url: '/material/project/listForSelect',
        method: 'post',
        data
    })
}

export function materialLatestRecord(matId) {
    return request({
        url: `/material/po/mat/latelyList/${matId}`,
        method: 'post',
    })
}

// 查询材料列表
export function listMaterial(query) {
    return request({
        url: '/material/project/list',
        method: 'post',
        data: query
    })
}

// 查询材料详细
export function getMaterial(postId) {
    return request({
        url: 'material/type/' + postId,
        method: 'get'
    })
}

// 新增材料
export function addMaterial(data) {
    return request({
        url: '/material/project/add',
        method: 'post',
        data: data
    })
}

// 修改材料
export function updateMaterial(data) {
    return request({
        url: '/material/project/update',
        method: 'post',
        data: data
    })
}

// 删除材料
export function delMaterial(ids) {
    return request({
        url: '/material/project/batchDelete',
        method: 'post',
        data: {
            matIds: ids.toString()
        }
    })
}

// 生成材料编码
export function generateMaterialNo(typeId) {
    return request({
        url: `/material/project/generateNo/${typeId}`,
        method: 'post'
    })
}

// 修改材料状态
export function updateMaterialStatusServer(matIds, status) {
    return request({
        url: `/material/project/batchUpdateStatus`,
        method: 'post',
        data: {
            matIds,
            status
        }
    })
}

// 修改材料状态
export function batchBackStatusServer(matIds, status) {
    return request({
        url: `/material/project/batchBackStatus`,
        method: 'post',
        data: {
            matIds,
            status
        }
    })
}
