/**
 * UI Component Exports
 * 
 * All reusable UI components are exported from here.
 * Import as: import { Button, Select, ConfirmDialog } from '@/components/ui'
 */

// Button
export { Button, buttonVariants } from './Button'
export type { ButtonProps } from './Button'

// Spinner
export { Spinner } from './Spinner'

// Select
export { Select } from './Select'
export type { SelectProps, SelectOption } from './Select'

// Dialog System
export {
  // Base components
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  // Pre-built dialogs
  AlertDialog,
  ConfirmDialog,
  PromptDialog,
  CustomDialog,
  // Types
  type DialogVariant,
  type AlertDialogProps,
  type ConfirmDialogProps,
  type PromptDialogProps,
  type CustomDialogProps,
} from './Dialog'

// Dialog Provider & Hook
export { 
  DialogProvider, 
  useDialog,
  type AlertOptions,
  type ConfirmOptions,
  type PromptOptions,
} from './DialogProvider'

// Card
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardBody,
  CardFooter,
} from './Card'
export type {
  CardProps,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
} from './Card'

// Input
export { Input } from './Input'
export type { InputProps } from './Input'

// Badge
export { Badge, badgeVariants } from './Badge'
export type { BadgeProps } from './Badge'

// Rating
export { Rating } from './Rating'
export type { RatingProps } from './Rating'

// EmptyState
export { EmptyState } from './EmptyState'
export type { EmptyStateProps } from './EmptyState'

// Add more component exports as they are created:
// export { Toast } from './Toast'
// export { Table } from './Table'
// export { Loading } from './Loading'
