// Facade: re-exports all domain stores as a single useAppStore hook for backward compatibility
import { useActivityStore } from './activityStore'
import { useContactsStore } from './contactsStore'
import { useCompaniesStore } from './companiesStore'
import { useDealsStore } from './dealsStore'
import { useTasksStore } from './tasksStore'
import { useUiStore } from './uiStore'
import { Contact, Company, Deal, Task, Note, Email } from '@/lib/ipc'

export const useAppStore = () => {
  const { dashboard } = useActivityStore()
  const { contacts, notes, emails, addContact, updateContact, deleteContact, addNote, deleteNote, addEmail, batchAddContacts } = useContactsStore()
  const { companies, addCompany, updateCompany, deleteCompany } = useCompaniesStore()
  const { deals, addDeal, updateDeal, deleteDeal, batchAddDeals } = useDealsStore()
  const { tasks, addTask, updateTask, deleteTask, batchAddTasks } = useTasksStore()
  const { loading, error, currentView, settings, saveError, clearSaveError, load, updateSettings, setCurrentView } = useUiStore()

  return {
    dashboard,
    contacts,
    notes,
    emails,
    companies,
    deals,
    tasks,
    settings,
    loading,
    error,
    saveError,
    currentView,
    load,
    addContact,
    updateContact,
    deleteContact,
    addNote,
    deleteNote,
    addEmail,
    addCompany,
    updateCompany,
    deleteCompany,
    addDeal,
    updateDeal,
    deleteDeal,
    addTask,
    updateTask,
    deleteTask,
    updateSettings,
    setCurrentView,
    clearSaveError,
    batchAdd: async (type: 'contacts' | 'deals' | 'tasks', records: (Contact | Deal | Task)[]) => {
      if (type === 'contacts') await batchAddContacts(records as Contact[])
      else if (type === 'deals') await batchAddDeals(records as Deal[])
      else if (type === 'tasks') await batchAddTasks(records as Task[])
    },
  }
}
