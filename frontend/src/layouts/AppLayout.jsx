import { BarChart2, BoxIcon, LogOut, Menu, TrendingUp, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/dashboard',  icon: BarChart2,  label: 'Dashboard'   },
  { to: '/products',   icon: BoxIcon,    label: 'Productos'    },
  { to: '/movements',  icon: TrendingUp, label: 'Movimientos'  },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const [open, setOpen]  = useState(false)

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <BoxIcon size={22} />
          <span>Inventra</span>
        </div>

        <nav className="sidebar__nav">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
              onClick={() => setOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <span className="sidebar__user">{user?.name}</span>
          <button className="sidebar__logout" onClick={logout} title="Cerrar sesión">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="layout__main">
        <header className="topbar">
          <button className="topbar__menu" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
          <span className="topbar__title">Inventra</span>
        </header>

        {open && <div className="layout__overlay" onClick={() => setOpen(false)} />}

        <main className="layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
