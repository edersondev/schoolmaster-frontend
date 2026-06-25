import { schoolRoutes } from './schools.routes'
import { accessAdministrationRoutes } from './access-administration.routes'
import { academicRoutes } from './academics.routes'
import { guardianRoutes } from './guardians.routes'
export { createAdministrationRoute } from './administration-route'

export const administrationRoutes = [
  ...schoolRoutes,
  ...accessAdministrationRoutes,
  ...academicRoutes,
  ...guardianRoutes,
]
