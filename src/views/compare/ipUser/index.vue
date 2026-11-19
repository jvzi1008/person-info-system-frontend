<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="76px">
      <el-form-item label="登录账号" prop="loginName">
        <el-input v-model="queryParams.loginName" placeholder="请输入登录账号" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="姓名" prop="userName">
        <el-input v-model="queryParams.userName" placeholder="请输入姓名" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="单位" prop="orgName">
        <el-input v-model="queryParams.orgName" placeholder="请输入单位名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
          <el-option label="正常" value="0" />
          <el-option label="停用" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['compare:ipUser:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['compare:ipUser:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['compare:ipUser:remove']">删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="编号" align="center" prop="id" width="70" />
      <el-table-column label="登录账号" align="center" prop="loginName" min-width="120" />
      <el-table-column label="姓名" align="center" prop="userName" min-width="100" />
      <el-table-column label="单位" align="center" prop="orgName" min-width="150" show-overflow-tooltip />
      <el-table-column label="绑定IP" align="center" prop="bindIp" min-width="130" />
      <el-table-column label="最后登录IP" align="center" prop="lastLoginIp" min-width="130" />
      <el-table-column label="最后登录时间" align="center" prop="lastLoginTime" width="170" />
      <el-table-column label="状态" align="center" width="90">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === '0' ? 'success' : 'info'" size="small">
            {{ scope.row.status === '0' ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['compare:ipUser:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['compare:ipUser:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :visible.sync="open" width="620px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="90px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="登录账号" prop="loginName">
              <el-input v-model="form.loginName" :disabled="form.id != null" placeholder="4-32位字母、数字或下划线" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="userName">
              <el-input v-model="form.userName" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input v-model="form.password" type="password" :placeholder="form.id ? '不填则不修改' : '8-20位字母和数字'" show-password />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户类型" prop="userType">
              <el-select v-model="form.userType" style="width: 100%">
                <el-option label="单位用户" value="1" />
                <el-option label="个人用户" value="2" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="单位名称" prop="orgName">
          <el-input v-model="form.orgName" placeholder="请输入单位名称" />
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="contactPhone">
              <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系邮箱" prop="contactEmail">
              <el-input v-model="form.contactEmail" placeholder="请输入联系邮箱" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="绑定IP" prop="bindIp">
              <el-input v-model="form.bindIp" placeholder="例如 127.0.0.1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="0">正常</el-radio>
                <el-radio label="1">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listIpUser, getIpUser, addIpUser, updateIpUser, delIpUser } from '@/api/compare/ipUser'

export default {
  name: 'CompareIpUser',
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      userList: [],
      title: '',
      open: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        loginName: null,
        userName: null,
        orgName: null,
        status: null
      },
      form: {},
      rules: {
        loginName: [{ required: true, message: '登录账号不能为空', trigger: 'blur' }],
        userName: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
        bindIp: [{ required: true, message: '绑定IP不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      listIpUser(this.queryParams)
        .then(res => {
          this.userList = res.rows
          this.total = res.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    reset() {
      this.form = {
        id: null,
        loginName: '',
        password: '',
        userName: '',
        userType: '2',
        orgName: '',
        contactPhone: '',
        contactEmail: '',
        bindIp: '',
        status: '0',
        remark: ''
      }
      this.resetForm('form')
    },
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '新增接入用户'
    },
    handleUpdate(row) {
      this.reset()
      getIpUser(row.id || this.ids[0]).then(res => {
        this.form = res.data
        this.open = true
        this.title = '修改接入用户'
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        if (this.form.id != null) {
          updateIpUser(this.form).then(() => {
            this.$message.success('修改成功')
            this.open = false
            this.getList()
          })
        } else {
          addIpUser(this.form).then(() => {
            this.$message.success('新增成功')
            this.open = false
            this.getList()
          })
        }
      })
    },
    handleDelete(row) {
      const ids = row.id ? [row.id] : this.ids
      this.$confirm('确认删除选中的接入用户吗？', '提示', { type: 'warning' })
        .then(() => delIpUser(ids.join(',')))
        .then(() => {
          this.$message.success('删除成功')
          this.getList()
        })
        .catch(() => {})
    },
    cancel() {
      this.open = false
      this.reset()
    }
  }
}
</script>
