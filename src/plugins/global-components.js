import AddressField from '@/components/ui/AddressField.vue'
import PhoneField from '@/components/ui/PhoneField.vue'

export function registerGlobalComponents(app) {
  app.component('AddressField', AddressField)
  app.component('PhoneField', PhoneField)
}

export default {
  install(app) {
    registerGlobalComponents(app)
  },
}
