
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  FileText, Upload, Presentation, Search, 
  Home, Settings, PanelLeft, Book, Lightbulb 
} from 'lucide-react';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon: Icon, 
  label, 
  active = false, 
  onClick 
}) => {
  return (
    <Button
      variant="ghost"
      className={`w-full justify-start gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition-all duration-200 ${
        active 
          ? 'bg-accent text-accent-foreground hover:bg-accent/80' 
          : 'text-sidebar-foreground hover:bg-sidebar-accent/10'
      }`}
      onClick={onClick}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Button>
  );
};

interface AppSidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasDocs: boolean;
  hasSelection: boolean;
  hasPresentation: boolean;
}

const AppSidebar: React.FC<AppSidebarProps> = ({
  collapsed,
  toggleSidebar,
  activeTab,
  setActiveTab,
  hasDocs,
  hasSelection,
  hasPresentation
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className={`fixed left-0 top-0 z-30 h-full flex flex-col transition-all duration-300 bg-sidebar ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <h2 className="text-lg font-bold text-sidebar-foreground">
            AI Document Assistant
          </h2>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="text-sidebar-foreground hover:bg-sidebar-accent/10"
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <SidebarItem
          icon={Upload}
          label={collapsed ? '' : 'Upload'}
          active={activeTab === 'upload'}
          onClick={() => setActiveTab('upload')}
        />
        
        <SidebarItem
          icon={FileText}
          label={collapsed ? '' : 'Documents'}
          active={activeTab === 'documents'}
          onClick={() => setActiveTab('documents')}
        />
        
        <SidebarItem
          icon={Book}
          label={collapsed ? '' : 'View Document'}
          active={activeTab === 'view'}
          onClick={() => hasDocs ? setActiveTab('view') : null}
        />
        
        <SidebarItem
          icon={Presentation}
          label={collapsed ? '' : 'Generate Slides'}
          active={activeTab === 'generate'}
          onClick={() => hasSelection ? setActiveTab('generate') : null}
        />
        
        <SidebarItem
          icon={Search}
          label={collapsed ? '' : 'Preview Slides'}
          active={activeTab === 'preview'}
          onClick={() => hasPresentation ? setActiveTab('preview') : null}
        />
      </div>
      
      <div className="p-3 border-t border-sidebar-border">
        <SidebarItem
          icon={Settings}
          label={collapsed ? '' : 'Settings'}
          onClick={() => {}}
        />
      </div>
    </div>
  );
};

export default AppSidebar;
