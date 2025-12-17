import React, { useState, useEffect, useRef } from 'react'
import {
    CBadge,
    CDropdown,
    CDropdownHeader,
    CDropdownItem,
    CDropdownMenu,
    CDropdownToggle,
    CButton,
    CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBell, cilEnvelopeOpen } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import notificationService from '../../../app/services/notificationService'

const AppHeaderNotification = () => {
    const navigate = useNavigate()
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getNotifications(1, 10, false); // Get recent 10
            if (data) {
                setNotifications(data.items || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    }

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [])

    const handleMarkAllRead = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        try {
            setLoading(true);
            await notificationService.markAllAsRead();
            setUnreadCount(0);
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Failed to mark all as read", error);
        } finally {
            setLoading(false);
        }
    }

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            try {
                await notificationService.markAsRead([notification.id]);
                setUnreadCount(prev => Math.max(0, prev - 1));
                setNotifications(notifications.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
            } catch (error) {
                console.error("Failed to mark notification as read", error);
            }
        }

    }

    return (
        <CDropdown variant="nav-item">
            <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
                <span className="position-relative d-inline-flex align-items-center">
                    <CIcon icon={cilBell} size="lg" />
                    {unreadCount > 0 && (
                        <CBadge
                            color="danger"
                            className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                            <span className="visually-hidden">unread messages</span>
                        </CBadge>
                    )}
                </span>
            </CDropdownToggle>
            <CDropdownMenu className="pt-0" placement="bottom-end" style={{ minWidth: '300px', maxHeight: '400px', overflowY: 'auto' }}>
                <CDropdownHeader className="bg-body-secondary fw-semibold mb-2 d-flex justify-content-between align-items-center">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <CButton
                            color="link"
                            size="sm"
                            className="text-decoration-none p-0"
                            onClick={handleMarkAllRead}
                            disabled={loading}
                        >
                            Mark all read
                        </CButton>
                    )}
                </CDropdownHeader>

                {notifications.length === 0 ? (
                    <CDropdownItem className="text-center text-muted py-3">
                        No notifications
                    </CDropdownItem>
                ) : (
                    notifications.map((notification) => (
                        <CDropdownItem
                            key={notification.id}
                            href="#"
                            onClick={(e) => { e.preventDefault(); handleNotificationClick(notification); }}
                            className={`border-bottom ${!notification.isRead ? 'bg-light-subtle' : ''}`}
                            style={{ whiteSpace: 'normal' }}
                        >
                            <div className="d-flex align-items-start">
                                <div className="flex-grow-1">
                                    <div className="small text-body-secondary text-uppercase mb-1">
                                        {notification.title}
                                    </div>
                                    <div className="fw-normal">
                                        {notification.message}
                                    </div>
                                    <div className="small text-body-secondary mt-1">
                                        {new Date(notification.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                {!notification.isRead && (
                                    <div className="ms-2">
                                        <span className="d-inline-block bg-primary rounded-circle" style={{ width: '8px', height: '8px' }}></span>
                                    </div>
                                )}
                            </div>
                        </CDropdownItem>
                    ))
                )}
            </CDropdownMenu>
        </CDropdown >
    )
}

export default AppHeaderNotification
