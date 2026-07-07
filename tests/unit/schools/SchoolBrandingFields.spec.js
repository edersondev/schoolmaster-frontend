import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SchoolBrandingFields from '@/modules/schools/components/SchoolBrandingFields.vue'
import { administrationPlugins } from '../admin-system/administration/administration.fixtures'

function createModel() {
  return {
    logo_path: null,
    logo_file: null,
    primary_color: '#1D4ED8',
    secondary_color: '#F59E0B',
  }
}

describe('SchoolBrandingFields', () => {
  it('stores selected logo as the original File object', async () => {
    const model = createModel()
    const logo = new File(['logo'], 'logo.png', { type: 'image/png' })
    const uploadFile = { name: logo.name, raw: logo }
    const wrapper = mount(SchoolBrandingFields, {
      props: { modelValue: model },
      global: { plugins: administrationPlugins() },
    })
    const upload = wrapper.getComponent({ name: 'ElUpload' })

    expect(upload.props('autoUpload')).toBe(false)
    expect(upload.props('limit')).toBe(1)

    upload.props('onChange')(uploadFile, [uploadFile])
    await wrapper.vm.$nextTick()

    expect(model.logo_file).toBe(logo)
    expect(wrapper.text()).toContain('logo.png')
  })
})
