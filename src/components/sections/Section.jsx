import { useState } from 'react';
import { Card, Button, Dropdown } from 'flowbite-react';
import { ChevronDown, ChevronRight, Plus, MoreVertical, Edit, Trash2, Table as TableIcon } from 'lucide-react';

/**
 * Section Component - Collapsible container for tables and nested sections
 */
export default function Section({ 
  section, 
  tables = [], 
  childSections = [],
  onAddTable,
  onAddSection,
  onEdit,
  onDelete,
  onTableClick,
  onEditTable,
  onDeleteTable,
  depth = 0
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const paddingLeft = depth * 24;

  return (
    <div
      className="border-l-2 border-gray-200 hover:border-blue-400 transition-colors"
      style={{ marginLeft: `${paddingLeft}px` }}
    >
      <Card className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
            <h3 className="text-lg font-semibold text-gray-900 break-words">
              {section.name}
            </h3>
            <span className="text-xs text-gray-500">
              ({tables.length} tables, {childSections.length} sections)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="xs"
              color="light"
              onClick={() => onAddTable(section.id)}
            >
              <TableIcon className="w-4 h-4 mr-1" />
              Add Table
            </Button>
            <Button
              size="xs"
              color="light"
              onClick={() => onAddSection(section.id)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Section
            </Button>
            <Dropdown
              label=""
              dismissOnClick={true}
              renderTrigger={() => (
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              )}
            >
              <Dropdown.Item icon={Edit} onClick={() => onEdit(section)}>
                Edit
              </Dropdown.Item>
              <Dropdown.Item icon={Trash2} onClick={() => onDelete(section)}>
                Delete
              </Dropdown.Item>
            </Dropdown>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-2">
            {/* Tables in this section */}
            {tables.length > 0 && (
              <div className="space-y-2">
                {tables.map((table) => (
                  <div
                    key={table.id}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                  >
                    <button
                      onClick={() => onTableClick(table)}
                      className="flex items-center gap-3 flex-1 text-left"
                    >
                      <TableIcon className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900 break-words">{table.name}</span>
                    </button>
                    <Dropdown
                      label=""
                      dismissOnClick={true}
                      renderTrigger={() => (
                        <button className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                      )}
                    >
                      <Dropdown.Item icon={Edit} onClick={() => onEditTable(table)}>
                        Edit
                      </Dropdown.Item>
                      <Dropdown.Item icon={Trash2} onClick={() => onDeleteTable(table)}>
                        Delete
                      </Dropdown.Item>
                    </Dropdown>
                  </div>
                ))}
              </div>
            )}

            {/* Message if empty */}
            {tables.length === 0 && childSections.length === 0 && (
              <p className="text-sm text-gray-500 italic">
                No tables or sections yet. Add one to get started.
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Render child sections recursively */}
      {isExpanded && childSections.length > 0 && (
        <div className="space-y-4">
          {childSections.map((childSection) => (
            <Section
              key={childSection.id}
              section={childSection}
              tables={tables}
              childSections={childSections}
              onAddTable={onAddTable}
              onAddSection={onAddSection}
              onEdit={onEdit}
              onDelete={onDelete}
              onTableClick={onTableClick}
              onEditTable={onEditTable}
              onDeleteTable={onDeleteTable}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
