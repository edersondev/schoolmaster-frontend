import { computed, reactive, readonly, shallowRef, toRaw } from 'vue'
import { normalizeAdministrationError } from '@/services/admin-system/administration-error-mapper'
import { isValidCnpj } from '@/utils/cnpj'
import { mapSchoolTabErrors } from '../utils/schoolTabErrors'
import { schoolModuleService } from '../services/schoolService'

const DEFAULT_PRIMARY_COLOR = '#1D4ED8'
const DEFAULT_SECONDARY_COLOR = '#F59E0B'
const MAX_LOGO_BYTES = 2 * 1024 * 1024
const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const LOOKUP_LOADERS = [
  ['administrativeTypes', 'listAdministrativeTypes'],
  ['legalNatures', 'listLegalNatures'],
  ['managementTypes', 'listManagementTypes'],
  ['pedagogicalApproaches', 'listPedagogicalApproaches'],
  ['educationLevels', 'listEducationLevels'],
  ['modalities', 'listModalities'],
]
const ADDRESS_REQUIRED_MESSAGES = {
  street: 'Street is required.',
  number: 'Number is required.',
  neighborhood: 'Neighborhood is required.',
  city: 'City is required.',
  state: 'State is required.',
  zipCode: 'ZIP code is required.',
}
const INSTITUTIONAL_REQUIRED_MESSAGES = {
  administrative_type_id: 'Administrative type is required.',
  legal_nature_id: 'Legal nature is required.',
  management_type_id: 'Management type is required.',
  pedagogical_approach_id: 'Pedagogical approach is required.',
}

export function createSchoolFormValues() {
  return {
    inep_code: '',
    status: 1,
    name: '',
    trade_name: '',
    legal_name: '',
    document: '',
    email: '',
    phone: '',
    website: '',
    description: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Brazil',
    },
    administrative_type_id: null,
    legal_nature_id: null,
    management_type_id: null,
    pedagogical_approach_id: null,
    education_level_ids: [],
    modality_ids: [],
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR',
    logo_path: null,
    logo_file: null,
    primary_color: DEFAULT_PRIMARY_COLOR,
    secondary_color: DEFAULT_SECONDARY_COLOR,
  }
}

export function mapSchoolRecordToForm(record = {}) {
  const values = createSchoolFormValues()
  const address = record.address ?? {}

  return {
    ...values,
    ...pick(record, [
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
      'administrative_type_id',
      'legal_nature_id',
      'management_type_id',
      'pedagogical_approach_id',
      'timezone',
      'language',
      'logo_path',
      'primary_color',
      'secondary_color',
    ]),
    status: Number(record.status ?? values.status),
    address: {
      ...values.address,
      street: address.street ?? '',
      number: address.number ?? '',
      complement: address.complement ?? '',
      neighborhood: address.neighborhood ?? '',
      city: address.city ?? '',
      state: address.state ?? '',
      zipCode: address.zip_code ?? address.zipCode ?? '',
      country: address.country ?? '',
    },
    education_level_ids: Array.isArray(record.education_level_ids)
      ? record.education_level_ids.map(Number)
      : [],
    modality_ids: Array.isArray(record.modality_ids) ? record.modality_ids.map(Number) : [],
    logo_file: null,
  }
}

export function validateSchoolFormValues(values = {}, { mode = 'create' } = {}) {
  const errors = {}
  const digits = (value) => String(value ?? '').replace(/\D/g, '')

  if (!/^\d{8}$/.test(digits(values.inep_code))) {
    errors.inep_code = ['INEP code must have 8 digits.']
  }

  if (![0, 1].includes(Number(values.status))) {
    errors.status = ['Status must be active or inactive.']
  }

  if (!present(values.name)) errors.name = ['School name is required.']

  if (mode === 'create') {
    if (!present(values.document)) errors.document = ['Document is required.']
    else if (!isValidCnpj(values.document)) errors.document = ['Enter a valid CNPJ document.']
  }

  if (!present(values.email)) {
    errors.email = ['Email is required.']
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(values.email))) {
    errors.email = ['Enter a valid email address.']
  }

  const address = values.address ?? {}
  for (const field of ['street', 'number', 'neighborhood', 'city', 'state', 'zipCode']) {
    if (!present(address[field])) {
      errors[`address.${field === 'zipCode' ? 'zip_code' : field}`] = [
        ADDRESS_REQUIRED_MESSAGES[field],
      ]
    }
  }
  if (present(address.number) && !/^\d+$/.test(digits(address.number))) {
    errors['address.number'] = ['Use numbers only.']
  }
  if (present(address.zipCode) && !/^\d+$/.test(digits(address.zipCode))) {
    errors['address.zip_code'] = ['Use numbers only.']
  }

  for (const field of [
    'administrative_type_id',
    'legal_nature_id',
    'management_type_id',
    'pedagogical_approach_id',
  ]) {
    if (!present(values[field])) errors[field] = [INSTITUTIONAL_REQUIRED_MESSAGES[field]]
  }
  if (!Array.isArray(values.education_level_ids) || values.education_level_ids.length === 0) {
    errors.education_level_ids = ['Select at least one education level.']
  }
  if (!Array.isArray(values.modality_ids) || values.modality_ids.length === 0) {
    errors.modality_ids = ['Select at least one modality.']
  }

  for (const field of ['primary_color', 'secondary_color']) {
    if (present(values[field]) && !/^#[0-9A-Fa-f]{6}$/.test(String(values[field]))) {
      errors[field] = ['Use #RRGGBB format.']
    }
  }

  const logoFile = getLogoFile(values.logo_file)
  if (logoFile) {
    if (!ALLOWED_LOGO_TYPES.includes(logoFile.type)) {
      errors.logo_file = ['Logo must be PNG, JPEG, or WebP.']
    } else if (logoFile.size > MAX_LOGO_BYTES) {
      errors.logo_file = ['Logo must be 2 MB or smaller.']
    }
  }

  return errors
}

export function useSchoolForm(options = {}) {
  const mode = options.mode ?? 'create'
  const service = options.service ?? schoolModuleService
  const values = reactive(createSchoolFormValues())
  const initialSnapshot = shallowRef(snapshot(values))
  const activeTab = shallowRef('basic')
  const fieldErrors = shallowRef({})
  const formError = shallowRef(null)
  const status = shallowRef(mode === 'edit' ? 'loading' : 'ready')
  const lookupStatus = shallowRef('idle')
  const lookupError = shallowRef(null)
  const submitted = shallowRef(false)
  const requestToken = shallowRef(0)
  const saveToken = shallowRef(0)
  const lookupToken = shallowRef(0)
  const lookups = reactive({
    administrativeTypes: [],
    legalNatures: [],
    managementTypes: [],
    pedagogicalApproaches: [],
    educationLevels: [],
    modalities: [],
  })

  const pending = computed(() => status.value === 'submitting')
  const isDirty = computed(() => snapshot(values) !== initialSnapshot.value)
  const tabErrors = computed(() => mapSchoolTabErrors(fieldErrors.value))

  function reset(nextValues = createSchoolFormValues()) {
    Object.assign(values, cloneForm(nextValues))
    initialSnapshot.value = snapshot(values)
    fieldErrors.value = {}
    formError.value = null
    submitted.value = false
    activeTab.value = 'basic'
    status.value = 'ready'
  }

  async function loadLookups() {
    const token = lookupToken.value + 1
    lookupToken.value = token
    lookupStatus.value = 'loading'
    lookupError.value = null

    try {
      const results = await Promise.all(
        LOOKUP_LOADERS.map(([, method]) => service[method]()),
      )
      if (lookupToken.value !== token) return null
      LOOKUP_LOADERS.forEach(([key], index) => {
        lookups[key] = results[index]
      })
      lookupStatus.value = 'ready'
      return lookups
    } catch (cause) {
      if (lookupToken.value !== token) return null
      lookupStatus.value = 'unavailable'
      lookupError.value = normalizeAdministrationError(cause, {
        operationId: 'listSchoolLookups',
      })
      return null
    }
  }

  async function loadSchool(id) {
    if (!id) return null
    const token = requestToken.value + 1
    requestToken.value = token
    status.value = 'loading'
    formError.value = null

    try {
      const school = await service.getSchool(id)
      if (requestToken.value !== token) return null
      reset(mapSchoolRecordToForm(school))
      return school
    } catch (cause) {
      if (requestToken.value !== token) return null
      const normalized = normalizeAdministrationError(cause, {
        operationId: 'getSchool',
      })
      formError.value = normalized
      status.value = normalized.type
      return null
    }
  }

  async function submit(id = null) {
    if (pending.value) return null

    const localErrors = validateSchoolFormValues(values, { mode })
    if (Object.keys(localErrors).length > 0) {
      fieldErrors.value = localErrors
      formError.value = {
        type: 'validation',
        messageKey: 'common.validationSummary',
        fieldErrors: localErrors,
      }
      activeTab.value = firstErroredTab(localErrors)
      status.value = formError.value.type
      throw formError.value
    }

    if (lookupStatus.value === 'unavailable') {
      await loadLookups()
    }

    if (lookupStatus.value === 'unavailable') {
      fieldErrors.value = {}
      formError.value = {
        type: 'unavailable',
        messageKey: 'common.unavailable',
        fieldErrors: {},
      }
      activeTab.value = 'institutional'
      status.value = formError.value.type
      throw formError.value
    }

    const token = saveToken.value + 1
    saveToken.value = token
    status.value = 'submitting'
    fieldErrors.value = {}
    formError.value = null

    try {
      const result =
        mode === 'edit' ? await service.updateSchool(id, values) : await service.createSchool(values)
      if (saveToken.value !== token) return null
      reset(mapSchoolRecordToForm(result))
      submitted.value = true
      status.value = 'succeeded'
      return result
    } catch (cause) {
      if (saveToken.value !== token) return null
      const normalized = normalizeAdministrationError(cause, {
        operationId: mode === 'edit' ? 'updateSchool' : 'createSchool',
      })
      fieldErrors.value = normalized.fieldErrors ?? {}
      formError.value = normalized
      activeTab.value = firstErroredTab(fieldErrors.value)
      status.value = normalized.type
      throw normalized
    }
  }

  function setLogoFile(file) {
    values.logo_file = file
    if (fieldErrors.value.logo_file) {
      const { logo_file, ...rest } = fieldErrors.value
      fieldErrors.value = rest
    }
  }

  return {
    values,
    lookups,
    activeTab,
    fieldErrors: readonly(fieldErrors),
    formError: readonly(formError),
    status: readonly(status),
    lookupStatus: readonly(lookupStatus),
    lookupError: readonly(lookupError),
    submitted: readonly(submitted),
    pending,
    isDirty,
    tabErrors,
    reset,
    loadLookups,
    loadSchool,
    submit,
    setLogoFile,
  }
}

function firstErroredTab(errors) {
  const tabs = mapSchoolTabErrors(errors)
  return ['basic', 'address', 'institutional', 'branding'].find((tab) => tabs[tab]) ?? 'basic'
}

function pick(source, keys) {
  return Object.fromEntries(keys.filter((key) => source[key] !== undefined).map((key) => [key, source[key]]))
}

function present(value) {
  return value !== undefined && value !== null && String(value).trim() !== ''
}

function cloneForm(value) {
  return {
    ...createSchoolFormValues(),
    ...value,
    address: { ...createSchoolFormValues().address, ...(value.address ?? {}) },
    education_level_ids: [...(value.education_level_ids ?? [])],
    modality_ids: [...(value.modality_ids ?? [])],
  }
}

function snapshot(value) {
  const upload = getLogoFile(value.logo_file)
  const logoFile = upload
    ? {
        name: upload.name,
        size: upload.size,
        type: upload.type,
      }
    : null
  return JSON.stringify({ ...cloneForm(value), logo_file: logoFile })
}

function getLogoFile(value) {
  const raw = toRaw(value)
  return isLogoFile(raw) ? raw : null
}

function isLogoFile(value) {
  return typeof Blob !== 'undefined' && value instanceof Blob
}
