import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { describe, expect, it } from 'vitest'
import RosterMembershipTable from '@/components/admin-system/class-sections/RosterMembershipTable.vue'
import { rosterMembership } from '../fixtures/studentEnrollmentRoster.fixtures'

describe('RosterMembershipTable', () => {
  it('renders active and empty states', () => {
    expect(mount(RosterMembershipTable, { global: { plugins: [ElementPlus] }, props: { rows: [rosterMembership] } }).props('rows')).toHaveLength(1)
    expect(mount(RosterMembershipTable, { global: { plugins: [ElementPlus] }, props: { rows: [] } }).props('rows')).toHaveLength(0)
  })
})
