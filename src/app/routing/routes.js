import React from 'react'

const Dashboard = React.lazy(() => import('../../template/views/dashboard/Dashboard'))
const Widgets = React.lazy(() => import('../../template/views/widgets/Widgets'))
const WidgetsDropdown = React.lazy(() => import('../../template/views/widgets/WidgetsDropdown'))
const Cards = React.lazy(() => import('../../template/views/base/cards/Cards'))
const ListGroups = React.lazy(() => import('../../template/views/base/list-groups/ListGroups'))
const Modals = React.lazy(() => import('../../template/views/notifications/modals/Modals'))
const FormControl = React.lazy(() => import('../../template/views/forms/form-control/FormControl'))
const InputGroup = React.lazy(() => import('../../template/views/forms/input-group/InputGroup'))
const Login = React.lazy(() => import('../../template/views/pages/login/Login'))
const Register = React.lazy(() => import('../../template/views/pages/register/Register'))

const routes = [
  { path: '/', name: 'Home', element: Dashboard },
  { path: '/offers', name: 'Offers', element: Widgets },
  { path: '/offers/:id', name: 'Offer Details', element: Cards },
  { path: '/messages', name: 'Messages', element: ListGroups },
  { path: '/messages/:threadId', name: 'Message Thread', element: Modals },
  { path: '/profile', name: 'Profile', element: FormControl },
  { path: '/users/:id', name: 'User Profile', element: InputGroup },
  { path: '/admin', name: 'Admin', element: WidgetsDropdown },
  { path: '/login', name: 'Login', element: Login, layout: 'public' },
  { path: '/register', name: 'Register', element: Register, layout: 'public' },
]

export default routes
