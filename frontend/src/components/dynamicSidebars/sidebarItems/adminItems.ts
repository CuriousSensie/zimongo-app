import { Paperclip } from "lucide-react";
import {
  FaBuilding,
  FaStore,
  FaGavel,
  FaChartLine,
  FaGear,
  FaGaugeHigh,
  FaUsers,
  FaListCheck,
  FaBell,
} from "react-icons/fa6";
import { FaShieldAlt } from "react-icons/fa";

export const AdminSidebarItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: FaGaugeHigh,
    separator: false,
    isTitle: false,
  },
  {
    label: "User Management",
    href: "/users",
    icon: FaBuilding,
    separator: false,
    isTitle: false,
  },
  {
    label: "Leads Management",
    href: "/leads",
    icon: FaStore,
    separator: false,
    isTitle: false,
  },
  {
    label: "Spams and Reportings",
    href: "/spams",
    icon: Paperclip,
    separator: false,
    isTitle: false,
  },
  {
    label: "Permissions",
    href: "/permission",
    icon: FaShieldAlt,
    separator: false,
    isTitle: false,
  },
  {
    label: "Reports & Analytics",
    href: "/reports-analytics",
    icon: FaChartLine,
    separator: false,
    isTitle: false,
  },
  {
    label: "System Settings",
    href: "/system-settings",
    icon: FaGear,
    separator: false,
    isTitle: false,
  },
  {
    label: "Notifications",
    href: "/notification",
    icon: FaBell,
    separator: false,
    isTitle: false,
  },
];
