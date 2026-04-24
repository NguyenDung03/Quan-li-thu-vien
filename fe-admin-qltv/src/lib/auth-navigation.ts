import type { NavigateFunction } from 'react-router-dom'

let navigateRef: NavigateFunction | null = null
let onUnauthorizedRef: (() => void) | null = null

export function registerAuthNavigation(
	navigate: NavigateFunction,
	onUnauthorized: () => void,
) {
	navigateRef = navigate
	onUnauthorizedRef = onUnauthorized
}

export function clearAuthNavigation() {
	navigateRef = null
	onUnauthorizedRef = null
}


export function triggerUnauthorizedRedirect() {
	onUnauthorizedRef?.()

	if (window.location.pathname.includes('/login')) {
		return
	}

	if (navigateRef) {
		navigateRef('/login', { replace: true })
	} else {
		window.location.href = '/login'
	}
}
