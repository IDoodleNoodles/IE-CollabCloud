// Utility functions for CollabCloud

/**
 * Format bytes to human readable file size
 */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes.toFixed(0) + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

/**
 * Get file size from base64 data URL
 */
export function getFileSizeFromDataUrl(dataUrl: string): number {
    try {
        const base64 = dataUrl.split(',')[1]
        return base64.length * 0.75
    } catch {
        return 0
    }
}

/**
 * Format timestamp to time ago string
 */
export function getTimeAgo(timestamp: number): string {
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
}

/**
 * Check if file is a text file that can be edited
 */
export function isTextFile(fileName: string): boolean {
    const ext = fileName.split('.').pop()?.toLowerCase()
    return ['txt', 'md', 'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json'].includes(ext || '')
}

/**
 * Get file extension from filename
 */
export function getFileExtension(fileName: string): string {
    return fileName.split('.').pop()?.toLowerCase() || ''
}

/**
 * Get file type icon/label
 */
export function getFileTypeLabel(fileName: string): string {
    const ext = getFileExtension(fileName)
    const typeMap: Record<string, string> = {
        'js': 'JS', 'ts': 'TS', 'jsx': 'JSX', 'tsx': 'TSX',
        'py': 'PY', 'java': 'JAVA', 'cpp': 'C++', 'c': 'C',
        'html': 'HTML', 'css': 'CSS', 'json': 'JSON',
        'md': 'MD', 'txt': 'TXT', 'pdf': 'PDF',
        'jpg': 'IMG', 'png': 'IMG', 'gif': 'IMG', 'svg': 'IMG',
        'zip': 'ZIP', 'rar': 'RAR', '7z': '7Z',
    }
    return typeMap[ext] || 'FILE'
}

/**
 * Encode text content to base64
 */
export function encodeToBase64(content: string): string {
    return btoa(encodeURIComponent(content))
}

/**
 * Decode base64 to text content
 */
export function decodeFromBase64(base64: string): string {
    return decodeURIComponent(atob(base64.replace(/\s/g, '')))
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
    return password.length >= 6
}

/**
 * Generate avatar color from string
 */
export function getAvatarColor(str: string): string {
    const colors = [
        '#2196f3', '#4caf50', '#ff9800', '#e91e63',
        '#9c27b0', '#00bcd4', '#8bc34a', '#ff5722'
    ]
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = str.codePointAt(i)! + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: number | null = null
    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait) as unknown as number
    }
}

/**
 * Download file from data URL or backend
 */
export function downloadFile(fileName: string, dataUrl: string, mimeType?: string, fileId?: string): void {
    try {
        // Check if this is a backend file (has fileId or doesn't start with 'data:')
        if (fileId || !dataUrl.startsWith('data:')) {
            // Download from backend API
            const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080'
            const a = document.createElement('a')
            a.href = `${API_BASE}/api/files/${fileId}/download`
            a.download = fileName
            a.target = '_blank'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            return
        }

        // Handle data URL
        const arr = dataUrl.split(',')
        const matches = /:(.*?);/.exec(arr[0])
        const mime = mimeType || (matches ? matches[1] : 'application/octet-stream')
        const bstr = atob(arr[1])
        let n = bstr.length
        const u8 = new Uint8Array(n)
        while (n--) u8[n] = bstr.codePointAt(n)!
        const blob = new Blob([u8], { type: mime })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        a.click()
        URL.revokeObjectURL(url)
    } catch (error) {
        console.error('Error downloading file:', error)
        throw new Error('Failed to download file')
    }
}
