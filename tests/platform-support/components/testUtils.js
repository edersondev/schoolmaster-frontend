import { createI18n } from 'vue-i18n'

export const globalStubs = {
  ElAlert: { template: '<div><slot />{{ title }}</div>', props: ['title'] },
  ElButton: { template: '<button @click="$emit(`click`)"><slot /></button>' },
  ElTag: { template: '<span><slot /></span>' },
  ElForm: { template: '<form @submit.prevent="$emit(`submit`)"><slot /></form>' },
  ElFormItem: { template: '<label><slot /></label>' },
  ElInput: {
    template: '<input :value="modelValue" @input="$emit(`update:modelValue`, $event.target.value)" />',
    props: ['modelValue'],
  },
  RouterLink: { template: '<a><slot /></a>' },
}

export const i18nMock = {
  $t: (key, fallback) => fallback ?? key,
}

export function globalMountOptions() {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: { en: {} },
    missing: (_locale, key) => key,
  })

  return {
    global: {
      plugins: [i18n],
      stubs: globalStubs,
      mocks: i18nMock,
    },
  }
}
