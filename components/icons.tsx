import type { LucideIcon, LucideProps } from "lucide-react";
import {
  Bookmark,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  House,
  LayoutGrid,
  Loader2,
  Maximize,
  Menu,
  Play,
  Search,
  SkipBack,
  SkipForward,
  Star,
  Trash2,
  X,
} from "lucide-react";

type IconProps = LucideProps;

function make(Icon: LucideIcon, defaults?: IconProps) {
  return function IconWrapper({ className, ...props }: IconProps) {
    return (
      <Icon
        aria-hidden
        strokeWidth={1.8}
        className={className}
        {...defaults}
        {...props}
      />
    );
  };
}

export const PlayIcon = make(Play, { fill: "currentColor", stroke: "none" });
export const SearchIcon = make(Search);
export const MenuIcon = make(Menu);
export const XIcon = make(X);
export const ChevronLeftIcon = make(ChevronLeft);
export const ChevronRightIcon = make(ChevronRight);
export const ChevronDownIcon = make(ChevronDown);
export const StarIcon = make(Star, { fill: "currentColor", stroke: "none" });
export const BookmarkIcon = make(Bookmark);
export const BookmarkFilledIcon = make(Bookmark, {
  fill: "currentColor",
  stroke: "none",
});
export const CalendarIcon = make(Calendar);
export const GridIcon = make(LayoutGrid);
export const HomeIcon = make(House);
export const ClockIcon = make(Clock);
export const TrashIcon = make(Trash2);
export const ExternalLinkIcon = make(ExternalLink);
export const MaximizeIcon = make(Maximize);
export const SkipBackIcon = make(SkipBack, {
  fill: "currentColor",
  stroke: "none",
});
export const SkipForwardIcon = make(SkipForward, {
  fill: "currentColor",
  stroke: "none",
});
export const LoaderIcon = make(Loader2);
