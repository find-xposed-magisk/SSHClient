<template>
  <div class="terminal-container">
    <div ref="terminal" class="terminal"></div>
    <div class="quick-commands">
      <button 
        v-for="cmd in quickCommands" 
        :key="cmd.name"
        @click="sendCommand(cmd.command)"
      >
        {{ cmd.name }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { useSshStore } from '../stores/ssh'
import 'xterm/css/xterm.css'
import { config } from '../config/index'

const props = defineProps({
  connectionId: {
    type: String,
    required: true
  }
})

const terminal = ref(null)
const term = ref(null)
const sshStore = useSshStore()
const ws = ref(null)

onMounted(() => {
  initializeTerminal()
  connectWebSocket()
})

function initializeTerminal() {
  term.value = new Terminal({
    cursorBlink: true,
    theme: {
      background: '#1e1e1e'
    }
  })
  
  const fitAddon = new FitAddon()
  term.value.loadAddon(fitAddon)
  term.value.open(terminal.value)
  fitAddon.fit()
}

function connectWebSocket() {
  const workerUrl = config.workerUrl;
  ws.value = new WebSocket(workerUrl);
  
  ws.value.onopen = () => {
    // 发送连接信息
    ws.value.send(JSON.stringify({
      type: 'connect',
      host: sshStore.activeConnection.host,
      port: sshStore.activeConnection.port,
      username: sshStore.activeConnection.username,
      // 注意：密码等敏感信息需要加密处理
      password: sshStore.activeConnection.password
    }));
  };
  
  ws.value.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    switch(data.type) {
      case 'data':
        term.value.write(data.content);
        break;
      case 'error':
        console.error(data.message);
        // 显示错误提示
        break;
    }
  };
  
  ws.value.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  ws.value.onclose = () => {
    console.log('WebSocket connection closed');
    // 可以在这里实现重连逻辑
  };
}

function sendCommand(command) {
  ws.value?.send(JSON.stringify({
    type: 'command',
    data: command
  }))
}

onUnmounted(() => {
  ws.value?.close()
  term.value?.dispose()
})
</script>

<style scoped>
.terminal-container {
  height: 100%;
  padding: 1rem;
  background: #1e1e1e;
}

.quick-commands {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}

button {
  padding: 0.5rem 1rem;
  background: #2c2c2c;
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #3c3c3c;
}
</style> 