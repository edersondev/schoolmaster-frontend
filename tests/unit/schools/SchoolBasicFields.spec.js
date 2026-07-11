import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SchoolBasicFields from '@/modules/schools/components/SchoolBasicFields.vue'
import { administrationPlugins } from '../admin-system/administration/administration.fixtures'

function createModel() {
  return {
    inep_code: '',
    status: 1,
    name: '',
    document: '',
    email: '',
  }
}

describe('SchoolBasicFields', () => {
  it('stores only digits in the INEP code field', async () => {
    const model = createModel()
    const wrapper = mount(SchoolBasicFields, {
      props: { modelValue: model },
      global: { plugins: administrationPlugins() },
    })

    await wrapper.get('input[autocomplete="off"]').setValue('12A34-56789')

    expect(model.inep_code).toBe('12345678')
  })

  it('renders status as a switch after description', () => {
    const wrapper = mount(SchoolBasicFields, {
      props: { modelValue: createModel() },
      global: { plugins: administrationPlugins() },
    })

    const text = wrapper.text()
    const statusSwitch = wrapper.findComponent({ name: 'ElSwitch' })

    expect(text.indexOf('Description')).toBeLessThan(text.indexOf('Status'))
    expect(statusSwitch.exists()).toBe(true)
    expect(statusSwitch.props('activeValue')).toBe(1)
    expect(statusSwitch.props('inactiveValue')).toBe(0)
  })

  it('emits status-change without mutating the form status directly', async () => {
    const model = createModel()
    const wrapper = mount(SchoolBasicFields, {
      props: { modelValue: model },
      global: { plugins: administrationPlugins() },
    })

    wrapper.findComponent({ name: 'ElSwitch' }).vm.$emit('update:modelValue', 0)

    expect(wrapper.emitted('status-change')).toEqual([[0]])
    expect(model.status).toBe(1)
  })
})
