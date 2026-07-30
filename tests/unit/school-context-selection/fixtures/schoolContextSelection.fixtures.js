export function schoolFixture(overrides = {}) {
  return {
    id: 'school-001',
    name: 'Central School',
    inep_code: '12345678',
    cnpj: '56563930000108',
    status: 1,
    address: { city: 'Recife', state: 'PE' },
    ...overrides,
  }
}

export const activeSchool = Object.freeze(schoolFixture())
export const inactiveSchool = Object.freeze(schoolFixture({ id: 'school-002', status: 0 }))
export const duplicateNameSchools = Object.freeze([
  schoolFixture({ id: 'school-003', inep_code: '11111111' }),
  schoolFixture({
    id: 'school-004',
    inep_code: '22222222',
    address: { city: 'Olinda', state: 'PE' },
  }),
])
export const oneHundredActiveSchools = Object.freeze(
  Array.from({ length: 100 }, (_, index) =>
    schoolFixture({
      id: `school-${String(index + 1).padStart(3, '0')}`,
      name: `School ${String(index + 1).padStart(3, '0')}`,
      inep_code: String(10000000 + index),
    }),
  ),
)
export const numericStatusSchools = Object.freeze([activeSchool, inactiveSchool])
export const staleGenerations = Object.freeze({ current: 2, stale: 1 })

export function paginatedSchools(items = [activeSchool], overrides = {}) {
  return {
    items,
    meta: { page: 1, perPage: 25, total: items.length, ...overrides },
  }
}
