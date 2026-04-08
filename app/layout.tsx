import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth'
import AuthNavigation from '@/components/AuthNavigation'
import { ThemeToggle } from '@/components/ThemeToggle'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Больница - Система управления',
  description: 'Система управления записями больницы',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900`}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Navigation */}
            <nav className="bg-white dark:bg-gray-800 shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  {/* Logo */}
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center">
                      <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        🏥 Больница
                      </Link>
                    </div>
                    
                    {/* Desktop Navigation */}
                    <div className="hidden md:ml-6 md:flex md:space-x-2">
                      <Link href="/" className="text-gray-900 dark:text-gray-100 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100 dark:hover:bg-gray-700">
                        Главная
                      </Link>
                      <Link href="/doctors" className="text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-gray-700">
                        Врачи
                      </Link>
                      <Link href="/appointments/new" className="text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-gray-700">
                        Записи
                      </Link>
                      <Link href="/schedule" className="text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-gray-700">
                        Календарь
                      </Link>
                      <Link href="/doctor" className="text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-gray-700">
                        Кабинет
                      </Link>
                    </div>
                  </div>

                  {/* Right side: Theme toggle + Auth */}
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <div className="hidden md:block">
                      <AuthNavigation />
                    </div>
                    
                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                      <AuthNavigation mobile />
                    </div>
                  </div>
                </div>
              </div>
            </nav>
            
            {/* Main content */}
            <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}