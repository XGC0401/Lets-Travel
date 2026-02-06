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
              <div v-if="message.message" class="message-content">
                {{ message.message }}
              </div>
              
              <!-- Attachment display -->
              <div v-if="message.attachment" class="message-attachment">
                <div v-if="message.attachmentType === 'image'" class="attachment-image">
                  <img :src="message.attachment" @click="openAttachment(message.attachment)" alt="Image" />
                </div>
                <div v-else class="attachment-file">
                  <span class="file-icon">{{ getFileIcon(message.attachmentType) }}</span>
                  <span class="file-name">{{ message.attachmentName }}</span>
                  <button @click="downloadAttachment(message.attachment, message.attachmentName)" class="btn-small btn-secondary">
                    Download
                  </button>
                </div>
              </div>
              
              <small class="message-time">{{ formatTime(message.timestamp) }}</small>
            </div>
          </div>
          
          <form @submit.prevent="sendMessage" class="message-input-form">
            <label for="file-upload" class="file-upload-btn">
              <input 
                type="file" 
                id="file-upload" 
                @change="handleFileUpload" 
                accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx"
                hidden
              >
              <span>+</span>
            </label>
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
  
  <ScrollToTop />
</template>

<script setup>
import ScrollToTop from '../../components/ScrollToTop.vue'
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
const pendingAttachment = ref(null)

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
  if (!newMessage.value.trim() && !pendingAttachment.value) return
  
  const message = {
    id: generateId('message'),
    bookingId: null,
    senderId: authStore.user.id,
    receiverId: selectedUserId.value,
    message: newMessage.value,
    timestamp: new Date().toISOString(),
    read: false
  }
  
  // Add attachment if present
  if (pendingAttachment.value) {
    message.attachment = pendingAttachment.value.data
    message.attachmentType = pendingAttachment.value.type
    message.attachmentName = pendingAttachment.value.name
  }
  
  dataStore.addMessage(message)
  newMessage.value = ''
  pendingAttachment.value = null
  
  nextTick(() => {
    scrollToBottom()
  })
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const fileType = getFileType(file.type, file.name)
    pendingAttachment.value = {
      data: e.target.result,
      type: fileType,
      name: file.name
    }
    
    // Auto-send if it's a file upload
    sendMessage()
  }
  reader.readAsDataURL(file)
  
  // Reset file input
  event.target.value = ''
}

function getFileType(mimeType, fileName) {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (fileName.endsWith('.pdf')) return 'pdf'
  if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) return 'document'
  if (fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) return 'presentation'
  return 'file'
}

function getFileIcon(fileType) {
  const icons = {
    image: '🖼️',
    video: '🎥',
    pdf: '📄',
    document: '📝',
    presentation: '📊',
    file: '📎'
  }
  return icons[fileType] || '📎'
}

function openAttachment(dataUrl) {
  window.open(dataUrl, '_blank')
}

function downloadAttachment(dataUrl, fileName) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = fileName
  link.click()
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
  max-height: 600px;
  min-height: 500px;
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
  word-wrap: break-word;
}

.message-attachment {
  margin: 0.5rem 0;
}

.attachment-image img {
  max-width: 300px;
  max-height: 300px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.attachment-image img:hover {
  transform: scale(1.02);
}

.attachment-file {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}

.file-icon {
  font-size: 1.5rem;
}

.file-name {
  flex: 1;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-small {
  padding: 0.25rem 0.75rem;
  font-size: 0.85rem;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
}

.message-input-form {
  display: flex;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 2px solid #e2e8f0;
  align-items: center;
}

.file-upload-btn {
  width: 40px;
  height: 40px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.5rem;
  font-weight: bold;
  transition: all 0.3s;
  flex-shrink: 0;
}

.file-upload-btn:hover {
  background: #764ba2;
  transform: scale(1.1);
}

.message-input {
  flex: 1;
  padding: 1rem 1.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 25px;
  outline: none;
  font-size: 1.25rem;
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
