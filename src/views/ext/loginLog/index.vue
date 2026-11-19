<template>
  <div class="ext-page">
    <el-card>
      <div slot="header" class="card-header">
        <span>我的登录日志</span>
      </div>

      <el-form :model="queryParams" ref="queryForm" size="small" :inline="true">
        <el-form-item label="登录状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="成功" value="0" />
            <el-option label="失败" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间">
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

      <el-table v-loading="loading" :data="logList" border size="small">
        <el-table-column prop="loginTime" label="登录时间" width="170" />
        <el-table-column prop="ipaddr" label="登录IP" width="140" />
        <el-table-column prop="loginLocation" label="登录地点" min-width="120" show-overflow-tooltip />
        <el-table-column prop="browser" label="浏览器" min-width="140" show-overflow-tooltip />
        <el-table-column prop="os" label="操作系统" min-width="120" show-overflow-tooltip />
        <el-table-column label="状态" width="90" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'" size="small">
              {{ scope.row.status === '0' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="msg" label="提示消息" min-width="180" show-overflow-tooltip />
      </el-table>

      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
    </el-card>
  </div>
</template>

<script>
import { listMyLoginLog } from '@/api/compare/myLoginLog'

export default {
  name: 'ExtLoginLog',
  data() {
    return {
      loading: false,
      total: 0,
      logList: [],
      daterange: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        status: null,
        params: {}
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      listMyLoginLog(this.addDateRange(this.queryParams, this.daterange, 'Time'))
        .then(res => {
          this.logList = res.rows || []
          this.total = res.total || 0
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
      this.daterange = []
      this.resetForm('queryForm')
      this.handleQuery()
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
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
</style>
