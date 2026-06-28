import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PhoneField from '@/components/ui/PhoneField.vue'
import { administrationPlugins } from '../administration.fixtures'

describe('PhoneField', () => {
  it('shows the placeholder and emits unmasked digits from the mask event', async () => {
    const wrapper = mount(PhoneField, {
      props: { modelValue: '' },
      global: { plugins: administrationPlugins() },
    })

    const input = wrapper.get('input')
    expect(input.attributes('placeholder')).toBe('(00) 00000-0000')

    await input.trigger('maska', {
      detail: {
        masked: '(11) 98765-4321',
        unmasked: '11987654321',
        completed: true,
      },
    })

    expect(wrapper.emitted('update:modelValue')).toEqual([['11987654321']])
  })
})
