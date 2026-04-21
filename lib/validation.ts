export const sanitize = (str: string): string => str.trim()

export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const isValidPhone = (phone: string): boolean => {
  if (!phone) return true
  const re = /^[\d\s\-\+\(\)]{7,20}$/
  return re.test(phone)
}

export const isValidName = (name: string): boolean => {
  return name.trim().length >= 1 && name.trim().length <= 100
}

export const isValidNumber = (val: unknown): boolean => {
  return typeof val === 'number' && !isNaN(val) && val >= 0
}

export interface ValidationError {
  field: string
  message: string
}

export const validateContact = (data: { name: string; email: string; phone?: string }): ValidationError[] => {
  const errors: ValidationError[] = []
  if (!isValidName(data.name)) errors.push({ field: 'name', message: 'Name is required' })
  if (!isValidEmail(data.email)) errors.push({ field: 'email', message: 'Invalid email format' })
  if (data.phone && !isValidPhone(data.phone)) errors.push({ field: 'phone', message: 'Invalid phone format' })
  return errors
}

export const validateDeal = (data: { title: string; value: number }): ValidationError[] => {
  const errors: ValidationError[] = []
  if (!isValidName(data.title)) errors.push({ field: 'title', message: 'Title is required' })
  if (!isValidNumber(data.value)) errors.push({ field: 'value', message: 'Invalid value' })
  return errors
}

export const validateCompany = (data: { name: string; domain?: string }): ValidationError[] => {
  const errors: ValidationError[] = []
  if (!isValidName(data.name)) errors.push({ field: 'name', message: 'Name is required' })
  if (data.domain && !/^[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z]{2,})+$/.test(data.domain)) {
    errors.push({ field: 'domain', message: 'Invalid domain format' })
  }
  return errors
}