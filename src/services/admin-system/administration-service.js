import axios from 'axios'
import { mapPaginatedEnvelope } from '@/contracts/admin-system/administration'
import {
  mapBulkLifecycleRequest,
  mapLifecycleActionRequest,
  mapLifecycleOutcome,
} from '@/contracts/admin-system/lifecycle'
import { authService } from '@/services/auth/authService'
import { normalizeAdministrationError } from './administration-error-mapper'

export const administrationHttpClient = axios.create({
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  withCredentials: true,
})

export function mapListParams(query = {}) {
  return Object.fromEntries(
    Object.entries({
      page: query.page,
      per_page: query.perPage,
      status: query.status,
      sort: query.sort,
      academic_year_id: query.academicYearId,
      search: query.search,
      inep_code: query.inepCode,
      document: query.document,
      name: query.name,
      email: query.email,
      city: query.city,
      state: query.state,
      administrative_type_id: query.administrativeTypeId,
      legal_nature_id: query.legalNatureId,
      management_type_id: query.managementTypeId,
      pedagogical_approach_id: query.pedagogicalApproachId,
    }).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  )
}

export function createAdministrationRequestConfig({
  query = {},
  schoolId = null,
  signal = null,
  accessToken = null,
  data,
} = {}) {
  return {
    params: mapListParams(query),
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(schoolId ? { 'X-School-Id': schoolId } : {}),
    },
    ...(signal ? { signal } : {}),
    ...(data !== undefined ? { data } : {}),
  }
}

export function createAdministrationService({
  client = administrationHttpClient,
  endpoint,
  listOperationId,
  createOperationId,
  mapRecord,
  mapCreateRequest,
  fixedListQuery = {},
  getAccessToken = () => authService.getAccessToken(),
}) {
  async function list(query = {}, options = {}) {
    try {
      const response = await client.get(
        endpoint,
        createAdministrationRequestConfig({
          query: { ...query, ...fixedListQuery },
          schoolId: options.schoolId,
          signal: options.signal,
          accessToken: getAccessToken(),
        }),
      )
      const envelope = response.data ?? response
      const mapped = mapPaginatedEnvelope(envelope)
      return { ...mapped, items: mapped.items.map(mapRecord) }
    } catch (error) {
      throw normalizeAdministrationError(error, { operationId: listOperationId })
    }
  }

  async function create(form, options = {}) {
    if (!createOperationId) throw new Error(`Create unsupported for ${endpoint}`)
    try {
      const accessToken = getAccessToken()
      const config = {
        ...createAdministrationRequestConfig({
          schoolId: options.schoolId,
          signal: options.signal,
          accessToken,
        }),
      }
      const response = await client.post(endpoint, mapCreateRequest(form), config)
      const envelope = response.data ?? response
      return mapRecord(envelope.data ?? envelope)
    } catch (error) {
      throw normalizeAdministrationError(error, { operationId: createOperationId })
    }
  }

  return { list, create }
}

export function createAdministrationResourceOperations({
  client = administrationHttpClient,
  endpoint,
  mapRecord,
  mapUpdateRequest,
  operations,
  getAccessToken = () => authService.getAccessToken(),
}) {
  function config(options = {}, data) {
    return createAdministrationRequestConfig({
      schoolId: options.schoolId,
      signal: options.signal,
      accessToken: getAccessToken?.(),
      data,
    })
  }

  async function getOne(id, options = {}) {
    try {
      const response = await client.get(`${endpoint}/${id}`, config(options))
      const envelope = response.data ?? response
      return mapRecord(envelope.data ?? envelope)
    } catch (error) {
      throw normalizeAdministrationError(error, { operationId: operations.detail })
    }
  }

  async function updateOne(id, form, options = {}) {
    try {
      const response = await client.patch(
        `${endpoint}/${id}`,
        mapUpdateRequest(form),
        config(options),
      )
      const envelope = response.data ?? response
      return mapRecord(envelope.data ?? envelope)
    } catch (error) {
      throw normalizeAdministrationError(error, { operationId: operations.update })
    }
  }

  async function lifecycle(id, action, form, options = {}) {
    try {
      const path = action === 'delete' ? `${endpoint}/${id}` : `${endpoint}/${id}/${action}`
      const payload = mapLifecycleActionRequest(form)
      const response =
        action === 'delete'
          ? await client.delete(path, config(options, payload))
          : await client.post(path, payload, config(options))
      return mapLifecycleOutcome(response.data ?? response)
    } catch (error) {
      throw normalizeAdministrationError(error, { operationId: operations[action] })
    }
  }

  async function bulkLifecycle(input, options = {}) {
    if (!operations.bulk) {
      throw new Error(`Bulk lifecycle unsupported for ${endpoint}`)
    }
    try {
      const response = await client.post(
        `${endpoint}/bulk-lifecycle`,
        mapBulkLifecycleRequest(input),
        config(options),
      )
      return mapLifecycleOutcome(response.data ?? response)
    } catch (error) {
      throw normalizeAdministrationError(error, { operationId: operations.bulk })
    }
  }

  return {
    getOne,
    updateOne,
    activate: (id, form, options) => lifecycle(id, 'activate', form, options),
    deactivate: (id, form, options) => lifecycle(id, 'deactivate', form, options),
    deleteOne: (id, form, options) => lifecycle(id, 'delete', form, options),
    restore: (id, form, options) => lifecycle(id, 'restore', form, options),
    bulkLifecycle,
  }
}
