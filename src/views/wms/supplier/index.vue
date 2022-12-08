<template>
  <div class="app-container">
    <el-form
      v-show="showSearch"
      ref="queryRef"
      :model="queryParams"
      :inline="true"
    >
      <el-form-item label="供应商编码" prop="supplierCode">
        <el-input
          v-model="queryParams.supplierCode"
          placeholder="请输入供应商编码"
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
      <el-form-item label="联系人" prop="contactPerson">
        <el-input
          v-model="queryParams.contactPerson"
          placeholder="请输入联系人"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="电话" prop="telephone">
        <el-input
          v-model="queryParams.telephone"
          placeholder="请输入电话"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="级别" prop="supplierLevel">
        <el-select
          v-model="queryParams.supplierLevel"
          placeholder="所有"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in wms_level"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['wms:supplier:add']"
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['wms:supplier:edit']"
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
          v-hasPermi="['wms:supplier:remove']"
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          >删除</el-button
        >
      </el-col>
      <right-toolbar
        v-model:showSearch="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="postList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        width="100"
        label="供应商编码"
        align="center"
        prop="supplierCode"
      >
        <template #default="scope">
          <el-link type="primary" @click="displayDetails(scope.row)">{{
            scope.row.supplierCode
          }}</el-link>
        </template>
      </el-table-column>
      <el-table-column
        width="100"
        label="供应商名称"
        align="center"
        prop="supplierName"
      />
      <el-table-column label="联系人" align="center" prop="contactPerson" />
      <el-table-column
        label="电话"
        align="center"
        prop="telephone"
        width="150"
      />
      <el-table-column
        label="手机"
        width="170"
        align="center"
        prop="mobilePhone"
      />
      <el-table-column width="150" label="邮箱" align="center" prop="email" />
      <el-table-column label="地址" align="center" prop="address" />
      <el-table-column label="级别" align="center" prop="supplierLevel" />
      <el-table-column
        label="发票抬头"
        align="center"
        prop="invoiceLookedUp"
        width="100"
      />
      <el-table-column label="发票税率" align="center" prop="invoiceTax" />
      <el-table-column label="发票种类" align="center" prop="invoiceType" />
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
            v-hasPermi="['wms:supplier:edit']"
            type="primary"
            size="small"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            >编辑</el-link
          >
          <el-divider direction="vertical" />
          <el-link
            v-if="scope.row.canDelete"
            v-hasPermi="['wms:supplier:remove']"
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
      width="600px"
    >
      <el-form
        ref="postRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        :disabled="formFlag === 'view'"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item label="供应商编码" prop="supplierCode">
              <el-input
                v-model="form.supplierCode"
                placeholder="请输入供应商编码"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="供应商名称" prop="supplierName">
              <el-input
                v-model="form.supplierName"
                placeholder="请输入供应商名称"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="联系人" prop="contactPerson">
              <el-input
                v-model="form.contactPerson"
                placeholder="请输入联系人"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电话" prop="telephone">
              <el-input v-model="form.telephone" placeholder="请输入电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="手机" prop="mobilePhone">
              <el-input v-model="form.mobilePhone" placeholder="请输入手机" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="地址" prop="address">
              <el-input v-model="form.address" placeholder="请输入地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="级别" prop="supplierLevel">
              <el-select
                v-model="form.supplierLevel"
                placeholder="所有"
                style="width: 240px"
              >
                <el-option
                  v-for="dict in wms_level"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="发票抬头" prop="invoiceLookedUp">
              <el-input
                v-model="form.invoiceLookedUp"
                placeholder="请输入发票抬头"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发票税率" prop="invoiceTax">
              <el-input
                v-model="form.invoiceTax"
                placeholder="请输入发票税率"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="发票种类" prop="invoiceType">
              <el-select
                v-model="form.invoiceType"
                placeholder="所有"
                style="width: 240px"
              >
                <el-option
                  v-for="dict in sys_invoice"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="币别" prop="currencyId">
              <el-select
                v-model="form.currencyId"
                placeholder="所有"
                style="width: 240px"
              >
                <el-option
                  v-for="dict in currencyListData"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            placeholder="请输入内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button
            v-if="formFlag !== 'view'"
            type="primary"
            @click="submitForm"
            >确 定</el-button
          >
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
  
<script setup name="Supplier" lang="ts">
import {
    listSupplier,
    addSupplier,
    delSupplier,
    updateSupplier,
} from "@/api/wms/supplier";
import { currencyList } from "@/api/basis";
import { ElMessage } from "element-plus";
import { getCurrentInstance, ref, reactive, toRefs, ComponentInternalInstance } from 'vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { wms_level, sys_invoice } = proxy!.useDict("wms_level", "sys_invoice");

const postList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const selecteds = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const currencyListData = ref<{value: string, label: string}[]>([]);
currencyList().then((res) => {
    currencyListData.value = res.data.map((i: any) => {
        return {
            value: i.currId,
            label: i.currName,
        };
    });
});

const data = reactive<{
  form: any,
  queryParams:any,
  rules: any
}>({
    form: {},
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        supplierCode: undefined,
        supplierName: undefined,
        contactPerson: undefined,
        telephone: undefined,
        supplierLevel: undefined,
        isAsc: "asc",
    },
    rules: {
        supplierCode: [
            { required: true, message: "供应商编码不能为空", trigger: "blur" },
        ],
        supplierName: [
            { required: true, message: "供应商名称不能为空", trigger: "blur" },
        ],
        contactPerson: [
            { required: true, message: "联系人不能为空", trigger: "blur" },
        ],
        telephone: [{ required: true, message: "电话不能为空", trigger: "blur" }],
        supplierLevel: [
            { required: true, message: "级别不能为空", trigger: "blur" },
        ],
        address: [{ required: true, message: "地址不能为空", trigger: "blur" }],
        invoiceLookedUp: [
            { required: true, message: "发票抬头不能为空", trigger: "blur" },
        ],
        invoiceTax: [
            { required: true, message: "发票税率不能为空", trigger: "blur" },
        ],
        invoiceType: [
            { required: true, message: "发票种类不能为空", trigger: "blur" },
        ],
        currencyId: [{ required: true, message: "币别不能为空", trigger: "blur" }],
    },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询供应商列表 */
function getList() {
    loading.value = true;
    listSupplier(queryParams.value).then((response: any) => {
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
        supplierCode: undefined,
        supplierName: undefined,
        contactPerson: undefined,
        telephone: undefined,
        mobilePhone: undefined,
        email: undefined,
        address: undefined,
        supplierLevel: wms_level.value[0].value,
        invoiceLookedUp: undefined,
        invoiceTax: undefined,
        invoiceType: sys_invoice.value[0].value,
        remark: undefined,
    };
    proxy!.resetForm("postRef");
}
/** 搜索按钮操作 */
function handleQuery() {
    queryParams.value.pageNum = 1;
    getList();
}
/** 重置按钮操作 */
function resetQuery() {
    proxy!.resetForm("queryRef");
    handleQuery();
}
/** 多选框选中数据 */
function handleSelectionChange(selection: any) {
    selecteds.value = selection;
    single.value = selection.length !== 1;
    multiple.value = !selection.length;
}
const formFlag = ref("");
/** 新增按钮操作 */
function handleAdd() {
    reset();
    open.value = true;
    formFlag.value = "add";
    title.value = "添加供应商";
}
/** 修改按钮操作 */
function handleUpdate(row: any) {
    reset();
    form.value = { ...(row.id ? row : selecteds.value[0]) };
    open.value = true;
    formFlag.value = "update";
    title.value = "修改供应商";
}
const displayDetails = async (row: any) => {
    form.value = { ...(row.id ? row : selecteds.value[0]) };
    formFlag.value = "view";
    open.value = true;
    title.value = "供应商详情";
};
/** 提交按钮 */
function submitForm() {
    (proxy!.$refs["postRef"] as any ).validate((valid: boolean) => {
        if (valid) {
            if (form.value.id !== undefined) {
                updateSupplier(form.value).then((response) => {
                    proxy!.$modal.msgSuccess("修改成功");
                    open.value = false;
                    getList();
                });
            } else {
                addSupplier(form.value).then((response) => {
                    proxy!.$modal.msgSuccess("新增成功");
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
    const cannotDelete = deleteList.filter((i) => {
        return !i.canDelete;
    });
    if (cannotDelete.length) {
        return ElMessage({
            message: `单据 ${cannotDelete
                .map((i) => i.supplierCode)
                .toString()} 不可删除`,
            type: "warning",
        });
    }

    const ids = row.id || deleteList.map((i) => i.id);
    const supplierCodes =
    row.supplierCode || deleteList.map((i) => i.supplierCode);
    proxy!.$modal
        .confirm('是否确认删除供应商编号为"' + supplierCodes + '"的数据项？')
        .then(function () {
            return delSupplier(ids);
        })
        .then(() => {
            getList();
            proxy!.$modal.msgSuccess("删除成功");
        })
        .catch(() => {
            return;
        });
}
getList();
</script>
  