/**
 * CheckoutForm Component
 *
 * Payment form with card details (mock validation only).
 */

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { CreditCard, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CheckoutFormData {
  cardName: string
  cardNumber: string
  expiryDate: string
  cvv: string
  email: string
}

export interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => void
  isLoading?: boolean
  className?: string
}

interface FormErrors {
  cardName?: string
  cardNumber?: string
  expiryDate?: string
  cvv?: string
  email?: string
}

export function CheckoutForm({
  onSubmit,
  isLoading = false,
  className,
}: CheckoutFormProps) {
  const [formData, setFormData] = useState<CheckoutFormData>({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    email: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.cardName.trim()) {
      newErrors.cardName = 'Name on card is required'
    }

    if (!formData.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      newErrors.cardNumber = 'Enter a valid 16-digit card number'
    }

    if (!formData.expiryDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
      newErrors.expiryDate = 'Enter a valid expiry date (MM/YY)'
    }

    if (!formData.cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = 'Enter a valid CVV (3-4 digits)'
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const formatCardNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const formatExpiryDate = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`
    }
    return digits
  }

  return (
    <Card className={className} data-testid="checkout-form">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            error={errors.email}
            data-testid="email-input"
          />

          <Input
            label="Name on Card"
            placeholder="John Doe"
            value={formData.cardName}
            onChange={(e) =>
              setFormData({ ...formData, cardName: e.target.value })
            }
            error={errors.cardName}
            data-testid="card-name-input"
          />

          <Input
            label="Card Number"
            placeholder="1234 5678 9012 3456"
            value={formData.cardNumber}
            onChange={(e) =>
              setFormData({
                ...formData,
                cardNumber: formatCardNumber(e.target.value),
              })
            }
            error={errors.cardNumber}
            maxLength={19}
            data-testid="card-number-input"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Expiry Date"
              placeholder="MM/YY"
              value={formData.expiryDate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  expiryDate: formatExpiryDate(e.target.value),
                })
              }
              error={errors.expiryDate}
              maxLength={5}
              data-testid="expiry-input"
            />

            <Input
              label="CVV"
              placeholder="123"
              type="password"
              value={formData.cvv}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  cvv: e.target.value.replace(/\D/g, '').slice(0, 4),
                })
              }
              error={errors.cvv}
              maxLength={4}
              data-testid="cvv-input"
            />
          </div>

          <div
            className={cn(
              'flex items-center gap-2 text-sm text-[var(--color-fg-muted)]',
              'p-3 bg-[var(--color-surface-elevated)] rounded-[var(--radius-md)]'
            )}
          >
            <Lock className="h-4 w-4" />
            <span>Your payment information is secure and encrypted</span>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            data-testid="confirm-booking-btn"
          >
            {isLoading ? 'Processing...' : 'Confirm Booking'}
          </Button>
        </form>
      </CardBody>
    </Card>
  )
}
