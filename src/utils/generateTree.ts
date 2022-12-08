function filter(data: any[], parentField: string, id: string, item: any): any {
    const subId = item[id];
    const chil = data.filter((sub) => {
        return sub[parentField] === subId;
    });
    if (chil.length > 0) {
        return {
            ...item,
            children: chil.map((c) => {
                return filter(data, parentField, id, c);
            })
        };
    } else {
        return item;
    }
}

export default function generateTree(data: any[], parentField: string, idField: string) {
    const M = new Map();
    return data.map((item) => {
        M.set(item[idField], item);
        return item;
    }).filter((item) => {
        return !M.get(item[parentField]);
    }).map((item) => {
        return filter(data, parentField, idField, item);
    });
}
