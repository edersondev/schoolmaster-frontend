import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'
import { adminSystemMessages } from './locales/admin-system'
import { administrationMessages } from './locales/administration'
import { administrationLifecycleMessages } from './locales/administration-lifecycle'
import { accountLifecycleMessages } from './locales/account-lifecycle'
import { authMessages } from './locales/auth'
import globalComponents from './plugins/global-components'
import './assets/styles/main.css'

const app = createApp(App)
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {
      adminSystem: adminSystemMessages,
      accountLifecycle: accountLifecycleMessages,
      administration: administrationMessages,
      administrationLifecycle: administrationLifecycleMessages,
      auth: authMessages,
    },
  },
})

app.use(createPinia())
app.use(i18n)
app.use(ElementPlus)
app.use(globalComponents)
app.use(router)

app.mount('#app')
