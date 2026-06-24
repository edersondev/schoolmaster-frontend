export const authMessages = {
  brand: {
    product: 'SchoolMaster',
    eyebrow: 'Secure workspace access',
    promise: 'One identity. The right school. No shortcuts around authorization.',
  },
  login: {
    title: 'Welcome back',
    subtitle: 'Sign in to continue to your authorized workspace.',
    email: 'Email address',
    password: 'Password',
    submit: 'Sign in',
    forgotPassword: 'Forgot your password?',
  },
  forgotPassword: {
    title: 'Reset access',
    subtitle: 'Enter your email. The response stays private, even when an account is not found.',
    email: 'Email address',
    submit: 'Send recovery instructions',
    backToLogin: 'Back to sign in',
  },
  validation: {
    emailRequired: 'Email is required',
    emailInvalid: 'Enter a valid email address',
    passwordRequired: 'Password is required',
    passwordMin: 'Use at least 8 characters',
  },
  feedback: {
    validation: 'Review the highlighted fields and try again.',
    invalidCredentials: 'The email or password could not be accepted.',
    lockout: 'Sign-in attempts are temporarily limited. Wait before trying again.',
    expiredSession: 'Your session expired. Sign in again to continue safely.',
    unauthorized: 'Sign in is required before this workspace can open.',
    forbidden: 'You do not have permission to open this workspace.',
    inactiveUser: 'This account cannot access SchoolMaster right now.',
    inactiveSchool: 'This school is not available for the current session.',
    tenantMismatch: 'The requested school context is not available to this session.',
    temporaryUnavailable: 'Authentication is temporarily unavailable. Try again shortly.',
    neutralConfirmation:
      'If the address can receive recovery email, instructions will arrive shortly.',
  },
  recovery: {
    signIn: 'Go to sign in',
    chooseSchool: 'Choose a school',
    allowedWorkspace: 'Go to allowed workspace',
    retry: 'Try again',
  },
  schoolSelection: {
    title: 'Choose a school',
    subtitle: 'Tenant-owned content remains hidden until the school context is confirmed.',
    blockedTitle: 'School selection is not available yet',
    blockedMessage: 'No approved user-authorized school source is published in the API contract.',
    select: 'Open school',
    empty: 'No authorized schools are available.',
  },
  state: {
    title: 'Workspace access',
  },
}

export default authMessages
