import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import SchoolBrandingFields from '@/modules/schools/components/SchoolBrandingFields.vue'
import { administrationPlugins } from '../admin-system/administration/administration.fixtures'

function createModel() {
  return {
    logo_path: null,
    logo_url: null,
    logo_file: null,
    primary_color: '#1D4ED8',
    secondary_color: '#F59E0B',
  }
}

describe('SchoolBrandingFields', () => {
  it('renders the existing logo URL as a thumbnail', () => {
    const model = createModel()
    model.logo_path = 'school-logos/school-id/logo.png'
    model.logo_url = 'http://localhost/storage/school-logos/school-id/logo.png'

    const wrapper = mount(SchoolBrandingFields, {
      props: { modelValue: model },
      global: { plugins: administrationPlugins() },
    })

    const image = wrapper.get('img[alt="School logo"]')

    expect(image.attributes('src')).toBe('http://localhost/storage/school-logos/school-id/logo.png')
    expect(wrapper.text()).not.toContain('school-logos/school-id/logo.png')
  })

  it('shows the empty logo state when no logo exists', () => {
    const wrapper = mount(SchoolBrandingFields, {
      props: { modelValue: createModel() },
      global: { plugins: administrationPlugins() },
    })

    expect(wrapper.find('img[alt="School logo"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('No logo selected')
  })

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
  })

  it('previews a selected logo file over the existing logo', async () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:logo-preview')
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const model = createModel()
    model.logo_path = 'school-logos/school-id/current.png'
    const logo = new File(['logo'], 'replacement.png', { type: 'image/png' })
    const uploadFile = { name: logo.name, raw: logo }
    const wrapper = mount(SchoolBrandingFields, {
      props: { modelValue: model },
      global: { plugins: administrationPlugins() },
    })
    const upload = wrapper.getComponent({ name: 'ElUpload' })

    upload.props('onChange')(uploadFile, [uploadFile])
    await wrapper.vm.$nextTick()

    expect(createObjectURL).toHaveBeenCalledWith(logo)
    expect(wrapper.get('img[alt="School logo"]').attributes('src')).toBe('blob:logo-preview')

    wrapper.unmount()

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:logo-preview')

    createObjectURL.mockRestore()
    revokeObjectURL.mockRestore()
  })
})
