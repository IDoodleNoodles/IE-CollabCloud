import React, { useEffect, useCallback } from 'react'
import { Button } from './Button'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    children: React.ReactNode
    footer?: React.ReactNode
    maxWidth?: string
}

export const Modal = React.memo<ModalProps>(({ 
    isOpen, 
    onClose, 
    title,
    children, 
    footer,
    maxWidth = '500px'
}) => {
    const handleEscape = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose()
        }
    }, [onClose])

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, handleEscape])

    if (!isOpen) return null

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
                padding: '2rem'
            }}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
        >
            <div
                className="card"
                style={{ 
                    maxWidth, 
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'auto'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {title && (
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '1rem'
                    }}>
                        <h3 id="modal-title" style={{ margin: 0 }}>{title}</h3>
                        <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={onClose}
                            aria-label="Close modal"
                        >
                            ✕
                        </Button>
                    </div>
                )}
                <div>{children}</div>
                {footer && (
                    <div style={{ marginTop: '1.5rem' }}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    )
})

Modal.displayName = 'Modal'
