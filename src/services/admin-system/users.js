import {
  mapUser,
  mapUserCreateRequest,
  mapUserDeleteRequest,
  mapUserUpdateRequest,
} from '@/contracts/admin-system/users'
import { authService } from '@/services/auth/authService'
import { administrationHttpClient, createAdministrationService } from './administration-service'
import { normalizeAdministrationError } from './administration-error-mapper'

const USER_ENDPOINT = '/api/v1/users'

export function createUsersService(
  client = administrationHttpClient,
  getAccessToken = () => authService.getAccessToken(),
) {
  const service = createAdministrationService({
    client,
    endpoint: USER_ENDPOINT,
    listOperationId: 'listUsers',
    createOperationId: 'createUser',
    mapRecord: mapUser,
    mapCreateRequest: mapUserCreateRequest,
    getAccessToken,
  })

  function requestConfig(options = {}) {
    const accessToken = getAccessToken?.()
    return {
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(options.schoolId ? { 'X-School-Id': options.schoolId } : {}),
      },
      ...(options.signal ? { signal: options.signal } : {}),
    }
  }

  async function getUser(userId, options = {}) {
    try {
      const response = await client.get(`${USER_ENDPOINT}/${userId}`, requestConfig(options))
      const envelope = response.data ?? response
      return mapUser(envelope.data ?? envelope)
    } catch (error) {
      throw normalizeAdministrationError(error, { operationId: 'getUser' })
    }
  }

  async function updateUser(userId, form, options = {}) {
    try {
      const response = await client.patch(
        `${USER_ENDPOINT}/${userId}`,
        mapUserUpdateRequest(form),
        requestConfig(options),
      )
      const envelope = response.data ?? response
      return mapUser(envelope.data ?? envelope)
    } catch (error) {
      throw normalizeAdministrationError(error, { operationId: 'updateUser' })
    }
  }

  async function deleteUser(userId, form, options = {}) {
    try {
      const response = await client.delete(`${USER_ENDPOINT}/${userId}`, {
        ...requestConfig(options),
        data: mapUserDeleteRequest(form),
      })
      return response.data ?? response
    } catch (error) {
      throw normalizeAdministrationError(error, { operationId: 'deleteUser' })
    }
  }

  return { listUsers: service.list, createUser: service.create, getUser, updateUser, deleteUser }
}

export const { listUsers, createUser, getUser, updateUser, deleteUser } = createUsersService()
