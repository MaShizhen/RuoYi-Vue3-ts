import request from '@/utils/request';

// 查询币别配置
export function currencyList() {
    return request({
        url: '/basis/currency/list',
        method: 'post'
    });
}

// 查询供应商
export function supplierList(data: any) {
    return request({
        url: '/basis/supplier/selectList',
        method: 'post',
        data,
        params: {
            pageNum: data.pageNum,
            pageSize: data.pageSize
        }
    });
}

// 查询币别配置
export function unitList(type = 0) {
    return request({
        url: `/basis/unit/list/${type}`,
        method: 'post'
    });
}
