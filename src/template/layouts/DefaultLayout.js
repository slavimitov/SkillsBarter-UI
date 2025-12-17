import React, { useMemo } from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import { useAuth } from '../../app/contexts/AuthContext'

const DefaultLayout = ({ navigation = [], routes = [] }) => {
  const { isAuthenticated, user } = useAuth()

  const sidebarItems = useMemo(() => {
    const hasAdminAccess = user?.roles?.some((role) => ['Admin', 'Moderator'].includes(role))

    return navigation.filter((item) => {
      if (isAuthenticated && (item?.to === '/login' || item?.to === '/register')) {
        return false
      }
      if (item?.to === '/admin' && !hasAdminAccess) {
        return false
      }
      return true
    })
  }, [isAuthenticated, user, navigation])

  return (
    <div>
      <AppSidebar items={sidebarItems} />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader routes={routes} />
        <div className="body flex-grow-1">
          <AppContent routes={routes} />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout
