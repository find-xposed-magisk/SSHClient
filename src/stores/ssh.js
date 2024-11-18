import { defineStore } from 'pinia'

export const useSshStore = defineStore('ssh', {
  state: () => ({
    connections: [],
    activeConnection: null,
    quickCommands: [
      { name: '查看系统信息', command: 'uname -a' },
      { name: '查看磁盘空间', command: 'df -h' },
      { name: '查看内存使用', command: 'free -h' },
    ]
  }),
  
  actions: {
    addConnection(connection) {
      this.connections.push(connection)
    },
    removeConnection(id) {
      this.connections = this.connections.filter(conn => conn.id !== id)
    },
    setActiveConnection(connection) {
      this.activeConnection = connection
    }
  }
}) 