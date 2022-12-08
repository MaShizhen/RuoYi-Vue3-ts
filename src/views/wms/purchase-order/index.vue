<template>
    <div class="app-container">
        <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true">
            <el-form-item label="订单状态" prop="statusArr">
                <el-select v-model="queryParams.statusArr" multiple collapse-tags placeholder="全部">
                    <el-option
                        v-for="dict in purchase_order_status"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                    ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="下单日期" style="width: 308px">
                <el-date-picker
                    v-model="queryParams.daterange"
                    value-format="YYYY-MM-DD"
                    type="daterange"
                    range-separator="-"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                ></el-date-picker>
            </el-form-item>
            <el-form-item label="采购单号" prop="purNo">
                <el-input
                    v-model="queryParams.purNo"
                    placeholder="请输入采购单号"
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
                    v-hasPermi="['material:po:add']"
                    type="primary"
                    plain
                    icon="Plus"
                    @click="handleAdd"
                    >新增</el-button
                >
            </el-col>
            <el-col :span="1.5">
                <el-button
                    v-hasPermi="['material:po:update']"
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
                    v-hasPermi="['material:po:delete']"
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
                    v-hasPermi="['material:po:submit']"
                    plain
                    :disabled="selecteds.length === 0"
                    @click="updatePurchaseOrderStatus(1)"
                    >提交</el-button
                >
            </el-col>
            <el-col :span="1.5">
                <el-button
                    v-hasPermi="['material:po:cancelSubmit']"
                    plain
                    :disabled="selecteds.length === 0"
                    @click="updatePurchaseOrderStatus(0)"
                    >取消提交</el-button
                >
            </el-col>
            <el-col :span="1.5">
                <el-button
                    v-hasPermi="['material:po:audit']"
                    plain
                    :disabled="selecteds.length === 0"
                    @click="updatePurchaseOrderStatus(2)"
                    >审核</el-button
                >
            </el-col>
            <el-col :span="1.5">
                <el-button
                    v-hasPermi="['material:po:cancelAudit']"
                    plain
                    :disabled="selecteds.length === 0"
                    @click="updatePurchaseOrderStatus(3)"
                    >反审核</el-button
                >
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="postList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />

            <!-- <el-table-column label="采购单ID" align="center" prop="purId" /> -->
            <el-table-column label="采购单号" width="120" align="center" prop="purNo">
                <template #default="scope">
                    <el-link type="primary" @click="displayDetails(scope.row)">{{ scope.row.purNo }}</el-link>
                </template>
            </el-table-column>
            <el-table-column label="单据状态" align="center" prop="statusName" />
            <el-table-column label="供应商编码" align="center" prop="supplierCode" width="120" />
            <el-table-column label="供应商名称" width="120" align="center" prop="supplierName" />
            <el-table-column label="审核时间" width="170" align="center" prop="auditDate" />
            <el-table-column label="操作时间" width="170" align="center" prop="opDate" />
            <!-- <el-table-column label="操作人ID" align="center" prop="opId" /> -->
            <el-table-column label="操作人" align="center" prop="opName" />
            <el-table-column label="提交时间" width="170" align="center" prop="postDate" />
            <el-table-column label="采购备注" align="center" prop="memo" />

            <el-table-column
                label="操作"
                align="center"
                fixed="right"
                class-name="small-padding fixed-width"
                width="140"
            >
                <template #default="scope">
                    <el-link
                        v-hasPermi="['material:po:update']"
                        type="primary"
                        size="small"
                        icon="Edit"
                        @click="handleUpdate(scope.row)"
                        >编辑</el-link
                    >
                    <el-divider direction="vertical" />
                    <el-link
                        v-hasPermi="['material:po:delete']"
                        icon="Delete"
                        type="danger"
                        size="small"
                        @click="handleDelete(scope.row)"
                        >删除</el-link
                    >
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

        <!-- 添加或修改供应商对话框 -->
        <el-dialog
            v-model="open"
            :title="title"
            :inline="true"
            append-to-body
            width="800px"
            :close-on-click-modal="false"
        >
            <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="供应商" prop="suppId">
                            <el-input
                                v-model="form.supplierName"
                                readonly
                                placeholder="请选择供应商"
                                @click="toogleSelectSupplier(true)"
                            >
                                <template v-if="formFlag !== 'view'" #append>
                                    <i
                                        style="color: #909399; cursor: pointer"
                                        @click="toogleSelectSupplier(true)"
                                        >···</i
                                    >
                                </template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="汇率" prop="exchangeRate">
                            <el-input
                                v-model="form.exchangeRate"
                                :readonly="formFlag === 'view'"
                                :disabled="formFlag !== 'view'"
                                placeholder="请选择供应商"
                            />
                        </el-form-item>
                        <el-form-item label="创建时间" prop="createTime">
                            <el-date-picker
                                v-model="form.createTime"
                                style="width: 100%"
                                type="datetime"
                                value-form="YYYY-MM-DD hh:mm:ss"
                                :readonly="formFlag === 'view'"
                            />
                        </el-form-item>
                        <el-form-item label="装运地址" prop="shippingAddress">
                            <el-input v-model="form.shippingAddress" disabled />
                        </el-form-item>
                        <el-form-item label="联系电话" prop="telephone">
                            <el-input v-model="form.telephone" disabled />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="币别" prop="currId">
                            <el-input
                                v-model="form.currName"
                                :readonly="formFlag === 'view'"
                                :disabled="formFlag !== 'view'"
                                placeholder="请选择供应商"
                            />
                        </el-form-item>
                        <el-form-item label="采购单号" prop="purNo">
                            <el-input v-model="form.purNo" readonly placeholder="请输入采购单号" />
                        </el-form-item>

                        <el-form-item label="录单人" prop="opName">
                            <el-input v-model="form.opName" disabled />
                        </el-form-item>

                        <el-form-item label="联系人" prop="contactPerson">
                            <el-input v-model="form.contactPerson" disabled placeholder="请输入联系人" />
                        </el-form-item>

                        <el-form-item label="请购部门" prop="reqDepartment">
                            <el-input
                                v-model="form.reqDepartment"
                                :readonly="formFlag === 'view'"
                                placeholder="请输入请购部门"
                            />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="备注" prop="memo">
                    <el-input
                        v-model="form.memo"
                        type="textarea"
                        :readonly="formFlag === 'view'"
                        placeholder="请输入备注"
                    />
                </el-form-item>
            </el-form>
            <h3>
                采购材料明细
                <el-button
                    v-show="formFlag !== 'view'"
                    style="float: right"
                    type="primary"
                    @click="toogleSelectMaterial(true)"
                    >添加物料</el-button
                >
            </h3>
            <el-table :data="form.details">
                <el-table-column label="序号" type="index" width="50" align="center" />
                <el-table-column label="材料编码" align="center" width="100" prop="matNo" />
                <el-table-column width="100" label="材料名称" align="center" prop="matName" />
                <el-table-column label="规格" align="center" prop="matSpc" />
                <el-table-column label="交货日期" align="center" prop="completeDate" width="170">
                    <template v-if="formFlag !== 'view'" #default="scope">
                        <el-date-picker
                            v-model="scope.row.completeDate"
                            style="width: 120px"
                            format="YYYY/MM/DD"
                            value-format="YYYY-MM-DD"
                            type="date"
                            placeholder="选择日期"
                        >
                        </el-date-picker>
                    </template>
                </el-table-column>
                <el-table-column label="采购单位" align="center" prop="unitName" />
                <el-table-column label="采购数量" align="center" prop="ordQty" width="200">
                    <template #default="scope">
                        <el-input-number
                            v-if="formFlag !== 'view'"
                            v-model="scope.row.ordQty"
                            style="width: 100%"
                            :min="1"
                            @change="calcMoney(scope.row)"
                        ></el-input-number>
                    </template>
                </el-table-column>
                <el-table-column label="送货数量" align="center" prop="num" />
                <el-table-column label="含税单价" align="center" prop="taxPrice" width="200">
                    <template #default="scope">
                        <el-input-number
                            v-model="scope.row.taxPrice"
                            style="width: 100%"
                            :min="0"
                            @change="calcMoney(scope.row)"
                        ></el-input-number>
                    </template>
                </el-table-column>
                <el-table-column label="税率%" align="center" prop="taxRate" width="200">
                    <template #default="scope">
                        <el-input-number
                            v-model="scope.row.taxRate"
                            style="width: 100%"
                            :min="0"
                            @change="calcMoney(scope.row)"
                        ></el-input-number>
                    </template>
                </el-table-column>
                <el-table-column width="200" label="不含税单价" align="center" prop="notaxPrice">
                    <template #default="scope">
                        <el-input-number
                            v-model="scope.row.notaxPrice"
                            style="width: 100%"
                            :min="0"
                            @change="calcMoney(scope.row)"
                        ></el-input-number>
                    </template>
                </el-table-column>
                <el-table-column label="含税金额" align="center" prop="amountIncludingTax" />
                <el-table-column label="税金" align="center" prop="tax" />
                <el-table-column label="金额" align="center" prop="amountIncludingTax" />
                <el-table-column label="供应商料号" align="center" prop="supplierMatNo" width="100" />
                <el-table-column label="采购原因" align="center" prop="purReason" width="150">
                    <template v-if="formFlag !== 'view'" #default="scope">
                        <el-input v-model="scope.row.purReason" type="text"></el-input>
                    </template>
                </el-table-column>
                <el-table-column label="特殊要求" align="center" prop="specMemo" width="150">
                    <template v-if="formFlag !== 'view'" #default="scope">
                        <el-input v-model="scope.row.specMemo" type="text"></el-input>
                    </template>
                </el-table-column>
                <el-table-column
                    label="操作"
                    align="center"
                    fixed="right"
                    class-name="small-padding fixed-width"
                    width="170"
                >
                    <template #default="scope">
                        <el-link
                            icon="Search"
                            type="info"
                            size="small"
                            title="最近5次采购记录"
                            @click="showLatestList(scope.row)"
                            >采购记录</el-link
                        >
                        <el-divider direction="vertical" />
                        <el-link
                            v-if="formFlag !== 'view'"
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
                    <el-button
                        v-if="formFlag !== 'view'"
                        :disabled="form.details.length === 0"
                        type="primary"
                        @click="submitForm"
                        >确 定</el-button
                    >
                    <el-button @click="cancel">取 消</el-button>
                </div>
            </template>
        </el-dialog>
        <template v-if="selectSupplier">
            <SelectSupplier
                :display="selectSupplier"
                @selected="onSelectSupplier"
                @cancel="toogleSelectSupplier(false)"
            />
        </template>
        <template v-if="selectMaterial">
            <SelectMaterial
                :suppId="form.suppId"
                :display="selectMaterial"
                @selected="onSelectMaterial"
                @cancel="toogleSelectMaterial(false)"
            />
        </template>
        <el-dialog
            v-model="matLatestRecordDisplay"
            :title="matLatestRecordTitle"
            :inline="true"
            append-to-body
            width="800px"
            :close-on-click-modal="false"
        >
            <el-table :data="matLatestRecord">
                <el-table-column label="供应商编码" align="center" width="100" prop="supplierCode" />
                <el-table-column label="供应商名称" align="center" width="150" prop="supplierName" />
                <el-table-column label="采购日期" align="center" width="170" prop="createTime" />
                <el-table-column label="单位" align="center" width="100" prop="unitName" />
                <el-table-column label="采购数量" align="center" width="100" prop="ordQty" />
                <el-table-column label="税率" align="center" width="100" prop="taxRate" />
                <el-table-column label="含税单价" align="center" width="100" prop="taxPrice" />
                <el-table-column label="无税单价" align="center" width="100" prop="notaxPrice" />
                <el-table-column label="含税金额" align="center" prop="amountIncludingTax" />
                <el-table-column label="税金" align="center" prop="tax" />
                <el-table-column label="金额" align="center" prop="amountIncludingTax" />
            </el-table>
        </el-dialog>
    </div>
</template>

<script setup name="Purchase-order" lang="ts">
import SelectSupplier from './components/SelectSupplier.vue';
import SelectMaterial from './components/SelectMaterial.vue';
import { ElMessage, ElMessageBox, ElForm } from 'element-plus';
import { times, divide } from '@/utils/math';
import {
    listPurchaseOrder,
    addPurchaseOrder,
    delPurchaseOrder,
    updatePurchaseOrder,
    queryPurchaseOrderMats,
    queryPurchaseOrder,
    bchatUpdateStatus,
    batchBackStatus,
    generatePoNo,
} from '@/api/wms/purchase-order';
import useUserStore from '@/store/modules/user';
import { materialLatestRecord } from '@/api/wms/material';
import { watch, getCurrentInstance, ref, reactive, toRefs, ComponentInternalInstance } from 'vue';

const userStore = useUserStore();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { purchase_order_status } = proxy!.useDict('purchase_order_status');

const postList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const selecteds = ref<any[]>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');

const data = reactive<{
    form: any;
    queryParams: any;
    rules: any;
}>({
    form: {
        details: [],
    },
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        statusArr: [],
        daterange: [],
        purNo: undefined,
        supplierName: undefined,
    },
    rules: {},
});

const { queryParams, form, rules } = toRefs(data);

/** 查询供应商列表 */
function getList() {
    loading.value = true;
    listPurchaseOrder(queryParams.value, purchase_order_status.value).then((response: any) => {
        postList.value = response.rows;
        total.value = response.total;
        loading.value = false;
    });
}
getList();
/** 取消按钮 */
function cancel() {
    open.value = false;
    reset();
}
const formFlag = ref('');
watch(formFlag, newFlag => {
    if (newFlag === 'add') {
        rules.value = {
            currId: [{ required: true, message: '请选择币别', trigger: 'change' }],
            exchangeRate: [{ required: true, message: '请输入汇率', trigger: 'change' }],
            suppId: [{ required: true, message: '请选择供应商', trigger: 'change' }],
        };
    } else {
        rules.value = {};
    }
});
const formRef = ref<InstanceType<typeof ElForm>>();
/** 表单重置 */
function reset() {
    form.value = {
        purNo: '',
        currId: '',
        currName: '',
        exchangeRate: '',
        memo: '',
        suppId: '',
        supplierCode: '',
        supplierName: '',
        createTime: new Date().getTime(),
        opId: userStore.userId,
        opName: userStore.name,
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
    reset();
    generatePoNo().then(res => {
        form.value.purNo = res.data;
    });
    formFlag.value = 'add';
    open.value = true;
    title.value = '添加采购单';
}
/** 修改按钮操作 */
function handleUpdate(row: any) {
    // reset();
    getDetails(row.purId ? row : selecteds.value[0]);
    open.value = true;
    formFlag.value = 'update';
    title.value = '修改采购单';
}
/** 提交按钮 */
function submitForm() {
    formRef.value?.validate(valid => {
        if (valid) {
            const errData: string[] = [];
            const errorData = form.value.details.find((i: any, index: number) => {
                i.recno = index + 1;
                if (!i.completeDate) {
                    errData.push('交货日期');
                }
                if (!i.ordQty) {
                    errData.push('采购数量');
                }
                if (errData.length) {
                    return true;
                }
                return false;
            });
            if (errorData && errData.length) {
                return ElMessage({
                    message: `请完善材料${errorData.recno} 的${errData.join('、')}`,
                    type: 'warning',
                });
            }
            const obj = {
                purNo: form.value.purNo,
                suppId: form.value.suppId,
                currId: form.value.currId,
                reqDepartment: form.value.reqDepartment,
                memo: form.value.memo,
                exchangeRate: form.value.exchangeRate,
                createTime: form.value.createTime,
                opDate: form.value.createTime,
                details: form.value.details.map((i: any, index: number) => {
                    return {
                        matId: i.matId,
                        recno: index + 1,
                        completeDate: i.completeDate,
                        ordQty: i.ordQty,
                        unitId: i.unit.unitId,
                        notaxPrice: i.notaxPrice,
                        taxPrice: i.taxPrice,
                        taxRate: i.taxRate,
                        suppMatNo: i.suppMatNo,
                        purReason: i.purReason,
                        specMemo: i.specMemo,
                    };
                }),
                purId: '',
                createBy: '',
                createNickName: '',
            };
            if (formFlag.value === 'update') {
                obj.purId = form.value.purId;
                obj.createBy = userStore.userId;
                obj.createNickName = userStore.name;
                updatePurchaseOrder(obj).then((response: any) => {
                    if (response.code === 10000) {
                        ElMessageBox.alert(
                            `采购单号重复，已自动使用新的单号：${response.data.purNo}`,
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
                addPurchaseOrder(obj).then((response: any) => {
                    if (response.code === 10000) {
                        ElMessageBox.alert(
                            `采购单号重复，已自动使用新的单号：${response.data.purNo}`,
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
    const purIds = row.purId || selecteds.value.map(i => i.purId);
    const purNos = row.purNo || selecteds.value.map(i => i.purNo);
    proxy!.$modal
        .confirm('是否确认删除供应商编号为"' + purNos + '"的数据项？')
        .then(function () {
            return delPurchaseOrder(purIds);
        })
        .then(() => {
            getList();
            proxy!.$modal.msgSuccess('删除成功');
        })
        .catch(() => {
            return;
        });
}

const selectSupplier = ref(false);
function toogleSelectSupplier(bool: boolean) {
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

const selectMaterial = ref(false);
function toogleSelectMaterial(bool: boolean) {
    if (!form.value.suppId) {
        return ElMessage({ type: 'warning', message: '请先选择供应商' });
    } else {
        selectMaterial.value = bool;
    }
}
function onSelectMaterial(rows: any[]) {
    form.value.details.push(
        ...rows.map(i => {
            return {
                ...i,
                notaxPrice: i.last?.notaxPrice || i.notaxPrice,
                taxPrice: i.last?.taxPrice || i.taxPrice,
                taxRate: i.last?.taxRate || i.taxRate,
                unitName: i.unit.unitName,
            };
        })
    );
    toogleSelectMaterial(false);
}
const getDetails = async (row: any) => {
    const res = await queryPurchaseOrder(row);
    form.value = { ...row, details: [] };
    form.value.currId = res?.data?.supplier?.currency?.currId;
    form.value.currName = res?.data?.supplier?.currency?.currName;
    form.value.exchangeRate = res?.data?.exchangeRate;
    form.value.createTime = res?.data?.createTime;
    form.value.shippingAddress = res?.data?.supplier?.address;
    form.value.contactPerson = res?.data?.supplier?.contactPerson;
    form.value.telephone = res?.data?.supplier?.telephone;
    form.value.reqDepartment = res?.data?.reqDepartment;

    const response = await queryPurchaseOrderMats(row);
    form.value.details = response.data.map((i: any) => {
        calcMoney(i);
        return {
            ...i,
            typeName: i.mat?.matType?.typeName,
            matName: i.mat?.matName,
            matNo: i.mat?.matNo,
            matId: i.mat?.matId,
            matSpc: i.mat?.matSpc,
            suppMatNo: i.mat?.suppMatNo,
            unitId: i.mat?.unit?.unitId,
            unitName: i.mat?.unit?.unitName,
            unitNo: i.mat?.unit?.unitNo,
            unit: {
                unitId: i.mat?.unit?.unitId,
            },
        };
    });
};
const displayDetails = async (row: any) => {
    getDetails(row);
    formFlag.value = 'view';

    open.value = true;
    title.value = '采购单详情';
};

const handleDetailDelete = (row: any) => {
    const index = form.value.details.findIndex((i: any) => {
        return i === row;
    });
    form.value.details.splice(index, 1);
};

const updatePurchaseOrderStatus = (type: number) => {
    if (selecteds.value.length === 0) {
        ElMessage({ type: 'warning', message: '请至少选择一条数据' });
        return;
    }
    let preStatus: number, nextStatus: number;
    let actionName = '';
    let updateStatusRquest: any = null;
    switch (type) {
        case 0:
            preStatus = 1;
            nextStatus = 0;
            actionName = '取消提交';
            updateStatusRquest = batchBackStatus;
            break;
        case 1:
            preStatus = 0;
            nextStatus = 1;
            actionName = '提交';
            updateStatusRquest = bchatUpdateStatus;
            break;
        case 2:
            preStatus = 1;
            nextStatus = 5;
            actionName = '审核';
            updateStatusRquest = bchatUpdateStatus;
            break;
        case 3:
            preStatus = 5;
            nextStatus = 1;
            actionName = '反审核';
            updateStatusRquest = batchBackStatus;
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
        needUpdateIds.push(i.purId);
        needUpdateCodes.push(i.purNo);
    });
    if (needUpdateData.length === 0) {
        ElMessage({ message: `没有待${actionName}的数据`, type: 'warning' });
        return;
    }
    proxy!.$modal
        .confirm(`是否确认${actionName}单据：${needUpdateCodes.toString()}`)
        .then(() => {
            updateStatusRquest(needUpdateIds, nextStatus)
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
const calcMoney = (row: any) => {
    // （金额）含税金额=含税单价*采购数量
    // 税金=未税单价*税率*采购数量
    // 含税单价=未税单价*(1+税率/100)
    row.amountIncludingTax = times(row.taxPrice, row.ordQty);
    row.tax = divide(times(row.notaxPrice, row.taxRate, row.ordQty), 100);
};

const matLatestRecordTitle = ref('');
const matLatestRecordDisplay = ref(false);
const matLatestRecord = ref([]);
const showLatestList = (row: any) => {
    materialLatestRecord(row.matId).then(res => {
        matLatestRecordTitle.value = `${row.matName}最近5条采购记录`;
        matLatestRecordDisplay.value = true;
        matLatestRecord.value = res.data
            .map((i: any) => {
                return {
                    supplierCode: i.po.supplier.supplierCode, // 供应商编码
                    supplierName: i.po.supplier.supplierName, // 供应商名称
                    createTime: i.poDetail.createTime, // 采购日期
                    unitName: i.poDetail.mat.unit.unitName, // 单位
                    ordQty: i.poDetail.ordQty, // 采购数量
                    taxRate: i.poDetail.taxRate, // 税率
                    taxPrice: i.poDetail.taxPrice, // 含税单价
                    notaxPrice: i.poDetail.notaxPrice, // 无税单价
                };
            })
            .map((row: any) => {
                calcMoney(row);
                return row;
            });
    });
};
</script>
