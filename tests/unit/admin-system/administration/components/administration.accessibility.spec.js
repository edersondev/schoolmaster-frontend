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

  it('offers an actionable sign-in recovery for expired administration sessions', () => {
    const feedback = mount(AdminFeedbackState, {
      props: { state: 'unauthorized' },
      global: {
        plugins: administrationPlugins(),
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a href="/auth/login"><slot /></a>',
          },
        },
      },
    })

    expect(feedback.text()).toContain('Your session expired')
    expect(feedback.get('a').text()).toBe('Sign in')
  })

  it('uses session recovery instead of a validation summary for form authorization failures', () => {
    const form = mount(AdminFormPage, {
      props: {
        title: 'Create user',
        formError: {
          type: 'unauthorized',
          messageKey: 'common.sessionExpired',
          recoveryAction: 'sign-in',
        },
      },
      global: {
        plugins: administrationPlugins(),
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a href="/auth/login"><slot /></a>',
          },
        },
      },
    })

    expect(form.find('[role="alert"][tabindex="-1"]').exists()).toBe(false)
    expect(form.text()).toContain('Your session expired')
    expect(form.get('a').text()).toBe('Sign in')
  })
})
