import { compactPayload, isPresent, isValidEmail } from './administration'
import { normalizePhone } from '@/utils/phone'

export const STUDENT_GUARDIAN_MAX_ENTRIES = 2

export const GUARDIAN_ENTRY_MODES = Object.freeze({
  new: 'new',
  existing: 'existing',
})

export function createGuardianEntryDraft(overrides = {}) {
  return {
    entryId:
      globalThis.crypto?.randomUUID?.() ?? `guardian-${Date.now()}-${Math.random().toString(16)}`,
    mode: GUARDIAN_ENTRY_MODES.new,
    relationshipType: '',
    guardianId: '',
    fullName: '',
    contactEmail: '',
    contactPhone: '',
    selectedGuardian: null,
    ...overrides,
  }
}

export function mapGuardianEntryRequest(entry = {}) {
  const base = { relationship_type: entry.relationshipType }

  if (entry.mode === GUARDIAN_ENTRY_MODES.existing) {
    return compactPayload({
      ...base,
      guardian_id: entry.guardianId ?? entry.selectedGuardian?.id,
    })
  }

  return compactPayload({
    ...base,
    full_name: entry.fullName,
    contact_email: entry.contactEmail,
    contact_phone: normalizePhone(entry.contactPhone),
  })
}

export function mapGuardianEntriesRequest(entries = []) {
  return entries.map(mapGuardianEntryRequest)
}

export function validateGuardianEntries(entries = []) {
  const errors = {}
  const existingIds = new Set()
  const newGuardianKeys = new Set()

  if (entries.length > STUDENT_GUARDIAN_MAX_ENTRIES) {
    errors.guardian_associations = ['Maximum two guardians are allowed.']
  }

  entries.forEach((entry, index) => {
    const prefix = `guardian_associations.${index}`

    if (!isPresent(entry.relationshipType)) {
      errors[`${prefix}.relationship_type`] = ['Relationship is required.']
    }

    if (entry.mode === GUARDIAN_ENTRY_MODES.existing) {
      const guardianId = entry.guardianId ?? entry.selectedGuardian?.id
      if (!isPresent(guardianId)) {
        errors[`${prefix}.guardian_id`] = ['Select an existing guardian.']
      } else if (existingIds.has(guardianId)) {
        errors[`${prefix}.guardian_id`] = ['This guardian is already selected.']
      }
      existingIds.add(guardianId)
      return
    }

    if (!isPresent(entry.fullName)) {
      errors[`${prefix}.full_name`] = ['Full name is required.']
    }

    if (isPresent(entry.contactEmail) && !isValidEmail(entry.contactEmail)) {
      errors[`${prefix}.contact_email`] = ['Enter a valid email address.']
    }

    const identityKey = [entry.fullName, entry.contactEmail, entry.contactPhone]
      .map((value) =>
        String(value ?? '')
          .trim()
          .toLowerCase(),
      )
      .join('|')

    if (identityKey !== '||' && newGuardianKeys.has(identityKey)) {
      errors[`${prefix}.full_name`] = ['This guardian is already entered.']
    }
    newGuardianKeys.add(identityKey)
  })

  return errors
}

export function mapStudentGuardianAssociation(record = {}) {
  return {
    id: record.id ?? record.guardian_id ?? null,
    guardianId: record.guardian_id ?? record.id ?? null,
    schoolId: record.school_id ?? null,
    fullName: record.full_name ?? '',
    relationshipType: record.relationship_type ?? '',
    contactEmail: record.contact_email ?? null,
    contactPhone: record.contact_phone ?? null,
    status: record.status ?? null,
  }
}
