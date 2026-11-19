<template>
  <div class="ext-layout">
    <header class="ext-header">
      <div class="brand">人员信息管理系统</div>
      <nav class="nav">
        <router-link to="/ext/compare">人员信息比对</router-link>
        <router-link to="/ext/ips">我的IP</router-link>
      </nav>
      <div class="user-area">
        <span class="user-name">{{ userName }}</span>
        <el-button type="text" class="logout" @click="openPwd">修改密码</el-button>
        <el-button type="text" class="logout" @click="handleLogout">退出登录</el-button>
      </div>
    </header>

    <main class="ext-main">
      <router-view />
    </main>

    <el-dialog title="修改密码" :visible.sync="pwdOpen" width="420px" append-to-body>
      <el-form ref="pwdForm" :model="pwdForm" :rules="pwdRules" label-width="90px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="pwdForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="pwdForm.newPassword" type="password" show-password placeholder="8-20位，含字母和数字" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="pwdForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="pwdOpen = false">取 消</el-button>
        <el-button type="primary" :loading="pwdSaving" @click="submitPwd">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { updateUserPwd } from '@/api/system/user'
export default {
  name: 'ExtLayout',
  data() {
    return {
      userName: '',
      pwdOpen: false,
      pwdSaving: false,
      pwdForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      pwdRules: {
        oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 8, max: 20, message: '密码长度必须为8-20位', trigger: 'blur' },
          { pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/, message: '密码必须同时包含字母和数字', trigger: 'blur' }
        ],
        confirmPassword: [{ required: true, message: '请再次输入新密码', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.userName = this.$store.getters.nickName || this.$store.getters.name || ''
  },
  methods: {
    openPwd() {
      this.pwdForm = { oldPassword: '', newPassword: '', confirmPassword: '' }
      this.pwdOpen = true
      this.$nextTick(() => {
        this.$refs.pwdForm && this.$refs.pwdForm.clearValidate()
      })
    },
    submitPwd() {
      this.$refs.pwdForm.validate(valid => {
        if (!valid) {
          return
        }
        if (this.pwdForm.newPassword !== this.pwdForm.confirmPassword) {
          this.$message.error('两次输入的新密码不一致')
          return
        }
        this.pwdSaving = true
        updateUserPwd(this.pwdForm.oldPassword, this.pwdForm.newPassword)
          .then(() => {
            this.$message.success('密码修改成功，请重新登录')
            this.pwdOpen = false
            this.handleLogout()
          })
          .finally(() => {
            this.pwdSaving = false
          })
      })
    },
    handleLogout() {
      this.$store.dispatch('LogOut').finally(() => {
        this.$router.replace('/login')
      })
    }
  }
}
</script>

<style scoped>
.ext-layout {
  min-height: 100vh;
  background: #f0f2f5;
}

.ext-header {
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 32px;
  background: #1f2d3d;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.brand {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 1px;
  white-space: nowrap;
}

.nav {
  display: flex;
  gap: 24px;
  margin-left: 48px;
}

.nav a {
  color: #c0c4cc;
  font-size: 15px;
  text-decoration: none;
  padding: 6px 0;
  border-bottom: 2px solid transparent;
}

.nav a.router-link-active {
  color: #fff;
  border-bottom-color: #409eff;
}

.user-area {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  color: #e5eaf3;
}

.logout {
  color: #c0c4cc;
}

.logout:hover {
  color: #fff;
}

.ext-main {
  padding: 24px;
}

@media (max-width: 768px) {
  .ext-header {
    flex-wrap: wrap;
    height: auto;
    padding: 12px 16px;
    gap: 10px;
  }

  .nav {
    order: 3;
    width: 100%;
    margin-left: 0;
    gap: 18px;
  }

  .ext-main {
    padding: 12px;
  }
}
</style>
