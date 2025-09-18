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
} from "react-icons/fa6";
import { FaPiggyBank } from "react-icons/fa6";
import { FaShieldAlt } from "react-icons/fa";

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
    separator: true,
    isTitle: false,
  },
  {
    label: "Advertise Yourself",
    href: "/advertisements",
    icon: FaGavel,
    separator: false,
    isTitle: false,
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: FaTruck,
    separator: false,
    isTitle: false,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: FaFileInvoice,
    separator: false,
    isTitle: false,
  },
  {
    label: "Settings",
    href: `/settings`,
    icon: FaPiggyBank,
    separator: false,
    isTitle: false,
  },
];
