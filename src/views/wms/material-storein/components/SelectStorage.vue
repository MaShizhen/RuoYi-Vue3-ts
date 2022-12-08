<template>
    <el-dialog
        title="选择仓位"
        width="800px"
        top="50px"
        :inline="true"
        :model-value="!!props.display"
        append-to-body
        :before-close="onClose"
        :close-on-click-modal="false"
        @keyup.enter="onSelected"
    >
        <el-form :inline="true" :model="queryParams">
            <el-form-item label="仓位编码" prop="storageCode">
                <el-input
                    v-model="queryParams.storageCode"
                    placeholder="请输入仓位编码"
                    clearable
                    style="width: 200px"
                    @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="仓位名称" prop="storageName">
                <el-input
                    v-model="queryParams.storageName"
                    placeholder="请输入仓位名称"
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
            <el-table-column label="仓位编码" align="center" prop="storageCode" />
            <el-table-column label="仓位名称" align="center" prop="storageName" />
            <el-table-column label="仓位条码" align="center" prop="storageBarcode" />
            <el-table-column label="是否停用" align="center" prop="isDisable">
                <template #default="scope">
                    <span>{{ scope.row.isDisable ? '是' : '否' }}</span>
                </template>
            </el-table-column>
            <el-table-column label="空库位标识" align="center" prop="isEmpty">
                <template #default="scope">
                    <span>{{ scope.row.isEmpty ? '是' : '否' }}</span>
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
                <el-button type="primary" @click="onSelected">确 定</el-button>
                <el-button @click="onClose">取 消</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup name="selectStorage" lang="ts">
import { listStorage } from '@/api/wms/storage';
import { ElMessage } from 'element-plus';
import { watch, ref, reactive, toRefs } from 'vue';

const props = defineProps({
    display: Boolean,
    warehouseId: Number,
});

watch(props, n => {
    if (n.warehouseId) {
        handleQuery();
    }
});

const data = reactive({
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        warehouseId: null as unknown as number,
        storageCode: undefined,
        storageName: undefined,
    },
});

const tableData = ref([]);
const { queryParams } = toRefs(data);

function handleQuery() {
    if (props.warehouseId) {
        queryParams.value.warehouseId = props.warehouseId;
        queryParams.value.pageNum = 1;
        getList();
    }
}

const total = ref(0);
const loading = ref(true);
const selectedRow = ref<any>(null);
const tableRef = ref();

async function getList() {
    if (!queryParams.value.warehouseId) {
        return;
    }
    loading.value = true;
    listStorage(queryParams.value)
        .then((response: any) => {
            tableData.value = response.rows;
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

const rowDblclick = (row: any) => {
    selectedRow.value = row;
    onSelected();
};
const handleSelectionChange = (selection: any, row: any) => {
    handleCurrentChange(row);
};
function handleCurrentChange(row: any) {
    tableRef.value.clearSelection();
    if (selectedRow.value?.storageCode !== row.storageCode) {
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
        ElMessage({ message: '请选择仓位', type: 'info' });
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
