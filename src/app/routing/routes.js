import React from 'react'

const Home = React.lazy(() => import('../pages/Home'))
const Offers = React.lazy(() => import('../pages/Offers'))
const CreateOffer = React.lazy(() => import('../pages/CreateOffer'))
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
const OAuthProfileCompletion = React.lazy(() => import('../features/auth/OAuthProfileCompletion'))
const RequestOffer = React.lazy(() => import('../pages/RequestOffer'))
const Proposals = React.lazy(() => import('../pages/Proposals'))
const AgreementDetails = React.lazy(() => import('../pages/AgreementDetails'))

const routes = [
  { path: '/', name: 'Home', element: Home },
  { path: '/offers', name: 'Offers', element: Offers },
  { path: '/offers/new', name: 'New Offer', element: CreateOffer, protected: true },
  { path: '/offers/:id', name: 'Offer Details', element: OfferDetails },
  { path: '/offers/:id/request', name: 'Request Offer', element: RequestOffer, protected: true },
  { path: '/proposals', name: 'Proposals', element: Proposals, protected: true },
  { path: '/agreements/:id', name: 'Agreement Details', element: AgreementDetails, protected: true },
  { path: '/messages', name: 'Messages', element: Messages, protected: true },
  { path: '/messages/:threadId', name: 'Message Thread', element: MessageThread, protected: true },
  { path: '/profile', name: 'Profile', element: Profile, protected: true },
  { path: '/users/:id', name: 'User Profile', element: UserProfile, protected: true },
  { path: '/admin', name: 'Admin', element: Admin, protected: true },
  { path: '/login', name: 'Login', element: Login, layout: 'public' },
  { path: '/register', name: 'Register', element: Register, layout: 'public' },
  { path: '/forgot-password', name: 'Forgot Password', element: ForgotPassword, layout: 'public' },
  { path: '/reset-password', name: 'Reset Password', element: ResetPassword, layout: 'public' },
  { path: '/verify-email', name: 'Email Verification', element: EmailVerification, layout: 'public' },
  { path: '/oauth-callback', name: 'OAuth Callback', element: OAuthCallback, layout: 'public' },
  { path: '/complete-profile', name: 'Complete Profile', element: OAuthProfileCompletion, protected: true },
]

export default routes
