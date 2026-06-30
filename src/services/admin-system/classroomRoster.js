import { mapPaginatedEnvelope } from '@/contracts/admin-system/administration'
import {
  mapClassSection,
  mapClassSectionCreateRequest,
  mapClassSectionStatusRequest,
  mapClassSectionUpdateRequest,
  mapRosterBatchAddRequest,
  mapRosterBatchEndRequest,
  mapRosterBatchResult,
  mapRosterMembership,
} from '@/contracts/admin-system/classroom-roster'
import { authService } from '@/services/auth/authService'
import { administrationHttpClient } from './administration-service'
import { normalizeStudentEnrollmentRosterError } from './studentEnrollmentRosterErrorMapper'

const ENDPOINT = '/api/v1/class-sections'

export function createClassroomRosterService(
  client = administrationHttpClient,
  getAccessToken = () => authService.getAccessToken(),
) {
  const config = (options = {}, params = {}) => ({
    params: cleanParams(params),
    headers: {
      ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}),
      ...(options.schoolId ? { 'X-School-Id': options.schoolId } : {}),
    },
    ...(options.signal ? { signal: options.signal } : {}),
  })

  async function listClassSections(query = {}, options = {}) {
    try {
      const response = await client.get(ENDPOINT, config(options, classSectionParams(query)))
      const mapped = mapPaginatedEnvelope(response.data ?? response)
      return { ...mapped, items: mapped.items.map(mapClassSection) }
    } catch (error) {
      throw normalizeStudentEnrollmentRosterError(error, { operationId: 'listClassSections' })
    }
  }

  async function createClassSection(form, options = {}) {
    try {
      const response = await client.post(ENDPOINT, mapClassSectionCreateRequest(form), config(options))
      return mapClassSection((response.data ?? response).data ?? response.data ?? response)
    } catch (error) {
      throw normalizeStudentEnrollmentRosterError(error, { operationId: 'createClassSection' })
    }
  }

  async function getClassSection(id, options = {}) {
    try {
      const response = await client.get(`${ENDPOINT}/${id}`, config(options))
      return mapClassSection((response.data ?? response).data ?? response.data ?? response)
    } catch (error) {
      throw normalizeStudentEnrollmentRosterError(error, { operationId: 'getClassSection' })
    }
  }

  async function updateClassSection(id, form, options = {}) {
    try {
      const response = await client.patch(`${ENDPOINT}/${id}`, mapClassSectionUpdateRequest(form), config(options))
      return mapClassSection((response.data ?? response).data ?? response.data ?? response)
    } catch (error) {
      throw normalizeStudentEnrollmentRosterError(error, { operationId: 'updateClassSection' })
    }
  }

  async function updateClassSectionStatus(id, form, options = {}) {
    try {
      const response = await client.patch(`${ENDPOINT}/${id}/status`, mapClassSectionStatusRequest(form), config(options))
      return mapClassSection((response.data ?? response).data ?? response.data ?? response)
    } catch (error) {
      throw normalizeStudentEnrollmentRosterError(error, { operationId: 'updateClassSectionStatus' })
    }
  }

  async function listClassSectionMemberships(classSectionId, query = {}, options = {}) {
    try {
      const response = await client.get(`${ENDPOINT}/${classSectionId}/memberships`, config(options, classSectionParams(query)))
      const mapped = mapPaginatedEnvelope(response.data ?? response)
      return { ...mapped, items: mapped.items.map(mapRosterMembership) }
    } catch (error) {
      throw normalizeStudentEnrollmentRosterError(error, { operationId: 'listClassSectionMemberships' })
    }
  }

  async function batchAddClassSectionMemberships(classSectionId, form, options = {}) {
    try {
      const response = await client.post(`${ENDPOINT}/${classSectionId}/memberships`, mapRosterBatchAddRequest(form), config(options))
      return mapRosterBatchResult((response.data ?? response).data ?? response.data ?? response)
    } catch (error) {
      throw normalizeStudentEnrollmentRosterError(error, { operationId: 'batchAddClassSectionMemberships' })
    }
  }

  async function batchEndClassSectionMemberships(classSectionId, form, options = {}) {
    try {
      const response = await client.patch(`${ENDPOINT}/${classSectionId}/memberships`, mapRosterBatchEndRequest(form), config(options))
      return mapRosterBatchResult((response.data ?? response).data ?? response.data ?? response)
    } catch (error) {
      throw normalizeStudentEnrollmentRosterError(error, { operationId: 'batchEndClassSectionMemberships' })
    }
  }

  return {
    listClassSections,
    createClassSection,
    getClassSection,
    updateClassSection,
    updateClassSectionStatus,
    listClassSectionMemberships,
    batchAddClassSectionMemberships,
    batchEndClassSectionMemberships,
  }
}

function classSectionParams(query = {}) {
  return {
    page: query.page,
    per_page: query.perPage,
    academicPeriodId: query.academicPeriodId,
    status: query.status,
  }
}

function cleanParams(params = {}) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined))
}

export const {
  listClassSections,
  createClassSection,
  getClassSection,
  updateClassSection,
  updateClassSectionStatus,
  listClassSectionMemberships,
  batchAddClassSectionMemberships,
  batchEndClassSectionMemberships,
} = createClassroomRosterService()
