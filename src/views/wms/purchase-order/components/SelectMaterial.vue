<template>
    <el-dialog
        :model-value="!!props.display"
        title="选择材料"
        width="800px"
        top="50px"
        :inline="true"
        append-to-body
        :before-close="onClose"
        :close-on-click-modal="false"
        @keyup.enter="onSelected"
    >
        <el-form :inline="true" :model="queryParams">
            <el-form-item label="材料名称" prop="matName">
                <el-input
                    v-model="queryParams.matName"
                    placeholder="请输入材料名称"
                    clearable
                    style="width: 200px"
                    @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="材料编码" prop="matNo">
                <el-input
                    v-model="queryParams.matNo"
                    placeholder="请输入材料编码"
                    clearable
                    style="width: 200px"
                    @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="类型名称" prop="typeName">
                <el-input
                    v-model="queryParams.typeName"
                    placeholder="请输入类型名称"
                    clearable
                    style="width: 200px"
                    @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="类型编码" prop="typeNo">
                <el-input
                    v-model="queryParams.typeNo"
                    placeholder="请输入类型编码"
                    clearable
                    style="width: 200px"
                    @keyup.enter="handleQuery"
                />
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
            row-key="uid"
            style="width: 100%"
            size="small"
            highlight-current-row
            @row-click="onSelectedRow"
            @selection-change="handleSelectionChange"
        >
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column prop="matName" label="材料名称" />
            <el-table-column prop="matNo" label="材料编码" />
            <el-table-column prop="matSpc" label="材料规格" />
            <el-table-column prop="matTypeName" label="材料类型" />
            <el-table-column prop="miniQty" label="库存" />
            <el-table-column prop="supplierName" label="供应商" />
            <el-table-column prop="notaxPrice" label="无税单价" />
            <el-table-column prop="taxPrice" label="含税单价" />
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

<script setup name="SelectMaterial" lang="ts">
import { materialSeletorList } from '@/api/wms/material';
import { ElMessage } from 'element-plus';
import { watch, ref, reactive, toRefs } from 'vue';

const props = defineProps({
    display: Boolean,
    suppId: Number,
});

const data = reactive({
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        matName: undefined,
        matNo: undefined,
        typeName: undefined,
        typeNo: undefined,
    },
});

const tableData = ref([]);
const { queryParams } = toRefs(data);
const total = ref(0);
const loading = ref(true);

watch(props, n => {
    if (n.suppId) {
        handleQuery();
    }
});

function handleQuery() {
    queryParams.value.pageNum = 1;
    getList();
}

async function getList() {
    if (!props.suppId) {
        return;
    }
    loading.value = true;
    materialSeletorList({
        ...queryParams.value,
        suppId: props.suppId,
    })
        .then((response: any) => {
            tableData.value = response.rows.map((i: any) => {
                return {
                    ...i,
                    currName: i.currency?.currName,
                    matTypeName: i.matType?.typeName,
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
    const isExit = selecteds.value.findIndex((item: any) => {
        return item.matId === row.matId;
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
        ElMessage({ message: '请选择材料', type: 'info' });
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
