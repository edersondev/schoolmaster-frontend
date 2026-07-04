import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CnpjField from '@/components/ui/CnpjField.vue'
import { administrationPlugins } from '../administration.fixtures'

describe('CnpjField', () => {
  it('shows the placeholder and emits unmasked digits from the mask event', async () => {
    const wrapper = mount(CnpjField, {
      props: { modelValue: '' },
      global: { plugins: administrationPlugins() },
    })

    const input = wrapper.get('input')
    expect(input.attributes('placeholder')).toBe('00.000.000/0000-00')

    await input.trigger('maska', {
      detail: {
        masked: '56.563.930/0001-08',
        unmasked: '56563930000108',
        completed: true,
      },
    })

    expect(wrapper.emitted('update:modelValue')).toEqual([['56563930000108']])
  })
})
