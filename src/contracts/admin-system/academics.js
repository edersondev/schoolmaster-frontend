import { isDateRangeOrdered, isPresent, mapCommonRecord } from './administration'

export function createAcademicYearForm() {
  return { name: '', startDate: '', endDate: '' }
}

export function createAcademicPeriodForm() {
  return { academicYearId: '', name: '', sequence: 1, startDate: '', endDate: '' }
}

export function validateAcademicYearForm(form = {}) {
  const errors = {}

  if (!isPresent(form.name)) {
    errors.name = ['Academic year name is required.']
  }

  if (!isPresent(form.startDate)) {
    errors.start_date = ['Start date is required.']
  }

  if (!isPresent(form.endDate)) {
    errors.end_date = ['End date is required.']
  } else if (!isDateRangeOrdered(form.startDate, form.endDate)) {
    errors.end_date = ['End date cannot be earlier than start date.']
  }

  return errors
}

export function validateAcademicPeriodForm(form = {}) {
  const errors = {}

  if (!isPresent(form.academicYearId)) {
    errors.academic_year_id = ['Academic year is required.']
  }

  if (!isPresent(form.name)) {
    errors.name = ['Academic period name is required.']
  }

  if (!Number.isInteger(Number(form.sequence)) || Number(form.sequence) < 1) {
    errors.sequence = ['Sequence must be a whole number greater than zero.']
  }

  if (!isPresent(form.startDate)) {
    errors.start_date = ['Start date is required.']
  }

  if (!isPresent(form.endDate)) {
    errors.end_date = ['End date is required.']
  } else if (!isDateRangeOrdered(form.startDate, form.endDate)) {
    errors.end_date = ['End date cannot be earlier than start date.']
  }

  return errors
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
