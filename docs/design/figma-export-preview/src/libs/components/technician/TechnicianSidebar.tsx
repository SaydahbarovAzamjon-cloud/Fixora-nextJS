import { ChevronRight, Zap } from "lucide-react";
import {
  LayoutDashboard, Inbox, Briefcase, MessageSquare, Bell,
  User, BarChart2, DollarSign, Settings, HelpCircle, BookOpen,
} from "lucide-react";
import styles from "../../../scss/pc/technician/technician-sidebar.module.scss";

export type Page =
  | "dashboard" | "requests" | "jobs" | "messages"
  | "notifications" | "profile" | "analytics" | "earnings"
  | "settings" | "help" | "articles";

const NAV = [
  { id: "dashboard"     as Page, label: "Dashboard",         icon: LayoutDashboard },
  { id: "requests"      as Page, label: "Incoming Requests",  icon: Inbox,         badge: 4 },
  { id: "jobs"          as Page, label: "Active Jobs",        icon: Briefcase,     badge: 7 },
  { id: "messages"      as Page, label: "Messages",           icon: MessageSquare, badge: 2 },
  { id: "notifications" as Page, label: "Notifications",      icon: Bell,          badge: 9 },
  { id: "profile"       as Page, label: "Public Profile",     icon: User },
  { id: "analytics"     as Page, label: "Analytics",          icon: BarChart2 },
  { id: "earnings"      as Page, label: "Earnings",           icon: DollarSign },
  { id: "articles"      as Page, label: "Write Article",      icon: BookOpen },
];

const BOTTOM_NAV = [
  { id: "settings" as Page, label: "Settings",      icon: Settings },
  { id: "help"     as Page, label: "Help & Support", icon: HelpCircle },
];

interface TechnicianSidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

export default function TechnicianSidebar({ activePage, onNavigate }: TechnicianSidebarProps) {
  const s = (name: string) => styles[name] ?? "";

  return (
    <aside className={s("fts__sidebar")}>

      {/* Logo */}
      <div className={s("fts__logo")}>
        <div className={s("fts__logo__icon")}>
          <Zap size={17} color="#fff" strokeWidth={2.5} />
        </div>
        <div>
          <div className={s("fts__logo__name")}>FIXORA</div>
          <div className={s("fts__logo__tag")}>TECHNICIAN</div>
        </div>
      </div>

      {/* Status */}
      <div className={s("fts__status")}>
        <div className={s("fts__status__badge")}>
          <div className={s("fts__status__dot")} />
          <span className={s("fts__status__label")}>Available for Jobs</span>
        </div>
      </div>

      {/* Main nav */}
      <nav className={s("fts__nav")}>
        <div className={s("fts__nav__section-label")}>MAIN MENU</div>
        {NAV.map((item) => {
          const active = activePage === item.id;
          const Icon = item.icon;
          const itemClass = [
            s("fts__nav__item"),
            active ? s("fts__nav__item--active") : "",
          ].join(" ");

          return (
            <button key={item.id} onClick={() => onNavigate(item.id)} className={itemClass}>
              {active && <div className={s("fts__nav__item__indicator")} />}
              <Icon size={16} strokeWidth={active ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
              <span className={s("fts__nav__item__label")}>{item.label}</span>
              {item.badge != null && (
                <span className={[
                  s("fts__nav__item__badge"),
                  active ? s("fts__nav__item__badge--active") : "",
                ].join(" ")}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom nav */}
      <div className={s("fts__bottom")}>
        {BOTTOM_NAV.map((item) => {
          const active = activePage === item.id;
          const Icon = item.icon;
          const itemClass = [
            s("fts__bottom__item"),
            active ? s("fts__bottom__item--active") : "",
          ].join(" ");

          return (
            <button key={item.id} onClick={() => onNavigate(item.id)} className={itemClass}>
              {active && <div className={s("fts__bottom__item__indicator")} />}
              <Icon size={16} strokeWidth={active ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* User card */}
        <div className={s("fts__user-card")}>
          <div className={s("fts__user-card__avatar")}>AK</div>
          <div className={s("fts__user-card__info")}>
            <div className={s("fts__user-card__name")}>Alex Kim</div>
            <div className={s("fts__user-card__role")}>Pro Technician</div>
          </div>
          <ChevronRight size={13} color="#606060" />
        </div>
      </div>
    </aside>
  );
}
