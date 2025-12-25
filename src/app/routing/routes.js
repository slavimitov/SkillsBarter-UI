import React from 'react'

const Home = React.lazy(() => import('../pages/Home'))
const Offers = React.lazy(() => import('../pages/Offers'))
const CreateOffer = React.lazy(() => import('../pages/CreateOffer'))
const OfferDetails = React.lazy(() => import('../pages/OfferDetails'))
const Profile = React.lazy(() => import('../pages/Profile'))
const UserProfile = React.lazy(() => import('../pages/UserProfile'))
const Admin = React.lazy(() => import('../pages/Admin'))
const AdminAgreements = React.lazy(() => import('../pages/AdminAgreements'))
const AdminDisputes = React.lazy(() => import('../pages/AdminDisputes'))
const AdminDisputeDetails = React.lazy(() => import('../pages/AdminDisputeDetails'))
const Login = React.lazy(() => import('../features/auth/Login'))
const Register = React.lazy(() => import('../features/auth/Register'))
const ForgotPassword = React.lazy(() => import('../features/auth/ForgotPassword'))
const ResetPassword = React.lazy(() => import('../features/auth/ResetPassword'))
const EmailVerification = React.lazy(() => import('../features/auth/EmailVerification'))
const OAuthCallback = React.lazy(() => import('../features/auth/OAuthCallback'))
const OAuthProfileCompletion = React.lazy(() => import('../features/auth/OAuthProfileCompletion'))
const RequestOffer = React.lazy(() => import('../pages/RequestOffer'))
const Proposals = React.lazy(() => import('../pages/Proposals'))
const Agreements = React.lazy(() => import('../pages/Agreements'))
const AgreementDetails = React.lazy(() => import('../pages/AgreementDetails'))
const Disputes = React.lazy(() => import('../pages/Disputes'))
const DisputeDetails = React.lazy(() => import('../pages/DisputeDetails'))
const Messages = React.lazy(() => import('../pages/Messages'))
const Settings = React.lazy(() => import('../pages/Settings'))

const routes = [
  { path: '/', name: 'Home', element: Home },
  { path: '/offers', name: 'Offers', element: Offers },
  { path: '/offers/new', name: 'New Offer', element: CreateOffer, protected: true },
  { path: '/offers/:id', name: 'Offer Details', element: OfferDetails },
  { path: '/offers/:id/edit', name: 'Edit Offer', element: CreateOffer, protected: true },
  { path: '/offers/:id/request', name: 'Request Offer', element: RequestOffer, protected: true },
  { path: '/proposals', name: 'Proposals', element: Proposals, protected: true },
  { path: '/agreements', name: 'Agreements', element: Agreements, protected: true },
  { path: '/messages', name: 'Messages', element: Messages, protected: true },
  { path: '/agreements/:id', name: 'Agreement Details', element: AgreementDetails, protected: true },
  { path: '/disputes', name: 'Disputes', element: Disputes, protected: true },
  { path: '/disputes/:id', name: 'Dispute Details', element: DisputeDetails, protected: true },
  { path: '/profile', name: 'Profile', element: Profile, protected: true },
  { path: '/users/:id', name: 'User Profile', element: UserProfile, protected: true },
  { path: '/admin', name: 'Admin', element: Admin, protected: true },
  { path: '/admin/agreements', name: 'Admin Agreements', element: AdminAgreements, protected: true },
  { path: '/admin/disputes', name: 'Admin Disputes', element: AdminDisputes, protected: true },
  { path: '/admin/disputes/:id', name: 'Admin Dispute Details', element: AdminDisputeDetails, protected: true },
  { path: '/settings', name: 'Settings', element: Settings, protected: true },
  { path: '/login', name: 'Login', element: Login, layout: 'public' },
  { path: '/register', name: 'Register', element: Register, layout: 'public' },
  { path: '/forgot-password', name: 'Forgot Password', element: ForgotPassword, layout: 'public' },
  { path: '/reset-password', name: 'Reset Password', element: ResetPassword, layout: 'public' },
  { path: '/verify-email', name: 'Email Verification', element: EmailVerification, layout: 'public' },
  { path: '/oauth-callback', name: 'OAuth Callback', element: OAuthCallback, layout: 'public' },
  { path: '/complete-profile', name: 'Complete Profile', element: OAuthProfileCompletion, protected: true },
]

export default routes
