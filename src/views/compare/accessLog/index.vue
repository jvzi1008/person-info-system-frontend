<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="76px">
      <el-form-item label="登录账号" prop="loginName">
        <el-input v-model="queryParams.loginName" placeholder="请输入登录账号" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="请求IP" prop="ipAddress">
        <el-input v-model="queryParams.ipAddress" placeholder="请输入请求IP" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="查询姓名" prop="queryName">
        <el-input v-model="queryParams.queryName" placeholder="请输入查询姓名" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="结果码" prop="resultCode">
        <el-select v-model="queryParams.resultCode" placeholder="全部" clearable style="width: 120px">
          <el-option label="成功" value="SUCCESS" />
          <el-option label="未匹配" value="NO_MATCH" />
          <el-option label="姓名不一致" value="NAME_MISMATCH" />
          <el-option label="仅转学记录" value="TRANSFER_ONLY" />
          <el-option label="冲突" value="CONFLICT" />
        </el-select>
      </el-form-item>
      <el-form-item label="需复核" prop="needReview">
        <el-select v-model="queryParams.needReview" placeholder="全部" clearable style="width: 100px">
          <el-option label="是" value="1" />
          <el-option label="否" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="请求时间">
        <el-date-picker
          v-model="daterange"
          style="width: 240px"
          value-format="yyyy-MM-dd HH:mm:ss"
          type="datetimerange"
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['compare:accessLog:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['compare:accessLog:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="logList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="编号" align="center" prop="id" width="70" />
      <el-table-column label="登录账号" align="center" prop="loginName" min-width="110" />
      <el-table-column label="请求IP" align="center" prop="ipAddress" min-width="125" />
      <el-table-column label="查询姓名" align="center" prop="queryName" min-width="100" />
      <el-table-column label="证件号" align="center" prop="queryIdCard" min-width="125" />
      <el-table-column label="是否在读" align="center" prop="isInSchool" width="90">
        <template slot-scope="scope">{{ flagText(scope.row.isInSchool) }}</template>
      </el-table-column>
      <el-table-column label="中小学生/职业" align="center" prop="isTargetStudent" width="115">
        <template slot-scope="scope">{{ flagText(scope.row.isTargetStudent) }}</template>
      </el-table-column>
      <el-table-column label="有转学记录" align="center" prop="hasTransfer" width="100">
        <template slot-scope="scope">{{ scope.row.hasTransfer === '1' ? '是' : '否' }}</template>
      </el-table-column>
      <el-table-column label="需复核" align="center" prop="needReview" width="85">
        <template slot-scope="scope">
          <el-tag :type="scope.row.needReview === '1' ? 'warning' : 'success'" size="small">
            {{ scope.row.needReview === '1' ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="结果" align="center" prop="resultCode" width="100" />
      <el-table-column label="请求时间" align="center" prop="requestTime" width="170" />
      <el-table-column label="操作" align="center" width="130" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-view" @click="handleView(scope.row)">详情</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['compare:accessLog:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog title="访问日志详情" :visible.sync="open" width="760px" append-to-body>
      <el-descriptions v-if="detail" :column="2" border size="small">
        <el-descriptions-item label="日志编号">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="登录账号">{{ detail.loginName }}</el-descriptions-item>
        <el-descriptions-item label="请求IP">{{ detail.ipAddress }}</el-descriptions-item>
        <el-descriptions-item label="请求方式">{{ detail.requestMethod }}</el-descriptions-item>
        <el-descriptions-item label="请求地址" :span="2">{{ detail.requestUri }}</el-descriptions-item>
        <el-descriptions-item label="查询姓名">{{ detail.queryName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="证件号">{{ detail.queryIdCard || '-' }}</el-descriptions-item>
        <el-descriptions-item label="是否在读">{{ flagText(detail.isInSchool) }}</el-descriptions-item>
        <el-descriptions-item label="学生类型">{{ detail.studentType || '-' }}</el-descriptions-item>
        <el-descriptions-item label="中小学生/职业">{{ flagText(detail.isTargetStudent) }}</el-descriptions-item>
        <el-descriptions-item label="有转学记录">{{ detail.hasTransfer === '1' ? '是' : '否' }}</el-descriptions-item>
        <el-descriptions-item label="冲突">{{ detail.conflictFlag === '1' ? '是' : '否' }}</el-descriptions-item>
        <el-descriptions-item label="需复核">{{ detail.needReview === '1' ? '是' : '否' }}</el-descriptions-item>
        <el-descriptions-item label="结果码">{{ detail.resultCode }}</el-descriptions-item>
        <el-descriptions-item label="耗时">{{ detail.costMs }} ms</el-descriptions-item>
        <el-descriptions-item label="结果说明" :span="2">{{ detail.resultMsg || '-' }}</el-descriptions-item>
        <el-descriptions-item label="请求时间" :span="2">{{ detail.requestTime }}</el-descriptions-item>
      </el-descriptions>
      <el-divider content-position="left">结果快照</el-divider>
      <pre class="json-box">{{ prettyJson }}</pre>
      <div slot="footer">
        <el-button @click="open = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listAccessLog, getAccessLog, delAccessLog } from '@/api/compare/accessLog'

export default {
  name: 'CompareAccessLog',
  data() {
    return {
      loading: true,
      ids: [],
      multiple: true,
      showSearch: true,
      total: 0,
      logList: [],
      daterange: [],
      open: false,
      detail: null,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        loginName: null,
        ipAddress: null,
        queryName: null,
        resultCode: null,
        needReview: null,
        params: {}
      }
    }
  },
  computed: {
    prettyJson() {
      if (!this.detail || !this.detail.resultJson) {
        return '无'
      }
      try {
        return JSON.stringify(JSON.parse(this.detail.resultJson), null, 2)
      } catch (e) {
        return this.detail.resultJson
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    flagText(value) {
      if (value === '1') {
        return '是'
      }
      if (value === '0') {
        return '否'
      }
      return '未知'
    },
    getList() {
      this.loading = true
      listAccessLog(this.queryParams)
        .then(res => {
          this.logList = res.rows
          this.total = res.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.addDateRange(this.queryParams, this.daterange, 'RequestTime')
      this.getList()
    },
    resetQuery() {
      this.daterange = []
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.multiple = !selection.length
    },
    handleView(row) {
      getAccessLog(row.id).then(res => {
        this.detail = res.data
        this.open = true
      })
    },
    handleDelete(row) {
      const ids = row.id ? [row.id] : this.ids
      this.$confirm('确认删除选中的访问日志吗？日志删除后不可恢复。', '提示', { type: 'warning' })
        .then(() => delAccessLog(ids.join(',')))
        .then(() => {
          this.$message.success('删除成功')
          this.getList()
        })
        .catch(() => {})
    },
    handleExport() {
      this.addDateRange(this.queryParams, this.daterange, 'RequestTime')
      this.download('compare/accessLog/export', { ...this.queryParams }, `accessLog_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>

<style scoped>
.json-box {
  max-height: 300px;
  overflow: auto;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.6;
}
</style>
