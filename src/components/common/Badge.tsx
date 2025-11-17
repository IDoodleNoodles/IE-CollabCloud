import React from 'react'

interface BadgeProps {
    children: React.ReactNode
    variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
    size?: 'xs' | 'sm' | 'md'
    style?: React.CSSProperties
}

export const Badge = React.memo<BadgeProps>(({ 
    children, 
    variant = 'primary',
    size = 'sm',
    style = {}
}) => {
    const baseClassName = 'badge'
    const variantClassName = variant !== 'primary' ? variant : ''
    const sizeClassName = size !== 'sm' ? `text-${size}` : 'text-xs'
    
    const combinedClassName = `${baseClassName} ${variantClassName} ${sizeClassName}`.trim()
    
    return (
        <span className={combinedClassName} style={style}>
            {children}
        </span>
    )
})

Badge.displayName = 'Badge'
