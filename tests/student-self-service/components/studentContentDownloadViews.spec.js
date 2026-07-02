import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import StudentContentDownloadAction from '@/components/student/StudentContentDownloadAction.vue'
import { createStudentI18n } from '../test-utils'

const download = vi.fn()

vi.mock('@/composables/student/useStudentContentDownload', () => ({
  useStudentContentDownload: () => ({
    state: { pendingId: null, feedback: null },
    download,
  }),
}))

describe('student content download view', () => {
  it('enables downloadable content and disables unavailable content', async () => {
    const global = {
      plugins: [createStudentI18n()],
      stubs: {
        ElButton: {
          props: ['disabled'],
          emits: ['click'],
          template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
        },
        StudentFeedbackState: true,
      },
    }
    const enabled = mount(StudentContentDownloadAction, {
      props: { contentItem: { id: 'content-1', downloadAvailable: true } },
      global,
    })
    await enabled.find('button').trigger('click')
    expect(download).toHaveBeenCalledWith({ id: 'content-1', downloadAvailable: true })

    const disabled = mount(StudentContentDownloadAction, {
      props: { contentItem: { id: 'content-2', downloadAvailable: false } },
      global,
    })
    expect(disabled.find('button').attributes('disabled')).toBeDefined()
  })
})
