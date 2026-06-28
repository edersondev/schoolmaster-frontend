import { mapAcademicYear, mapAcademicYearCreateRequest } from '@/contracts/admin-system/academics'
import { createAdministrationService } from './administration-service'

export function createAcademicYearsService(client) {
  const service = createAdministrationService({
    client,
    endpoint: '/api/v1/academic-years',
    listOperationId: 'listAcademicYears',
    createOperationId: 'createAcademicYear',
    mapRecord: mapAcademicYear,
    mapCreateRequest: mapAcademicYearCreateRequest,
  })
  return { listAcademicYears: service.list, createAcademicYear: service.create }
}

export const { listAcademicYears, createAcademicYear } = createAcademicYearsService()
