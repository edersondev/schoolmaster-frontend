import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { describe, expect, it, vi } from 'vitest'
import StudentCreateGuardiansTab from '@/components/admin-system/students/StudentCreateGuardiansTab.vue'

describe('guardian entry limit component', () => {
  it('disables add control when maximum is reached', () => {
    const wrapper = mount(StudentCreateGuardiansTab, {
      global: {
        plugins: [
          createI18n({
            legacy: false,
            locale: 'en',
            messages: {
              en: {
                studentGuardianTabs: {
                  guardians: {
                    add: 'Add guardian',
                    maximumTwo: 'Maximum two guardians per student.',
                  },
                },
              },
            },
          }),
        ],
        stubs: {
          ElAlert: { props: ['title'], template: '<div>{{ title }}</div>' },
          ElButton: {
            props: ['disabled'],
            template: '<button :disabled="disabled"><slot /></button>',
          },
          GuardianEntryEditor: true,
        },
      },
      props: {
        entries: [{ entryId: '1' }, { entryId: '2' }],
        canManage: true,
        canAdd: false,
        maximumReached: true,
        lookup: vi.fn(),
      },
    })

    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('Maximum two guardians per student.')
  })
})
