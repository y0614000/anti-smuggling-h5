import { createApp } from 'vue'
import App from './App.vue'
import { lockWeChatTextScale } from './features/platform/lockWeChatTextScale'
import './styles/global.css'

lockWeChatTextScale()
createApp(App).mount('#app')
