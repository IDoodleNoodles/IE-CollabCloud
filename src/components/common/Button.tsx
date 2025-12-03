import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline'
    size?: 'sm' | 'md' | 'lg'
    children: React.ReactNode
}

export const Button = React.memo<ButtonProps>(({ 
    variant = 'primary', 
    size = 'md',
    className = '',
    children, 
    ...props 
}) => {
    const baseStyles = 'border-none cursor-pointer transition-all border-radius-8px font-weight-600'
    
    const variantStyles = {
        primary: '',
        secondary: 'secondary',
        danger: 'danger',
        success: 'success',
        outline: 'outline'
    }
    
    const sizeStyles = {
        sm: 'padding-0.5rem-1rem font-size-0.875rem',
        md: 'padding-0.75rem-1.5rem font-size-1rem',
        lg: 'padding-1rem-2rem font-size-1.125rem'
    }
    
    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim()
    
    return (
        <button className={combinedClassName} {...props}>
            {children}
        </button>
    )
})

Button.displayName = 'Button'
