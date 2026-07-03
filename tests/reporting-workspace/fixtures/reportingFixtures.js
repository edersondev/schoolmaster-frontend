import { createI18n } from 'vue-i18n'
import { reportingMessages } from '@/i18n/modules/reporting'

export function createReportingI18n() {
  return createI18n({
    legacy: false,
    locale: 'en',
    messages: { en: { reporting: reportingMessages } },
  })
}

export const activeReportingSession = {
  status: 'authenticated',
  activeSchool: { id: 'school-1', timezone: 'America/Sao_Paulo' },
  permissions: [
    { code: 'reports.view', status: 'active' },
    { code: 'reports.lifecycle', status: 'active' },
    { code: 'reports.definitions', status: 'active' },
  ],
  hasPermission(code) {
    return this.permissions.some((permission) => permission.code === code && permission.status === 'active')
  },
}

export const catalogRecord = {
  domains: [{ id: 'attendance', label: 'Attendance' }],
  fields: [{ id: 'student_name' }],
  filters: [{ id: 'academic_period_id' }],
  operators: ['equals'],
  grouping: ['grade_level'],
  sorting: ['student_name'],
  output_formats: ['pdf', 'csv', 'xlsx'],
  complexity_limits: { fields: 25, filters: 10, grouping: 2, sorting: 3 },
  private_payload: 'hidden',
}

export const reportRunRecord = {
  id: 'run-1',
  school_id: 'school-1',
  report_type: 'attendance',
  report_source: 'built-in',
  generation_status: 'generated',
  output_formats: ['pdf', 'csv'],
  generated_at: '2026-07-03T12:00:00Z',
  output_expires_at: '2026-10-01T12:00:00Z',
  outputs: [
    { format: 'pdf', availability: 'available' },
    { format: 'csv', availability: 'expired' },
  ],
  storage_path: 'hidden',
}

export const pendingReportRunRecord = {
  ...reportRunRecord,
  id: 'run-2',
  generation_status: 'requested',
  outputs: [{ format: 'pdf', availability: 'pending' }],
}

export const definitionRecord = {
  id: 'definition-1',
  school_id: 'school-1',
  name: 'Attendance summary',
  domain: 'attendance',
  fields: ['student_name'],
  filters: [],
  grouping: [],
  sorting: [],
  output_formats: ['pdf'],
  lifecycle_state: 'active',
  hidden_field: 'hidden',
}

export function paginated(data) {
  return { data, meta: { page: 1, per_page: 25, total: data.length } }
}

export function errorResponse(status, code) {
  return {
    response: {
      status,
      data: { error: { code, message: 'unsafe private backend message' } },
      headers: { 'x-request-id': 'req-1' },
    },
  }
}
