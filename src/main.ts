import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@/assets/tailwind-init.css'
import '@flaticon/flaticon-uicons/css/all/all.css'
import VNetworkGraph from 'v-network-graph'
import 'v-network-graph/lib/style.css'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import menu from '@imengyu/vue3-context-menu'


import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(VNetworkGraph)
app.use(router)
app.use(menu)

app.mount('#app')
