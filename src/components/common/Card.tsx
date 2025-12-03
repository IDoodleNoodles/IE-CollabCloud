import React from 'react'

interface CardProps {
    children: React.ReactNode
    className?: string
    style?: React.CSSProperties
    onClick?: () => void
    hoverable?: boolean
}

export const Card = React.memo<CardProps>(({ 
    children, 
    className = '', 
    style = {},
    onClick,
    hoverable = false
}) => {
    const baseClassName = 'card'
    const hoverClassName = hoverable ? 'card-hoverable' : ''
    const combinedClassName = `${baseClassName} ${hoverClassName} ${className}`.trim()
    
    return (
        <div 
            className={combinedClassName} 
            style={style}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onClick()
                }
            } : undefined}
        >
            {children}
        </div>
    )
})

Card.displayName = 'Card'
