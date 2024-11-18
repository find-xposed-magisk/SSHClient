import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TerminalView from '../views/TerminalView.vue'
import FileManagerView from '../views/FileManagerView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/terminal/:id',
      name: 'terminal',
      component: TerminalView
    },
    {
      path: '/files/:id',
      name: 'files',
      component: FileManagerView
    }
  ]
})

export default router 