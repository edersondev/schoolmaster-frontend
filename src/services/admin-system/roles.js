import { mapRole, mapRoleCreateRequest } from '@/contracts/admin-system/access'
import { createAdministrationService } from './administration-service'

export function createRolesService(client) {
  const service = createAdministrationService({
    client,
    endpoint: '/api/v1/roles',
    listOperationId: 'listRoles',
    createOperationId: 'createRole',
    mapRecord: mapRole,
    mapCreateRequest: mapRoleCreateRequest,
  })
  return { listRoles: service.list, createRole: service.create }
}

export const { listRoles, createRole } = createRolesService()
