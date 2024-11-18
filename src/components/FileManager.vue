<template>
  <div class="file-manager">
    <div class="toolbar">
      <button @click="uploadFile">上传文件</button>
      <button @click="createFolder">新建文件夹</button>
      <button @click="refresh">刷新</button>
    </div>
    
    <div class="file-list">
      <div 
        v-for="file in files" 
        :key="file.path"
        class="file-item"
        @click="handleFileClick(file)"
      >
        <i :class="getFileIcon(file)"></i>
        <span>{{ file.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const files = ref([])

onMounted(() => {
  loadFiles()
})

function loadFiles() {
  // 通过 WebSocket 请求文件列表
}

function uploadFile() {
  // 实现文件上传逻辑
}

function createFolder() {
  // 实现创建文件夹逻辑
}

function handleFileClick(file) {
  if (file.type === 'directory') {
    // 进入目录
  } else {
    // 下载或预览文件
  }
}

function getFileIcon(file) {
  return file.type === 'directory' ? 'folder-icon' : 'file-icon'
}
</script>

<style scoped>
.file-manager {
  height: 100%;
  padding: 1rem;
}

.toolbar {
  margin-bottom: 1rem;
  display: flex;
  gap: 0.5rem;
}

.file-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.file-item {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.file-item:hover {
  background: #f5f5f5;
}
</style> 