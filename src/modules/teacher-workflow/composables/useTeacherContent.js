import { computed, reactive } from 'vue'
import { teacherContentService, validateTeacherContentUploadDraft } from '../services/teacherContentService'
import { canDownloadContent } from '../services/teacherWorkflowStatus'
import { useTeacherWorkflowStaleGuard } from './useTeacherWorkflowStaleGuard'

export function startTeacherContentDownload(download, documentRef = globalThis.document) {
  if (!download?.url || !documentRef?.createElement) return false

  const link = documentRef.createElement('a')
  link.href = download.url
  link.rel = 'noopener'
  link.target = '_blank'
  if (download.fileName) link.download = download.fileName
  documentRef.body?.appendChild(link)
  link.click()
  link.remove()
  return true
}

export function useTeacherContent({
  service = teacherContentService,
  options = {},
  startDownload = startTeacherContentDownload,
} = {}) {
  const staleGuard = useTeacherWorkflowStaleGuard()
  const state = reactive({
    loading: false,
    pending: false,
    feedback: null,
    items: [],
    detail: null,
    pagination: { page: 1, perPage: 15, total: 0 },
    uploadDraft: { title: '', description: '', folderId: '', contentType: 'pdf', file: null },
    download: null,
  })

  const downloadable = computed(() => state.detail && canDownloadContent(state.detail))

  async function loadList(query = {}) {
    state.loading = true
    const captured = staleGuard.capture(['content', query.page ?? state.pagination.page])
    try {
      const response = await service.list({ ...state.pagination, ...query }, options)
      if (!staleGuard.isCurrent(captured)) return
      state.items = response.items
      state.pagination = { ...state.pagination, ...response.meta, page: query.page ?? state.pagination.page }
      state.feedback = response.items.length ? null : { type: 'empty' }
    } catch (error) {
      state.feedback = error
    } finally {
      state.loading = false
    }
  }

  async function loadDetail(id) {
    state.loading = true
    const captured = staleGuard.capture(['content-detail', id])
    try {
      const record = await service.get(id, options)
      if (!staleGuard.isCurrent(captured)) return
      state.detail = record
      state.feedback = null
    } catch (error) {
      state.feedback = error
    } finally {
      state.loading = false
    }
  }

  async function upload() {
    const fields = validateTeacherContentUploadDraft(state.uploadDraft)
    if (Object.keys(fields).length) {
      state.feedback = { type: 'validation', fields }
      return null
    }
    state.pending = true
    try {
      const record = await service.create(state.uploadDraft, options)
      state.detail = record
      state.uploadDraft = { title: '', description: '', folderId: '', contentType: 'pdf', file: null }
      state.feedback = { type: 'success' }
      return record
    } catch (error) {
      state.feedback = error
      return null
    } finally {
      state.pending = false
    }
  }

  async function updateDetail(form) {
    state.pending = true
    try {
      state.detail = await service.update(state.detail.id, form, options)
      state.feedback = { type: 'success' }
    } catch (error) {
      state.feedback = error
    } finally {
      state.pending = false
    }
  }

  async function lifecycle(action, status) {
    if (!state.detail) return
    state.pending = true
    try {
      if (action === 'delete') await service.delete(state.detail.id, options)
      else if (action === 'restore') state.detail = await service.restore(state.detail.id, options)
      else state.detail = await service.updateStatus(state.detail.id, status, options)
      state.feedback = { type: 'success' }
    } catch (error) {
      state.feedback = error
    } finally {
      state.pending = false
    }
  }

  async function downloadDetail() {
    if (!downloadable.value) {
      state.feedback = { type: 'download-denied' }
      return null
    }
    try {
      state.download = await service.download(state.detail.id, options)
      if (!startDownload(state.download)) {
        state.feedback = { type: 'download-denied' }
        return null
      }
      return state.download
    } catch (error) {
      state.feedback = error
      return null
    }
  }

  return { state, downloadable, loadList, loadDetail, upload, updateDetail, lifecycle, downloadDetail }
}
