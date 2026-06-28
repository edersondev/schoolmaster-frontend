export const lifecycleSchoolId = 'school-001'
export const lifecycleTenant = Object.freeze({ id: lifecycleSchoolId, name: 'North Campus' })

export const lifecyclePermissions = Object.freeze({
  schoolsManager: ['schools.view', 'schools.manage'],
  usersManager: ['users.view', 'users.manage', 'roles.view'],
  rolesManager: ['roles.view', 'roles.manage', 'permissions.view'],
  academicYearsManager: ['academic_years.view', 'academic_years.manage'],
  academicPeriodsManager: ['academic_periods.view', 'academic_periods.manage'],
  guardiansManager: ['guardians.view', 'guardians.manage'],
})

export const lifecycleRecords = Object.freeze({
  school: {
    id: 'school-001',
    name: 'North Campus',
    code: 'NORTH',
    status: 'active',
    contact_email: 'office@example.test',
    contact_phone: '5551002000',
  },
  user: {
    id: 'user-001',
    school_id: lifecycleSchoolId,
    full_name: 'Avery Admin',
    email: 'avery@example.test',
    status: 'active',
    roles: [{ id: 'role-001', name: 'Coordinator', status: 'active' }],
  },
  role: {
    id: 'role-001',
    school_id: lifecycleSchoolId,
    scope: 'school',
    name: 'Coordinator',
    status: 'active',
    permissions: [{ id: 'perm-001', code: 'users.view', scope: 'school', status: 'active' }],
  },
  academicYear: {
    id: 'year-001',
    school_id: lifecycleSchoolId,
    name: '2026',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    status: 'active',
  },
  academicPeriod: {
    id: 'period-001',
    school_id: lifecycleSchoolId,
    academic_year_id: 'year-001',
    name: 'Term 1',
    sequence: 1,
    start_date: '2026-01-01',
    end_date: '2026-06-30',
    status: 'active',
  },
  guardian: {
    id: 'guardian-001',
    school_id: lifecycleSchoolId,
    full_name: 'Jordan Guardian',
    relationship_type: 'parent',
    contact_email: 'jordan@example.test',
    contact_phone: '5553004000',
    status: 'active',
  },
})

export const lifecycleOutcome = Object.freeze({
  resource_type: 'users',
  resource_id: 'user-001',
  action: 'deactivate',
  status: 'inactive',
  lifecycle_history: [
    {
      action: 'deactivate',
      status: 'inactive',
      effective_at: '2026-06-28',
    },
  ],
})

export const bulkLifecycleOutcome = Object.freeze({
  resource_type: 'users',
  action: 'deactivate',
  status: 'inactive',
  affected_ids: ['user-001', 'user-002'],
})

export const lifecycleErrorEnvelopes = Object.freeze({
  validation: {
    error: {
      code: 'validation_failed',
      details: { errors: { reason: ['Reason is required.'] } },
    },
  },
  forbidden: { error: { code: 'forbidden' } },
  tenantMismatch: { error: { code: 'tenant_mismatch' } },
  conflict: { error: { code: 'conflict' } },
  notFound: { error: { code: 'not_found' } },
  unavailable: { error: { code: 'service_unavailable' } },
})
