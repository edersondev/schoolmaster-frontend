import { describe, expect, it, vi } from 'vitest'
import {
  installSchoolContextInvalidationObserver,
  normalizeSchoolContextErrorCode,
} from '@/services/api/schoolContextInvalidation'

describe('school context invalidation', () => {
  it.each([
    [{ response: { data: { error: { code: 'TENANT_MISMATCH' } } } }, 'tenant_mismatch'],
    [{ response: { data: { code: 'inactive_school' } } }, 'inactive_school'],
    [{ response: { data: { errors: { code: 'tenant_mismatch' } } } }, null],
    [{ response: { data: { error: { reason: 'tenant_mismatch' } } } }, null],
  ])('normalizes only documented error code locations', (error, expected) => {
    expect(normalizeSchoolContextErrorCode(error)).toBe(expected)
  })

  it('invalidates only a matching header and generation, then supports teardown', async () => {
    let requestHandler
    let responseHandler
    const client = {
      interceptors: {
        request: {
          use: vi.fn((handler) => {
            requestHandler = handler
            return 1
          }),
          eject: vi.fn(),
        },
        response: {
          use: vi.fn((_, handler) => {
            responseHandler = handler
            return 2
          }),
          eject: vi.fn(),
        },
      },
    }
    const store = {
      activeSchool: { id: 'school-1' },
      schoolContextGeneration: 4,
      invalidateSchoolContext: vi.fn(),
    }
    const teardown = installSchoolContextInvalidationObserver({ client, store })
    const config = requestHandler({ headers: { 'X-School-Id': 'school-1' } })
    const error = { response: { data: { error: { code: 'inactive_school' } } }, config }

    await expect(responseHandler(error)).rejects.toBe(error)
    expect(store.invalidateSchoolContext).toHaveBeenCalledWith({
      reason: 'inactive-school',
      schoolId: 'school-1',
      generation: 4,
    })

    teardown()
    expect(client.interceptors.request.eject).toHaveBeenCalledWith(1)
    expect(client.interceptors.response.eject).toHaveBeenCalledWith(2)
  })

  it('captures a compatible administrator route before invalidation and opens the selector', async () => {
    let requestHandler
    let responseHandler
    const client = {
      interceptors: {
        request: {
          use: vi.fn((handler) => {
            requestHandler = handler
            return 1
          }),
          eject: vi.fn(),
        },
        response: {
          use: vi.fn((_, handler) => {
            responseHandler = handler
            return 2
          }),
          eject: vi.fn(),
        },
      },
    }
    const currentRoute = {
      name: 'usersList',
      query: { page: '2', unsafe: 'drop' },
      params: {},
      meta: {
        requiresSchoolContext: true,
        schoolContextSwitch: 'retain',
        contextNeutralQueryKeys: ['page'],
      },
    }
    const store = {
      activeSchool: { id: 'school-1' },
      schoolContextGeneration: 4,
      isSystemAdministrator: true,
      captureRequestedRoute: vi.fn(),
      invalidateSchoolContext: vi.fn().mockReturnValue(true),
    }
    const router = {
      currentRoute: { value: currentRoute },
      replace: vi.fn().mockResolvedValue(),
    }
    installSchoolContextInvalidationObserver({ client, store, router })
    const config = requestHandler({ headers: { 'X-School-Id': 'school-1' } })
    const error = { response: { data: { error: { code: 'tenant_mismatch' } } }, config }

    await expect(responseHandler(error)).rejects.toBe(error)

    expect(store.captureRequestedRoute).toHaveBeenCalledWith(currentRoute, 'context-invalidation')
    expect(store.captureRequestedRoute.mock.invocationCallOrder[0]).toBeLessThan(
      store.invalidateSchoolContext.mock.invocationCallOrder[0],
    )
    expect(router.replace).toHaveBeenCalledWith({ name: 'authSchoolSelection' })
  })

  it('routes non-administrators to auth recovery without opening the selector', async () => {
    let requestHandler
    let responseHandler
    const client = {
      interceptors: {
        request: {
          use: vi.fn((handler) => {
            requestHandler = handler
            return 1
          }),
          eject: vi.fn(),
        },
        response: {
          use: vi.fn((_, handler) => {
            responseHandler = handler
            return 2
          }),
          eject: vi.fn(),
        },
      },
    }
    const store = {
      activeSchool: { id: 'school-1' },
      schoolContextGeneration: 4,
      isSystemAdministrator: false,
      captureRequestedRoute: vi.fn(),
      invalidateSchoolContext: vi.fn().mockReturnValue(true),
    }
    const router = {
      currentRoute: { value: { meta: { requiresSchoolContext: true } } },
      replace: vi.fn().mockResolvedValue(),
    }
    installSchoolContextInvalidationObserver({ client, store, router })
    const config = requestHandler({ headers: { 'X-School-Id': 'school-1' } })
    const error = { response: { data: { code: 'inactive_school' } }, config }

    await expect(responseHandler(error)).rejects.toBe(error)

    expect(store.captureRequestedRoute).not.toHaveBeenCalled()
    expect(router.replace).toHaveBeenCalledWith({ name: 'authState' })
  })
})
