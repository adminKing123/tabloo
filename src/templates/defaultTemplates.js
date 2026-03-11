import { COLUMN_TYPES, DEFAULT_STATUS_OPTIONS, DEFAULT_PRIORITY_OPTIONS } from '../utils/constants';

/**
 * Default Table Templates
 */

export const DEFAULT_TEMPLATES = [
  {
    id: 'template-project-management',
    name: 'Project Management',
    description: 'Track tasks, status, and assignments',
    icon: 'BarChart2',
    columns: [
      {
        id: 'col-task-name',
        name: 'Task Name',
        type: COLUMN_TYPES.TEXT,
        required: true,
        order: 0
      },
      {
        id: 'col-status',
        name: 'Status',
        type: COLUMN_TYPES.STATUS,
        options: DEFAULT_STATUS_OPTIONS,
        required: false,
        order: 1
      },
      {
        id: 'col-priority',
        name: 'Priority',
        type: COLUMN_TYPES.DROPDOWN,
        options: DEFAULT_PRIORITY_OPTIONS,
        required: false,
        order: 2
      },
      {
        id: 'col-assignee',
        name: 'Assignee',
        type: COLUMN_TYPES.TEXT,
        required: false,
        order: 3
      },
      {
        id: 'col-start-date',
        name: 'Start Date',
        type: COLUMN_TYPES.DATE,
        required: false,
        order: 4
      },
      {
        id: 'col-due-date',
        name: 'Due Date',
        type: COLUMN_TYPES.DATE,
        required: false,
        order: 5
      },
      {
        id: 'col-description',
        name: 'Description',
        type: COLUMN_TYPES.LONG_TEXT,
        required: false,
        order: 6
      }
    ]
  },
  
  {
    id: 'template-todo',
    name: 'To-Do List',
    description: 'Simple task tracking',
    icon: 'CheckCircle2',
    columns: [
      {
        id: 'col-title',
        name: 'Title',
        type: COLUMN_TYPES.TEXT,
        required: true,
        order: 0
      },
      {
        id: 'col-completed',
        name: 'Completed',
        type: COLUMN_TYPES.BOOLEAN,
        required: false,
        order: 1
      },
      {
        id: 'col-due-date',
        name: 'Due Date',
        type: COLUMN_TYPES.DATE,
        required: false,
        order: 2
      },
      {
        id: 'col-priority',
        name: 'Priority',
        type: COLUMN_TYPES.DROPDOWN,
        options: DEFAULT_PRIORITY_OPTIONS,
        required: false,
        order: 3
      },
      {
        id: 'col-notes',
        name: 'Notes',
        type: COLUMN_TYPES.LONG_TEXT,
        required: false,
        order: 4
      }
    ]
  },
  
  {
    id: 'template-bug-tracker',
    name: 'Bug Tracker',
    description: 'Track bugs and issues',
    icon: 'Bug',
    columns: [
      {
        id: 'col-bug-title',
        name: 'Bug Title',
        type: COLUMN_TYPES.TEXT,
        required: true,
        order: 0
      },
      {
        id: 'col-status',
        name: 'Status',
        type: COLUMN_TYPES.STATUS,
        options: [
          { label: 'Open', color: '#EF4444' },
          { label: 'In Progress', color: '#F59E0B' },
          { label: 'Testing', color: '#3B82F6' },
          { label: 'Closed', color: '#10B981' }
        ],
        required: false,
        order: 1
      },
      {
        id: 'col-severity',
        name: 'Severity',
        type: COLUMN_TYPES.DROPDOWN,
        options: [
          { label: 'Critical', color: '#DC2626' },
          { label: 'High', color: '#F59E0B' },
          { label: 'Medium', color: '#3B82F6' },
          { label: 'Low', color: '#6B7280' }
        ],
        required: false,
        order: 2
      },
      {
        id: 'col-reported-by',
        name: 'Reported By',
        type: COLUMN_TYPES.TEXT,
        required: false,
        order: 3
      },
      {
        id: 'col-assigned-to',
        name: 'Assigned To',
        type: COLUMN_TYPES.TEXT,
        required: false,
        order: 4
      },
      {
        id: 'col-created-date',
        name: 'Created Date',
        type: COLUMN_TYPES.DATE,
        required: false,
        order: 5
      },
      {
        id: 'col-description',
        name: 'Description',
        type: COLUMN_TYPES.LONG_TEXT,
        required: false,
        order: 6
      }
    ]
  },
  
  {
    id: 'template-crm-contacts',
    name: 'CRM Contacts',
    description: 'Manage customer contacts',
    icon: 'Users',
    columns: [
      {
        id: 'col-name',
        name: 'Name',
        type: COLUMN_TYPES.TEXT,
        required: true,
        order: 0
      },
      {
        id: 'col-email',
        name: 'Email',
        type: COLUMN_TYPES.EMAIL,
        required: false,
        order: 1
      },
      {
        id: 'col-phone',
        name: 'Phone',
        type: COLUMN_TYPES.TEXT,
        required: false,
        order: 2
      },
      {
        id: 'col-company',
        name: 'Company',
        type: COLUMN_TYPES.TEXT,
        required: false,
        order: 3
      },
      {
        id: 'col-status',
        name: 'Status',
        type: COLUMN_TYPES.STATUS,
        options: [
          { label: 'Lead', color: '#F59E0B' },
          { label: 'Prospect', color: '#3B82F6' },
          { label: 'Customer', color: '#10B981' },
          { label: 'Inactive', color: '#6B7280' }
        ],
        required: false,
        order: 4
      },
      {
        id: 'col-notes',
        name: 'Notes',
        type: COLUMN_TYPES.LONG_TEXT,
        required: false,
        order: 5
      }
    ]
  },
  
  {
    id: 'template-inventory',
    name: 'Inventory',
    description: 'Track inventory and stock',
    icon: 'Package',
    columns: [
      {
        id: 'col-item-name',
        name: 'Item Name',
        type: COLUMN_TYPES.TEXT,
        required: true,
        order: 0
      },
      {
        id: 'col-sku',
        name: 'SKU',
        type: COLUMN_TYPES.TEXT,
        required: false,
        order: 1
      },
      {
        id: 'col-quantity',
        name: 'Quantity',
        type: COLUMN_TYPES.NUMBER,
        required: false,
        order: 2
      },
      {
        id: 'col-price',
        name: 'Price',
        type: COLUMN_TYPES.NUMBER,
        required: false,
        order: 3
      },
      {
        id: 'col-category',
        name: 'Category',
        type: COLUMN_TYPES.DROPDOWN,
        options: [
          { label: 'Electronics', color: '#3B82F6' },
          { label: 'Clothing', color: '#EC4899' },
          { label: 'Food', color: '#10B981' },
          { label: 'Other', color: '#6B7280' }
        ],
        required: false,
        order: 4
      },
      {
        id: 'col-supplier',
        name: 'Supplier',
        type: COLUMN_TYPES.TEXT,
        required: false,
        order: 5
      },
      {
        id: 'col-notes',
        name: 'Notes',
        type: COLUMN_TYPES.LONG_TEXT,
        required: false,
        order: 6
      }
    ]
  },
  
  {
    id: 'template-content-calendar',
    name: 'Content Calendar',
    description: 'Plan and schedule content',
    icon: 'Calendar',
    columns: [
      {
        id: 'col-title',
        name: 'Content Title',
        type: COLUMN_TYPES.TEXT,
        required: true,
        order: 0
      },
      {
        id: 'col-type',
        name: 'Type',
        type: COLUMN_TYPES.DROPDOWN,
        options: [
          { label: 'Blog Post', color: '#3B82F6' },
          { label: 'Social Media', color: '#EC4899' },
          { label: 'Video', color: '#EF4444' },
          { label: 'Newsletter', color: '#10B981' }
        ],
        required: false,
        order: 1
      },
      {
        id: 'col-status',
        name: 'Status',
        type: COLUMN_TYPES.STATUS,
        options: [
          { label: 'Idea', color: '#6B7280' },
          { label: 'Draft', color: '#F59E0B' },
          { label: 'Review', color: '#3B82F6' },
          { label: 'Published', color: '#10B981' }
        ],
        required: false,
        order: 2
      },
      {
        id: 'col-author',
        name: 'Author',
        type: COLUMN_TYPES.TEXT,
        required: false,
        order: 3
      },
      {
        id: 'col-publish-date',
        name: 'Publish Date',
        type: COLUMN_TYPES.DATE,
        required: false,
        order: 4
      },
      {
        id: 'col-url',
        name: 'URL',
        type: COLUMN_TYPES.URL,
        required: false,
        order: 5
      },
      {
        id: 'col-notes',
        name: 'Notes',
        type: COLUMN_TYPES.LONG_TEXT,
        required: false,
        order: 6
      }
    ]
  },
  
  {
    id: 'template-blank',
    name: 'Blank Table',
    description: 'Start from scratch',
    icon: 'FileText',
    columns: [
      {
        id: 'col-name',
        name: 'Name',
        type: COLUMN_TYPES.TEXT,
        required: true,
        order: 0
      }
    ]
  }
];

/**
 * Initialize default templates in database
 */
export const initializeDefaultTemplates = async (createTemplate) => {
  for (const template of DEFAULT_TEMPLATES) {
    try {
      await createTemplate(template);
    } catch (error) {
      // Silently ignore if template already exists
      if (error.name !== 'ConstraintError') {
        console.error(`Failed to create template ${template.name}:`, error);
      }
    }
  }
};
