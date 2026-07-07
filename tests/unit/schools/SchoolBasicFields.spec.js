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
})
