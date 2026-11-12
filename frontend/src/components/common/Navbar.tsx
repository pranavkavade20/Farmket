import PublicNavbar from './PublicNavbar';
import DashboardNavbar from './DashboardNavbar';

export interface NavbarProps {
  isDashboard?: boolean;
  onToggleMobileSidebar?: () => void;
  className?: string;
}

/**
 * Unified Navbar component for Farmket.
 * Serves PublicNavbar for marketing & public browsing,
 * and DashboardNavbar for authenticated application workspaces.
 */
export const Navbar = ({
  isDashboard = false,
  onToggleMobileSidebar,
  className,
}: NavbarProps) => {
  if (isDashboard) {
    return (
      <DashboardNavbar
        onToggleMobileSidebar={onToggleMobileSidebar}
        className={className}
      />
    );
  }

  return <PublicNavbar className={className} />;
};

export default Navbar;
