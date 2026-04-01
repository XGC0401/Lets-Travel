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
            <router-link to="/my-disputes">My Disputes</router-link>
            <router-link to="/my-transactions">My Transactions</router-link>
            <router-link to="/messages">Messages</router-link>
            <router-link to="/emergency" class="emergency-link">
              🚨 Emergency
              <span v-if="unresolvedEmergencyCount > 0" class="notification-badge">{{ unresolvedEmergencyCount }}</span>
            </router-link>
          </template>
          
          <!-- Tour Guide Navigation -->
          <template v-if="authStore.userType === 'guide'">
            <router-link to="/my-tours">My Tours</router-link>
            <router-link to="/create-tour">Create Tour</router-link>
            <router-link to="/bookings">Bookings</router-link>
            <router-link to="/guide-disputes">Disputes</router-link>
            <router-link to="/guide-transactions">Transactions</router-link>
            <router-link to="/guide-reports">Reports</router-link>
            <router-link to="/guide-emergency" class="emergency-link">
              🚨 Emergency
              <span v-if="unresolvedEmergencyCount > 0" class="notification-badge">{{ unresolvedEmergencyCount }}</span>
            </router-link>
          </template>
          
          <!-- Administrator Navigation -->
          <template v-if="authStore.userType === 'admin'">
            <router-link to="/admin/tours">Tours</router-link>
            <router-link to="/admin/users">Users</router-link>
            <router-link to="/admin/transactions">Transactions</router-link>
            <router-link to="/admin/disputes">Disputes</router-link>
            <router-link to="/admin/reviews">Reviews</router-link>
            <router-link to="/admin/reports">Reports</router-link>
            <router-link to="/admin/emergency" class="emergency-link">
              🚨 Emergency
              <span v-if="unresolvedEmergencyCount > 0" class="notification-badge">{{ unresolvedEmergencyCount }}</span>
            </router-link>
          </template>
        </nav>
        
        <div class="user-section">
          <div class="user-menu" @click="toggleUserMenu">
            <span class="user-name">{{ authStore.user?.name }}</span>
            <span class="user-type">({{ authStore.userType }})</span>
          </div>
          
          <div v-if="showUserMenu" class="dropdown-menu">
            <div class="dropdown-section currency-switcher">
              <label for="currency-select">Currency</label>
              <select id="currency-select" v-model="settingsStore.currency" @change="settingsStore.updateCurrency">
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
            <router-link to="/profile">Profile</router-link>
            <a @click="logout">Logout</a>
          </div>
        </div>
      </div>
    </header>
    
    <main :class="['app-main', { 'auth-main': !authStore.isAuthenticated }]">
      <router-view />
    </main>
    
    <footer v-if="authStore.isAuthenticated" class="app-footer">
      <p>&copy; 2026 Let's Travel - Connecting Tourists with Local Guides</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useSettingsStore } from './stores/settings'
import { useDataStore } from './stores/data'

const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const dataStore = useDataStore()
const showUserMenu = ref(false)

const unresolvedEmergencyCount = computed(() => {
  return dataStore.emergencies.filter(e => e.status === 'active').length
})

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
  padding: 1.5rem 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem 0 1.6rem;
  display: flex;
  align-items: center;
  gap: 1rem 1.75rem;
}

.logo {
  margin-right: 0.25rem;
  margin-left: -0.2rem;
  flex-shrink: 0;
}

.logo h1 {
  margin: 0;
  cursor: pointer;
  font-size: 1.55rem;
  white-space: nowrap;
  font-weight: 700;
}

.main-nav {
  display: flex;
  gap: 0.85rem;
  flex: 1 1 auto;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
}

.main-nav a {
  color: white;
  text-decoration: none;
  padding: 0.55rem 0.85rem;
  border-radius: 5px;
  transition: background 0.3s;
  font-size: 0.96rem;
  font-weight: 600;
  white-space: nowrap;
  display: flex;
  align-items: center;
}

.main-nav a:hover,
.main-nav a.router-link-active {
  background: rgba(255,255,255,0.2);
}

.main-nav a.emergency-link {
  margin-left: 0.75rem;
  border-left: 2px solid rgba(255,255,255,0.3);
  padding-left: 1.25rem;
  position: relative;
}

.notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 0 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  animation: pulse-badge 2s ease-in-out infinite;
}

@keyframes pulse-badge {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.user-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  margin-left: auto;
  flex-shrink: 0;
  padding-right: 0.35rem;
}

.currency-switcher select {
  width: 100%;
  padding: 0.6rem 0.7rem;
  border-radius: 5px;
  border: 1px solid #cbd5e0;
  background: white;
  cursor: pointer;
}

.user-menu {
  cursor: pointer;
  padding: 0.55rem 1rem;
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
  min-width: 220px;
}

.dropdown-section {
  padding: 0.9rem 1rem 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.dropdown-section label {
  display: block;
  margin-bottom: 0.4rem;
  color: #4a5568;
  font-size: 0.85rem;
  font-weight: 600;
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

.app-main.auth-main {
  min-height: 100vh;
  max-width: none;
  padding: 0;
}

.app-footer {
  background: #2d3748;
  color: white;
  text-align: center;
  padding: 2rem;
  margin-top: 4rem;
}

@media (max-width: 1180px) {
  .header-content {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .main-nav {
    flex-basis: 100%;
    order: 3;
  }

  .user-section {
    order: 2;
  }
}
</style>
