import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth'
import AuthNavigation from '@/components/AuthNavigation'

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
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center">
                      <span className="text-xl font-bold text-blue-600">🏥 Больница</span>
                    </div>
                    <div className="ml-6 flex space-x-4">
                      <a href="/" className="text-gray-900 px-4 py-2 rounded-lg text-base font-semibold hover:bg-blue-100">
                        Главная
                      </a>
                      <a href="/doctors" className="text-gray-700 px-4 py-2 rounded-lg text-base font-medium hover:bg-blue-100 hover:text-gray-900">
                        Врачи
                      </a>
                      <a href="/appointments/new" className="text-gray-700 px-4 py-2 rounded-lg text-base font-medium hover:bg-blue-100 hover:text-gray-900">
                        Записи
                      </a>
                      <a href="/schedule" className="text-gray-700 px-4 py-2 rounded-lg text-base font-medium hover:bg-blue-100 hover:text-gray-900">
                        Календарь
                      </a>
                    </div>
                  </div>
                  <AuthNavigation />
                </div>
              </div>
            </nav>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}