<template>
    <div class="app-container">
        <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true">
            <el-form-item label="入仓单号" prop="minNo">
                <el-input
                    v-model="queryParams.minNo"
                    placeholder="请输入入仓单号"
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
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button
                    v-hasPermi="['material:storein:add']"
                    type="primary"
                    plain
                    icon="Plus"
                    @click="handleAdd"
                    >新增</el-button
                >
            </el-col>
            <el-col :span="1.5">
                <el-button
                    v-hasPermi="['material:storein:delete']"
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
            <el-table-column label="入仓单号" align="center" prop="minNo" width="150">
                <template #default="scope">
                    <el-link type="primary" @click="handleUpdate(scope.row)">{{ scope.row.minNo }}</el-link>
                </template>
            </el-table-column>
            <el-table-column label="供应商编号" align="center" prop="supplierCode" width="150" />
            <el-table-column label="供应商名称" align="center" prop="supplierName" width="200" />
            <el-table-column label="创建时间" align="center" prop="createTime" width="170" />
            <el-table-column label="操作人员" align="center" prop="createNickName" />
            <el-table-column label="参考单号" align="center" prop="refNo" />
            <el-table-column label="仓库" align="center" prop="warehouseName" />
            <el-table-column label="仓位" align="center" prop="storageName" />
            <!-- <el-table-column label="是否打印" align="center" prop="xxx">
        <template #default="scope">
          <span>{{ scope.row.xxx ? "是" : "否" }}</span>
        </template>
      </el-table-column> -->
            <el-table-column label="备注" align="center" prop="memo" />

            <el-table-column label="操作" align="center" fixed="right" class-name="small-padding fixed-width">
                <template #default="scope">
                    <el-link
                        v-if="scope.row.canDelete"
                        v-hasPermi="['material:storein:delete']"
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
        <el-dialog v-model="open" :title="title" width="800px" append-to-body @keyup.enter.stop="submitForm">
            <el-form
                ref="postRef"
                :model="form"
                :rules="rules"
                label-width="100px"
                :disabled="formFlag === 'view'"
            >
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="入仓单号" prop="minNo">
                            <el-input v-model="form.minNo" readonly placeholder="请输入" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="供应商" prop="suppId">
                            <el-input
                                v-model="form.supplierName"
                                readonly
                                placeholder="请选择供应商"
                                @click="toogleSelectSupplier(true)"
                            >
                                <template #append>
                                    <i
                                        style="color: #909399; cursor: pointer"
                                        @click="toogleSelectSupplier(true)"
                                        >···</i
                                    >
                                </template>
                            </el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="创建时间" prop="createTime">
                            <el-date-picker
                                v-model="form.createTime"
                                style="width: 100%"
                                type="datetime"
                                :readonly="formFlag === 'view'"
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="操作人员" prop="createByName">
                            <el-input v-model="form.createByName" readonly />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="12">
                        <el-form-item label="仓库" prop="warehouseId">
                            <el-input
                                v-model="form.warehouseName"
                                readonly
                                placeholder="请选择仓库"
                                @click="toogleSelectWarehouse(true, form)"
                            >
                                <template #append>
                                    <i
                                        style="color: #909399; cursor: pointer"
                                        @click="toogleSelectWarehouse(true, form)"
                                        >···</i
                                    >
                                </template>
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="仓位" prop="storageName">
                            <el-input
                                v-model="form.storageName"
                                readonly
                                :disabled="!form.warehouseId"
                                placeholder="请选择仓位"
                                @click="toogleSelectStorage(true)"
                            >
                                <template #append>
                                    <i
                                        style="color: #909399; cursor: pointer"
                                        @click="toogleSelectStorage(true)"
                                        >···</i
                                    >
                                </template>
                            </el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="参考单号" prop="refNo">
                            <el-input v-model="form.refNo" placeholder="请输入" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="备注" prop="memo">
                    <el-input v-model="form.memo" type="textarea" placeholder="请输入备注" />
                </el-form-item>
            </el-form>
            <h3>
                入仓采购明细
                <el-button
                    v-show="formFlag !== 'view'"
                    style="float: right"
                    type="primary"
                    @click="toogleSelectPurchaseOrder(true)"
                    >选择采购单</el-button
                >
            </h3>
            <el-table :data="form.details">
                <el-table-column label="序号" type="index" width="50" align="center" />
                <el-table-column label="物料编码" align="center" prop="matNo" width="100" />
                <el-table-column label="物料名称" align="center" prop="matName" width="100" />
                <el-table-column label="物料规格" align="center" prop="matSpc" width="100" />
                <el-table-column label="送货数量" align="center" prop="completeQty" width="100" />
                <el-table-column label="采购数量" align="center" prop="ordQty" width="100" />
                <el-table-column label="入仓数量" align="center" prop="minQty" width="170">
                    <template #default="scope">
                        <el-input-number
                            v-if="formFlag !== 'view'"
                            v-model="scope.row.minQty"
                            style="width: 100%"
                            :min="1"
                            :max="scope.row.limit ? scope.row.ordQty - scope.row.completeQty : Infinity"
                        >
                        </el-input-number>
                    </template>
                </el-table-column>
                <el-table-column label="单位" align="center" prop="unitName" />
                <el-table-column label="仓库" align="center" prop="warehouseName" width="170">
                    <template #default="scope">
                        <el-input
                            v-model="scope.row.warehouseName"
                            readonly
                            placeholder="请选择仓库"
                            :disabled="formFlag === 'view'"
                            @click="toogleSelectWarehouse(true, scope.row)"
                        >
                            <template #append>
                                <i
                                    style="color: #909399; cursor: pointer"
                                    @click="toogleSelectWarehouse(true, scope.row)"
                                    >···</i
                                >
                            </template>
                        </el-input>
                    </template>
                </el-table-column>
                <el-table-column label="仓位" align="center" prop="storageId" width="170">
                    <template #default="scope">
                        <el-input
                            v-model="scope.row.storageName"
                            readonly
                            :disabled="!scope.row.warehouseId || formFlag === 'view'"
                            placeholder="请选择仓位"
                            @click="toogleSelectStorage(true)"
                        >
                            <template #append>
                                <i style="color: #909399; cursor: pointer" @click="toogleSelectStorage(true)"
                                    >···</i
                                >
                            </template>
                        </el-input>
                    </template>
                </el-table-column>
                <el-table-column label="内部批次号" align="center" prop="barcodeId" width="170" />
                <el-table-column label="有效期（天）" align="center" prop="validDays" width="170" />
                <el-table-column label="生产日期" align="center" prop="productDate" width="170">
                    <template v-if="formFlag !== 'view'" #default="scope">
                        <el-date-picker
                            v-model="scope.row.productDate"
                            :disabled="formFlag === 'view'"
                            style="width: 100%"
                            format="YYYY/MM/DD"
                            value-format="YYYY-MM-DD"
                            type="date"
                            placeholder="选择日期"
                        >
                        </el-date-picker>
                    </template>
                </el-table-column>
                <el-table-column
                    v-if="formFlag !== 'view'"
                    label="操作"
                    align="center"
                    fixed="right"
                    class-name="small-padding fixed-width"
                >
                    <template #default="scope">
                        <el-link
                            v-hasPermi="['material:storein:delete']"
                            icon="Delete"
                            type="danger"
                            size="small"
                            @click="handleDetailDelete(scope.row)"
                            >删除</el-link
                        >
                    </template>
                </el-table-column>
            </el-table>
            <template #footer>
                <div class="dialog-footer">
                    <el-button v-if="formFlag !== 'view'" type="primary" @click="submitForm">确 定</el-button>
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
        <template v-if="selectSupplier">
            <SelectSupplier
                :display="selectSupplier"
                @selected="onSelectSupplier"
                @cancel="toogleSelectSupplier(false)"
            />
        </template>
        <template v-if="selectStorage && form.warehouseId">
            <SelectStorage
                :display="selectStorage"
                :warehouseId="form.warehouseId"
                @selected="onSelectStorage"
                @cancel="toogleSelectStorage(false)"
            />
        </template>
        <template v-if="selectPurchaseOrder && form.suppId">
            <SelectPurchaseOrder
                :display="selectPurchaseOrder"
                :supplierId="form.suppId"
                @selected="onSelectPurchaseOrder"
                @cancel="toogleSelectPurchaseOrder(false)"
            />
        </template>
    </div>
</template>

<script setup name="Material-storein" lang="ts">
import {
    listMaterialStorein,
    addMaterialStorein,
    delMaterialStorein,
    getMaterialStorein,
    updateMaterialStorein,
    generateStoreinNo,
    generateBarcodeId,
    storeinDetails,
} from '@/api/wms/material-storein';
import SelectWarehouse from './components/SelectWarehouse.vue';
import SelectSupplier from './components/SelectSupplier.vue';
import SelectStorage from './components/SelectStorage.vue';
import SelectPurchaseOrder from './components/SelectPurchaseOrder.vue';
import useUserStore from '@/store/modules/user';
import { ElMessage, ElMessageBox } from 'element-plus';
import dayjs from 'dayjs';
import { getCurrentInstance, ref, reactive, toRefs, ComponentInternalInstance } from 'vue';

const userStore = useUserStore();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable } = proxy!.useDict('sys_normal_disable');

const tableData = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const selecteds = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');
const formFlag = ref('');

const data = reactive<{
    form: any;
    queryParams: any;
    rules: any;
}>({
    form: {
        warehouseId: null,
        suppId: null,
        details: [],
    },
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        minNo: undefined,
        supplierName: undefined,
    },
    rules: {
        minNo: [{ required: true, message: '有效天数不能为空', trigger: 'blur' }],
        suppId: [{ required: true, message: '供应商不能为空', trigger: 'change' }],
        warehouseId: [{ required: true, message: '仓库不能为空', trigger: 'change' }],
    },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询仓库列表 */
function getList() {
    loading.value = true;
    listMaterialStorein(queryParams.value).then((response: any) => {
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
        createById: userStore.userId,
        createByName: userStore.name,
        createTime: new Date(),
        warehouseId: null,
        suppId: null,
        details: [],
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
    formFlag.value = 'add';
    reset();
    generateStoreinNo().then(res => {
        form.value.minNo = res.data;
    });
    open.value = true;
    title.value = '添加入仓单';
}
/** 修改按钮操作 */
function handleUpdate(row: any) {
    formFlag.value = 'view';
    reset();
    form.value = { ...(row.minId ? row : selecteds.value[0]) };
    form.value.createByName = form.value.createNickName;
    form.value.createById = form.value.createBy;
    open.value = true;
    title.value = '入仓单详情';

    storeinDetails(form.value.minId).then(res => {
        form.value.details = res.data.map((i: any) => {
            return {
                ...i,
                matNo: i.mat?.matNo,
                matName: i.mat?.matName,
                matSpc: i.mat?.matSpc,
                unitName: i.mat?.unit?.unitName,
                unitId: i.mat?.unit?.unitId,
                validDays: i.mat?.validDays,
            };
        });
    });
}
/** 提交按钮 */
function submitForm() {
    (proxy!.$refs['postRef'] as any).validate((valid: boolean) => {
        if (valid) {
            let msg = '';
            form.value.createTime = dayjs(form.value.createTime).format('YYYY-MM-DD hh:mm:ss');
            form.value.details.find((item: any, index: number) => {
                item.recno = index + 1;
                if (!item.warehouseId) {
                    msg = `需要设置第${index}项的仓库`;
                    return true;
                }
                if (!item.minQty) {
                    msg = `第${index}项，需要设置入仓数量`;
                    return true;
                }
                if (item.validDays && !item.productDate) {
                    msg = `第${index}项，需要设置生产日期`;
                    return true;
                }
            });
            if (msg) {
                return ElMessage({ message: msg, type: 'warning' });
            }
            if (form.value.typeId !== undefined) {
                updateMaterialStorein(form.value).then(() => {
                    proxy!.$modal.msgSuccess('修改成功');
                    open.value = false;
                    getList();
                });
            } else {
                addMaterialStorein(form.value).then((response: any) => {
                    if (response.code === 10000) {
                        ElMessageBox.alert(
                            `入仓单号重复，已自动使用新的单号：${response.data.minNo}`,
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
    const deleteList = row.minId ? [row] : selecteds.value;
    const cannotDelete = deleteList.filter(i => {
        return !i.canDelete;
    });
    if (cannotDelete.length) {
        return ElMessage({
            message: `单据 ${cannotDelete.map(i => i.minNo).toString()} 不可删除`,
            type: 'warning',
        });
    }
    const ids = deleteList.map(i => i.minId);
    const minNos = deleteList.map(i => i.minNo).toString();
    proxy!.$modal
        .confirm('是否确认删除仓库编号为"' + minNos + '"的数据项？')
        .then(function () {
            return delMaterialStorein(ids);
        })
        .then(() => {
            getList();
            proxy!.$modal.msgSuccess('删除成功');
        })
        .catch(() => {
            return;
        });
}
const handleDetailDelete = (row: any) => {
    const index = form.value.details.findIndex((i: any) => {
        return i === row;
    });
    form.value.details.splice(index, 1);
};
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
const selectWarehouseBack = ref<any>(null);
function toogleSelectWarehouse(bool: boolean, back?: any) {
    if (formFlag.value === 'view') {
        return;
    }
    if (back) {
        selectWarehouseBack.value = back;
    }
    selectWarehouse.value = bool;
}
function onSelectWarehouse(row: any) {
    selectWarehouseBack.value.warehouseId = row.id;
    selectWarehouseBack.value.warehouseCode = row.warehouseCode;
    selectWarehouseBack.value.warehouseName = row.warehouseName;
    toogleSelectWarehouse(false);
}

const selectSupplier = ref(false);
function toogleSelectSupplier(bool: boolean) {
    if (formFlag.value === 'view') {
        return;
    }
    selectSupplier.value = bool;
}
function onSelectSupplier(row: any) {
    form.value.suppId = row.id;
    form.value.supplierCode = row.supplierCode;
    form.value.supplierName = row.supplierName;
    form.value.currId = row?.currency?.currId;
    form.value.currName = row?.currency?.currName;
    form.value.exchangeRate = row?.currency?.exchangeRate;
    form.value.shippingAddress = row.address;
    form.value.telephone = row.telephone;
    form.value.contactPerson = row.contactPerson;

    toogleSelectSupplier(false);
}

const selectStorage = ref(false);
function toogleSelectStorage(bool: boolean) {
    if (formFlag.value === 'view') {
        return;
    }
    selectStorage.value = bool;
}
function onSelectStorage(row: any) {
    form.value.storageName = row.storageName;
    form.value.storageId = row.storageId;

    toogleSelectStorage(false);
}

const selectPurchaseOrder = ref(false);
function toogleSelectPurchaseOrder(bool: boolean) {
    if (formFlag.value === 'view') {
        return;
    }
    if (bool && !form.value.suppId) {
        return ElMessage({ message: '请选择供应商', type: 'info' });
    }
    selectPurchaseOrder.value = bool;
}
function onSelectPurchaseOrder(rows: any[]) {
    form.value.details.push(
        ...rows.map(i => {
            return {
                ...i,
                validDays: i.mat?.validDays,
                warehouseId: form.value.warehouseId,
                warehouseName: form.value.warehouseName,
                storageId: form.value.storageId,
                storageName: form.value.storageName,
            };
        })
    );
    toogleSelectPurchaseOrder(false);
    completionBarcodeId();
}
const completionBarcodeId = () => {
    form.value.details.forEach((item: any, index: number) => {
        if (!item.barcodeId) {
            generateBarcodeId(item.purId).then(res => {
                form.value.details[index].barcodeId = res.data;
            });
        }
    });
};
getList();
</script>
