<template>
  <div id="app">
    <header v-if="authStore.isAuthenticated" class="app-header">
      <div class="header-content">
        <div class="logo" @click="router.push('/')">
          <h1>🌍 Let's Travel</h1>
        </div>
        
        <nav class="main-nav">
          <!-- Tourist Navigation -->
          <template v-if="authStore.userType === 'tourist'">
            <router-link to="/search">Search Tours</router-link>
            <router-link to="/my-bookings">My Bookings</router-link>
            <router-link to="/messages">Messages</router-link>
          </template>
          
          <!-- Tour Guide Navigation -->
          <template v-if="authStore.userType === 'guide'">
            <router-link to="/my-tours">My Tours</router-link>
            <router-link to="/create-tour">Create Tour</router-link>
            <router-link to="/bookings">Bookings</router-link>
            <router-link to="/guide-reports">Reports</router-link>
          </template>
          
          <!-- Administrator Navigation -->
          <template v-if="authStore.userType === 'admin'">
            <router-link to="/admin/users">Users</router-link>
            <router-link to="/admin/tours">Tours</router-link>
            <router-link to="/admin/reviews">Reviews</router-link>
            <router-link to="/admin/disputes">Disputes</router-link>
            <router-link to="/admin/reports">Reports</router-link>
          </template>
        </nav>
        
        <div class="user-section">
          <!-- Currency Switcher -->
          <div class="currency-switcher" v-if="authStore.userType === 'tourist'">
            <select v-model="settingsStore.currency" @change="settingsStore.updateCurrency">
              <option value="USD">USD $</option>
              <option value="EUR">EUR €</option>
              <option value="GBP">GBP £</option>
              <option value="HKD">HKD $</option>
              <option value="JPY">JPY ¥</option>
              <option value="CNY">CNY ¥</option>
              <option value="AUD">AUD $</option>
              <option value="SGD">SGD $</option>
            </select>
          </div>
          
          <div class="user-menu" @click="toggleUserMenu">
            <span class="user-name">{{ authStore.user?.name }}</span>
            <span class="user-type">({{ authStore.userType }})</span>
          </div>
          
          <div v-if="showUserMenu" class="dropdown-menu">
            <router-link to="/profile">Profile</router-link>
            <a @click="logout">Logout</a>
          </div>
        </div>
      </div>
    </header>
    
    <main class="app-main">
      <router-view />
    </main>
    
    <footer v-if="authStore.isAuthenticated" class="app-footer">
      <p>&copy; 2026 Let's Travel - Connecting Tourists with Local Guides</p>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useSettingsStore } from './stores/settings'

const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const showUserMenu = ref(false)

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const logout = () => {
  authStore.logout()
  router.push('/login')
  showUserMenu.value = false
}
</script>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo h1 {
  margin: 0;
  cursor: pointer;
  font-size: 1.5rem;
}

.main-nav {
  display: flex;
  gap: 2rem;
}

.main-nav a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: background 0.3s;
}

.main-nav a:hover,
.main-nav a.router-link-active {
  background: rgba(255,255,255,0.2);
}

.user-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.currency-switcher select {
  padding: 0.5rem;
  border-radius: 5px;
  border: none;
  background: white;
  cursor: pointer;
}

.user-menu {
  cursor: pointer;
  padding: 0.5rem 1rem;
  background: rgba(255,255,255,0.2);
  border-radius: 5px;
}

.user-type {
  font-size: 0.85rem;
  opacity: 0.8;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
  z-index: 1000;
}

.dropdown-menu a {
  display: block;
  padding: 0.75rem 1.5rem;
  color: #333;
  text-decoration: none;
  cursor: pointer;
}

.dropdown-menu a:hover {
  background: #f5f5f5;
}

.app-main {
  min-height: calc(100vh - 200px);
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.app-footer {
  background: #2d3748;
  color: white;
  text-align: center;
  padding: 2rem;
  margin-top: 4rem;
}
</style>
