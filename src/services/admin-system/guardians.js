import { mapGuardian, mapGuardianCreateRequest } from '@/contracts/admin-system/guardians'
import { createAdministrationService } from './administration-service'

export function createGuardiansService(client) {
  const service = createAdministrationService({
    client,
    endpoint: '/api/v1/guardians',
    listOperationId: 'listGuardians',
    createOperationId: 'createGuardian',
    mapRecord: mapGuardian,
    mapCreateRequest: mapGuardianCreateRequest,
  })
  return { listGuardians: service.list, createGuardian: service.create }
}

export const { listGuardians, createGuardian } = createGuardiansService()
