export interface PasswordStrength {
  score: number
  label: string
  color: string
  rules: {
    minLength: boolean
    hasUppercase: boolean
    hasNumber: boolean
    hasSpecial: boolean
  }
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const rules = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  }

  const score = Object.values(rules).filter(Boolean).length

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']

  return {
    score,
    label: labels[score] || '',
    color: colors[score] || '',
    rules,
  }
}
