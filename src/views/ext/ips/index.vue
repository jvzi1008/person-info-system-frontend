<template>
  <div class="ext-page">
    <el-card>
      <div slot="header" class="card-header">
        <span>我的 IP 授权</span>
        <el-button type="primary" size="small" icon="el-icon-plus" @click="handleAdd">添加 IP</el-button>
      </div>

      <el-alert
        title="每个用户最多保留 10 个有效 IP，支持单个 IP 和 CIDR；新增 IP 需管理员审核通过后生效；不能删除最后一个有效 IP。"
        type="info"
        :closable="false"
        show-icon
        class="mb16"
      />

      <el-table v-loading="loading" :data="ipList" border size="small">
        <el-table-column prop="ipAddress" label="IP / CIDR" min-width="180" />
        <el-table-column prop="sourceType" label="来源" width="100">
          <template slot-scope="scope">
            {{ sourceText(scope.row.sourceType) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.auditStatus === '0'" type="warning" size="small">待审核</el-tag>
            <el-tag v-else-if="scope.row.auditStatus === '2'" type="danger" size="small">已驳回</el-tag>
            <el-tag v-else :type="scope.row.status === '0' ? 'success' : 'info'" size="small">
              {{ scope.row.status === '0' ? '有效' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="effectiveTime" label="生效时间" width="170" />
        <el-table-column prop="expireTime" label="过期时间" width="170">
          <template slot-scope="scope">{{ scope.row.expireTime || '永久' }}</template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" />
        <el-table-column label="操作" width="90" align="center">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="添加 IP 授权" :visible.sync="dialogVisible" width="460px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="90px" size="small">
        <el-form-item label="IP / CIDR" prop="ipAddress">
          <el-input v-model="form.ipAddress" placeholder="例如 127.0.0.1 或 192.168.1.0/24" />
        </el-form-item>
        <el-form-item label="生效时间">
          <el-date-picker
            v-model="form.effectiveTime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="不填则立即生效"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="过期时间">
          <el-date-picker
            v-model="form.expireTime"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="不填则永久有效"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="限流QPS">
          <el-input-number v-model="form.maxQps" :min="1" :max="1000" controls-position="right" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="small" @click="dialogVisible = false">取消</el-button>
        <el-button size="small" type="primary" :loading="saving" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listMyIps, addMyIp, delMyIp } from '@/api/compare/myIp'

export default {
  name: 'ExtIps',
  data() {
    return {
      loading: false,
      saving: false,
      dialogVisible: false,
      ipList: [],
      form: {
        ipAddress: '',
        effectiveTime: null,
        expireTime: null,
        maxQps: 20,
        remark: ''
      },
      rules: {
        ipAddress: [{ required: true, message: '请输入 IP 或 CIDR', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      listMyIps()
        .then(res => {
          this.ipList = res.data || []
        })
        .finally(() => {
          this.loading = false
        })
    },
    sourceText(value) {
      const map = {
        1: '首次登录',
        2: '自助添加',
        3: '管理员添加'
      }
      return map[value] || '-'
    },
    handleAdd() {
      this.form = {
        ipAddress: '',
        effectiveTime: null,
        expireTime: null,
        maxQps: 20,
        remark: ''
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        this.saving = true
        addMyIp(this.form)
          .then(res => {
            this.$message.success((res && res.msg) || 'IP已提交，待管理员审核')
            this.dialogVisible = false
            this.getList()
          })
          .finally(() => {
            this.saving = false
          })
      })
    },
    handleDelete(row) {
      this.$confirm('确认删除该 IP 授权吗？', '提示', {
        type: 'warning'
      })
        .then(() => delMyIp(row.id))
        .then(() => {
          this.$message.success('删除成功')
          this.getList()
        })
        .catch(() => {})
    }
  }
}
</script>

<style scoped>
.ext-page {
  max-width: 1180px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.mb16 {
  margin-bottom: 16px;
}
</style>
