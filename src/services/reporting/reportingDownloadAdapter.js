export function extractSafeFilename(disposition = '', fallback = 'report-output') {
  const match = String(disposition).match(/filename="?([^";]+)"?/i)
  const raw = match?.[1] ?? fallback
  return raw.replace(/[^A-Za-z0-9._-]/g, '_')
}

export function startReportDownload(response, { createObjectURL, revokeObjectURL, documentRef } = {}) {
  const doc = documentRef ?? (typeof document !== 'undefined' ? document : null)
  const urlApi = {
    createObjectURL: createObjectURL ?? (typeof URL !== 'undefined' ? URL.createObjectURL?.bind(URL) : null),
    revokeObjectURL: revokeObjectURL ?? (typeof URL !== 'undefined' ? URL.revokeObjectURL?.bind(URL) : null),
  }

  if (!doc || !urlApi.createObjectURL || !response?.data) {
    return { started: false, filename: extractSafeFilename(response?.disposition) }
  }

  const filename = extractSafeFilename(response?.disposition, `report.${response?.format ?? 'bin'}`)
  const url = urlApi.createObjectURL(response.data)
  const link = doc.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  link.click()
  urlApi.revokeObjectURL?.(url)
  return { started: true, filename }
}
