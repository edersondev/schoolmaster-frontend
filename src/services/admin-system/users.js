import { mapUser, mapUserCreateRequest } from '@/contracts/admin-system/users'
import { createAdministrationService } from './administration-service'

export function createUsersService(client) {
  const service = createAdministrationService({
    client,
    endpoint: '/api/v1/users',
    listOperationId: 'listUsers',
    createOperationId: 'createUser',
    mapRecord: mapUser,
    mapCreateRequest: mapUserCreateRequest,
  })
  return { listUsers: service.list, createUser: service.create }
}

export const { listUsers, createUser } = createUsersService()
