const INVALIDATING_CODES = new Set(['tenant_mismatch', 'inactive_school'])
const contextStamp = Symbol('school-context-request')

export function normalizeSchoolContextErrorCode(error) {
  const nestedCode = error?.response?.data?.error?.code
  const legacyCode = error?.response?.data?.code
  const code = typeof nestedCode === 'string' ? nestedCode : legacyCode
  return typeof code === 'string' ? code.toLowerCase() : null
}

function headerValue(headers, name) {
  if (typeof headers?.get === 'function') return headers.get(name)
  return headers?.[name] ?? headers?.[name.toLowerCase()] ?? null
}

export function installSchoolContextInvalidationObserver({ client, store, router = null }) {
  const requestInterceptor = client.interceptors.request.use((config) => {
    config[contextStamp] = {
      schoolId: headerValue(config.headers, 'X-School-Id'),
      generation: store.schoolContextGeneration,
    }
    return config
  })

  const responseInterceptor = client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const code = normalizeSchoolContextErrorCode(error)
      const stamp = error?.config?.[contextStamp]
      const currentSchoolId = store.activeSchool?.id ?? null

      if (
        INVALIDATING_CODES.has(code) &&
        stamp?.schoolId === currentSchoolId &&
        stamp?.generation === store.schoolContextGeneration
      ) {
        const currentRoute = router?.currentRoute?.value
        const requiresSchoolContext =
          currentRoute?.meta?.requiresSchoolContext === true ||
          (currentRoute?.meta?.userLookupMode === true &&
            currentRoute?.query?.user_mode === 'school')
        const canSelectSchool = store.isSystemAdministrator === true

        if (requiresSchoolContext && canSelectSchool) {
          store.captureRequestedRoute?.(currentRoute, 'context-invalidation')
        }

        const invalidated = store.invalidateSchoolContext({
          reason: code.replace('_', '-'),
          schoolId: stamp.schoolId,
          generation: stamp.generation,
        })
        if (invalidated && requiresSchoolContext) {
          await router.replace({ name: canSelectSchool ? 'authSchoolSelection' : 'authState' })
        }
      }

      return Promise.reject(error)
    },
  )

  return () => {
    client.interceptors.request.eject(requestInterceptor)
    client.interceptors.response.eject(responseInterceptor)
  }
}
