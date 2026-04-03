import { checkPasswordStrength } from '@/lib/passwordStrength'
import { Check, X } from 'lucide-react'

interface Props {
  password: string
}

export function PasswordStrengthBar({ password }: Props) {
  if (!password) return null
  const { score, label, color, rules } = checkPasswordStrength(password)

  return (
    <div className="space-y-2 mt-1">
      {/* Bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? color : 'bg-muted'
            }`}
          />
        ))}
      </div>
      {/* Label */}
      {label && (
        <p className={`text-xs font-medium ${
          score === 1 ? 'text-red-500' :
          score === 2 ? 'text-orange-500' :
          score === 3 ? 'text-yellow-500' :
          'text-green-500'
        }`}>
          {label}
        </p>
      )}
      {/* Rules */}
      <div className="grid grid-cols-2 gap-1">
        {[
          { key: 'minLength', label: 'At least 8 characters' },
          { key: 'hasUppercase', label: 'One uppercase letter' },
          { key: 'hasNumber', label: 'One number' },
          { key: 'hasSpecial', label: 'One special character' },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center gap-1">
            {rules[key as keyof typeof rules] ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <X className="h-3 w-3 text-muted-foreground" />
            )}
            <span className={`text-xs ${
              rules[key as keyof typeof rules] ? 'text-green-500' : 'text-muted-foreground'
            }`}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
