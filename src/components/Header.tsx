import { Link, useNavigate } from '@tanstack/react-router'

import { useState } from 'react'
import { BarChart2, List, LogOut, Menu, PlusCircle, Wallet, X } from 'lucide-react'
import { logoutFn } from '@/functions/auth'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  async function handleLogout() {
    setIsOpen(false)
    await logoutFn()
    navigate({ to: '/login' })
  }

  return (
    <>
      <header className="p-4 flex items-center bg-primary text-black border-b-[3px] border-black">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 hover:bg-black/10 rounded-sm border-2 border-black transition-colors"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <h1 className="ml-4 text-xl font-extrabold uppercase tracking-wider">
          <Link to="/entries">Accounting</Link>
        </h1>
      </header>

      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-white text-black border-r-[3px] border-black z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b-2 border-black">
          <h2 className="text-xl font-extrabold uppercase">Navigation</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-primary/30 rounded-sm border-2 border-black transition-colors"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <Link
            to="/entries"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-sm border-2 border-black hover:bg-primary/20 transition-all mb-3 shadow-brutal-sm hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-sm border-2 border-black bg-primary font-bold transition-all mb-3 shadow-brutal-sm',
            }}
          >
            <List size={20} />
            <span className="font-bold">Entries</span>
          </Link>

          <Link
            to="/accounts"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-sm border-2 border-black hover:bg-primary/20 transition-all mb-3 shadow-brutal-sm hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-sm border-2 border-black bg-primary font-bold transition-all mb-3 shadow-brutal-sm',
            }}
          >
            <Wallet size={20} />
            <span className="font-bold">Accounts</span>
          </Link>

          <Link
            to="/reports"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-sm border-2 border-black hover:bg-primary/20 transition-all mb-3 shadow-brutal-sm hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-sm border-2 border-black bg-primary font-bold transition-all mb-3 shadow-brutal-sm',
            }}
          >
            <BarChart2 size={20} />
            <span className="font-bold">Reports</span>
          </Link>

          <Link
            to="/entries/create"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-sm border-2 border-black hover:bg-primary/20 transition-all mb-3 shadow-brutal-sm hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-sm border-2 border-black bg-primary font-bold transition-all mb-3 shadow-brutal-sm',
            }}
          >
            <PlusCircle size={20} />
            <span className="font-bold">New Entry</span>
          </Link>
        </nav>

        {/* Logout pinned to bottom */}
        <div className="p-4 border-t-2 border-black">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 p-3 rounded-sm border-2 border-black hover:bg-red-50 hover:border-red-600 hover:text-red-700 transition-all shadow-brutal-sm hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none"
          >
            <LogOut size={20} />
            <span className="font-bold">Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
