import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ElementPlus from 'element-plus'
import ClassSectionSummaryPanel from '@/components/admin-system/class-sections/ClassSectionSummaryPanel.vue'
import { classSection } from '../fixtures/studentEnrollmentRoster.fixtures'

describe('ClassSectionsRosterPages', () => {
  it('shows roster summary and dependency conflict feedback', () => {
    const wrapper = mount(ClassSectionSummaryPanel, { global: { plugins: [ElementPlus] }, props: { classSection, conflict: { code: 'dependency_conflict' } } })
    expect(wrapper.text()).toContain('Math 1')
    expect(wrapper.text()).toContain('dependency_conflict')
  })
})
