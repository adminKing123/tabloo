import { 
  Folder, 
  BarChart2, 
  Target, 
  Briefcase, 
  FileText, 
  Rocket, 
  Lightbulb, 
  Wrench, 
  TrendingUp, 
  Palette, 
  Building2, 
  Smartphone,
  CheckCircle2,
  Bug,
  Users,
  Package,
  Calendar,
  ClipboardList
} from 'lucide-react';

/**
 * Icon mapping for project and template icons
 */
const ICON_MAP = {
  Folder,
  BarChart2,
  Target,
  Briefcase,
  FileText,
  Rocket,
  Lightbulb,
  Wrench,
  TrendingUp,
  Palette,
  Building2,
  Smartphone,
  CheckCircle2,
  Bug,
  Users,
  Package,
  Calendar,
  ClipboardList
};

/**
 * ProjectIcon Component
 * Renders a lucide-react icon based on icon name
 */
export default function ProjectIcon({ icon, className = "w-6 h-6", ...props }) {
  const IconComponent = ICON_MAP[icon] || Folder;
  // Add default text color that adapts to dark mode if no color is specified
  const classes = className.includes('text-') 
    ? className 
    : `${className} text-gray-700 dark:text-gray-300`;
  return <IconComponent className={classes} {...props} />;
}

/**
 * Get icon component by name
 */
export function getIconComponent(iconName) {
  return ICON_MAP[iconName] || Folder;
}
