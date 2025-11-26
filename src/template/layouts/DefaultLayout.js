import React from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'

const DefaultLayout = ({ navigation = [], routes = [] }) => {
  return (
    <div>
      <AppSidebar items={navigation} />
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
