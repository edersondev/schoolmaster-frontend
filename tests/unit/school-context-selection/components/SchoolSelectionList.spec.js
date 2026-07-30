import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SchoolSelectionList from '@/components/auth/SchoolSelectionList.vue'
import { authGlobalPlugins } from '@/../tests/unit/auth/auth.fixtures'
import { duplicateNameSchools, inactiveSchool } from '../fixtures/schoolContextSelection.fixtures'

describe('SchoolSelectionList', () => {
  it('distinguishes duplicate names without rendering CNPJ and emits only explicit active choice', async () => {
    const schools = [
      ...duplicateNameSchools.map((school) => ({
        ...school,
        status: 'active',
        inepCode: school.inep_code,
        city: school.address.city,
        state: school.address.state,
      })),
      { ...inactiveSchool, status: 'inactive' },
    ]
    const wrapper = mount(SchoolSelectionList, {
      attachTo: document.body,
      props: { schools },
      global: { plugins: authGlobalPlugins() },
    })

    const choices = wrapper.findAll('button')
    expect(choices).toHaveLength(2)
    expect(wrapper.text()).toContain('11111111')
    expect(wrapper.text()).toContain('22222222')
    expect(wrapper.text()).not.toContain('56563930000108')
    expect(choices[0].attributes('aria-label')).toContain('Central School')
    expect(wrapper.emitted('select')).toBeUndefined()
    await wrapper.vm.$nextTick()
    expect(document.activeElement).toBe(choices[0].element)

    await choices[1].trigger('click')
    expect(wrapper.emitted('select')).toEqual([[schools[1]]])
    wrapper.unmount()
  })
})
