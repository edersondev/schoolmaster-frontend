import { mapPermission } from '@/contracts/admin-system/access'
import { createAdministrationService } from './administration-service'

export function createPermissionsService(client) {
  const service = createAdministrationService({
    client,
    endpoint: '/api/v1/permissions',
    listOperationId: 'listPermissions',
    mapRecord: mapPermission,
  })
  return { listPermissions: service.list }
}

export const { listPermissions } = createPermissionsService()
