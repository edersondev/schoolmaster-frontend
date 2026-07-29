import { createPinia, setActivePinia } from 'pinia'

export const activeSchool = Object.freeze({
  id: 'school-1',
  name: 'Northfield Academy',
  status: 'active',
})

export const secondActiveSchool = Object.freeze({
  id: 'school-2',
  name: 'Southfield Academy',
  status: 'active',
})

export const systemAdministratorRole = Object.freeze({
  id: 'role-system-administrator',
  name: 'System Administrator',
  scope: 'platform',
  status: 'active',
  permissions: [],
})

export const limitedRole = Object.freeze({
  id: 'role-limited',
  name: 'School Viewer',
  scope: 'school',
  schoolId: activeSchool.id,
  status: 'active',
  permissions: [],
})

export function createResolvedSystemAdministrator(overrides = {}) {
  return {
    status: 'authenticated',
    hasBootstrapped: true,
    isAuthenticated: true,
    currentUser: { id: 'user-system-administrator', status: 'active' },
    roles: [systemAdministratorRole],
    permissions: [],
    activeSchool,
    activeStudentProfile: null,
    currentAcademicPeriod: null,
    ...overrides,
  }
}

export function createLimitedSession(overrides = {}) {
  return {
    status: 'authenticated',
    hasBootstrapped: true,
    isAuthenticated: true,
    currentUser: { id: 'user-limited', status: 'active' },
    roles: [limitedRole],
    permissions: [],
    activeSchool,
    ...overrides,
  }
}

export function backendSessionForSchool(school = activeSchool) {
  return {
    token: 'session-token',
    token_expires_at: '2026-07-15T12:00:00Z',
    user: {
      id: 'user-system-administrator',
      full_name: 'System Administrator',
      status: 'active',
      roles: [systemAdministratorRole],
    },
    roles: [systemAdministratorRole],
    permissions: [],
    resolved_school: school,
  }
}

export function createSystemAdminPinia() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}
