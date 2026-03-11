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
  return <IconComponent className={className} {...props} />;
}

/**
 * Get icon component by name
 */
export function getIconComponent(iconName) {
  return ICON_MAP[iconName] || Folder;
}
