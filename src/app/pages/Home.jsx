import React from 'react'
import {
  CCard,
  CCardBody,
  CCardText,
  CCardTitle,
  CButton,
  CRow,
  CCol,
  CContainer,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPeople,
  cilSwapHorizontal,
  cilStar,
  cilSearch,
  cilArrowRight,
} from '@coreui/icons'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: cilSearch,
      title: 'Discover Skills',
      description: 'Browse thousands of skills offered by talented community members',
      color: 'primary',
    },
    {
      icon: cilSwapHorizontal,
      title: 'Exchange & Learn',
      description: 'Trade your expertise for skills you want to learn - no money involved',
      color: 'success',
    },
    {
      icon: cilPeople,
      title: 'Build Community',
      description: 'Connect with like-minded individuals and grow your network',
      color: 'info',
    },
    {
      icon: cilStar,
      title: 'Earn Reputation',
      description: 'Build your reputation through quality exchanges and reviews',
      color: 'warning',
    },
  ]


  // Stats Data Just for display purposes (not real or dynamic)
  const stats = [
    { value: '1,000+', label: 'Active Users' },
    { value: '5,000+', label: 'Skills Offered' },
    { value: '10,000+', label: 'Successful Exchanges' },
    { value: '4.8/5', label: 'Average Rating' },
  ]

  return (
    <CContainer>
      {/* Hero Section */}
      <CRow className="mb-5 fade-in">
        <CCol xs={12}>
          <CCard className="bg-gradient border-0 shadow-lg text-white gradient-animation" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CCardBody className="p-5 text-center">
              <h1 className="display-4 fw-bold mb-3 float">Welcome to Skills Barter</h1>
              <p className="lead mb-4 slide-in-left">
                The platform where knowledge meets opportunity. Exchange skills, grow together, and build meaningful connections.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap slide-in-right">
                <CButton 
                  color="light" 
                  size="lg" 
                  onClick={() => navigate('/offers')}
                  className="px-4 ripple"
                >
                  Browse Offers <CIcon icon={cilArrowRight} className="ms-2" />
                </CButton>
                <CButton 
                  color="light" 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/offers/new')}
                  className="px-4 ripple"
                >
                  Create Your Offer
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Stats Section */}
      <CRow className="mb-5 text-center">
        {stats.map((stat, index) => (
          <CCol key={index} xs={6} md={3} className="mb-3 stagger-item">
            <CCard className="border-0 shadow-sm h-100 hover-lift">
              <CCardBody>
                <h3 className="fw-bold text-primary mb-1 stat-value">{stat.value}</h3>
                <p className="text-muted mb-0 small">{stat.label}</p>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      {/* Features Section */}
      <CRow className="mb-4">
        <CCol xs={12} className="mb-4">
          <h2 className="text-center fw-bold">How It Works</h2>
          <p className="text-center text-muted">Everything you need to start exchanging skills</p>
        </CCol>
        {features.map((feature, index) => (
          <CCol key={index} xs={12} md={6} lg={3} className="mb-4">
            <CCard className="h-100 border-0 shadow-sm hover-lift feature-card">
              <CCardBody className="text-center p-4">
                <div 
                  className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-3 icon-background`}
                  style={{ 
                    width: '70px', 
                    height: '70px', 
                    backgroundColor: `var(--cui-${feature.color})`,
                    opacity: 0.1
                  }}
                >
                  <CIcon 
                    icon={feature.icon} 
                    size="xl" 
                    className="icon-hover"
                    style={{ color: `var(--cui-${feature.color})` }}
                  />
                </div>
                <CCardTitle className="fw-bold mb-2">{feature.title}</CCardTitle>
                <CCardText className="text-muted small">
                  {feature.description}
                </CCardText>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      {/* CTA Section */}
      <CRow className="mb-5">
        <CCol xs={12}>
          <CCard className="border-0 shadow-sm neon-hover gradient-animation" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CCardBody className="text-center p-5">
              <h3 className="fw-bold mb-3 text-white pulse">Ready to Start Exchanging?</h3>
              <p className="text-white mb-4" style={{ opacity: 0.9 }}>
                Join our community today and discover endless opportunities to learn and share
              </p>
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                <CBadge style={{ backgroundColor: 'rgba(255,255,255,0.3)', color: 'white' }} className="p-2 px-3 badge-glow">Skill-Based Exchange</CBadge>
                <CBadge style={{ backgroundColor: 'rgba(255,255,255,0.3)', color: 'white' }} className="p-2 px-3 badge-glow">Trusted Community</CBadge>
                <CBadge style={{ backgroundColor: 'rgba(255,255,255,0.3)', color: 'white' }} className="p-2 px-3 badge-glow">Built on Trust</CBadge>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default Home

