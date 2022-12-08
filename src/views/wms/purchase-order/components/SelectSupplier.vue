<template>
    <el-dialog
        :model-value="!!props.display"
        title="选择供应商"
        width="800px"
        top="50px"
        :inline="true"
        append-to-body
        :before-close="onClose"
        :close-on-click-modal="false"
        @keyup.enter="onSelected"
    >
        <el-form :inline="true" :model="queryParams">
            <el-form-item label="供应商编号" prop="supplierCode">
                <el-input
                    v-model="queryParams.supplierCode"
                    placeholder="请输入供应商编号"
                    clearable
                    style="width: 200px"
                    @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="供应商名称" prop="supplierName">
                <el-input
                    v-model="queryParams.supplierName"
                    placeholder="请输入供应商名称"
                    clearable
                    style="width: 200px"
                    @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            </el-form-item>
        </el-form>
        <el-table
            ref="tableRef"
            v-loading="loading"
            :data="tableData"
            stripe
            row-key="id"
            style="width: 100%"
            size="small"
            highlight-current-row
            @row-click="handleCurrentChange"
            @select="handleSelectionChange"
            @row-dblclick="rowDblclick"
        >
            <el-table-column type="selection" width="55" align="center" />

            <el-table-column prop="supplierCode" label="供应商编码" />
            <el-table-column prop="supplierName" label="供应商名称" />
            <el-table-column prop="address" label="装运地址" />
            <el-table-column prop="contactPerson" label="联络人" />
            <el-table-column prop="telephone" label="电话传真" />
            <el-table-column prop="currName" label="币别" />

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
                <el-button type="primary" @click="onSelected">确 定</el-button>
                <el-button @click="onClose">取 消</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup name="selectSupplier" lang="ts">
import { supplierList } from '@/api/basis';
import { ElMessage } from 'element-plus';
import { ref, reactive, toRefs } from 'vue';

const props = defineProps({
    display: Boolean,
});

const data = reactive({
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        supplierCode: undefined,
        supplierName: undefined,
    },
});

const tableData = ref([]);
const { queryParams } = toRefs(data);

function handleQuery() {
    queryParams.value.pageNum = 1;
    getList();
}

const total = ref(0);
const loading = ref(true);
const selectedRow = ref<any>(null);
const tableRef = ref();

async function getList() {
    loading.value = true;
    supplierList(queryParams.value)
        .then((response: any) => {
            tableData.value = response.rows.map((i: any) => {
                return {
                    ...i,
                    currName: i.currency?.currName,
                };
            });
            total.value = response.total;
            loading.value = false;
        })
        .catch(() => {
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
const rowDblclick = (row: any) => {
    selectedRow.value = row;
    onSelected();
};
const handleSelectionChange = (selection: any, row: any) => {
    handleCurrentChange(row);
};
function handleCurrentChange(row: any) {
    tableRef.value.clearSelection();
    if (selectedRow.value?.supplierCode !== row.supplierCode) {
        selectedRow.value = row;
        tableRef.value.toggleRowSelection(row, true);
    } else {
        selectedRow.value = null;
    }
}

const clear = () => {
    selectedRow.value = null;
    tableRef.value.clearSelection();
};
const emit = defineEmits(['selected', 'cancel']);
// 回填
function onSelected() {
    if (selectedRow.value) {
        emit('selected', selectedRow.value);
        clear();
    } else {
        ElMessage({ message: '请选择供应商', type: 'info' });
    }
}
function onClose() {
    emit('cancel');
    clear();
}
</script>

<style scoped>
.empty-text {
    font-size: 16px;
    position: relative;
    font-weight: bold;
    top: -20px;
}
</style>
