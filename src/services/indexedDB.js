import { openDB } from 'idb';
import { DB_NAME, DB_VERSION, STORES } from '../utils/constants';

/**
 * Generate a unique ID
 */
const generateId = (prefix) => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Initialize IndexedDB
 */
export const initDB = async () => {
  return await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Projects store
      if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
        const projectStore = db.createObjectStore(STORES.PROJECTS, { keyPath: 'id' });
        projectStore.createIndex('createdAt', 'createdAt');
        projectStore.createIndex('updatedAt', 'updatedAt');
      }

      // Sections store
      if (!db.objectStoreNames.contains(STORES.SECTIONS)) {
        const sectionStore = db.createObjectStore(STORES.SECTIONS, { keyPath: 'id' });
        sectionStore.createIndex('projectId', 'projectId');
        sectionStore.createIndex('parentId', 'parentId');
      }

      // Tables store
      if (!db.objectStoreNames.contains(STORES.TABLES)) {
        const tableStore = db.createObjectStore(STORES.TABLES, { keyPath: 'id' });
        tableStore.createIndex('projectId', 'projectId');
        tableStore.createIndex('sectionId', 'sectionId');
        tableStore.createIndex('parentId', 'parentId');
      }

      // Records store
      if (!db.objectStoreNames.contains(STORES.RECORDS)) {
        const recordStore = db.createObjectStore(STORES.RECORDS, { keyPath: 'id' });
        recordStore.createIndex('tableId', 'tableId');
      }

      // Templates store
      if (!db.objectStoreNames.contains(STORES.TEMPLATES)) {
        const templateStore = db.createObjectStore(STORES.TEMPLATES, { keyPath: 'id' });
        templateStore.createIndex('name', 'name');
      }

      // Columns store
      if (!db.objectStoreNames.contains(STORES.COLUMNS)) {
        const columnStore = db.createObjectStore(STORES.COLUMNS, { keyPath: 'id' });
        columnStore.createIndex('tableId', 'tableId');
      }

      // Global Fields store
      if (!db.objectStoreNames.contains(STORES.GLOBAL_FIELDS)) {
        const globalFieldsStore = db.createObjectStore(STORES.GLOBAL_FIELDS, { keyPath: 'id' });
        globalFieldsStore.createIndex('name', 'name');
        globalFieldsStore.createIndex('createdAt', 'createdAt');
      }
    }
  });
};

/**
 * Generic database operations
 */

// Get all items from a store
export const getAll = async (storeName) => {
  const db = await initDB();
  return await db.getAll(storeName);
};

// Get item by ID
export const getById = async (storeName, id) => {
  const db = await initDB();
  return await db.get(storeName, id);
};

// Add item
export const add = async (storeName, item) => {
  const db = await initDB();
  await db.add(storeName, item);
  return item;
};

// Update item
export const update = async (storeName, item) => {
  const db = await initDB();
  await db.put(storeName, item);
  return item;
};

// Delete item
export const deleteItem = async (storeName, id) => {
  const db = await initDB();
  await db.delete(storeName, id);
};

// Get items by index
export const getByIndex = async (storeName, indexName, value) => {
  const db = await initDB();
  return await db.getAllFromIndex(storeName, indexName, value);
};

// Clear store
export const clearStore = async (storeName) => {
  const db = await initDB();
  await db.clear(storeName);
};

/**
 * Project operations
 */

export const createProject = async (projectData) => {
  const project = {
    ...projectData,
    id: projectData.id || generateId('project'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  return await add(STORES.PROJECTS, project);
};

export const getProjects = async () => {
  return await getAll(STORES.PROJECTS);
};

export const getProject = async (id) => {
  return await getById(STORES.PROJECTS, id);
};

export const updateProject = async (id, updates) => {
  const project = await getProject(id);
  if (!project) throw new Error('Project not found');
  
  const updated = {
    ...project,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  return await update(STORES.PROJECTS, updated);
};

export const deleteProject = async (id) => {
  // Delete project and all related data
  await deleteItem(STORES.PROJECTS, id);
  
  // Delete sections
  const sections = await getByIndex(STORES.SECTIONS, 'projectId', id);
  for (const section of sections) {
    await deleteSection(section.id);
  }
  
  // Delete tables
  const tables = await getByIndex(STORES.TABLES, 'projectId', id);
  for (const table of tables) {
    await deleteTable(table.id);
  }
};

/**
 * Section operations
 */

export const createSection = async (sectionData) => {
  const section = {
    ...sectionData,
    id: sectionData.id || generateId('section'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  return await add(STORES.SECTIONS, section);
};

export const getSections = async (projectId) => {
  return await getByIndex(STORES.SECTIONS, 'projectId', projectId);
};

export const getSection = async (id) => {
  return await getById(STORES.SECTIONS, id);
};

export const updateSection = async (id, updates) => {
  const section = await getSection(id);
  if (!section) throw new Error('Section not found');
  
  const updated = {
    ...section,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  return await update(STORES.SECTIONS, updated);
};

export const deleteSection = async (id) => {
  // Get child sections
  const childSections = await getByIndex(STORES.SECTIONS, 'parentId', id);
  for (const child of childSections) {
    await deleteSection(child.id);
  }
  
  // Delete tables in this section
  const tables = await getByIndex(STORES.TABLES, 'sectionId', id);
  for (const table of tables) {
    await deleteTable(table.id);
  }
  
  await deleteItem(STORES.SECTIONS, id);
};

/**
 * Table operations
 */

export const createTable = async (tableData) => {
  const table = {
    ...tableData,
    id: tableData.id || generateId('table'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  return await add(STORES.TABLES, table);
};

export const getTables = async (projectId) => {
  return await getByIndex(STORES.TABLES, 'projectId', projectId);
};

export const getGlobalTables = async () => {
  const db = await initDB();
  const tx = db.transaction(STORES.TABLES, 'readonly');
  const store = tx.objectStore(STORES.TABLES);
  const allTables = await store.getAll();
  // Return tables without a projectId (global tables)
  return allTables.filter(table => !table.projectId);
};

export const getTablesBySection = async (sectionId) => {
  return await getByIndex(STORES.TABLES, 'sectionId', sectionId);
};

export const getTable = async (id) => {
  return await getById(STORES.TABLES, id);
};

export const updateTable = async (id, updates) => {
  const table = await getTable(id);
  if (!table) throw new Error('Table not found');
  
  const updated = {
    ...table,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  return await update(STORES.TABLES, updated);
};

export const deleteTable = async (id) => {
  // Delete all records
  const records = await getRecords(id);
  for (const record of records) {
    await deleteRecord(record.id);
  }
  
  // Delete columns
  const columns = await getColumns(id);
  for (const column of columns) {
    await deleteColumn(column.id);
  }
  
  // Delete nested tables
  const nestedTables = await getByIndex(STORES.TABLES, 'parentId', id);
  for (const table of nestedTables) {
    await deleteTable(table.id);
  }
  
  await deleteItem(STORES.TABLES, id);
};

/**
 * Column operations
 */

export const createColumn = async (columnData) => {
  const column = {
    ...columnData,
    id: columnData.id || generateId('column'),
    createdAt: new Date().toISOString()
  };
  return await add(STORES.COLUMNS, column);
};

export const getColumns = async (tableId) => {
  return await getByIndex(STORES.COLUMNS, 'tableId', tableId);
};

export const getColumn = async (id) => {
  return await getById(STORES.COLUMNS, id);
};

export const updateColumn = async (id, updates) => {
  const column = await getColumn(id);
  if (!column) throw new Error('Column not found');
  
  const updated = { ...column, ...updates };
  return await update(STORES.COLUMNS, updated);
};

export const deleteColumn = async (id) => {
  await deleteItem(STORES.COLUMNS, id);
};

/**
 * Record operations
 */

export const createRecord = async (recordData) => {
  const record = {
    ...recordData,
    id: recordData.id || generateId('record'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  return await add(STORES.RECORDS, record);
};

export const getRecords = async (tableId) => {
  return await getByIndex(STORES.RECORDS, 'tableId', tableId);
};

export const getRecord = async (id) => {
  return await getById(STORES.RECORDS, id);
};

export const updateRecord = async (id, updates) => {
  const record = await getRecord(id);
  if (!record) throw new Error('Record not found');
  
  const updated = {
    ...record,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  return await update(STORES.RECORDS, updated);
};

export const deleteRecord = async (id) => {
  await deleteItem(STORES.RECORDS, id);
};

/**
 * Template operations
 */

export const createTemplate = async (templateData) => {
  const template = {
    ...templateData,
    id: templateData.id || generateId('template'),
    createdAt: new Date().toISOString()
  };
  return await add(STORES.TEMPLATES, template);
};

export const getTemplates = async () => {
  return await getAll(STORES.TEMPLATES);
};

export const getTemplate = async (id) => {
  return await getById(STORES.TEMPLATES, id);
};

export const updateTemplate = async (id, updates) => {
  const template = await getTemplate(id);
  if (!template) throw new Error('Template not found');
  
  const updated = { ...template, ...updates };
  return await update(STORES.TEMPLATES, updated);
};

export const deleteTemplate = async (id) => {
  await deleteItem(STORES.TEMPLATES, id);
};

/**
 * Global Fields operations
 */

export const createGlobalField = async (fieldData) => {
  const field = {
    ...fieldData,
    id: fieldData.id || generateId('field'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  return await add(STORES.GLOBAL_FIELDS, field);
};

export const getGlobalFields = async () => {
  return await getAll(STORES.GLOBAL_FIELDS);
};

export const getGlobalField = async (id) => {
  return await getById(STORES.GLOBAL_FIELDS, id);
};

export const updateGlobalField = async (id, updates) => {
  const field = await getGlobalField(id);
  if (!field) throw new Error('Global field not found');
  
  const updated = {
    ...field,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  return await update(STORES.GLOBAL_FIELDS, updated);
};

export const deleteGlobalField = async (id) => {
  await deleteItem(STORES.GLOBAL_FIELDS, id);
};
