<template>
    <el-dialog
        :model-value="!!props.display"
        title="选择采购单"
        width="800px"
        top="50px"
        :inline="true"
        append-to-body
        :before-close="onClose"
        :close-on-click-modal="false"
        @keyup.enter="onSelected"
    >
        <el-form :inline="true" :model="queryParams">
            <el-form-item label="材料编码" prop="matNo">
                <el-input
                    v-model="queryParams.matNo"
                    placeholder="请输入材料编码"
                    clearable
                    style="width: 150px"
                    @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="采购单创建时间" prop="typeName">
                <el-date-picker v-model="queryParams.daterange" style="width: 220px" type="daterange" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            </el-form-item>
        </el-form>

        <!-- 选中项 -->
        <div style="height: 34px">
            <el-tag
                v-for="(item, index) in selecteds"
                :key="index"
                style="margin-right: 5px"
                type="info"
                closable
                @close="unSelectRow(index, item)"
                >{{ item.matNo }}</el-tag
            >
        </div>

        <el-table
            ref="tableRef"
            v-loading="loading"
            :data="tableData"
            stripe
            row-key="purId"
            style="width: 100%"
            size="small"
            highlight-current-row
            @row-click="onSelectedRow"
            @selection-change="handleSelectionChange"
        >
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column prop="purNo" label="采购单号" width="100" />
            <el-table-column prop="matNo" label="供应商" width="100" />
            <el-table-column prop="matName" label="材料编码" width="100" />
            <el-table-column prop="matSpc" label="材料名称" width="100" />
            <el-table-column prop="ordQty" label="材料规格" />
            <el-table-column prop="unitName" label="单位" />
            <el-table-column prop="ordQty" label="采购单数量" width="150" />
            <el-table-column prop="completeQty" label="已送数量" />
            <el-table-column prop="unitName" label="待送数量">
                <template #default="scope">
                    <span>{{ scope.row.ordQty - scope.row.completeQty }}</span>
                </template>
            </el-table-column>
            <template #empty>
                <div style="margin-top: 15px">
                    <img src="@/assets/empty.png" />
                    <div class="empty-text">没有数据</div>
                </div>
            </template>
        </el-table>
        <!-- 分页 -->
        <div style="display: flex; justify-content: flex-end">
            <pagination
                v-show="total > 0"
                v-model:page="queryParams.pageNum"
                v-model:limit="queryParams.pageSize"
                :total="total"
                @pagination="getList"
            />
        </div>

        <template #footer>
            <div class="dialog-footer">
                <el-button type="primary" :disabled="selecteds.length === 0" @click="onSelected"
                    >确 定</el-button
                >
                <el-button @click="onClose">取 消</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup name="SelectPurchaseOrder" lang="ts">
import { purchaseOrderlistForStorein } from '@/api/wms/purchase-order';
import { ElMessage } from 'element-plus';
import { watch, ref, reactive, toRefs } from 'vue';

const props = defineProps({
    display: Boolean,
    supplierId: Number,
});

const data = reactive({
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        matNo: undefined,
        daterange: [],
    },
});

const tableData = ref([]);
const { queryParams } = toRefs(data);
const total = ref(0);
const loading = ref(true);

watch(props, n => {
    if (n.supplierId) {
        handleQuery();
    }
});

function handleQuery() {
    queryParams.value.pageNum = 1;
    getList();
}

async function getList() {
    if (!props.supplierId) {
        return;
    }
    loading.value = true;
    purchaseOrderlistForStorein({
        ...queryParams.value,
        supplierId: props.supplierId,
    })
        .then((response: any) => {
            tableData.value = response.rows.map((i: any) => {
                return {
                    ...i,
                    matNo: i.mat?.matNo,
                    matName: i.mat?.matName,
                    matSpc: i.mat?.matSpc,
                    unitName: i.mat?.unit?.unitName,
                };
            });
            total.value = response.total;
            loading.value = false;
        })
        .catch(err => {
            // 查询失败
            loading.value = false;
            tableData.value = [];
            total.value = 0;
        });
}
// 页码发生改变
function handleCurrentChange_cust(pageNum: number) {
    queryParams.value.pageNum = pageNum;
    getList();
}
getList();

const emit = defineEmits(['selected', 'cancel']);

const clear = () => {
    selecteds.value = [];
    tableRef.value.clearSelection();
};
function onClose() {
    emit('cancel');
    clear();
}
/** 多选框选中数据 */
const selecteds = ref<any[]>([]);
const tableRef = ref();

// 单击行
function onSelectedRow(row: any) {
    const isExit = selecteds.value.findIndex(item => {
        return item.purId === row.purId;
    });
    if (isExit === -1) {
        selecteds.value.push(row);
        tableRef.value.toggleRowSelection(row, true);
    } else {
        selecteds.value = selecteds.value.filter((_, index) => index !== isExit);
        tableRef.value.toggleRowSelection(row, false);
    }
}
function handleSelectionChange(selection: any) {
    selecteds.value = selection;
}
function onSelected() {
    if (selecteds.value.length === 0) {
        ElMessage({ message: '请选择单据', type: 'info' });
    } else {
        emit('selected', selecteds.value);
        clear();
    }
}
// tag标签关闭事件
const unSelectRow = (index: number, row: any) => {
    selecteds.value.splice(index, 1);
    tableRef.value.toggleRowSelection(row, false);
};
</script>

<style scoped>
.empty-text {
    font-size: 16px;
    position: relative;
    font-weight: bold;
    top: -20px;
}
</style>
