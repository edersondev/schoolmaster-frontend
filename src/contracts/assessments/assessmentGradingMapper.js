export function mapManualGradingPayload({ answerId, score, studentFeedbackSummary = '' } = {}) {
  const numericScore = Number(score)
  if (!Number.isFinite(numericScore) || numericScore < 0 || numericScore > 100) {
    return { valid: false, payload: null, reason: 'invalid-score' }
  }
  return {
    valid: true,
    reason: null,
    payload: {
      answer_id: answerId,
      score: numericScore,
      student_feedback_summary: studentFeedbackSummary,
    },
  }
}

export function mapFailedScanActionPayload({ answerId, action } = {}) {
  if (!['zero', 'exempt'].includes(action)) {
    return { valid: false, payload: null, reason: 'unsupported-failed-scan-action' }
  }
  return {
    valid: true,
    reason: null,
    payload: {
      answer_id: answerId,
      failed_scan_action: action,
    },
  }
}
