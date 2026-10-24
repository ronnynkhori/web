import { createElement } from "react";
import {
  Bed,
  Calendar,
  Camera,
  Check,
  CircleAlert,
  Clock,
  Download,
  Globe,
  IdCard,
  Image,
  Info,
  LayoutDashboard,
  List,
  type LucideIcon,
  type LucideProps,
  MapPin,
  Megaphone,
  MessageSquare,
  Newspaper,
  Plane,
  Radio,
  Shield,
  Star,
  Trophy,
  Tv,
} from "lucide-react";
import type { IconName } from "@/components/ui/icon";

/** The content schemas name icons with the public site's set; the Control Room draws them with lucide. */
const map: Partial<Record<IconName, LucideIcon>> = {
  grid: LayoutDashboard,
  live: Radio,
  list: List,
  check: Check,
  trophy: Trophy,
  calendar: Calendar,
  globe: Globe,
  megaphone: Megaphone,
  download: Download,
  info: Info,
  chat: MessageSquare,
  pin: MapPin,
  star: Star,
  camera: Camera,
  image: Image,
  id: IdCard,
  clock: Clock,
  news: Newspaper,
  plane: Plane,
  bed: Bed,
  shield: Shield,
  tv: Tv,
  alert: CircleAlert,
};

export function iconFor(name: IconName): LucideIcon {
  return map[name] ?? Info;
}

export function AdminIcon({ name, ...props }: { name: IconName } & LucideProps) {
  return createElement(iconFor(name), { "aria-hidden": true, ...props });
}
