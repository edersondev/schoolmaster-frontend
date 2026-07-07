export type SchoolFormMode = 'create' | 'edit'

export type SchoolStatus = 1 | 0

export interface SchoolAddress {
  street: string
  number: string
  complement?: string | null
  neighborhood: string
  city: string
  state: string
  zip_code: string
  country?: string | null
}

export interface SchoolLookupOption {
  id: number
  label: string
  status?: SchoolStatus
  sort_order?: number
}

export interface SchoolProfile {
  id?: string
  inep_code: string
  status: SchoolStatus
  name: string
  trade_name?: string | null
  legal_name?: string | null
  document: string
  email: string
  phone?: string | null
  website?: string | null
  description?: string | null
  address: SchoolAddress
  administrative_type_id: number | null
  legal_nature_id: number | null
  management_type_id: number | null
  pedagogical_approach_id: number | null
  education_level_ids: number[]
  modality_ids: number[]
  timezone: string
  language: string
  logo_path?: string | null
  primary_color: string
  secondary_color: string
}

export type SchoolFieldErrors = Record<string, string[]>

export type SchoolTabKey = 'basic' | 'address' | 'institutional' | 'branding'
