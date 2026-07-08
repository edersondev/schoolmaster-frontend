import { toRaw } from 'vue'
import { authService } from '@/services/auth/authService'
import { administrationHttpClient } from '@/services/admin-system/administration-service'

export const SCHOOL_ENDPOINT = '/api/v1/schools'
export const SCHOOL_LOOKUP_ENDPOINT = '/api/v1/school-lookups'
export const ADDRESS_LOOKUP_ENDPOINT = '/api/v1/address-lookups'

export function createSchoolModuleService(
  client = administrationHttpClient,
  getAccessToken = () => authService.getAccessToken(),
) {
  const headers = (extra = {}) => ({
    Authorization: `Bearer ${getAccessToken()}`,
    ...extra,
  })

  return {
    async getSchool(id) {
      const response = await client.get(`${SCHOOL_ENDPOINT}/${id}`, { headers: headers() })
      return response.data?.data ?? response.data
    },

    async createSchool(payload) {
      const body = toSchoolRequestBody(payload)
      const response = await client.post(SCHOOL_ENDPOINT, body.data, {
        headers: headers(body.headers),
      })
      return response.data?.data ?? response.data
    },

    async updateSchool(id, payload) {
      const body = toSchoolRequestBody(payload, { omitDocument: true })
      const method = isMultipartBody(body.data) ? 'post' : 'patch'
      const methodHeaders = method === 'post' ? { 'X-HTTP-Method-Override': 'PATCH' } : {}
      const response = await client[method](`${SCHOOL_ENDPOINT}/${id}`, body.data, {
        headers: headers({ ...body.headers, ...methodHeaders }),
      })
      return response.data?.data ?? response.data
    },

    async listLookup(kind) {
      const response = await client.get(`${SCHOOL_LOOKUP_ENDPOINT}/${kind}`, { headers: headers() })
      return response.data?.data ?? []
    },

    async lookupAddressByZipCode(zipCode) {
      const normalizedZipCode = digits(zipCode)
      const response = await client.get(`${ADDRESS_LOOKUP_ENDPOINT}/${normalizedZipCode}`, {
        headers: headers(),
      })

      return mapAddressLookupResponse(response.data?.data ?? response.data)
    },

    listAdministrativeTypes() {
      return this.listLookup('administrative-types')
    },

    listLegalNatures() {
      return this.listLookup('legal-natures')
    },

    listManagementTypes() {
      return this.listLookup('management-types')
    },

    listPedagogicalApproaches() {
      return this.listLookup('pedagogical-approaches')
    },

    listEducationLevels() {
      return this.listLookup('education-levels')
    },

    listModalities() {
      return this.listLookup('modalities')
    },
  }
}

export function mapAddressLookupResponse(address = {}) {
  return {
    street: address.street ?? address.logradouro ?? '',
    neighborhood: address.neighborhood ?? address.bairro ?? '',
    city: address.city ?? address.localidade ?? '',
    state: address.state ?? address.uf ?? '',
    country: 'Brazil',
  }
}

export function toSchoolRequestBody(payload = {}, options = {}) {
  const normalized = compactSchoolPayload(payload, options)
  const logoFile = getUploadFile(payload.logo_file)

  if (!logoFile) {
    return { data: normalized, headers: {} }
  }

  const form = new FormData()
  appendFormData(form, normalized)
  form.append('logo_file', logoFile, logoFile.name || 'logo')

  return { data: form, headers: { 'Content-Type': 'multipart/form-data' } }
}

export function compactSchoolPayload(payload = {}, { omitDocument = false } = {}) {
  const result = {
    inep_code: digits(payload.inep_code),
    status: numberOrUndefined(payload.status),
    name: payload.name,
    trade_name: payload.trade_name,
    legal_name: payload.legal_name,
    email: payload.email,
    phone: digits(payload.phone),
    website: payload.website,
    description: payload.description,
    address: payload.address ? compactAddress(payload.address) : undefined,
    administrative_type_id: numberOrUndefined(payload.administrative_type_id),
    legal_nature_id: numberOrUndefined(payload.legal_nature_id),
    management_type_id: numberOrUndefined(payload.management_type_id),
    pedagogical_approach_id: numberOrUndefined(payload.pedagogical_approach_id),
    education_level_ids: toNumberArray(payload.education_level_ids),
    modality_ids: toNumberArray(payload.modality_ids),
    timezone: payload.timezone || 'America/Sao_Paulo',
    language: payload.language || 'pt-BR',
    primary_color: payload.primary_color || '#1D4ED8',
    secondary_color: payload.secondary_color || '#F59E0B',
  }

  if (!omitDocument) {
    result.document = digits(payload.document)
  }

  return pruneEmpty(result)
}

function compactAddress(address = {}) {
  return pruneEmpty({
    street: address.street,
    number: digits(address.number),
    complement: address.complement,
    neighborhood: address.neighborhood,
    city: address.city,
    state: address.state,
    zip_code: digits(address.zip_code ?? address.zipCode),
    country: address.country,
  })
}

function appendFormData(form, value, prefix = '') {
  for (const [key, item] of Object.entries(value)) {
    const name = prefix ? `${prefix}[${key}]` : key
    if (Array.isArray(item)) {
      item.forEach((entry) => form.append(`${name}[]`, entry))
    } else if (item && typeof item === 'object') {
      appendFormData(form, item, name)
    } else if (item !== undefined && item !== null) {
      form.append(name, item)
    }
  }
}

function pruneEmpty(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined && item !== null && item !== ''),
  )
}

function digits(value) {
  return String(value ?? '').replace(/\D/g, '')
}

function numberOrUndefined(value) {
  if (value === undefined || value === null || value === '') return undefined
  return Number(value)
}

function toNumberArray(value) {
  if (!Array.isArray(value)) return []
  return value.map(Number)
}

function getUploadFile(value) {
  const raw = toRaw(value)
  return isUploadFile(raw) ? raw : null
}

function isUploadFile(value) {
  return typeof Blob !== 'undefined' && value instanceof Blob
}

function isMultipartBody(value) {
  return typeof FormData !== 'undefined' && value instanceof FormData
}

export const schoolModuleService = createSchoolModuleService()
