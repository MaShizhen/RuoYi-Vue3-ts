import request from '@/utils/request';

// 查询材料类型列表
export function listMaterialType(query) {
    return request({
        url: '/material/type/list',
        method: 'post',
        data: query
    });
}

// 查询材料类型详细
export function getMaterialType(postId) {
    return request({
        url: 'material/type/' + postId,
        method: 'get'
    });
}

// 新增材料类型
export function addMaterialType(data) {
    return request({
        url: '/material/type/add',
        method: 'post',
        data: data
    });
}

// 修改材料类型
export function updateMaterialType(data) {
    return request({
        url: '/material/type/update',
        method: 'post',
        data: data
    });
}

// 删除材料类型
export function delMaterialType(ids) {
    return request({
        url: '/material/type/batchDelete',
        method: 'post',
        data: {
            typeIds: ids.toString()
        }
    });
}
