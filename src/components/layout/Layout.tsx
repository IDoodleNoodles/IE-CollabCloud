import React from 'react'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'

interface LayoutProps {
    children: React.ReactNode
}

export const Layout = React.memo<LayoutProps>(({ children }) => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <div style={{ 
                flex: 1, 
                marginLeft: '250px',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Navbar />
                <main style={{ 
                    flex: 1, 
                    marginTop: '70px',
                    padding: '2rem',
                    background: '#f8fafc',
                    minHeight: 'calc(100vh - 70px)'
                }}>
                    {children}
                </main>
            </div>
        </div>
    )
})

Layout.displayName = 'Layout'
