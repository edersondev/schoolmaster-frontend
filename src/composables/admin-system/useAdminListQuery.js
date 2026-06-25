import { computed, toValue } from 'vue'

const DEFAULT_PAGE_SIZE = 25
const PAGE_SIZES = new Set([10, 25, 50, 100])
const STATUSES = new Set(['active', 'inactive'])
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const ADMIN_QUERY_CONFIG = Object.freeze({
  schools: { status: true },
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

export function parseAdminListQuery(resource, query = {}) {
  const config = ADMIN_QUERY_CONFIG[resource] ?? {}
  const perPage = positiveInteger(query.per_page ?? query.perPage, DEFAULT_PAGE_SIZE)
  const parsed = {
    page: positiveInteger(query.page, 1),
    perPage: PAGE_SIZES.has(perPage) ? perPage : DEFAULT_PAGE_SIZE,
  }

  if (config.status && STATUSES.has(query.status)) parsed.status = query.status
  const sort = normalizeSort(query.sort, config.sorts)
  if (sort) parsed.sort = sort
  const academicYearId = query.academic_year_id ?? query.academicYearId
  if (config.academicYearId && UUID.test(String(academicYearId ?? ''))) {
    parsed.academicYearId = academicYearId
  }
  return parsed
}

export function serializeAdminListQuery(resource, query = {}) {
  const parsed = parseAdminListQuery(resource, {
    page: query.page,
    per_page: query.perPage,
    status: query.status,
    sort: query.sort,
    academic_year_id: query.academicYearId,
  })
  const serialized = { page: String(parsed.page), per_page: String(parsed.perPage) }
  if (parsed.status) serialized.status = parsed.status
  if (parsed.sort) serialized.sort = parsed.sort
  if (parsed.academicYearId) serialized.academic_year_id = parsed.academicYearId
  return serialized
}

export function updateAdminListQuery(resource, current, patch) {
  const resetsPage = Object.keys(patch).some((key) => key !== 'page')
  return parseAdminListQuery(resource, {
    ...serializeAdminListQuery(resource, current),
    ...patch,
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
