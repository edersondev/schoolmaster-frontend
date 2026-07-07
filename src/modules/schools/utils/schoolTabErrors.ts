import type { SchoolFieldErrors, SchoolTabKey } from '../types/school'

const TAB_FIELDS: Record<SchoolTabKey, string[]> = {
  basic: [
    'inep_code',
    'status',
    'name',
    'trade_name',
    'legal_name',
    'document',
    'email',
    'phone',
    'website',
    'description',
  ],
  address: ['address'],
  institutional: [
    'administrative_type_id',
    'legal_nature_id',
    'management_type_id',
    'pedagogical_approach_id',
    'education_level_ids',
    'modality_ids',
    'timezone',
    'language',
  ],
  branding: ['logo_file', 'logo_path', 'primary_color', 'secondary_color'],
}

export function tabForSchoolField(field: string): SchoolTabKey {
  if (field.startsWith('address.')) return 'address'

  for (const [tab, fields] of Object.entries(TAB_FIELDS) as [SchoolTabKey, string[]][]) {
    if (fields.includes(field)) return tab
  }

  return 'basic'
}

export function mapSchoolTabErrors(errors: SchoolFieldErrors = {}): Record<SchoolTabKey, boolean> {
  return Object.keys(errors).reduce<Record<SchoolTabKey, boolean>>(
    (tabs, field) => {
      tabs[tabForSchoolField(field)] = true

      return tabs
    },
    {
      basic: false,
      address: false,
      institutional: false,
      branding: false,
    },
  )
}
