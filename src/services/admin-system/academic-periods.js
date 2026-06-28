import {
  mapAcademicPeriod,
  mapAcademicPeriodCreateRequest,
} from '@/contracts/admin-system/academics'
import { createAdministrationService } from './administration-service'

export function createAcademicPeriodsService(client) {
  const service = createAdministrationService({
    client,
    endpoint: '/api/v1/academic-periods',
    listOperationId: 'listAcademicPeriods',
    createOperationId: 'createAcademicPeriod',
    mapRecord: mapAcademicPeriod,
    mapCreateRequest: mapAcademicPeriodCreateRequest,
  })
  return { listAcademicPeriods: service.list, createAcademicPeriod: service.create }
}

export const { listAcademicPeriods, createAcademicPeriod } = createAcademicPeriodsService()
