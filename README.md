# Tabloo - Flexible Project Workspace

A fully functional web application for organizing projects, managing data with customizable tables, and creating structured workflows. Built with React, Vite, Flowbite, and IndexedDB for local-first data persistence.

## Features

### ✨ Core Features
- **Project Management**: Create, organize, and manage multiple projects
- **Nested Sections**: Unlimited depth organization with sections and sub-sections  
- **Dynamic Tables**: Airtable-style tables with custom schemas
- **Multiple Column Types**: Text, Number, Date, Status, Dropdown, Boolean, Email, URL, and more
- **Template System**: Pre-built templates for common use cases (Project Management, CRM, Bug Tracker, etc.)
- **Local Storage**: All data stored locally using IndexedDB
- **Responsive UI**: Works on desktop and mobile devices

### 📊 Table Features
- Inline editing
- Custom column types
- Required fields
- Status badges with color coding
- Dropdown options
- Nested tables (tables within records)
- Search and filter records
- Column management

### 🎨 Built-in Templates
1. **Project Management** - Track tasks, status, and assignments
2. **To-Do List** - Simple task tracking
3. **Bug Tracker** - Track bugs and issues
4. **CRM Contacts** - Manage customer contacts
5. **Inventory** - Track inventory and stock
6. **Content Calendar** - Plan and schedule content
7. **Blank Table** - Start from scratch

## Tech Stack

- **Frontend**: React 19.2
- **Build Tool**: Vite 7.3
- **UI Components**: Flowbite React 0.7.2
- **Styling**: TailwindCSS 3.4
- **State Management**: Zustand 4.5
- **Routing**: React Router DOM 6.22
- **Storage**: IndexedDB (via idb 8.0)
- **Icons**: Lucide React 0.344
- **Date Handling**: date-fns 3.3

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## Project Structure

```
tabloo/
├── src/
│   ├── components/          # React components
│   │   ├── common/         # Reusable UI components
│   │   ├── layout/         # Layout components (Sidebar, Layout)
│   │   ├── sections/       # Section components
│   │   ├── tables/         # Table components
│   │   └── workspace/      # Workspace components
│   │
│   ├── pages/              # Page components
│   │   ├── WorkspacePage.jsx
│   │   ├── ProjectPage.jsx
│   │   └── TablePage.jsx
│   │
│   ├── services/           # Services layer
│   │   └── indexedDB.js    # IndexedDB operations
│   │
│   ├── store/              # State management
│   │   └── store.js        # Zustand store
│   │
│   ├── templates/          # Table templates
│   │   └── defaultTemplates.js
│   │
│   ├── utils/              # Utility functions
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── validation.js
│   │
│   ├── hooks/              # Custom React hooks
│   │   └── useApiData.js
│   │
│   ├── App.jsx             # Main App component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
│
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
└── postcss.config.js       # PostCSS configuration
```

## Usage Guide

### Creating a Project
1. Click "New Project" on the workspace page
2. Enter project name and description
3. Choose an icon and color (optional)
4. Click "Create"

### Creating Sections
1. Open a project
2. Click "New Section"
3. Enter section name
4. Sections can be nested within other sections

### Creating Tables
1. Inside a project or section, click "New Table"
2. Enter table name
3. Choose a template or start blank
4. Customize columns as needed

### Managing Columns
1. Open a table
2. Click "Manage Columns"
3. Add, edit, or delete columns
4. Configure column types and options
5. Set required fields

### Working with Records
1. Click "Add Record" to create a new row
2. Click on any cell to edit inline
3. Data saves automatically
4. Use search to filter records

## Column Types Reference

| Type | Description | Use Case |
|------|-------------|----------|
| Text | Single line text | Names, titles, short descriptions |
| Long Text | Multi-line text | Descriptions, notes, comments |
| Number | Numeric values | Quantities, prices, scores |
| Boolean | True/False checkbox | Completed, active, enabled |
| Date | Date picker | Due dates, created dates |
| Status | Color-coded dropdown | Task status, stages |
| Dropdown | Custom options | Priority, category, type |
| Tags | Multiple selections | Labels, categories |
| Email | Email address with validation | Contact emails |
| URL | Web link with validation | External links, resources |
| API Dropdown | Options from API | Dynamic data from external source |
| Calculated | Computed field | Formulas, calculations |
| Nested Table | Table within a record | Sub-tasks, line items |
| Relation | Link to another table | References, relationships |
| JSON | Raw JSON data | Advanced data structures |

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Local Storage

All data is stored locally in your browser using IndexedDB. Data persists across sessions but is specific to the browser and device. To backup data, use the export feature (if implemented) or browser DevTools.

## Performance Notes

- Handles thousands of records efficiently
- Lazy loading for large datasets
- Optimized re-renders with React memoization
- Virtual scrolling ready for future scaling

## Known Limitations

- No cloud sync (local-first architecture)
- No multi-user collaboration
- No authentication/login system
- Data is browser-specific

## Development

### Code Style
- Use ES6+ features
- Follow React best practices
- Component-driven architecture
- Clean, commented code

### Adding New Column Types
1. Add type to `COLUMN_TYPES` in `constants.js`
2. Add label to `COLUMN_TYPE_LABELS`
3. Implement rendering in `TableCell.jsx`
4. Add validation in `validation.js`

### Creating New Templates
1. Add template object to `DEFAULT_TEMPLATES` in `defaultTemplates.js`
2. Define columns with types and options
3. Template will be available on app initialization

## Troubleshooting

### Data not persisting
- Check browser console for IndexedDB errors
- Ensure browser supports IndexedDB
- Check browser privacy settings

### Performance issues
- Clear old data from IndexedDB
- Limit number of visible records
- Reduce number of columns

### UI not loading
- Clear browser cache
- Check console for JavaScript errors
- Ensure all dependencies installed

## Contributing

This is a production-ready application. Future enhancements could include:
- Export/Import functionality
- Advanced formulas and calculations
- Rich text editing
- File attachments
- Advanced filtering and sorting
- Chart visualizations
- Template marketplace

## License

MIT License - feel free to use for personal or commercial projects.

## Support

For issues or questions, please check:
1. Browser console for errors
2. IndexedDB storage in DevTools
3. Network tab for API issues

---

**Built with ❤️ using React, Flowbite, and TailwindCSS**
