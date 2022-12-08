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
            <el-form-item label="材料编码" prop="matNo">
                <el-input
                    v-model="queryParams.matNo"
                    placeholder="请输入材料编码"
                    clearable
                    style="width: 200px"
                    @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="材料名称" prop="matName">
                <el-input
                    v-model="queryParams.matName"
                    placeholder="请输入材料名称"
                    clearable
                    style="width: 200px"
                    @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="状态" prop="statusArr">
                <el-checkbox-group v-model="queryParams.statusArr">
                    <el-checkbox v-for="stat in materialStatusArr" :key="stat.value" :label="stat.value">{{
                        stat.label
                    }}</el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>
        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button
                    v-hasPermi="['material:project:add']"
                    type="primary"
                    plain
                    icon="Plus"
                    @click="handleAdd"
                    >新增</el-button
                >
            </el-col>
            <el-col :span="1.5">
                <el-button
                    v-hasPermi="['material:project:update']"
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
                    v-hasPermi="['material:project:delete']"
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
            <el-col :span="1.5">
                <el-button
                    v-hasPermi="['material:project:submit']"
                    plain
                    :disabled="selecteds.length === 0"
                    @click="updateMaterialStatus(0)"
                    >提交</el-button
                >
            </el-col>
            <el-col :span="1.5">
                <el-button
                    v-hasPermi="['material:project:cancelSubmit']"
                    plain
                    :disabled="selecteds.length === 0"
                    @click="updateMaterialStatus(1)"
                    >取消提交</el-button
                >
            </el-col>
            <el-col :span="1.5">
                <el-button
                    v-hasPermi="['material:project:audit']"
                    plain
                    :disabled="selecteds.length === 0"
                    @click="updateMaterialStatus(2)"
                    >审核</el-button
                >
            </el-col>
            <el-col :span="1.5">
                <el-button
                    v-hasPermi="['material:project:cancelAudit']"
                    plain
                    :disabled="selecteds.length === 0"
                    @click="updateMaterialStatus(3)"
                    >反审核</el-button
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
            <el-table-column label="类别代码" align="center" prop="matType.typeNo" width="150" />
            <el-table-column label="类别名称" align="center" prop="matType.typeName" width="150" />
            <el-table-column label="材料编码" align="center" prop="matNo" width="150" />
            <el-table-column label="材料名称" align="center" prop="matName" width="150" />
            <el-table-column label="状态" align="center" prop="statusName" width="150" />
            <el-table-column label="材料规格" align="center" prop="matSpc" width="150" />
            <el-table-column label="单位" align="center" prop="unit.unitName" />
            <el-table-column label="重量" align="center" prop="unitWeight" />
            <el-table-column label="长" align="center" prop="unitLength" />
            <el-table-column label="宽" align="center" prop="unitWidth" />
            <el-table-column label="颜色" align="center" prop="matColor" width="150" />
            <el-table-column label="安全库存" align="center" prop="miniQty" width="150" />
            <!-- <el-table-column label="IPC" align="center" prop="isIqc" width="150" /> 
<el-table-column label="先进先出" align="center" prop="isFifo" width="150" />  -->
            <el-table-column label="保质期天数" align="center" prop="validDays" width="120" />
            <el-table-column label="默认仓库" align="center" prop="warehouseId" width="150" />
            <el-table-column
                label="备注"
                align="center"
                prop="memo"
                width="150"
                :show-overflow-tooltip="true"
            />
            <!-- <el-table-column label="创建人" align="center" prop="xx" width="150" /> 
<el-table-column label="创建时间" align="center" prop="xx" width="150" /> 
<el-table-column label="修改人" align="center" prop="xx" width="150" /> 
<el-table-column label="修改时间" align="center" prop="xx" width="150" />  -->
            <el-table-column
                label="操作"
                align="center"
                fixed="right"
                class-name="small-padding fixed-width"
                width="140"
            >
                <template #default="scope">
                    <el-link
                        v-hasPermi="['material:project:update']"
                        type="primary"
                        size="small"
                        icon="Edit"
                        @click="handleUpdate(scope.row)"
                        >编辑
                    </el-link>
                    <el-divider direction="vertical" />
                    <el-link
                        v-hasPermi="['material:project:delete']"
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
        <el-dialog v-model="open" :title="title" width="80%" append-to-body>
            <el-form ref="postRef" :model="form" :rules="rules" label-width="100px">
                <el-row>
                    <el-col :xs="24" :sm="12" :lg="8" :xl="6">
                        <el-form-item label="材料类型" prop="typeId">
                            <el-tree-select
                                v-model="form.typeId"
                                style="width: 100%"
                                :data="materialTypeTree"
                                :render-after-expand="false"
                                @change="generateMatNo"
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="12" :lg="8" :xl="6">
                        <el-form-item label="材料名称" prop="matName">
                            <el-input v-model="form.matName" />
                        </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="12" :lg="8" :xl="6">
                        <el-form-item label="单位" prop="unitId">
                            <el-select-v2
                                v-model="form.unitId"
                                :options="unitListData"
                                placeholder="请选择"
                                style="width: 100%"
                                filterable
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="12" :lg="8" :xl="6">
                        <el-form-item label="长" prop="unitLength">
                            <el-input-number v-model="form.unitLength" :min="0" style="width: 100%" />
                        </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="12" :lg="8" :xl="6">
                        <el-form-item label="颜色" prop="matColor">
                            <el-input v-model="form.matColor" />
                        </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="12" :lg="8" :xl="6">
                        <el-form-item label="禁止采购" prop="forbidPurchase">
                            <el-switch v-model="form.forbidPurchase" />
                        </el-form-item>
                    </el-col>

                    <el-col :xs="24" :sm="12" :lg="8" :xl="6">
                        <el-form-item label="IQC" prop="isIqc">
                            <el-switch v-model="form.isIqc" />
                        </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="12" :lg="8" :xl="6">
                        <el-form-item label="保质期天数" prop="validDays">
                            <el-input-number v-model="form.validDays" :min="0" style="width: 100%" />
                        </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="12" :lg="8" :xl="6">
                        <el-form-item label="材料编码" prop="matNo">
                            <el-input v-model="form.matNo" readonly />
                        </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="12" :lg="8" :xl="6">
                        <el-form-item label="材料规格" prop="matSpc">
                            <el-input v-model="form.matSpc" />
                        </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="12" :lg="8" :xl="6">
                        <el-form-item label="重量" prop="unitWeight">
                            <el-input-number v-model="form.unitWeight" :min="0" style="width: 100%" />
                        </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="12" :lg="8" :xl="6">
                        <el-form-item label="宽" prop="unitWidth">
                            <el-input-number v-model="form.unitWidth" :min="0" style="width: 100%" />
                        </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="12" :lg="8" :xl="6">
                        <el-form-item label="安全库存" prop="miniQty">
                            <el-input-number v-model="form.miniQty" :min="0" style="width: 100%" />
                        </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="12" :lg="8" :xl="6">
                        <el-form-item label="含税单价" prop="taxPrice">
                            <el-input-number
                                v-model="form.taxPrice"
                                :min="0"
                                style="width: 100%"
                                @change="calcMoney()"
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="12" :lg="8" :xl="6">
                        <el-form-item label="税率" prop="taxRate">
                            <el-input-number
                                v-model="form.taxRate"
                                :min="0"
                                style="width: 100%"
                                @change="calcMoney()"
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="12" :lg="8" :xl="6">
                        <el-form-item label="无税单价" prop="notaxPrice">
                            <el-input v-model="form.notaxPrice" readonly style="width: 100%" />
                        </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="12" :lg="8" :xl="6">
                        <el-form-item label="先进先出" prop="isFifo">
                            <el-switch v-model="form.isFifo" />
                        </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="12" :lg="8" :xl="6">
                        <el-form-item label="采购周期" prop="xxx">
                            <el-input-number v-model="form.unitWeight" :min="0" style="width: 100%" />
                        </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="12" :lg="8" :xl="6">
                        <el-form-item label="默认仓库" prop="warehouseId">
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
        <template :if="selectWarehouse">
            <SelectWarehouse
                :display="selectWarehouse"
                @selected="onSelectWarehouse"
                @cancel="toogleSelectWarehouse(false)"
            />
        </template>
    </div>
</template>

<script setup name="Material" lang="ts">
import { unitList } from '@/api/basis';
import {
    listMaterial,
    addMaterial,
    delMaterial,
    getMaterial,
    updateMaterial,
    generateMaterialNo,
    updateMaterialStatusServer,
    batchBackStatusServer,
} from '@/api/wms/material';
import { listMaterialType } from '@/api/wms/material-type';
import generateTree from '@/utils/generateTree';
import { times } from '@/utils/math';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getCurrentInstance, ref, reactive, toRefs, ComponentInternalInstance } from 'vue';
import SelectWarehouse from './components/SelectWarehouse.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableData = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const selecteds = ref<any[]>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');

const materialStatusArr = ref([
    { value: 0, label: '未提交' },
    { value: 1, label: '待审' },
    { value: 2, label: '已审' },
    { value: 3, label: '失效' },
]);

const materialTypeTree = ref<any[]>([]);
listMaterialType({}).then(response => {
    const dataRows = response.data.map((i: any) => {
        return {
            ...i,
            value: i.typeId,
            label: i.typeName,
        };
    });
    materialTypeTree.value = generateTree(dataRows, 'parentId', 'typeId');
});

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
        typeId: [{ required: true, message: '材料类型不能为空', trigger: 'change' }],
        matNo: [{ required: true, message: '材料编码不能为空', trigger: 'blur' }],
        matName: [{ required: true, message: '材料名称不能为空', trigger: 'blur' }],
        unitId: [{ required: true, message: '单位不能为空', trigger: 'blur' }],
        miniQty: [{ required: true, message: '安全库存不能为空', trigger: 'blur' }],
        taxPrice: [{ required: true, message: '含税单价不能为空', trigger: 'blur' }],
        notaxPrice: [{ required: true, message: '无税单价不能为空', trigger: 'blur' }],
        taxRate: [{ required: true, message: '税率不能为空', trigger: 'blur' }],
        warehouseId: [{ required: true, message: '默认仓库不能为空', trigger: 'change' }],
    },
});

const { queryParams, form, rules } = toRefs(data);
const unitListData = ref([]);
unitList().then(res => {
    unitListData.value = res.data.map((i: any) => {
        return {
            value: i.unitId,
            label: i.unitName,
        };
    });
});
/** 查询仓库列表 */
function getList() {
    loading.value = true;
    listMaterial(queryParams.value).then((response: any) => {
        tableData.value = response.rows;
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
        taxRate: undefined,
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
    title.value = '添加材料项目';
}
/** 修改按钮操作 */
function handleUpdate(row: any) {
    reset();
    form.value = { ...(row.typeId ? row : selecteds.value[0]) };
    form.value.isFifo = Boolean(form.value.isFifo);
    form.value.isIqc = Boolean(form.value.isIqc);
    form.value.forbidPurchase = Boolean(form.value.forbidPurchase);
    open.value = true;
    title.value = '修改材料项目';
}
/** 提交按钮 */
function submitForm() {
    (proxy!.$refs['postRef'] as any).validate((valid: boolean) => {
        if (valid) {
            form.value.isFifo = Boolean(form.value.isFifo);
            form.value.isIqc = Boolean(form.value.isIqc);
            form.value.forbidPurchase = Boolean(form.value.forbidPurchase);
            if (form.value.matId !== undefined) {
                updateMaterial(form.value).then((response: any) => {
                    if (response.code === 10000) {
                        ElMessageBox.alert(
                            `材料编号重复，已自动使用新的单号：${response.data.matNo}`,
                            '修改成功',
                            {
                                confirmButtonText: 'OK',
                                callback: () => {
                                    open.value = false;
                                    getList();
                                },
                            }
                        );
                    } else {
                        proxy!.$modal.msgSuccess('修改成功');
                        open.value = false;
                        getList();
                    }
                });
            } else {
                addMaterial(form.value).then((response: any) => {
                    if (response.code === 10000) {
                        ElMessageBox.alert(
                            `材料编号重复，已自动使用新的单号：${response.data.matNo}`,
                            '新增成功',
                            {
                                confirmButtonText: 'OK',
                                callback: () => {
                                    open.value = false;
                                    getList();
                                },
                            }
                        );
                    } else {
                        proxy!.$modal.msgSuccess('新增成功');
                        open.value = false;
                        getList();
                    }
                });
            }
        }
    });
}
/** 删除按钮操作 */
function handleDelete(row: any) {
    const ids = row.matId || selecteds.value.map(i => i.matId);
    const matNos = row.matNo || selecteds.value.map(i => i.matNo);
    proxy!.$modal
        .confirm('是否确认删除仓库编号为"' + matNos + '"的数据项？')
        .then(function () {
            return delMaterial(ids);
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
const generateMatNo = () => {
    generateMaterialNo(form.value.typeId).then(res => {
        form.value.matNo = res.data;
    });
};

const updateMaterialStatus = (type: number) => {
    if (selecteds.value.length === 0) {
        return ElMessage({ type: 'warning', message: '请至少选择一条数据' });
    }
    let preStatus: number, nextStatus: number;
    let actionName = '';
    let server: any = null;
    switch (type) {
        case 0:
            preStatus = 0;
            nextStatus = 1;
            actionName = '提交';
            server = updateMaterialStatusServer;
            break;
        case 1:
            preStatus = 1;
            nextStatus = 0;
            actionName = '取消提交';
            server = batchBackStatusServer;
            break;
        case 2:
            preStatus = 1;
            nextStatus = 2;
            actionName = '审核';
            server = updateMaterialStatusServer;
            break;
        case 3:
            preStatus = 2;
            nextStatus = 1;
            actionName = '反审核';
            server = batchBackStatusServer;
            break;

        default:
            break;
    }
    const needUpdateData = selecteds.value.filter(i => {
        return i.status === preStatus;
    });
    const needUpdateIds: number[] = [];
    const needUpdateCodes: number[] = [];
    needUpdateData.forEach(i => {
        needUpdateIds.push(i.matId);
        needUpdateCodes.push(i.matNo);
    });
    if (needUpdateData.length === 0) {
        ElMessage(`没有待${actionName}的数据`);
        return;
    }
    proxy!.$modal
        .confirm(`是否确认${actionName}单据：${needUpdateCodes.toString()}`)
        .then(() => {
            server(needUpdateIds, nextStatus)
                .then(() => {
                    ElMessage({
                        message: '操作成功',
                        type: 'success',
                    });
                    getList();
                })
                .catch(() => {
                    ElMessage({
                        message: '操作失败，请稍后再试',
                        type: 'error',
                    });
                });
        })
        .catch(() => {
            return;
        });
};
getList();

const calcMoney = () => {
    // TODO 金钱小数位
    form.value.notaxPrice = times(form.value.taxPrice || 0, 1 - (form.value.taxRate || 0) / 100);
};
</script>
