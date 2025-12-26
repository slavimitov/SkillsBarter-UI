import React, { useState, useEffect } from 'react'
import {
    CAlert,
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CForm,
    CFormCheck,
    CFormInput,
    CFormLabel,
    CFormSelect,
    CNav,
    CNavItem,
    CNavLink,
    CRow,
    CSpinner,
    CTabContent,
    CTabPane,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
    cilLockLocked,
    cilBell,
    cilShieldAlt,
    cilUser,
    cilSettings,
} from '@coreui/icons'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import userService from '../services/userService'

const Settings = () => {
    const { user, isAuthenticated, logout } = useAuth()
    const { showSuccess, showError } = useToast()

    const [activeTab, setActiveTab] = useState('security')
    const [loading, setLoading] = useState(false)

    // Security Settings
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordError, setPasswordError] = useState('')

    // Notification Preferences
    const [notificationPrefs, setNotificationPrefs] = useState({
        emailNotifications: true,
        proposalNotifications: true,
        agreementNotifications: true,
        messageNotifications: true,
        reviewNotifications: true,
        disputeNotifications: true,
        notificationFrequency: 'instant'
    })
    const [prefsLoading, setPrefsLoading] = useState(true)

    // Privacy Settings
    const [privacySettings, setPrivacySettings] = useState({
        profileVisibility: 'public',
        showEmail: false,
        messagePermissions: 'anyone',
        showOnlineStatus: true
    })

    // Account Settings
    const [newEmail, setNewEmail] = useState('')
    const [emailError, setEmailError] = useState('')

    // Preferences
    const [preferences, setPreferences] = useState({
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        dateFormat: 'MM/DD/YYYY'
    })

    useEffect(() => {
        if (isAuthenticated) {
            loadPreferences()
        }
    }, [isAuthenticated])

    const loadPreferences = async () => {
        try {
            setPrefsLoading(true)
            const data = await userService.getPreferences()
            if (data.success) {
                setNotificationPrefs(data.preferences.notifications || notificationPrefs)
                setPrivacySettings(data.preferences.privacy || privacySettings)
                setPreferences(data.preferences.general || preferences)
            }
        } catch (error) {
            // If preferences don't exist yet, use defaults
            console.log('Using default preferences')
        } finally {
            setPrefsLoading(false)
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()
        setPasswordError('')

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError('All fields are required')
            return
        }

        if (newPassword.length < 8) {
            setPasswordError('New password must be at least 8 characters')
            return
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match')
            return
        }

        try {
            setLoading(true)
            await userService.changePassword(currentPassword, newPassword)
            showSuccess('Password changed successfully')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (error) {
            setPasswordError(error.response?.data?.message || 'Failed to change password')
            showError(error.response?.data?.message || 'Failed to change password')
        } finally {
            setLoading(false)
        }
    }

    const handleSaveNotificationPrefs = async () => {
        try {
            setLoading(true)
            await userService.updatePreferences({ notifications: notificationPrefs })
            showSuccess('Notification preferences saved')
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to save preferences')
        } finally {
            setLoading(false)
        }
    }

    const handleSavePrivacySettings = async () => {
        try {
            setLoading(true)
            await userService.updatePreferences({ privacy: privacySettings })
            showSuccess('Privacy settings saved')
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to save settings')
        } finally {
            setLoading(false)
        }
    }

    const handleChangeEmail = async (e) => {
        e.preventDefault()
        setEmailError('')

        if (!newEmail) {
            setEmailError('Email is required')
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(newEmail)) {
            setEmailError('Please enter a valid email address')
            return
        }

        try {
            setLoading(true)
            await userService.changeEmail(newEmail)
            showSuccess('Verification email sent. Please check your inbox.')
            setNewEmail('')
        } catch (error) {
            setEmailError(error.response?.data?.message || 'Failed to change email')
            showError(error.response?.data?.message || 'Failed to change email')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            return
        }

        const confirmation = window.prompt('Type "DELETE" to confirm account deletion:')
        if (confirmation !== 'DELETE') {
            showError('Account deletion cancelled')
            return
        }

        try {
            setLoading(true)
            await userService.deleteAccount()
            showSuccess('Account deleted successfully')
            logout()
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to delete account')
        } finally {
            setLoading(false)
        }
    }

    const handleSavePreferences = async () => {
        try {
            setLoading(true)
            await userService.updatePreferences({ general: preferences })
            showSuccess('Preferences saved')
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to save preferences')
        } finally {
            setLoading(false)
        }
    }

    if (!isAuthenticated) {
        return (
            <CRow>
                <CCol xs={12}>
                    <CAlert color="info">Please log in to access settings.</CAlert>
                </CCol>
            </CRow>
        )
    }

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader>
                        <strong>Settings</strong>
                    </CCardHeader>
                    <CCardBody>
                        <CNav variant="tabs" role="tablist">
                            <CNavItem>
                                <CNavLink
                                    active={activeTab === 'security'}
                                    onClick={() => setActiveTab('security')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <CIcon icon={cilLockLocked} className="me-2" />
                                    Security
                                </CNavLink>
                            </CNavItem>
                            <CNavItem>
                                <CNavLink
                                    active={activeTab === 'notifications'}
                                    onClick={() => setActiveTab('notifications')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <CIcon icon={cilBell} className="me-2" />
                                    Notifications
                                </CNavLink>
                            </CNavItem>
                            <CNavItem>
                                <CNavLink
                                    active={activeTab === 'privacy'}
                                    onClick={() => setActiveTab('privacy')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <CIcon icon={cilShieldAlt} className="me-2" />
                                    Privacy
                                </CNavLink>
                            </CNavItem>
                            <CNavItem>
                                <CNavLink
                                    active={activeTab === 'account'}
                                    onClick={() => setActiveTab('account')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <CIcon icon={cilUser} className="me-2" />
                                    Account
                                </CNavLink>
                            </CNavItem>
                            <CNavItem>
                                <CNavLink
                                    active={activeTab === 'preferences'}
                                    onClick={() => setActiveTab('preferences')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <CIcon icon={cilSettings} className="me-2" />
                                    Preferences
                                </CNavLink>
                            </CNavItem>
                        </CNav>

                        <CTabContent className="mt-3">
                            {/* Security Tab */}
                            <CTabPane visible={activeTab === 'security'}>
                                <h5 className="mb-3">Change Password</h5>
                                <CForm onSubmit={handleChangePassword}>
                                    <CRow className="mb-3">
                                        <CCol md={6}>
                                            <CFormLabel htmlFor="currentPassword">Current Password</CFormLabel>
                                            <CFormInput
                                                type="password"
                                                id="currentPassword"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="Enter current password"
                                            />
                                        </CCol>
                                    </CRow>
                                    <CRow className="mb-3">
                                        <CCol md={6}>
                                            <CFormLabel htmlFor="newPassword">New Password</CFormLabel>
                                            <CFormInput
                                                type="password"
                                                id="newPassword"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Enter new password (min 8 characters)"
                                            />
                                        </CCol>
                                    </CRow>
                                    <CRow className="mb-3">
                                        <CCol md={6}>
                                            <CFormLabel htmlFor="confirmPassword">Confirm New Password</CFormLabel>
                                            <CFormInput
                                                type="password"
                                                id="confirmPassword"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Confirm new password"
                                            />
                                        </CCol>
                                    </CRow>
                                    {passwordError && (
                                        <CAlert color="danger" className="mb-3">
                                            {passwordError}
                                        </CAlert>
                                    )}
                                    <CButton type="submit" color="primary" disabled={loading}>
                                        {loading ? <CSpinner size="sm" /> : 'Change Password'}
                                    </CButton>
                                </CForm>
                            </CTabPane>

                            {/* Notifications Tab */}
                            <CTabPane visible={activeTab === 'notifications'}>
                                {prefsLoading ? (
                                    <div className="text-center py-4">
                                        <CSpinner />
                                    </div>
                                ) : (
                                    <>
                                        <h5 className="mb-3">Notification Preferences</h5>
                                        <CFormCheck
                                            id="emailNotifications"
                                            label="Enable Email Notifications"
                                            checked={notificationPrefs.emailNotifications}
                                            onChange={(e) => setNotificationPrefs({
                                                ...notificationPrefs,
                                                emailNotifications: e.target.checked
                                            })}
                                            className="mb-3"
                                        />

                                        <h6 className="mb-2 mt-4">Notify me about:</h6>
                                        <CFormCheck
                                            id="proposalNotifications"
                                            label="New proposals and offers"
                                            checked={notificationPrefs.proposalNotifications}
                                            onChange={(e) => setNotificationPrefs({
                                                ...notificationPrefs,
                                                proposalNotifications: e.target.checked
                                            })}
                                            className="mb-2"
                                        />
                                        <CFormCheck
                                            id="agreementNotifications"
                                            label="Agreement updates"
                                            checked={notificationPrefs.agreementNotifications}
                                            onChange={(e) => setNotificationPrefs({
                                                ...notificationPrefs,
                                                agreementNotifications: e.target.checked
                                            })}
                                            className="mb-2"
                                        />
                                        <CFormCheck
                                            id="messageNotifications"
                                            label="New messages"
                                            checked={notificationPrefs.messageNotifications}
                                            onChange={(e) => setNotificationPrefs({
                                                ...notificationPrefs,
                                                messageNotifications: e.target.checked
                                            })}
                                            className="mb-2"
                                        />
                                        <CFormCheck
                                            id="reviewNotifications"
                                            label="Reviews received"
                                            checked={notificationPrefs.reviewNotifications}
                                            onChange={(e) => setNotificationPrefs({
                                                ...notificationPrefs,
                                                reviewNotifications: e.target.checked
                                            })}
                                            className="mb-2"
                                        />
                                        <CFormCheck
                                            id="disputeNotifications"
                                            label="Dispute notifications"
                                            checked={notificationPrefs.disputeNotifications}
                                            onChange={(e) => setNotificationPrefs({
                                                ...notificationPrefs,
                                                disputeNotifications: e.target.checked
                                            })}
                                            className="mb-3"
                                        />

                                        <CRow className="mb-3 mt-4">
                                            <CCol md={6}>
                                                <CFormLabel htmlFor="notificationFrequency">Notification Frequency</CFormLabel>
                                                <CFormSelect
                                                    id="notificationFrequency"
                                                    value={notificationPrefs.notificationFrequency}
                                                    onChange={(e) => setNotificationPrefs({
                                                        ...notificationPrefs,
                                                        notificationFrequency: e.target.value
                                                    })}
                                                >
                                                    <option value="instant">Instant</option>
                                                    <option value="daily">Daily Digest</option>
                                                    <option value="weekly">Weekly Summary</option>
                                                </CFormSelect>
                                            </CCol>
                                        </CRow>

                                        <CButton color="primary" onClick={handleSaveNotificationPrefs} disabled={loading}>
                                            {loading ? <CSpinner size="sm" /> : 'Save Notification Preferences'}
                                        </CButton>
                                    </>
                                )}
                            </CTabPane>

                            {/* Privacy Tab */}
                            <CTabPane visible={activeTab === 'privacy'}>
                                {prefsLoading ? (
                                    <div className="text-center py-4">
                                        <CSpinner />
                                    </div>
                                ) : (
                                    <>
                                        <h5 className="mb-3">Privacy Settings</h5>
                                        <CRow className="mb-3">
                                            <CCol md={6}>
                                                <CFormLabel htmlFor="profileVisibility">Profile Visibility</CFormLabel>
                                                <CFormSelect
                                                    id="profileVisibility"
                                                    value={privacySettings.profileVisibility}
                                                    onChange={(e) => setPrivacySettings({
                                                        ...privacySettings,
                                                        profileVisibility: e.target.value
                                                    })}
                                                >
                                                    <option value="public">Public - Anyone can view</option>
                                                    <option value="connections">Connections Only</option>
                                                    <option value="private">Private - Only me</option>
                                                </CFormSelect>
                                            </CCol>
                                        </CRow>

                                        <CRow className="mb-3">
                                            <CCol md={6}>
                                                <CFormLabel htmlFor="messagePermissions">Who can message you?</CFormLabel>
                                                <CFormSelect
                                                    id="messagePermissions"
                                                    value={privacySettings.messagePermissions}
                                                    onChange={(e) => setPrivacySettings({
                                                        ...privacySettings,
                                                        messagePermissions: e.target.value
                                                    })}
                                                >
                                                    <option value="anyone">Anyone</option>
                                                    <option value="connections">Connections Only</option>
                                                    <option value="none">No One</option>
                                                </CFormSelect>
                                            </CCol>
                                        </CRow>

                                        <CFormCheck
                                            id="showEmail"
                                            label="Show email on my profile"
                                            checked={privacySettings.showEmail}
                                            onChange={(e) => setPrivacySettings({
                                                ...privacySettings,
                                                showEmail: e.target.checked
                                            })}
                                            className="mb-3"
                                        />

                                        <CFormCheck
                                            id="showOnlineStatus"
                                            label="Show online status"
                                            checked={privacySettings.showOnlineStatus}
                                            onChange={(e) => setPrivacySettings({
                                                ...privacySettings,
                                                showOnlineStatus: e.target.checked
                                            })}
                                            className="mb-3"
                                        />

                                        <CButton color="primary" onClick={handleSavePrivacySettings} disabled={loading}>
                                            {loading ? <CSpinner size="sm" /> : 'Save Privacy Settings'}
                                        </CButton>
                                    </>
                                )}
                            </CTabPane>

                            {/* Account Tab */}
                            <CTabPane visible={activeTab === 'account'}>
                                <h5 className="mb-3">Account Management</h5>
                                
                                <div className="mb-4">
                                    <h6 className="mb-2">Current Email</h6>
                                    <p className="text-muted">{user?.email}</p>
                                </div>

                                <CForm onSubmit={handleChangeEmail} className="mb-5">
                                    <h6 className="mb-3">Change Email Address</h6>
                                    <CRow className="mb-3">
                                        <CCol md={6}>
                                            <CFormLabel htmlFor="newEmail">New Email Address</CFormLabel>
                                            <CFormInput
                                                type="email"
                                                id="newEmail"
                                                value={newEmail}
                                                onChange={(e) => setNewEmail(e.target.value)}
                                                placeholder="Enter new email address"
                                            />
                                        </CCol>
                                    </CRow>
                                    {emailError && (
                                        <CAlert color="danger" className="mb-3">
                                            {emailError}
                                        </CAlert>
                                    )}
                                    <CButton type="submit" color="primary" disabled={loading}>
                                        {loading ? <CSpinner size="sm" /> : 'Change Email'}
                                    </CButton>
                                </CForm>

                                <hr />

                                <div className="mt-4">
                                    <h6 className="mb-3 text-danger">Danger Zone</h6>
                                    <p className="text-muted mb-3">
                                        Once you delete your account, there is no going back. Please be certain.
                                    </p>
                                    <CButton color="danger" onClick={handleDeleteAccount} disabled={loading}>
                                        {loading ? <CSpinner size="sm" /> : 'Delete Account'}
                                    </CButton>
                                </div>
                            </CTabPane>

                            {/* Preferences Tab */}
                            <CTabPane visible={activeTab === 'preferences'}>
                                {prefsLoading ? (
                                    <div className="text-center py-4">
                                        <CSpinner />
                                    </div>
                                ) : (
                                    <>
                                        <h5 className="mb-3">General Preferences</h5>
                                        <CRow className="mb-3">
                                            <CCol md={6}>
                                                <CFormLabel htmlFor="language">Language</CFormLabel>
                                                <CFormSelect
                                                    id="language"
                                                    value={preferences.language}
                                                    onChange={(e) => setPreferences({
                                                        ...preferences,
                                                        language: e.target.value
                                                    })}
                                                >
                                                    <option value="en">English</option>
                                                    <option value="es">Español</option>
                                                    <option value="fr">Français</option>
                                                    <option value="de">Deutsch</option>
                                                </CFormSelect>
                                            </CCol>
                                        </CRow>

                                        <CRow className="mb-3">
                                            <CCol md={6}>
                                                <CFormLabel htmlFor="timezone">Timezone</CFormLabel>
                                                <CFormSelect
                                                    id="timezone"
                                                    value={preferences.timezone}
                                                    onChange={(e) => setPreferences({
                                                        ...preferences,
                                                        timezone: e.target.value
                                                    })}
                                                >
                                                    <option value="America/New_York">Eastern Time (ET)</option>
                                                    <option value="America/Chicago">Central Time (CT)</option>
                                                    <option value="America/Denver">Mountain Time (MT)</option>
                                                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                                    <option value="Europe/London">London (GMT)</option>
                                                    <option value="Europe/Paris">Paris (CET)</option>
                                                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                                                    <option value="Australia/Sydney">Sydney (AEST)</option>
                                                </CFormSelect>
                                            </CCol>
                                        </CRow>

                                        <CRow className="mb-3">
                                            <CCol md={6}>
                                                <CFormLabel htmlFor="dateFormat">Date Format</CFormLabel>
                                                <CFormSelect
                                                    id="dateFormat"
                                                    value={preferences.dateFormat}
                                                    onChange={(e) => setPreferences({
                                                        ...preferences,
                                                        dateFormat: e.target.value
                                                    })}
                                                >
                                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                                </CFormSelect>
                                            </CCol>
                                        </CRow>

                                        <CButton color="primary" onClick={handleSavePreferences} disabled={loading}>
                                            {loading ? <CSpinner size="sm" /> : 'Save Preferences'}
                                        </CButton>
                                    </>
                                )}
                            </CTabPane>
                        </CTabContent>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    )
}

export default Settings
