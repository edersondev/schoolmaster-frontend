import { computed, toValue } from 'vue'

const DEFAULT_PAGE_SIZE = 25
const PAGE_SIZES = new Set([10, 25, 50, 100])
const STATUSES = new Set(['active', 'inactive'])
const SCHOOL_STATUSES = new Set(['1', '0'])
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const SCHOOL_LIST_FILTER_KEYS = Object.freeze([
  'status',
  'inepCode',
  'document',
  'name',
  'email',
  'city',
  'state',
  'administrativeTypeId',
  'legalNatureId',
  'managementTypeId',
  'pedagogicalApproachId',
])

const SCHOOL_TEXT_FILTERS = Object.freeze([
  'inepCode',
  'document',
  'name',
  'email',
  'city',
  'state',
])
const SCHOOL_LOOKUP_FILTERS = Object.freeze([
  'administrativeTypeId',
  'legalNatureId',
  'managementTypeId',
  'pedagogicalApproachId',
])
const QUERY_PARAMS = Object.freeze({
  perPage: 'per_page',
  academicYearId: 'academic_year_id',
  inepCode: 'inep_code',
  administrativeTypeId: 'administrative_type_id',
  legalNatureId: 'legal_nature_id',
  managementTypeId: 'management_type_id',
  pedagogicalApproachId: 'pedagogical_approach_id',
})

export const ADMIN_QUERY_CONFIG = Object.freeze({
  schools: {
    status: true,
    statusValues: SCHOOL_STATUSES,
    schoolFilters: true,
    sorts: ['name', 'email', 'status'],
  },
  users: { status: true, sorts: ['full_name', 'email', 'status'] },
  roles: { status: true },
  permissions: {},
  'academic-years': { status: true },
  'academic-periods': { status: true, academicYearId: true },
  guardians: { status: true },
})

function positiveInteger(value, fallback) {
  const number = Number.parseInt(value, 10)
  return Number.isInteger(number) && number > 0 ? number : fallback
}

function normalizeSort(value, allowed = []) {
  if (typeof value !== 'string') return undefined
  const field = value.startsWith('-') ? value.slice(1) : value
  return allowed.includes(field) ? value : undefined
}

function queryValue(query, key) {
  const param = QUERY_PARAMS[key] ?? key
  const value = query[param] ?? query[key]
  return Array.isArray(value) ? undefined : value
}

function nonEmptyString(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return undefined
  const normalized = String(value).trim()
  return normalized ? normalized : undefined
}

function positiveIntegerString(value) {
  const normalized = nonEmptyString(value)
  if (!normalized || !/^\d+$/.test(normalized)) return undefined
  return Number.parseInt(normalized, 10) > 0 ? normalized : undefined
}

export function parseAdminListQuery(resource, query = {}) {
  const config = ADMIN_QUERY_CONFIG[resource] ?? {}
  const perPage = positiveInteger(queryValue(query, 'perPage'), DEFAULT_PAGE_SIZE)
  const parsed = {
    page: positiveInteger(query.page, 1),
    perPage: PAGE_SIZES.has(perPage) ? perPage : DEFAULT_PAGE_SIZE,
  }

  const status = nonEmptyString(queryValue(query, 'status'))
  const statusValues = config.statusValues ?? STATUSES
  if (config.status && statusValues.has(status)) parsed.status = status
  const sort = normalizeSort(query.sort, config.sorts)
  if (sort) parsed.sort = sort
  const academicYearId = queryValue(query, 'academicYearId')
  if (config.academicYearId && UUID.test(String(academicYearId ?? ''))) {
    parsed.academicYearId = academicYearId
  }
  if (config.schoolFilters) {
    for (const key of SCHOOL_TEXT_FILTERS) {
      const value = nonEmptyString(queryValue(query, key))
      if (value) parsed[key] = value
    }
    for (const key of SCHOOL_LOOKUP_FILTERS) {
      const value = positiveIntegerString(queryValue(query, key))
      if (value) parsed[key] = value
    }
  }
  return parsed
}

export function serializeAdminListQuery(resource, query = {}) {
  const parsed = parseAdminListQuery(resource, query)
  const serialized = { page: String(parsed.page), per_page: String(parsed.perPage) }
  if (parsed.status) serialized.status = parsed.status
  if (parsed.sort) serialized.sort = parsed.sort
  if (parsed.academicYearId) serialized.academic_year_id = parsed.academicYearId
  if (ADMIN_QUERY_CONFIG[resource]?.schoolFilters) {
    for (const key of SCHOOL_TEXT_FILTERS) {
      if (parsed[key]) serialized[QUERY_PARAMS[key] ?? key] = parsed[key]
    }
    for (const key of SCHOOL_LOOKUP_FILTERS) {
      if (parsed[key]) serialized[QUERY_PARAMS[key]] = parsed[key]
    }
  }
  return serialized
}

function serializePatchQuery(patch = {}) {
  return Object.fromEntries(
    Object.entries(patch).map(([key, value]) => [QUERY_PARAMS[key] ?? key, value]),
  )
}

export function updateAdminListQuery(resource, current, patch) {
  const resetsPage = Object.keys(patch).some((key) => key !== 'page')
  return parseAdminListQuery(resource, {
    ...serializeAdminListQuery(resource, current),
    ...serializePatchQuery(patch),
    page: resetsPage ? 1 : (patch.page ?? current.page),
    per_page: patch.perPage ?? current.perPage,
    academic_year_id: patch.academicYearId ?? current.academicYearId,
  })
}

export function useAdminListQuery({ resource, route, router }) {
  const query = computed(() => parseAdminListQuery(resource, toValue(route).query))

  async function update(patch) {
    const next = updateAdminListQuery(resource, query.value, patch)
    await router.replace({ query: serializeAdminListQuery(resource, next) })
  }

  return { query, update }
}
