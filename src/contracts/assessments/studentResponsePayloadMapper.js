import { ADVANCED_MAX_FILE_SIZE_BYTES, ADVANCED_FILE_CATEGORIES } from './advancedAssessmentContract'

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/

export function validateLongTextAnswer(value = '', { maxLength = 10000 } = {}) {
  const text = String(value)
  if (!text.trim()) return { valid: false, reason: 'blank' }
  if (text.length > maxLength) return { valid: false, reason: 'too-long' }
  if (CONTROL_CHARS.test(text)) return { valid: false, reason: 'unsafe-control-character' }
  return { valid: true, reason: null }
}

export function inferFileCategory(file = {}) {
  const type = file.type ?? ''
  const name = file.name ?? ''
  if (type.includes('pdf') || name.endsWith('.pdf')) return 'pdf'
  if (type.startsWith('image/')) return 'image'
  if (type.startsWith('text/') || /\.(txt|csv|md)$/i.test(name)) return 'text'
  if (/(word|excel|powerpoint|officedocument)|\.(docx?|xlsx?|pptx?)$/i.test(`${type} ${name}`)) return 'office'
  return 'unknown'
}

export function validateFileSelection(files = [], rule = {}) {
  const selected = Array.from(files)
  if (selected.length === 0) return { valid: false, reason: 'missing-file' }
  if (selected.length > (rule.maxFiles ?? 1)) return { valid: false, reason: 'multiple-files' }
  const file = selected[0]
  if (/[/\\]|\.\./.test(file.name ?? '')) return { valid: false, reason: 'unsafe-filename' }
  if ((file.size ?? 0) > (rule.maxFileSize ?? ADVANCED_MAX_FILE_SIZE_BYTES)) return { valid: false, reason: 'too-large' }
  const category = inferFileCategory(file)
  if (!(rule.allowedCategories ?? ADVANCED_FILE_CATEGORIES).includes(category)) {
    return { valid: false, reason: 'unsupported-category' }
  }
  return { valid: true, reason: null, category, file }
}

export function buildStudentResponsePayload({ questionnaireId, learningSetId, textAnswers = [], fileAnswers = [] } = {}) {
  const hasFiles = fileAnswers.some((answer) => answer.file)
  if (!hasFiles) {
    return {
      questionnaire_id: questionnaireId,
      learning_set_id: learningSetId,
      answers: textAnswers.map((answer) => ({
        question_id: answer.questionId,
        text_answer: answer.value,
      })),
    }
  }

  const formData = new FormData()
  formData.append('questionnaire_id', questionnaireId ?? '')
  formData.append('learning_set_id', learningSetId ?? '')
  textAnswers.forEach((answer, index) => {
    formData.append(`answers[${index}][question_id]`, answer.questionId)
    formData.append(`answers[${index}][text_answer]`, answer.value)
  })
  fileAnswers.forEach((answer, index) => {
    const answerIndex = textAnswers.length + index
    formData.append(`answers[${answerIndex}][question_id]`, answer.questionId)
    formData.append(`answers[${answerIndex}][file]`, answer.file)
  })
  return formData
}
