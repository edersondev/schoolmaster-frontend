import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminFeedbackState from '@/components/ui/admin/AdminFeedbackState.vue'
import AdminFormPage from '@/components/ui/admin/AdminFormPage.vue'
import AdminListPage from '@/components/ui/admin/AdminListPage.vue'
import { administrationPlugins } from '../administration.fixtures'

describe('administration accessibility', () => {
  it('announces feedback and focuses validation summaries after submission failure', async () => {
    const feedback = mount(AdminFeedbackState, {
      props: { state: 'unavailable' },
      global: { plugins: administrationPlugins() },
    })
    expect(feedback.attributes('aria-live')).toBe('assertive')
    const form = mount(AdminFormPage, {
      attachTo: document.body,
      props: { title: 'Create' },
      global: { plugins: administrationPlugins() },
    })
    await form.setProps({ fieldErrors: { name: ['Required'] } })
    await nextTick()
    const summary = form.find('[role="alert"]')
    expect(summary.attributes('tabindex')).toBe('-1')
    expect(document.activeElement).toBe(summary.element)
    form.unmount()
  })

  it('renders the create destination as one keyboard target', () => {
    const list = mount(AdminListPage, {
      props: {
        title: 'Schools',
        canCreate: true,
        createTo: '/admin/schools/create',
      },
      global: {
        plugins: administrationPlugins(),
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a :href="to"><slot /></a>',
          },
        },
      },
    })

    expect(list.findAll('a')).toHaveLength(1)
    expect(list.find('a').text()).toBe('Create')
    expect(list.find('a button').exists()).toBe(false)
  })
})
