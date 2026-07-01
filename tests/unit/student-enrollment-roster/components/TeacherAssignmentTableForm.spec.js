import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { describe, expect, it } from 'vitest'
import TeacherAssignmentForm from '@/components/admin-system/teacher-assignments/TeacherAssignmentForm.vue'
import TeacherAssignmentTable from '@/components/admin-system/teacher-assignments/TeacherAssignmentTable.vue'
import { teacherAssignment } from '../fixtures/studentEnrollmentRoster.fixtures'

describe('TeacherAssignmentTableForm', () => {
  it('renders form and table contract', () => {
    expect(mount(TeacherAssignmentForm, { global: { plugins: [ElementPlus] }, props: { modelValue: {} } }).text()).toContain('Teacher user')
    expect(mount(TeacherAssignmentTable, { global: { plugins: [ElementPlus] }, props: { rows: [teacherAssignment] } }).props('rows')).toHaveLength(1)
  })
})
