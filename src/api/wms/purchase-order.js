import request from '@/utils/request'

// 查询岗位列表
export function listPurchaseOrder(query, purchaseOrderStatus) {
    return request({
        url: '/material/po/list',
        method: 'post',
        data: {
            ...query,
            statusArr: query.statusArr.length === 0 ? purchaseOrderStatus.map(i => Number(i.value)) : query.statusArr.map(i => Number(i)),
            startTime: query.daterange[0],
            endTime: query.daterange[1],
            purNo: query.purNo,
            supplierName: query.supplierName,
        }
    })
}

// 查询岗位详细
export function getPurchaseOrder(postId) {
    return request({
        url: '/basis/supplier/' + postId,
        method: 'get'
    })
}

// 添加采购单
export function addPurchaseOrder(data) {
    return request({
        url: '/material/po/add',
        method: 'post',
        data
    })
}

// 修改岗位
export function updatePurchaseOrder(data) {
    return request({
        url: '/material/po/update',
        method: 'post',
        data: data
    })
}

// 删除岗位
export function delPurchaseOrder(purIds) {
    return request({
        url: '/material/po/batchDelete',
        method: 'post',
        data: {
            purIds: purIds.toString()
        }
    })
}
// 获取采购单详情
export function queryPurchaseOrder({ purId }) {
    return request({
        url: `/material/po/${purId}`,
        method: 'post'
    })
}
// 获取采购单明细
export function queryPurchaseOrderMats({ purId }) {
    return request({
        url: `/material/po/details/${purId}`,
        method: 'post'
    })
}
// 修改采购单状态
export function bchatUpdateStatus(purIds, status) {
    return request({
        url: `/material/po/batchUpdateStatus`,
        method: 'post',
        data: {
            purIds,
            status
        }
    })
}
// 回退采购单状态
export function batchBackStatus(purIds, status) {
    return request({
        url: `/material/po/batchBackStatus`,
        method: 'post',
        data: {
            purIds,
            status
        }
    })
}

// 生成采购单号
export function generatePoNo() {
    return request({
        url: `/material/po/generateNo`,
        method: 'post'
    })
}

// 弹窗采购单分页列表
// 该接口用于在新增入仓单时，根据选择的“供应商”查询改供应商所有的已审核、已入仓的采购单数据
export function purchaseOrderlistForStorein(query) {
    return request({
        url: `/material/po/listForStorein`,
        method: 'post',
        data: query
    })
}
