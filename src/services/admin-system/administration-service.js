import axios from 'axios'
import { mapPaginatedEnvelope } from '@/contracts/admin-system/administration'
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
    }).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  )
}

function requestConfig(query, schoolId, signal, accessToken) {
  return {
    params: mapListParams(query),
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(schoolId ? { 'X-School-Id': schoolId } : {}),
    },
    ...(signal ? { signal } : {}),
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
        requestConfig(
          { ...query, ...fixedListQuery },
          options.schoolId,
          options.signal,
          getAccessToken(),
        ),
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
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          ...(options.schoolId ? { 'X-School-Id': options.schoolId } : {}),
        },
        ...(options.signal ? { signal: options.signal } : {}),
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
