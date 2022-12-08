<template>
    <div class="app-container">
        <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true">
            <el-form-item label="类型编码" prop="typeNo">
                <el-input
                    v-model="queryParams.typeNo"
                    placeholder="请输入类型编码"
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
            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button
                    v-hasPermi="['material:type:add']"
                    type="primary"
                    plain
                    icon="Plus"
                    @click="handleAdd"
                    >新增</el-button
                >
            </el-col>
            <el-col :span="1.5">
                <el-button
                    v-hasPermi="['material:type:update']"
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
                    v-hasPermi="['material:type:delete']"
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

        <el-table
            v-loading="loading"
            :data="tableData"
            row-key="typeId"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
            @selection-change="handleSelectionChange"
        >
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="类型编码" align="center" prop="typeNo" width="150" />
            <el-table-column width="150" label="类型名称" align="center" prop="typeName" />
            <!-- <el-table-column label="父类编码" align="center" prop="parentName" /> -->
            <el-table-column label="显示顺序" align="center" prop="orderNum" />
            <el-table-column label="编码前缀" align="center" prop="prefixNo" />
            <!-- <el-table-column label="IQC" align="center" prop="isIqc" /> -->
            <el-table-column label="先进先出" align="center" prop="isFifo">
                <template #default="scope">
                    <span>{{ scope.row.isFifo ? '是' : '否' }}</span>
                </template>
            </el-table-column>
            <el-table-column label="有效期" align="center" prop="validDays" />
            <!-- <el-table-column label="特殊键值" align="center" prop="specKey" /> -->
            <el-table-column label="默认仓库" align="center" prop="warehouseName" />
            <!-- <el-table-column label="备注" align="center" prop="memo" /> -->
            <el-table-column label="创建人" align="center" prop="createNickName" />
            <el-table-column width="170" label="创建时间" align="center" prop="createTime" />
            <!-- <el-table-column label="修改人" align="center" prop="updateBy" /> -->
            <el-table-column width="170" label="修改时间" align="center" prop="updateTime" />
            <el-table-column
                label="操作"
                align="center"
                fixed="right"
                class-name="small-padding fixed-width"
                width="140"
            >
                <template #default="scope">
                    <el-link
                        v-hasPermi="['material:type:update']"
                        type="primary"
                        size="small"
                        icon="Edit"
                        @click="handleUpdate(scope.row)"
                        >编辑
                    </el-link>
                    <el-divider v-if="scope.row.canDelete" direction="vertical" />
                    <el-link
                        v-if="scope.row.canDelete"
                        v-hasPermi="['material:type:delete']"
                        icon="Delete"
                        type="danger"
                        size="small"
                        @click="handleDelete(scope.row)"
                        >删除
                    </el-link>
                </template>
            </el-table-column>
        </el-table>

        <!-- 添加或修改仓库对话框 -->
        <el-dialog v-model="open" :title="title" width="80%" append-to-body>
            <el-form ref="postRef" :model="form" :rules="rules" label-width="100px">
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="类型编码" prop="typeNo">
                            <el-input v-model="form.typeNo" placeholder="请输入类型编码" />
                        </el-form-item>
                        <el-form-item label="父级类型" prop="parentId">
                            <el-tree-select
                                v-model="form.parentId"
                                :data="tableData"
                                :render-after-expand="false"
                            />
                        </el-form-item>
                        <el-form-item label="顺序号" prop="orderNum">
                            <el-input-number v-model="form.orderNum" :min="1" />
                        </el-form-item>
                        <el-form-item label="IQC" prop="isIqc">
                            <el-switch v-model="form.isIqc" />
                        </el-form-item>
                        <el-form-item label="特殊键" prop="specKey">
                            <el-input v-model="form.specKey" placeholder="请输入特殊键" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="类型名称" prop="typeName">
                            <el-input v-model="form.typeName" placeholder="请输入类型名称" />
                        </el-form-item>
                        <el-form-item label="编码前缀" prop="prefixNo">
                            <el-input v-model="form.prefixNo" placeholder="请输入编码前缀" />
                        </el-form-item>
                        <el-form-item label="先进先出" prop="isFifo">
                            <el-switch v-model="form.isFifo" />
                        </el-form-item>
                        <el-form-item label="有效天数" prop="validDays">
                            <el-input-number v-model="form.validDays" :min="1" />
                        </el-form-item>

                        <el-form-item label="仓库" prop="warehouseId">
                            <el-input
                                v-model="form.warehouseName"
                                readonly
                                placeholder="请选择仓库"
                                @click="toogleSelectWarehouse(true)"
                            >
                                <template #append>
                                    <i
                                        style="color: #909399; cursor: pointer"
                                        @click="toogleSelectWarehouse(true)"
                                        >···</i
                                    >
                                </template>
                            </el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="备注" prop="memo">
                    <el-input v-model="form.memo" type="textarea" placeholder="请输入备注" />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button type="primary" @click="submitForm">确 定</el-button>
                    <el-button @click="cancel">取 消</el-button>
                </div>
            </template>
        </el-dialog>
        <template v-if="selectWarehouse">
            <SelectWarehouse
                :display="selectWarehouse"
                @selected="onSelectWarehouse"
                @cancel="toogleSelectWarehouse(false)"
            />
        </template>
    </div>
</template>
  
<script setup name="Material-type" lang="ts">
import {
    listMaterialType,
    addMaterialType,
    delMaterialType,
    getMaterialType,
    updateMaterialType,
} from '@/api/wms/material-type';
import generateTree from '@/utils/generateTree';
import { ElMessage } from 'element-plus';
import SelectWarehouse from './components/SelectWarehouse.vue';
import { getCurrentInstance, ref, reactive, toRefs, ComponentInternalInstance } from 'vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableData = ref<any[]>([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const selecteds = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');

const data = reactive<{
    form: any;
    queryParams: any;
    rules: any;
}>({
    form: {},
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        typeNo: undefined,
        typeName: undefined,
    },
    rules: {
        warehouseName: [{ required: true, message: '仓库名称不能为空', trigger: 'blur' }],
        typeNo: [{ required: true, message: '类型编码不能为空', trigger: 'blur' }],
        // parentId: [
        //   { required: true, message: "父级类型不能为空", trigger: "blur" },
        // ],
        orderNum: [{ required: true, message: '顺序号不能为空', trigger: 'blur' }],
        isIqc: [{ required: true, message: 'IQC不能为空', trigger: 'blur' }],
        specKey: [{ required: true, message: '特殊键不能为空', trigger: 'blur' }],
        typeName: [{ required: true, message: '类型名称不能为空', trigger: 'blur' }],
        prefixNo: [{ required: true, message: '编码前缀不能为空', trigger: 'blur' }],
        isFifo: [{ required: true, message: '先进先出不能为空', trigger: 'blur' }],
        validDays: [{ required: true, message: '有效天数不能为空', trigger: 'blur' }],
        warehouseId: [{ required: true, message: '仓库不能为空', trigger: 'change' }],
    },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询仓库列表 */
function getList() {
    loading.value = true;
    listMaterialType(queryParams.value).then(response => {
        const dataRows = response.data.map((i: any) => {
            return {
                ...i,
                value: i.typeId,
                label: i.typeName,
            };
        });
        tableData.value = generateTree(dataRows, 'parentId', 'typeId');
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
        warehouseCode: '',
        warehouseName: '',
        typeNo: '',
        typeName: '',
        parentId: null,
        prefixNo: '',
        orderNum: null,
        isIqc: false,
        isFifo: false,
        validDays: null,
        specKey: '',
        warehouseId: '',
        memo: '',
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
    title.value = '添加材料类型';
}
/** 修改按钮操作 */
function handleUpdate(row: any) {
    reset();
    form.value = { ...(row.typeId ? row : selecteds.value[0]) };
    form.value.isFifo = Boolean(form.value.isFifo);
    form.value.isIqc = Boolean(form.value.isIqc);
    open.value = true;
    title.value = '修改材料类型';
}
/** 提交按钮 */
function submitForm() {
    (proxy!.$refs['postRef'] as any).validate((valid: any) => {
        if (valid) {
            if (form.value.typeId !== undefined) {
                updateMaterialType(form.value).then(() => {
                    proxy!.$modal.msgSuccess('修改成功');
                    open.value = false;
                    getList();
                });
            } else {
                addMaterialType(form.value).then(() => {
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
    const deleteList = row.typeId ? [row] : selecteds.value;
    const cannotDelete = deleteList.filter(i => {
        return !i.canDelete;
    });
    if (cannotDelete.length) {
        return ElMessage({
            message: `单据 ${cannotDelete.map(i => i.typeNo).toString()} 不可删除`,
            type: 'warning',
        });
    }
    const ids = deleteList.map(i => i.typeId);
    const typeNos = deleteList.map(i => i.typeNo);
    proxy!.$modal
        .confirm('是否确认删除仓库编号为"' + typeNos + '"的数据项？')
        .then(function () {
            return delMaterialType(ids);
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

const selectWarehouse = ref(false);
function toogleSelectWarehouse(bool: boolean) {
    selectWarehouse.value = bool;
}
function onSelectWarehouse(row: any) {
    form.value.warehouseId = row.id;
    form.value.warehouseCode = row.warehouseCode;
    form.value.warehouseName = row.warehouseName;
    toogleSelectWarehouse(false);
}

getList();
</script>
