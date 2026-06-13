export function normalizeApiBaseUrl(url) {
    const trimmedUrl = url?.trim()

    if (!trimmedUrl) {
        return ''
    }

    if (/^https?:\/\//i.test(trimmedUrl)) {
        return trimmedUrl
    }

    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:'
    return `${protocol}//${trimmedUrl.replace(/^\/+/, '')}`
}