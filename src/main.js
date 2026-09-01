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
import { studentEnrollmentRosterMessages } from './locales/student-enrollment-roster'
import { studentGuardianTabsMessages } from './locales/student-guardian-tabs'
import { guardianSelfServiceMessages } from './i18n/modules/guardianSelfService'
import { reportingMessages } from './i18n/modules/reporting'
import { platformSupportMessages } from './i18n/modules/platform-support'
import { advancedAssessmentMessages } from './i18n/modules/advanced-assessment'
import { studentSelfServiceMessages } from './i18n/modules/studentSelfService'
import { teacherWorkflowMessages } from './i18n/modules/teacherWorkflow'
import globalComponents from './plugins/global-components'
import { administrationHttpClient } from './services/admin-system/administration-service'
import { installSchoolContextInvalidationObserver } from './services/api/schoolContextInvalidation'
import { useAuthSessionStore } from './stores/auth/sessionStore'
import './assets/styles/main.css'

const app = createApp(App)
const pinia = createPinia()
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {
      adminSystem: {
        ...adminSystemMessages,
        studentEnrollmentRoster: studentEnrollmentRosterMessages,
      },
      accountLifecycle: accountLifecycleMessages,
      administration: administrationMessages,
      administrationLifecycle: administrationLifecycleMessages,
      auth: authMessages,
      guardianSelfService: guardianSelfServiceMessages,
      advancedAssessment: advancedAssessmentMessages,
      platformSupport: platformSupportMessages,
      reporting: reportingMessages,
      studentEnrollmentRoster: studentEnrollmentRosterMessages,
      studentGuardianTabs: studentGuardianTabsMessages,
      studentSelfService: studentSelfServiceMessages,
      teacherWorkflow: teacherWorkflowMessages,
    },
  },
})

app.use(pinia)
app.use(i18n)
app.use(ElementPlus)
app.use(globalComponents)
app.use(router)

installSchoolContextInvalidationObserver({
  client: administrationHttpClient,
  store: useAuthSessionStore(pinia),
  router,
})

app.mount('#app')
