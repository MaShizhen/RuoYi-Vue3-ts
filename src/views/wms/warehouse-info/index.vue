<!-- eslint-disable vue/v-on-event-hyphenation -->
<template>
    <div class="app-container">
        <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true">
            <el-form-item label="仓库编码" prop="warehouseCode">
                <el-input
                    v-model="queryParams.warehouseCode"
                    placeholder="请输入仓库编码"
                    clearable
                    style="width: 200px"
                    @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="仓库名称" prop="warehouseName">
                <el-input
                    v-model="queryParams.warehouseName"
                    placeholder="请输入仓库名称"
                    clearable
                    style="width: 200px"
                    @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="负责人" prop="principal">
                <el-input
                    v-model="queryParams.principal"
                    placeholder="请输入负责人"
                    clearable
                    style="width: 200px"
                    @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="联系方式" prop="telephone">
                <el-input
                    v-model="queryParams.telephone"
                    placeholder="请输入联系方式"
                    clearable
                    style="width: 200px"
                    @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button
                    v-hasPermi="['wh:warehouse:add']"
                    type="primary"
                    plain
                    icon="Plus"
                    @click="handleAdd"
                    >新增</el-button
                >
            </el-col>
            <el-col :span="1.5">
                <el-button
                    v-hasPermi="['wh:warehouse:edit']"
                    type="success"
                    plain
                    icon="Edit"
                    :disabled="single"
                    @click="handleUpdate"
                    >修改</el-button
                >
            </el-col>
            <el-col :span="1.5">
                <el-button
                    v-hasPermi="['wh:warehouse:remove']"
                    type="danger"
                    plain
                    icon="Delete"
                    :disabled="multiple"
                    @click="handleDelete"
                    >删除</el-button
                >
            </el-col>
            <el-col :span="1.5">
                <el-button
                    v-hasPermi="['system:post:export']"
                    type="warning"
                    plain
                    icon="Download"
                    @click="handleExport"
                    >导出</el-button
                >
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="postList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="仓库编码" align="center" prop="warehouseCode" />
            <el-table-column label="仓库名称" align="center" prop="warehouseName" />
            <el-table-column label="所在城市" align="center" prop="city" />
            <el-table-column label="地址" align="center" prop="address" />
            <el-table-column label="负责人" align="center" prop="principal" />
            <el-table-column label="联系方式" align="center" prop="telephone" />
            <el-table-column label="备注" align="center" prop="remark" />
            <el-table-column
                label="操作"
                align="center"
                fixed="right"
                class-name="small-padding fixed-width"
                width="125"
            >
                <template #default="scope">
                    <el-link
                        v-hasPermi="['wh:warehouse:edit']"
                        type="primary"
                        size="small"
                        icon="Edit"
                        @click="handleUpdate(scope.row)"
                        >编辑
                    </el-link>
                    <el-divider direction="vertical" />
                    <el-link
                        v-if="scope.row.canDelete"
                        v-hasPermi="['wh:warehouse:remove']"
                        icon="Delete"
                        type="danger"
                        size="small"
                        @click="handleDelete(scope.row)"
                        >删除
                    </el-link>
                </template>
            </el-table-column>
        </el-table>

        <pagination
            v-show="total > 0"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            :total="total"
            @pagination="getList"
        />

        <!-- 添加或修改仓库对话框 -->
        <el-dialog v-model="open" :title="title" width="500px" append-to-body>
            <el-form ref="postRef" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="仓库编码" prop="warehouseCode">
                    <el-input v-model="form.warehouseCode" placeholder="请输入仓库编码" />
                </el-form-item>
                <el-form-item label="仓库名称" prop="warehouseName">
                    <el-input v-model="form.warehouseName" placeholder="请输入仓库名称" />
                </el-form-item>
                <el-form-item label="所在城市" prop="city">
                    <el-input v-model="form.city" placeholder="请输入所在城市" />
                </el-form-item>
                <el-form-item label="地址" prop="address">
                    <el-input v-model="form.address" placeholder="请输入地址" />
                </el-form-item>
                <el-form-item label="负责人" prop="principal">
                    <el-input v-model="form.principal" placeholder="请输入负责人" />
                </el-form-item>
                <el-form-item label="联系方式" prop="telephone">
                    <el-input v-model="form.telephone" placeholder="请输入联系方式" />
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                    <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button type="primary" @click="submitForm">确 定</el-button>
                    <el-button @click="cancel">取 消</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>
  
<script setup name="Warehouse-info" lang="ts">
import {
    listWarehouse,
    addWarehouse,
    delWarehouse,
    getWarehouse,
    updateWarehouse,
} from '@/api/wms/warehouse-info';
import { ElMessage } from 'element-plus';
import { getCurrentInstance, ref, reactive, toRefs, ComponentInternalInstance } from 'vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const postList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const selecteds = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');

const data = reactive<{
    form: any,
    queryParams: any,
    rules: any
}>({
    form: {},
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        warehouseCode: undefined,
        warehouseName: undefined,
        city: undefined,
        address: undefined,
        principal: undefined,
        telephone: undefined,
        remark: undefined,
        isAsc: 'asc',
    },
    rules: {
        warehouseName: [{ required: true, message: '仓库名称不能为空', trigger: 'blur' }],
        warehouseCode: [{ required: true, message: '仓库编码不能为空', trigger: 'blur' }],
        city: [{ required: true, message: '所在城市不能为空', trigger: 'blur' }],
        address: [{ required: true, message: '地址不能为空', trigger: 'blur' }],
        principal: [{ required: true, message: '负责人不能为空', trigger: 'blur' }],
        telephone: [{ required: true, message: '联系方式不能为空', trigger: 'blur' }],
        remark: [{ required: true, message: '备注不能为空', trigger: 'blur' }],
    },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询仓库列表 */
function getList() {
    loading.value = true;
    listWarehouse(queryParams.value).then((response: any) => {
        postList.value = response.rows;
        total.value = response.total;
        loading.value = false;
    });
}
/** 取消按钮 */
function cancel() {
    open.value = false;
    reset();
}
/** 表单重置 */
function reset() {
    form.value = {
        id: undefined,
        warehouseCode: undefined,
        warehouseName: undefined,
        status: '0',
        remark: undefined,
    };
    proxy!.resetForm('postRef');
}
/** 搜索按钮操作 */
function handleQuery() {
    queryParams.value.pageNum = 1;
    getList();
}
/** 重置按钮操作 */
function resetQuery() {
    proxy!.resetForm('queryRef');
    handleQuery();
}
/** 多选框选中数据 */
function handleSelectionChange(selection: any) {
    selecteds.value = selection;
    single.value = selection.length !== 1;
    multiple.value = !selection.length;
}
/** 新增按钮操作 */
function handleAdd() {
    reset();
    open.value = true;
    title.value = '添加仓库';
}
/** 修改按钮操作 */
function handleUpdate(row: any) {
    reset();
    form.value = { ...(row.id ? row : selecteds.value[0]) };
    open.value = true;
    title.value = '修改仓库';
}
/** 提交按钮 */
function submitForm() {
    (proxy!.$refs['postRef'] as any).validate((valid: boolean) => {
        if (valid) {
            if (form.value.id !== undefined) {
                updateWarehouse(form.value).then(response => {
                    proxy!.$modal.msgSuccess('修改成功');
                    open.value = false;
                    getList();
                });
            } else {
                addWarehouse(form.value).then(response => {
                    proxy!.$modal.msgSuccess('新增成功');
                    open.value = false;
                    getList();
                });
            }
        }
    });
}
/** 删除按钮操作 */
function handleDelete(row: any) {
    const deleteList = row.id ? [row] : selecteds.value;
    const cannotDelete = deleteList.filter(i => {
        return !i.canDelete;
    });
    if (cannotDelete.length) {
        return ElMessage({
            message: `单据 ${cannotDelete.map(i => i.warehouseCode).toString()} 不可删除`,
            type: 'warning',
        });
    }
    const ids = deleteList.map(i => i.id);
    const warehouseCodes = deleteList.map(i => i.warehouseCode);
    proxy!.$modal
        .confirm('是否确认删除仓库编号为"' + warehouseCodes + '"的数据项？')
        .then(function () {
            return delWarehouse(ids);
        })
        .then(() => {
            getList();
            proxy!.$modal.msgSuccess('删除成功');
        })
        .catch(() => {
            return;
        });
}
/** 导出按钮操作 */
function handleExport() {
    proxy!.download(
        'system/post/export',
        {
            ...queryParams.value,
        },
        `post_${new Date().getTime()}.xlsx`
    );
}

getList();
</script>
  