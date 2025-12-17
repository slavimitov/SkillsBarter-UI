import React, { useMemo } from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import { useAuth } from '../../app/contexts/AuthContext'

const DefaultLayout = ({ navigation = [], routes = [] }) => {
  const { isAuthenticated } = useAuth()

  const sidebarItems = useMemo(() => {
    if (!isAuthenticated) return navigation
    return navigation.filter((item) => item?.to !== '/login' && item?.to !== '/register')
  }, [isAuthenticated, navigation])

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
