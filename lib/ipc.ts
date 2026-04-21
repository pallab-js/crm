import { invoke } from '@tauri-apps/api/core'

export interface Activity {
  id: string
  message: string
  timestamp: string
}

export interface DashboardState {
  stats: { label: string; value: string; delta?: number }[]
  recent: Activity[]
}

export interface Company {
  id: string
  name: string
  domain: string
  industry: string
  phone: string
  address: string
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  company_id?: string
  status: string
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  contact_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface Email {
  id: string
  contact_id: string
  subject: string
  body: string
  direction: 'inbound' | 'outbound'
  created_at: string
}

export interface Deal {
  id: string
  title: string
  value: number
  stage: string
  probability: number
  contact_id: string
  company_id?: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: string
  due_date: string
  recurring?: string
  contact_id?: string
  deal_id?: string
  created_at: string
  updated_at: string
}

export interface AppSettings {
  theme: 'dark' | 'light'
  tags: string[]
}

export interface AppData {
  dashboard: DashboardState
  companies: Company[]
  contacts: Contact[]
  notes: Note[]
  emails: Email[]
  deals: Deal[]
  tasks: Task[]
  settings: AppSettings
}

export const fetchAppData = (): Promise<AppData> =>
  invoke('load_app_data')

export const saveAppData = (data: AppData): Promise<void> =>
  invoke('save_app_data', { data })

export const fetchSystemInfo = (): Promise<Record<string, string>> =>
  invoke('get_system_info')