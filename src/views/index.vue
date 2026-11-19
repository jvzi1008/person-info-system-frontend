<template>
  <div class="home">
    <h1>人员信息管理系统</h1>
    <ext-compare />
  </div>
</template>

<script>
import ExtCompare from '@/views/ext/compare/index'

export default {
  name: 'Index',
  components: {
    ExtCompare
  }
}
</script>

<style scoped>
.home {
  max-width: 1180px;
  margin: 0 auto;
  padding: 30px 20px 40px;
}

.home h1 {
  margin: 0 0 28px;
  text-align: center;
  font-size: 44px;
  font-weight: 600;
  letter-spacing: 4px;
  color: #1f2d3d;
}

@media (max-width: 768px) {
  .home h1 {
    font-size: 30px;
    letter-spacing: 2px;
  }
}
</style>
