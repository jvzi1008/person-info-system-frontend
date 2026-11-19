<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="76px">
      <el-form-item label="用户" prop="userId">
        <el-select v-model="queryParams.userId" placeholder="全部用户" clearable filterable style="width: 180px">
          <el-option v-for="item in userOptions" :key="item.userId" :label="item.userName + (item.nickName ? ' / ' + item.nickName : '')" :value="item.userId" />
        </el-select>
      </el-form-item>
      <el-form-item label="IP地址" prop="ipAddress">
        <el-input v-model="queryParams.ipAddress" placeholder="请输入IP或CIDR" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
          <el-option label="有效" value="0" />
          <el-option label="停用" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="审核状态" prop="auditStatus">
        <el-select v-model="queryParams.auditStatus" placeholder="全部" clearable style="width: 120px">
          <el-option label="待审核" value="0" />
          <el-option label="已通过" value="1" />
          <el-option label="已驳回" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['compare:ipAuth:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['compare:ipAuth:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['compare:ipAuth:remove']">删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="authList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="编号" align="center" prop="id" width="70" />
      <el-table-column label="用户" align="center" min-width="150">
        <template slot-scope="scope">{{ userLabel(scope.row.userId) }}</template>
      </el-table-column>
      <el-table-column label="IP / CIDR" align="center" prop="ipAddress" min-width="150" />
      <el-table-column label="来源" align="center" width="100">
        <template slot-scope="scope">{{ sourceText(scope.row.sourceType) }}</template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="90">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === '0' ? 'success' : 'info'" size="small">
            {{ scope.row.status === '0' ? '有效' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="审核状态" align="center" width="100">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.auditStatus === '0'" type="warning" size="small">待审核</el-tag>
          <el-tag v-else-if="scope.row.auditStatus === '2'" type="danger" size="small">已驳回</el-tag>
          <el-tag v-else type="success" size="small">已通过</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="生效时间" align="center" prop="effectiveTime" width="170" />
      <el-table-column label="过期时间" align="center" prop="expireTime" width="170">
        <template slot-scope="scope">{{ scope.row.expireTime || '永久' }}</template>
      </el-table-column>
      <el-table-column label="限流QPS" align="center" prop="maxQps" width="90" />
      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-if="scope.row.auditStatus === '0'" size="mini" type="text" icon="el-icon-s-check" @click="handleAudit(scope.row)" v-hasPermi="['compare:ipAuth:edit']">审核</el-button>
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['compare:ipAuth:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['compare:ipAuth:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :visible.sync="open" width="560px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="用户" prop="userId">
          <el-select v-model="form.userId" placeholder="请选择用户" filterable style="width: 100%">
            <el-option v-for="item in userOptions" :key="item.id" :label="item.loginName + ' / ' + item.userName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="IP / CIDR" prop="ipAddress">
          <el-input v-model="form.ipAddress" placeholder="例如 127.0.0.1 或 192.168.1.0/24" />
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="来源" prop="sourceType">
              <el-select v-model="form.sourceType" style="width: 100%">
                <el-option label="首次登录" value="1" />
                <el-option label="自助添加" value="2" />
                <el-option label="管理员添加" value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="0">有效</el-radio>
                <el-radio label="1">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="生效时间">
              <el-date-picker v-model="form.effectiveTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="立即生效" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="过期时间">
              <el-date-picker v-model="form.expireTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="永久有效" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="限流QPS">
          <el-input-number v-model="form.maxQps" :min="1" :max="1000" controls-position="right" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog title="IP 审核" :visible.sync="auditOpen" width="480px" append-to-body>
      <el-form ref="auditForm" :model="auditForm" label-width="90px">
        <el-form-item label="用户">{{ auditForm.userName }}</el-form-item>
        <el-form-item label="IP / CIDR">{{ auditForm.ipAddress }}</el-form-item>
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditForm.auditStatus">
            <el-radio label="1">通过</el-radio>
            <el-radio label="2">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input v-model="auditForm.auditRemark" type="textarea" :rows="3" placeholder="驳回时必须填写原因" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="auditOpen = false">取 消</el-button>
        <el-button type="primary" @click="submitAudit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listIpAuth, getIpAuth, addIpAuth, updateIpAuth, delIpAuth, auditIpAuth, ipAuthUserOptions } from '@/api/compare/ipAuth'

export default {
  name: 'CompareIpAuth',
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      authList: [],
      userOptions: [],
      title: '',
      open: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: null,
        ipAddress: null,
        status: null,
        auditStatus: null
      },
      auditOpen: false,
      auditForm: {
        id: null,
        userName: '',
        ipAddress: '',
        auditStatus: '1',
        auditRemark: ''
      },
      form: {},
      rules: {
        userId: [{ required: true, message: '请选择用户', trigger: 'change' }],
        ipAddress: [{ required: true, message: 'IP地址不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getUsers()
    this.getList()
  },
  methods: {
    getUsers() {
      ipAuthUserOptions().then(res => {
        this.userOptions = res.data || []
      })
    },
    userLabel(userId) {
      const user = this.userOptions.find(item => item.userId === userId)
      return user ? user.userName : userId
    },
    sourceText(value) {
      const map = { 1: '首次登录', 2: '自助添加', 3: '管理员添加' }
      return map[value] || '-'
    },
    getList() {
      this.loading = true
      listIpAuth(this.queryParams)
        .then(res => {
          this.authList = res.rows
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
        userId: null,
        ipAddress: '',
        sourceType: '3',
        authType: '1',
        status: '0',
        effectiveTime: null,
        expireTime: null,
        maxQps: 20,
        remark: ''
      }
      this.resetForm('form')
    },
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '新增IP授权'
    },
    handleAudit(row) {
      this.auditForm = {
        id: row.id,
        userName: this.userLabel(row.userId),
        ipAddress: row.ipAddress,
        auditStatus: '1',
        auditRemark: ''
      }
      this.auditOpen = true
    },
    submitAudit() {
      if (this.auditForm.auditStatus === '2' && !this.auditForm.auditRemark) {
        this.$message.error('驳回必须填写原因')
        return
      }
      auditIpAuth({
        id: this.auditForm.id,
        auditStatus: this.auditForm.auditStatus,
        auditRemark: this.auditForm.auditRemark
      }).then(() => {
        this.$message.success('审核完成')
        this.auditOpen = false
        this.getList()
      })
    },
    handleUpdate(row) {
      this.reset()
      getIpAuth(row.id || this.ids[0]).then(res => {
        this.form = res.data
        this.open = true
        this.title = '修改IP授权'
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        if (this.form.id != null) {
          updateIpAuth(this.form).then(() => {
            this.$message.success('修改成功')
            this.open = false
            this.getList()
          })
        } else {
          addIpAuth(this.form).then(() => {
            this.$message.success('新增成功')
            this.open = false
            this.getList()
          })
        }
      })
    },
    handleDelete(row) {
      const ids = row.id ? [row.id] : this.ids
      this.$confirm('确认删除选中的IP授权吗？', '提示', { type: 'warning' })
        .then(() => delIpAuth(ids.join(',')))
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
