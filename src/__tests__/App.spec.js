import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('mounts the routed application shell', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: {
            template: '<section data-test="app-route-view" />',
          },
        },
      },
    })

    expect(wrapper.find('[data-test="app-route-view"]').exists()).toBe(true)
  })
})
