import { Paperclip, UserCog, ShoppingBasket, Bookmark } from "lucide-react";
import {
  FaStore,
  FaChartLine,
  FaGear,
  FaGaugeHigh,
  FaUsers,
  FaListCheck,
  FaBell,
  FaCircleCheck,
  FaGavel,
  FaTruck,
  FaFileInvoice,
  FaPlus,
  FaUser,
} from "react-icons/fa6";
import { FaPiggyBank } from "react-icons/fa6";
import { FaCogs, FaShieldAlt } from "react-icons/fa";

export const getUserSidebarItems = (profileId: string) => [
  {
    label: "Dashboard",
    href: "/",
    icon: FaGaugeHigh,
    separator: false,
    isTitle: false,
  },
  {
    label: "Post a Lead",
    href: "/post-lead",
    icon: FaPlus,
    separator: false,
    isTitle: false,
  },
  {
    label: "Mange Leads",
    href: `/leads`,
    icon: Paperclip,
    separator: false,
    isTitle: false,
  },
  {
    label: "Saved Leads",
    href: `/saved-leads`,
    icon: Bookmark,
    separator: false,
    isTitle: false,
  },
  {
    label: "Interactions",
    href: `/interactions`,
    icon: FaCircleCheck,
    separator: false,
    isTitle: false,
  },
  {
    label: "Advertise Yourself",
    href: "/advertisements",
    icon: FaGavel,
    separator: true,
    isTitle: false,
  },
  {
    label: "Account",
    href: "/",
    icon: FaBell,
    separator: false,
    isTitle: true,
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: FaBell,
    separator: false,
    isTitle: false,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: FaUser,
    separator: false,
    isTitle: false,
  },
  {
    label: "Settings",
    href: `/settings`,
    icon: FaCogs,
    separator: false,
    isTitle: false,
  },
];
