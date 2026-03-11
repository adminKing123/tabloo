import { create } from 'zustand';
import * as db from '../services/indexedDB';

/**
 * Main application store using Zustand
 */
export const useStore = create((set, get) => ({
  // Projects
  projects: [],
  currentProject: null,
  
  // Sections
  sections: [],
  
  // Tables
  tables: [],
  currentTable: null,
  
  // Global Tables (workspace-level tables)
  globalTables: [],
  
  // Records
  records: [],
  
  // Columns
  columns: [],
  
  // Templates
  templates: [],
  
  // Global Fields
  globalFields: [],
  
  // UI State
  loading: false,
  error: null,
  sidebarOpen: true,
  
  // Actions
  
  /**
   * Initialize app - load initial data
   */
  initialize: async () => {
    set({ loading: true });
    try {
      const projects = await db.getProjects();
      const templates = await db.getTemplates();
      const globalFields = await db.getGlobalFields();
      const globalTables = await db.getGlobalTables();
      set({ projects, templates, globalFields, globalTables, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  /**
   * Project Actions
   */
  loadProjects: async () => {
    try {
      const projects = await db.getProjects();
      set({ projects });
    } catch (error) {
      set({ error: error.message });
    }
  },
  
  createProject: async (projectData) => {
    set({ loading: true });
    try {
      const project = await db.createProject(projectData);
      set((state) => ({
        projects: [...state.projects, project],
        loading: false
      }));
      return project;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  updateProject: async (id, updates) => {
    try {
      const updated = await db.updateProject(id, updates);
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? updated : p)),
        currentProject: state.currentProject?.id === id ? updated : state.currentProject
      }));
      return updated;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  deleteProject: async (id) => {
    try {
      await db.deleteProject(id);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  setCurrentProject: async (projectId) => {
    set({ loading: true });
    try {
      const project = await db.getProject(projectId);
      const sections = await db.getSections(projectId);
      const tables = await db.getTables(projectId);
      
      set({
        currentProject: project,
        sections,
        tables,
        loading: false
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  /**
   * Section Actions
   */
  createSection: async (sectionData) => {
    try {
      const section = await db.createSection(sectionData);
      set((state) => ({
        sections: [...state.sections, section]
      }));
      return section;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  updateSection: async (id, updates) => {
    try {
      const updated = await db.updateSection(id, updates);
      set((state) => ({
        sections: state.sections.map((s) => (s.id === id ? updated : s))
      }));
      return updated;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  deleteSection: async (id) => {
    try {
      await db.deleteSection(id);
      set((state) => ({
        sections: state.sections.filter((s) => s.id !== id)
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  /**
   * Table Actions
   */
  createTable: async (tableData) => {
    let table;
    try {
      table = await db.createTable(tableData);
      
      // Create columns if provided
      if (tableData.columns) {
        for (const columnData of tableData.columns) {
          try {
            // Don't pass the id from template - let DB generate new unique IDs
            const { id, ...columnWithoutId } = columnData;
            await db.createColumn({
              ...columnWithoutId,
              tableId: table.id
            });
          } catch (columnError) {
            // Silently skip columns that fail (likely due to duplicate IDs from old data)
            // They will be created with new IDs on next attempt
            if (columnError.name !== 'ConstraintError') {
              console.error('Failed to create column:', columnError);
            }
          }
        }
      }
      
      set((state) => ({
        tables: table.projectId ? [...state.tables, table] : state.tables,
        globalTables: !table.projectId ? [...state.globalTables, table] : state.globalTables
      }));
      
      return table;
    } catch (error) {
      // Only set error and throw if table creation itself failed
      if (!table) {
        set({ error: error.message });
        throw error;
      }
      // If table was created but columns failed, still return the table
      return table;
    }
  },
  
  updateTable: async (id, updates) => {
    try {
      const updated = await db.updateTable(id, updates);
      set((state) => ({
        tables: state.tables.map((t) => (t.id === id ? updated : t)),
        globalTables: state.globalTables.map((t) => (t.id === id ? updated : t)),
        currentTable: state.currentTable?.id === id ? updated : state.currentTable
      }));
      return updated;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  deleteTable: async (id) => {
    try {
      await db.deleteTable(id);
      set((state) => ({
        tables: state.tables.filter((t) => t.id !== id),
        globalTables: state.globalTables.filter((t) => t.id !== id),
        currentTable: state.currentTable?.id === id ? null : state.currentTable,
        records: state.currentTable?.id === id ? [] : state.records,
        columns: state.currentTable?.id === id ? [] : state.columns
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  loadGlobalTables: async () => {
    try {
      const globalTables = await db.getGlobalTables();
      set({ globalTables });
    } catch (error) {
      set({ error: error.message });
    }
  },
  
  setCurrentTable: async (tableId) => {
    set({ loading: true });
    try {
      const table = await db.getTable(tableId);
      const records = await db.getRecords(tableId);
      const columns = await db.getColumns(tableId);
      
      set({
        currentTable: table,
        records,
        columns,
        loading: false
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  /**
   * Column Actions
   */
  createColumn: async (columnData) => {
    try {
      const column = await db.createColumn(columnData);
      set((state) => ({
        columns: [...state.columns, column]
      }));
      return column;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  updateColumn: async (id, updates) => {
    try {
      const updated = await db.updateColumn(id, updates);
      set((state) => ({
        columns: state.columns.map((c) => (c.id === id ? updated : c))
      }));
      return updated;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateColumns: async (columnsToUpdate) => {
    try {
      const updatedColumns = [];
      for (const column of columnsToUpdate) {
        const updated = await db.updateColumn(column.id, column);
        updatedColumns.push(updated);
      }
      
      set((state) => ({
        columns: state.columns.map((c) => {
          const updated = updatedColumns.find(uc => uc.id === c.id);
          return updated || c;
        })
      }));
      
      return updatedColumns;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  deleteColumn: async (id) => {
    try {
      await db.deleteColumn(id);
      set((state) => ({
        columns: state.columns.filter((c) => c.id !== id)
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  /**
   * Record Actions
   */
  createRecord: async (recordData) => {
    try {
      const record = await db.createRecord(recordData);
      set((state) => ({
        records: [...state.records, record]
      }));
      return record;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  updateRecord: async (id, updates) => {
    try {
      const updated = await db.updateRecord(id, updates);
      set((state) => ({
        records: state.records.map((r) => (r.id === id ? updated : r))
      }));
      return updated;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateRecords: async (recordsToUpdate) => {
    try {
      const updatedRecords = [];
      for (const record of recordsToUpdate) {
        const updated = await db.updateRecord(record.id, record);
        updatedRecords.push(updated);
      }
      
      set((state) => ({
        records: state.records.map((r) => {
          const updated = updatedRecords.find(ur => ur.id === r.id);
          return updated || r;
        })
      }));
      
      return updatedRecords;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  deleteRecord: async (id) => {
    try {
      await db.deleteRecord(id);
      set((state) => ({
        records: state.records.filter((r) => r.id !== id)
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  /**
   * Template Actions
   */
  loadTemplates: async () => {
    try {
      const templates = await db.getTemplates();
      set({ templates });
    } catch (error) {
      set({ error: error.message });
    }
  },
  
  createTemplate: async (templateData) => {
    try {
      const template = await db.createTemplate(templateData);
      set((state) => ({
        templates: [...state.templates, template]
      }));
      return template;
    } catch (error) {
      // Only set error for non-constraint errors (template already exists is ok)
      if (error.name !== 'ConstraintError') {
        set({ error: error.message });
      }
      throw error;
    }
  },

  /**
   * Global Fields Actions
   */
  loadGlobalFields: async () => {
    try {
      const globalFields = await db.getGlobalFields();
      set({ globalFields });
    } catch (error) {
      set({ error: error.message });
    }
  },

  createGlobalField: async (fieldData) => {
    try {
      const field = await db.createGlobalField(fieldData);
      set((state) => ({
        globalFields: [...state.globalFields, field]
      }));
      return field;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateGlobalField: async (id, updates) => {
    try {
      const updated = await db.updateGlobalField(id, updates);
      set((state) => ({
        globalFields: state.globalFields.map((f) => (f.id === id ? updated : f))
      }));
      return updated;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteGlobalField: async (id) => {
    try {
      await db.deleteGlobalField(id);
      set((state) => ({
        globalFields: state.globalFields.filter((f) => f.id !== id)
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  /**
   * UI Actions
   */
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },
  
  clearError: () => {
    set({ error: null });
  }
}));
