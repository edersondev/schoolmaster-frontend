import { schoolsService } from '@/services/admin-system/schools'

export const SCHOOL_SELECTION_PER_PAGE = 25

export function createSchoolSelectionService(service = schoolsService) {
  return {
    async listActiveSchools({
      page = 1,
      perPage = SCHOOL_SELECTION_PER_PAGE,
      name = '',
      inepCode = '',
      signal,
    } = {}) {
      const result = await service.listSchools(
        {
          status: 1,
          page,
          perPage,
          name: String(name).trim(),
          inepCode: String(inepCode).trim(),
        },
        { signal },
      )

      return {
        ...result,
        items: result.items.filter(
          (school) => school.status === 'active' || school.status === 1 || school.status === '1',
        ),
      }
    },
  }
}

export const schoolSelectionService = createSchoolSelectionService()
