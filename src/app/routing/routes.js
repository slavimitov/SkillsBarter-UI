import React from 'react'

const Home = React.lazy(() => import('../pages/Home'))
const Offers = React.lazy(() => import('../pages/Offers'))
const OfferDetails = React.lazy(() => import('../pages/OfferDetails'))
const Messages = React.lazy(() => import('../pages/Messages'))
const MessageThread = React.lazy(() => import('../pages/MessageThread'))
const Profile = React.lazy(() => import('../pages/Profile'))
const UserProfile = React.lazy(() => import('../pages/UserProfile'))
const Admin = React.lazy(() => import('../pages/Admin'))
const Login = React.lazy(() => import('../features/auth/Login'))
const Register = React.lazy(() => import('../features/auth/Register'))
const ForgotPassword = React.lazy(() => import('../features/auth/ForgotPassword'))
const ResetPassword = React.lazy(() => import('../features/auth/ResetPassword'))
const EmailVerification = React.lazy(() => import('../features/auth/EmailVerification'))
const OAuthCallback = React.lazy(() => import('../features/auth/OAuthCallback'))

const routes = [
  { path: '/', name: 'Home', element: Home },
  { path: '/offers', name: 'Offers', element: Offers },
  { path: '/offers/:id', name: 'Offer Details', element: OfferDetails },
  { path: '/messages', name: 'Messages', element: Messages },
  { path: '/messages/:threadId', name: 'Message Thread', element: MessageThread },
  { path: '/profile', name: 'Profile', element: Profile },
  { path: '/users/:id', name: 'User Profile', element: UserProfile },
  { path: '/admin', name: 'Admin', element: Admin },
  { path: '/login', name: 'Login', element: Login, layout: 'public' },
  { path: '/register', name: 'Register', element: Register, layout: 'public' },
  { path: '/forgot-password', name: 'Forgot Password', element: ForgotPassword, layout: 'public' },
  { path: '/reset-password', name: 'Reset Password', element: ResetPassword, layout: 'public' },
  { path: '/verify-email', name: 'Email Verification', element: EmailVerification, layout: 'public' },
  { path: '/oauth-callback', name: 'OAuth Callback', element: OAuthCallback, layout: 'public' },
]

export default routes
