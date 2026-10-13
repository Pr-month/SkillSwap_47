import React from 'react'
import authStyles from './Auth.module.css'
import { getAuthStepTitleId, type AuthRegistrationStep } from './authStepIds'

type RegistrationStepHeaderProps = {
  step: AuthRegistrationStep
}

export const RegistrationStepHeader: React.FC<RegistrationStepHeaderProps> = ({ step }) => {
  const titleId = getAuthStepTitleId(step)

  return (
    <div className={authStyles.stepHeader}>
      <h1 id={titleId} className={authStyles.stepTitle}>
        Шаг {step} из 3
      </h1>
      <div
        className={authStyles.stepProgress}
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={3}
        aria-valuenow={step}
        aria-label={`Шаг ${step} из 3`}
      >
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className={step >= index + 1 ? authStyles.stepBarActive : authStyles.stepBar}
          />
        ))}
      </div>
    </div>
  )
}
