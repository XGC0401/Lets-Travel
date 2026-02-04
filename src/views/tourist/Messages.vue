<template>
  <div class="messages-view">
    <h1>Messages</h1>
    
    <div class="messages-container">
      <!-- Conversations List -->
      <div class="conversations-sidebar card">
        <h3>Conversations</h3>
        <div v-if="conversations.length === 0" class="empty-state">
          No conversations yet
        </div>
        <div 
          v-for="conv in conversations" 
          :key="conv.userId"
          @click="selectConversation(conv.userId)"
          :class="['conversation-item', { active: selectedUserId === conv.userId }]"
        >
          <img :src="conv.avatar" alt="Avatar" class="avatar-small">
          <div class="conversation-info">
            <strong>{{ conv.name }}</strong>
            <small>{{ conv.lastMessage }}</small>
          </div>
          <div v-if="conv.unread" class="unread-badge">{{ conv.unread }}</div>
        </div>
      </div>
      
      <!-- Chat Area -->
      <div class="chat-area card">
        <div v-if="!selectedUserId" class="empty-chat">
          Select a conversation to start messaging
        </div>
        
        <div v-else class="chat-container">
          <div class="chat-header">
            <img :src="selectedUser?.avatar" alt="Avatar" class="avatar-small">
            <div>
              <h3>{{ selectedUser?.name }}</h3>
              <small>{{ selectedUser?.type }}</small>
            </div>
          </div>
          
          <div class="messages-list" ref="messagesContainer">
            <div 
              v-for="message in currentMessages" 
              :key="message.id"
              :class="['message-bubble', { 'my-message': message.senderId === authStore.user.id }]"
            >
              <div class="message-content">
                {{ message.message }}
              </div>
              <small class="message-time">{{ formatTime(message.timestamp) }}</small>
            </div>
          </div>
          
          <form @submit.prevent="sendMessage" class="message-input-form">
            <input 
              type="text" 
              v-model="newMessage" 
              placeholder="Type a message..."
              class="message-input"
            >
            <button type="submit" class="btn btn-primary">Send</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDataStore } from '../../stores/data'
import { useAuthStore } from '../../stores/auth'
import { generateId } from '../../data/dataService'

const route = useRoute()
const dataStore = useDataStore()
const authStore = useAuthStore()

const selectedUserId = ref(null)
const newMessage = ref('')
const messagesContainer = ref(null)

onMounted(() => {
  // Check if there's a userId in query params
  if (route.query.userId) {
    selectConversation(route.query.userId)
  }
})

const conversations = computed(() => {
  const userMessages = dataStore.messages.filter(m => 
    m.senderId === authStore.user.id || m.receiverId === authStore.user.id
  )
  
  const users = new Set()
  userMessages.forEach(m => {
    const otherUserId = m.senderId === authStore.user.id ? m.receiverId : m.senderId
    users.add(otherUserId)
  })
  
  return Array.from(users).map(userId => {
    const user = dataStore.getUserById(userId)
    const userConversation = dataStore.getConversation(authStore.user.id, userId)
    const lastMsg = userConversation[userConversation.length - 1]
    const unreadCount = userConversation.filter(m => 
      m.receiverId === authStore.user.id && !m.read
    ).length
    
    return {
      userId,
      name: user?.name || 'Unknown',
      avatar: user?.avatar || '',
      type: user?.type || '',
      lastMessage: lastMsg?.message.substring(0, 30) || '',
      unread: unreadCount
    }
  }).sort((a, b) => b.unread - a.unread)
})

const selectedUser = computed(() => {
  return selectedUserId.value ? dataStore.getUserById(selectedUserId.value) : null
})

const currentMessages = computed(() => {
  if (!selectedUserId.value) return []
  return dataStore.getConversation(authStore.user.id, selectedUserId.value)
})

function selectConversation(userId) {
  selectedUserId.value = userId
  
  // Mark messages as read
  dataStore.messages.forEach(m => {
    if (m.senderId === userId && m.receiverId === authStore.user.id) {
      m.read = true
    }
  })
  dataStore.saveAllData()
  
  nextTick(() => {
    scrollToBottom()
  })
}

function sendMessage() {
  if (!newMessage.value.trim()) return
  
  const message = {
    id: generateId('message'),
    bookingId: null,
    senderId: authStore.user.id,
    receiverId: selectedUserId.value,
    message: newMessage.value,
    timestamp: new Date().toISOString(),
    read: false
  }
  
  dataStore.addMessage(message)
  newMessage.value = ''
  
  nextTick(() => {
    scrollToBottom()
  })
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}
</script>

<style scoped>
.messages-container {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 2rem;
  height: calc(100vh - 250px);
}

.conversations-sidebar {
  overflow-y: auto;
}

.conversations-sidebar h3 {
  margin: 0 0 1rem 0;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.conversation-item {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  border-radius: 5px;
  transition: background 0.3s;
  position: relative;
}

.conversation-item:hover {
  background: #f7fafc;
}

.conversation-item.active {
  background: #e9d8fd;
}

.avatar-small {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.conversation-info {
  flex: 1;
}

.conversation-info strong {
  display: block;
  margin-bottom: 0.25rem;
}

.conversation-info small {
  color: #718096;
}

.unread-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #667eea;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
}

.chat-area {
  display: flex;
  flex-direction: column;
}

.empty-chat,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #a0aec0;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 1rem;
}

.chat-header h3 {
  margin: 0;
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-bubble {
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 15px;
  background: #f7fafc;
}

.message-bubble.my-message {
  align-self: flex-end;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message-content {
  margin-bottom: 0.25rem;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
}

.message-input-form {
  display: flex;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #e2e8f0;
}

.message-input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 25px;
  outline: none;
}

.message-input:focus {
  border-color: #667eea;
}

@media (max-width: 768px) {
  .messages-container {
    grid-template-columns: 1fr;
  }
  
  .conversations-sidebar {
    max-height: 300px;
  }
}
</style>
