import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ElementPlus from 'element-plus'
import TeacherAssignmentTable from '@/components/admin-system/teacher-assignments/TeacherAssignmentTable.vue'
import { teacherAssignment } from '../fixtures/studentEnrollmentRoster.fixtures'

describe('TeacherAssignmentFlow', () => {
  it('shows admin-visible assignment rows only', () => {
    const wrapper = mount(TeacherAssignmentTable, { global: { plugins: [ElementPlus] }, props: { rows: [teacherAssignment] } })
    expect(wrapper.props('rows')).toHaveLength(1)
    expect(wrapper.text()).not.toContain('Own assignments')
  })
})
