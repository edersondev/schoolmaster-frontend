import { mapStudentProfileOption } from '@/contracts/admin-system/guardians'
import { createAdministrationService } from './administration-service'

export function createStudentProfilesService(client) {
  const service = createAdministrationService({
    client,
    endpoint: '/api/v1/student-profiles',
    listOperationId: 'listStudentProfiles',
    mapRecord: mapStudentProfileOption,
    fixedListQuery: { status: 'active' },
  })
  return { listStudentProfiles: service.list }
}

export const { listStudentProfiles } = createStudentProfilesService()
