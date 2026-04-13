import React from "react";
import {
  NavLink,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  BedDouble,
  CalendarDays,
  Coins,
  LockKeyhole,
  LogOut,
  MessageSquareQuote,
  Search,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  getAdminSession,
  logoutAdmin,
} from "../../services/adminAuth";

const ProtectedAdminLayout: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const session = getAdminSession();

  if (!session?.token) {
    return (
      <Navigate
        to="/private/hp/admin"
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  }

  const handleLogout = () => {
    logoutAdmin();
    navigate("/private/hp/admin", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff6e2_0%,_#f8efe3_38%,_#eadfcd_100%)] text-[#2f241c]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-[#d7c8b5] bg-[#2f241c] px-6 py-6 text-white lg:min-h-screen lg:w-[300px] lg:border-b-0 lg:border-r lg:px-7 lg:py-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c59f58] text-[#2f241c] shadow-lg">
              <LockKeyhole size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#d7c29a]">
                {t("admin.layout.accessLabel")}
              </p>
              <h1 className="mt-1 text-2xl font-serif font-bold">
                {t("admin.layout.title")}
              </h1>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d7c29a]">
              {t("admin.layout.loggedInAs")}
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              {session?.name ?? session?.username ?? "admin"}
            </p>
            {session?.name && (
              <p className="mt-1 text-sm text-white/60">@{session.username}</p>
            )}
            <p className="mt-1 text-sm text-white/60">
              {t("admin.layout.sessionActive")}
            </p>
          </div>

          <nav className="mt-8 space-y-3">
            <NavLink
              to="/private/hp/admin/booking"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#c59f58] text-[#2f241c] shadow-lg"
                    : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <CalendarDays size={18} />
              <span>{t("admin.layout.navBookings")}</span>
            </NavLink>

            <NavLink
              to="/private/hp/admin/room"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#c59f58] text-[#2f241c] shadow-lg"
                    : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <BedDouble size={18} />
              <span>{t("admin.layout.navRooms")}</span>
            </NavLink>

            <NavLink
              to="/private/hp/admin/currency"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#c59f58] text-[#2f241c] shadow-lg"
                    : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Coins size={18} />
              <span>{t("admin.layout.navCurrency")}</span>
            </NavLink>

            <NavLink
              to="/private/hp/admin/comments"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#c59f58] text-[#2f241c] shadow-lg"
                    : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <MessageSquareQuote size={18} />
              <span>{t("admin.layout.navComments")}</span>
            </NavLink>

            <NavLink
              to="/private/hp/admin/check-room"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#c59f58] text-[#2f241c] shadow-lg"
                    : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Search size={18} />
              <span>{t("admin.layout.navCheckRoom")}</span>
            </NavLink>

            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-white/15 px-4 py-3 text-sm text-white/50">
              <Sparkles size={16} />
              <span>{t("admin.layout.navMoreSoon")}</span>
            </div>
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-[#d7c29a] hover:text-[#d7c29a]"
          >
            <LogOut size={16} />
            {t("admin.layout.logout")}
          </button>
        </aside>

        <div className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ProtectedAdminLayout;
