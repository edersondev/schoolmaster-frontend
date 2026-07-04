import { createI18n } from 'vue-i18n'
import { advancedAssessmentMessages } from '@/i18n/modules/advanced-assessment'

export function createAdvancedAssessmentI18n() {
  return createI18n({
    legacy: false,
    locale: 'en',
    messages: { en: { advancedAssessment: advancedAssessmentMessages } },
  })
}

export const advancedQuestionnaire = {
  id: 'questionnaire-1',
  title: 'Advanced quiz',
  questions: [
    {
      id: 'q-long',
      type: 'long_text',
      prompt: 'Explain',
      answerSchema: { minLength: 1, maxLength: 10000 },
      gradingRule: { mode: 'manual', maxScore: 100 },
      lifecycleLockState: 'editable',
    },
    {
      id: 'q-file',
      type: 'file_response',
      prompt: 'Upload evidence',
      fileRule: { allowedCategories: ['pdf', 'image', 'text', 'office'], maxFiles: 1, maxFileSize: 26214400 },
      gradingRule: { mode: 'manual', maxScore: 100 },
      lifecycleLockState: 'editable',
    },
  ],
}

export const responseAttempt = {
  id: 'response-1',
  response_attempt_id: 'response-1',
  questionnaire_id: 'questionnaire-1',
  student_display_name: 'A Student',
  grading_status: 'pending',
  answers: [
    {
      id: 'answer-1',
      question_id: 'q-long',
      question_type: 'long_text',
      prompt: 'Explain',
      text_answer: 'Safe student answer',
      private_grading_note: 'hidden',
    },
    {
      id: 'answer-2',
      question_id: 'q-file',
      question_type: 'file_response',
      scan_status: 'failed',
    },
  ],
  files: [
    {
      id: 'file-1',
      display_name: 'answer.pdf',
      scan_status: 'clean',
      storage_path: '/private/path',
    },
  ],
}

export const componentGlobal = {
  plugins: [createAdvancedAssessmentI18n()],
  stubs: {
    RouterLink: { template: '<a><slot /></a>' },
    RouterView: { template: '<div />' },
    ElAlert: { props: ['title'], template: '<div>{{ title }}</div>' },
    ElButton: { template: '<button><slot /></button>' },
    ElForm: { template: '<form><slot /></form>' },
    ElFormItem: { props: ['label', 'error'], template: '<label>{{ label }} {{ error }}<slot /></label>' },
    ElInput: { props: ['modelValue'], template: '<input :value="modelValue" />' },
    ElInputNumber: { props: ['modelValue'], template: '<input :value="modelValue" />' },
    ElOption: { props: ['label'], template: '<option>{{ label }}</option>' },
    ElSelect: { template: '<select><slot /></select>' },
    ElSkeleton: { template: '<div />' },
    ElTag: { template: '<span><slot /></span>' },
    ElUpload: { template: '<div><slot /></div>' },
  },
}
