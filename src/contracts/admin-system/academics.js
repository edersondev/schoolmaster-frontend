import { mapCommonRecord } from './administration'

export function createAcademicYearForm() {
  return { name: '', startDate: '', endDate: '' }
}

export function createAcademicPeriodForm() {
  return { academicYearId: '', name: '', sequence: 1, startDate: '', endDate: '' }
}

export function mapAcademicYear(record) {
  return mapCommonRecord(record)
}

export function mapAcademicPeriod(record) {
  return { ...mapCommonRecord(record), sequence: Number(record.sequence) }
}

export function mapAcademicYearCreateRequest(form) {
  return { name: form.name, start_date: form.startDate, end_date: form.endDate }
}

export function mapAcademicPeriodCreateRequest(form) {
  return {
    academic_year_id: form.academicYearId,
    name: form.name,
    sequence: Number(form.sequence),
    start_date: form.startDate,
    end_date: form.endDate,
  }
}
