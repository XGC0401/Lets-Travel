<template>
  <el-container style="min-height: 100vh">
    <el-aside width="240px" class="aside">
      <div class="logo">
        <span>Let's Travel</span>
        <small>Local Guide Platform</small>
      </div>
      <el-menu
        router
        :default-active="activeRoute"
        class="menu"
      >
        <el-menu-item index="/dashboard">Dashboard</el-menu-item>
        <el-menu-item index="/users">Users</el-menu-item>
        <el-menu-item index="/tours">Tours</el-menu-item>
        <el-menu-item index="/bookings">Bookings</el-menu-item>
        <el-menu-item index="/transactions">Transactions</el-menu-item>
        <el-menu-item index="/disputes">Disputes</el-menu-item>
        <el-menu-item index="/reports">Reports</el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <h1>Local Experience Operations</h1>
          <p>Connect tourists with verified local guides</p>
        </div>
        <div class="header-right">
          <el-input
            placeholder="Search tours, guides, bookings"
            :prefix-icon="Search"
            class="search"
            disabled
          />
          <el-avatar size="large">LT</el-avatar>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { Search } from "@element-plus/icons-vue";

const route = useRoute();
const activeRoute = computed(() => route.path);
</script>

<style scoped>
.aside {
  background: #0f172a;
  color: #fff;
}

.logo {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-weight: 600;
  font-size: 18px;
}

.logo small {
  font-size: 12px;
  color: #94a3b8;
}

.menu {
  border-right: none;
  background: transparent;
}

:deep(.el-menu-item) {
  color: #cbd5f5;
}

:deep(.el-menu-item.is-active) {
  background: rgba(148, 163, 184, 0.2);
  color: #fff;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.header-left h1 {
  margin: 0;
  font-size: 18px;
}

.header-left p {
  margin: 2px 0 0 0;
  font-size: 12px;
  color: #6b7280;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search {
  width: 260px;
}
</style>
