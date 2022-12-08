import request from '@/utils/request';

// 查询仓库列表
export function listWarehouse(query: any) {
    return request({
        url: '/wh/warehouse/list',
        method: 'post',
        data: query,
        CONTENT_TYPE: 'form'
    });
}

// 查询仓库详细
export function getWarehouse(postId: number) {
    return request({
        url: '/wh/warehouse/' + postId,
        method: 'get'
    });
}

// 新增仓库
export function addWarehouse(data: any) {
    return request({
        url: '/wh/warehouse/add',
        method: 'post',
        data: data,
        CONTENT_TYPE: 'form'
    });
}

// 修改仓库
export function updateWarehouse(data: any) {
    return request({
        url: '/wh/warehouse/edit',
        method: 'post',
        data: data,
        CONTENT_TYPE: 'form'
    });
}

// 删除仓库
export function delWarehouse(ids: number[]) {
    return request({
        url: '/wh/warehouse/remove',
        method: 'post',
        data: {
            ids: ids.toString()
        },
        CONTENT_TYPE: 'form'
    });
}
