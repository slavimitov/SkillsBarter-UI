import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'
import ProtectedRoute from './app/routing/ProtectedRoute'

import { CSpinner, useColorModes } from '@coreui/react'
import './template/scss/style.scss'

// We use those styles to show code examples, you should remove them in your application.
import './template/scss/examples.scss'

import routes from './app/routing/routes'
import navigation from './app/navigation/nav'

const DefaultLayout = React.lazy(() => import('./template/layouts/DefaultLayout'))
const Page404 = React.lazy(() => import('./template/views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./template/views/pages/page500/Page500'))
const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
    }

    if (isColorModeSet()) {
      return
    }

    setColorMode(storedTheme)
  }, [])

  const publicRoutes = routes.filter((route) => route.layout === 'public')
  const appRoutes = routes.filter((route) => route.layout !== 'public')

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          {publicRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={<route.element />} />
          ))}
          <Route path="/404" element={<Page404 />} />
          <Route path="/500" element={<Page500 />} />
          <Route path="*" element={<DefaultLayout navigation={navigation} routes={appRoutes} />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
