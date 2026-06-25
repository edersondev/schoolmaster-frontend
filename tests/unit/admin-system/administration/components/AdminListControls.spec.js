import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminFilterBar from '@/components/ui/admin/AdminFilterBar.vue'
import AdminPagination from '@/components/ui/admin/AdminPagination.vue'
import { administrationPlugins } from '../administration.fixtures'

describe('admin list controls', () => {
  it('emits approved filter/reset and pagination intent', async () => {
    const filters = mount(AdminFilterBar, {
      props: { status: '', showStatus: true },
      global: { plugins: administrationPlugins() },
    })
    filters.vm.$emit('update:status', 'active')
    filters.vm.$emit('reset')
    expect(filters.emitted('update:status')[0]).toEqual(['active'])
    expect(filters.emitted('reset')).toHaveLength(1)

    const pagination = mount(AdminPagination, {
      props: { page: 1, perPage: 25, total: 50 },
      global: { plugins: administrationPlugins() },
    })
    pagination.vm.$emit('update:page', 2)
    expect(pagination.emitted('update:page')[0]).toEqual([2])
  })
})
