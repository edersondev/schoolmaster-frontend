import { mapPermission } from '@/contracts/admin-system/access'
import { createAdministrationService } from './administration-service'

export function createPermissionsService(client) {
  const service = createAdministrationService({
    client,
    endpoint: '/api/v1/permissions',
    listOperationId: 'listPermissions',
    mapRecord: mapPermission,
  })

  function listPermissions(query = {}, options = {}) {
    return service.list(
      {
        page: query.page,
        perPage: query.perPage,
      },
      options,
    )
  }

  return { listPermissions }
}

export const { listPermissions } = createPermissionsService()
