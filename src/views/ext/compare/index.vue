<template>
  <div class="compare-page">
    <el-card class="query-card">
      <div slot="header" class="card-header">
        <span>人员信息比对</span>
      </div>

      <el-form ref="queryForm" :model="queryParams" :rules="rules" label-width="90px" size="medium">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="14">
            <el-form-item label="证件号" prop="idCardNo">
              <el-input
                v-model="queryParams.idCardNo"
                placeholder="请输入证件号"
                clearable
                @keyup.enter.native="handleQuery"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="10">
            <el-form-item label="姓名" prop="name">
              <el-input
                v-model="queryParams.name"
                placeholder="选填，用于一致性校验"
                clearable
                @keyup.enter.native="handleQuery"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <el-button type="primary" icon="el-icon-search" :loading="loading" @click="handleQuery">
            查询
          </el-button>
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="result" class="result-card">
      <div slot="header" class="card-header">
        <span>比对结果</span>
      </div>

      <el-alert
        v-if="queryAlert"
        :title="queryAlert"
        type="error"
        :closable="false"
        show-icon
        class="mb16"
      />
      <el-alert
        v-else-if="reviewAlert"
        :title="reviewAlert"
        type="warning"
        :closable="false"
        show-icon
        class="mb16"
      />

      <el-row :gutter="16">
        <el-col :xs="24" :sm="8">
          <div class="result-item">
            <div class="result-label">是否在读</div>
            <el-tag :type="inSchoolTagType" size="medium">
              {{ inSchoolText }}
            </el-tag>
          </div>
        </el-col>
        <el-col :xs="24" :sm="8">
          <div class="result-item">
            <div class="result-label">是否中小学生或职业学生</div>
            <el-tag :type="targetStudentTagType" size="medium">
              {{ targetStudentText }}
            </el-tag>
          </div>
        </el-col>
        <el-col :xs="24" :sm="8">
          <div class="result-item">
            <div class="result-label">是否有转学记录</div>
            <el-tag :type="result.hasTransfer ? 'warning' : 'info'" size="medium">
              {{ result.hasTransfer ? '是' : '否' }}
            </el-tag>
          </div>
        </el-col>
      </el-row>

      <el-descriptions :column="3" border size="small" class="mt20">
        <el-descriptions-item label="姓名">{{ result.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="证件号">{{ result.idCardNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="学生类型">{{ studentTypeText }}</el-descriptions-item>
        <el-descriptions-item label="命中条数">{{ result.matchCount }}</el-descriptions-item>
        <el-descriptions-item label="结果说明">{{ result.resultMsg || '-' }}</el-descriptions-item>
        <el-descriptions-item label="需要复核">{{ result.needReview ? '是' : '否' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">在校状态</el-divider>
      <template v-if="result.statusList && result.statusList.length">
        <el-tag v-for="status in result.statusList" :key="status" class="mr10" type="info">
          {{ status }}
        </el-tag>
      </template>
      <span v-else class="text-muted">无</span>

      <el-divider content-position="left">学生结果明细</el-divider>
      <el-table :data="result.studentResults || []" border size="small" empty-text="无">
        <el-table-column prop="sourceType" label="来源" width="80" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="status" label="在校状态" width="120" />
        <el-table-column prop="schoolName" label="学校" />
      </el-table>

      <el-divider content-position="left">转学记录</el-divider>
      <el-table :data="result.transfers || []" border size="small" empty-text="无">
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="fromSchool" label="转出学校" />
        <el-table-column prop="toSchool" label="转入学校" />
        <el-table-column prop="zxlx" label="转学类型" width="90" />
        <el-table-column prop="applyTime" label="申请时间" width="170" />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { comparePerson } from '@/api/compare/person'

export default {
  name: 'ExtCompare',
  data() {
    return {
      loading: false,
      queryParams: {
        idCardNo: '',
        name: ''
      },
      rules: {
        idCardNo: [{ required: true, message: '证件号不能为空', trigger: 'blur' }]
      },
      result: null
    }
  },
  computed: {
    studentTypeText() {
      const map = {
        PRIMARY_SECONDARY: '中小学生',
        VOCATIONAL: '职业学生',
        BOTH: '中小学生 + 职业学生',
        UNKNOWN: '未知'
      }
      return map[this.result && this.result.studentType] || '未知'
    },
    queryAlert() {
      if (!this.result) {
        return ''
      }
      if (this.result.queryStatus === 'NOT_FOUND') {
        return '未查询到该身份证号对应的人员信息，请核对身份证号和姓名'
      }
      if (this.result.queryStatus === 'NAME_MISMATCH') {
        return '姓名与系统记录不一致，请核对姓名'
      }
      return ''
    },
    reviewAlert() {
      if (!this.result || this.queryAlert) {
        return ''
      }
      if (this.result.reviewReasons && this.result.reviewReasons.length) {
        return this.result.resultMsg || '部分数据需要人工复核'
      }
      return ''
    },
    inSchoolText() {
      if (!this.result) {
        return '-'
      }
      const map = { YES: '是', NO: '否', UNKNOWN: '未知', CONFLICT: '状态冲突' }
      if (this.result.inSchoolStatus) {
        return map[this.result.inSchoolStatus] || '未知'
      }
      return this.result.inSchool === true ? '是' : this.result.inSchool === false ? '否' : '未知'
    },
    inSchoolTagType() {
      if (!this.result) {
        return 'info'
      }
      if (this.result.inSchoolStatus === 'YES') {
        return 'success'
      }
      if (this.result.inSchoolStatus === 'CONFLICT') {
        return 'warning'
      }
      return 'info'
    },
    targetStudentText() {
      if (!this.result) {
        return '-'
      }
      const map = { YES: '是', NO: '否', UNKNOWN: '未知' }
      if (this.result.targetStudentStatus) {
        return map[this.result.targetStudentStatus] || '未知'
      }
      return this.result.targetStudent === true ? '是' : this.result.targetStudent === false ? '否' : '未知'
    },
    targetStudentTagType() {
      if (!this.result) {
        return 'info'
      }
      return this.result.targetStudentStatus === 'YES' ? 'success' : 'info'
    }
  },
  methods: {
    handleQuery() {
      this.$refs.queryForm.validate(valid => {
        if (!valid) {
          return
        }
        this.loading = true
        comparePerson({
          idCardNo: this.queryParams.idCardNo.trim(),
          name: this.queryParams.name.trim()
        })
          .then(res => {
            this.result = res.data
          })
          .finally(() => {
            this.loading = false
          })
      })
    },
    resetQuery() {
      this.$refs.queryForm.resetFields()
      this.result = null
    }
  }
}
</script>

<style scoped>
.compare-page {
  max-width: 1180px;
  margin: 0 auto;
}

.query-card {
  margin-bottom: 20px;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.result-item {
  padding: 18px 10px;
  text-align: center;
  background: #f8f8f9;
  border-radius: 6px;
  margin-bottom: 12px;
}

.result-label {
  margin-bottom: 10px;
  color: #606266;
}

.mb16 {
  margin-bottom: 16px;
}

.mt20 {
  margin-top: 20px;
}

.mr10 {
  margin-right: 10px;
}

.text-muted {
  color: #909399;
}
</style>
