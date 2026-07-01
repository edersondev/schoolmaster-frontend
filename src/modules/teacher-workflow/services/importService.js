import { teacherWorkflowHttp, unwrapData } from './teacherWorkflowHttp'
import { TEACHER_WORKFLOW_OPERATIONS } from './teacherWorkflowContract'

export const IMPORT_ROW_LIMIT = 500

export function validateImportRows(rows) {
  if (!Array.isArray(rows)) return { rows: ['Rows must be a JSON array.'] }
  if (rows.length < 1) return { rows: ['At least one row is required.'] }
  if (rows.length > IMPORT_ROW_LIMIT) return { rows: [`Use ${IMPORT_ROW_LIMIT} rows or fewer.`] }
  return {}
}

export function mapImportRequest(rows = []) {
  return { rows }
}

export function mapImportRun(record = {}) {
  return {
    id: record.id ?? record.import_run_id ?? '',
    status: record.status ?? (record.rejected_count > 0 ? 'rejected' : 'accepted'),
    acceptedRowCount: record.accepted_count ?? record.accepted_row_count ?? 0,
    rejectedRowCount: record.rejected_count ?? record.rejected_row_count ?? 0,
    errorSummary: record.error_summary ?? record.errors ?? [],
  }
}

export function createImportService(http = teacherWorkflowHttp) {
  return {
    importGrades: (rows, options = {}) =>
      http.post('/api/v1/grades/imports', mapImportRequest(rows), {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.importGrades,
        map: (response) => mapImportRun(unwrapData(response)),
      }),
    importAttendance: (rows, options = {}) =>
      http.post('/api/v1/attendance/imports', mapImportRequest(rows), {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.importAttendance,
        map: (response) => mapImportRun(unwrapData(response)),
      }),
  }
}

export const importService = createImportService()
