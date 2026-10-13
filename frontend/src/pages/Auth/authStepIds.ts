export type AuthRegistrationStep = 1 | 2 | 3

export const getAuthStepTitleId = (step: AuthRegistrationStep) => `auth-step-${step}-title`
