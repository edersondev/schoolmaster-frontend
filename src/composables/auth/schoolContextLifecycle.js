export function applySchoolLifecycleContextOutcome({ action, targetId, outcome, session }) {
  const resolvedTargetId = String(outcome?.resourceId ?? targetId ?? '')
  if (
    !resolvedTargetId ||
    (outcome?.resourceId && String(outcome.resourceId) !== String(targetId))
  ) {
    return false
  }
  if (!['deactivate', 'delete'].includes(action)) return false
  if (session.activeSchool?.id !== resolvedTargetId) return false

  return session.invalidateSchoolContext({
    reason: 'inactive-school',
    schoolId: resolvedTargetId,
  })
}
