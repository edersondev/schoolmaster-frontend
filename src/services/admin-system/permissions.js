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

  async function listAllPermissions(query = {}, options = {}) {
    const perPage = query.perPage ?? 100
    const firstPage = await listPermissions({ page: 1, perPage }, options)
    const pageCount = Math.max(
      1,
      Math.ceil(firstPage.meta.total / Math.max(firstPage.meta.perPage, 1)),
    )
    const permissionsById = new Map(
      firstPage.items.map((permission) => [permission.id, permission]),
    )

    for (let page = 2; page <= pageCount; page += 1) {
      const result = await listPermissions({ page, perPage }, options)
      result.items.forEach((permission) => permissionsById.set(permission.id, permission))
    }

    const items = [...permissionsById.values()]

    return {
      items,
      meta: {
        page: 1,
        perPage: Math.max(items.length, 1),
        total: items.length,
      },
    }
  }

  return { listPermissions, listAllPermissions }
}

export const { listPermissions, listAllPermissions } = createPermissionsService()
