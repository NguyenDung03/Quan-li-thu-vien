import { useCallback, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'


function stableDefaultSignature<T extends Record<string, string | number | boolean | undefined>>(
	defaults: T,
): string {
	const keys = Object.keys(defaults).sort((a, b) => a.localeCompare(b))
	return keys
		.map((k) => {
			const v = defaults[k as keyof T]
			const encoded = v === undefined ? '∅' : JSON.stringify(v)
			return `${k}:${encoded}`
		})
		.join('|')
}


export const useQueryParameters = <T extends Record<string, string | number | boolean | undefined>>(
	defaultValues: T,
) => {
	const [searchParams, setSearchParams] = useSearchParams()
	const searchKey = searchParams.toString()

	const signature = stableDefaultSignature(defaultValues)
	const stableDefaultsRef = useRef(defaultValues)
	const lastSignatureRef = useRef<string | null>(null)

	if (lastSignatureRef.current === null || lastSignatureRef.current !== signature) {
		lastSignatureRef.current = signature
		stableDefaultsRef.current = defaultValues
	}

	const defaults = stableDefaultsRef.current

	const getParam = useCallback(
		<K extends keyof T>(key: K): T[K] => {
			const value = searchParams.get(String(key))

			if (value === null) return defaults[key]

			if (typeof defaults[key] === 'number') {
				const parsed = Number(value)
				return (Number.isNaN(parsed) ? defaults[key] : parsed) as T[K]
			}

			if (typeof defaults[key] === 'boolean') {
				return (value === 'true') as T[K]
			}

			return value as T[K]
		},
		[searchKey, defaults, searchParams],
	)

	const setParam = useCallback(
		<K extends keyof T>(
			key: K,
			value: T[K],
			options?: { replace?: boolean },
		) => {
			const newParams = new URLSearchParams(searchParams)

			if (
				value === undefined ||
				value === '' ||
				value === null ||
				(typeof value === 'string' && value.trim() === '')
			) {
				newParams.delete(String(key))
			} else {
				newParams.set(String(key), String(value))
			}

			setSearchParams(newParams, { replace: options?.replace ?? true })
		},
		[searchParams, setSearchParams],
	)

	const setMultipleParams = useCallback(
		(updates: Partial<T>, options?: { replace?: boolean }) => {
			const newParams = new URLSearchParams(searchParams)

			Object.entries(updates).forEach(([key, value]) => {
				if (
					value === undefined ||
					value === '' ||
					value === null ||
					(typeof value === 'string' && value.trim() === '')
				) {
					newParams.delete(key)
				} else {
					newParams.set(key, String(value))
				}
			})

			setSearchParams(newParams, { replace: options?.replace ?? true })
		},
		[searchParams, setSearchParams],
	)

	const resetParams = useCallback(() => {
		setSearchParams(new URLSearchParams(), { replace: true })
	}, [setSearchParams])

	const params = useMemo(() => {
		const next = { ...defaults } as T
		;(Object.keys(defaults) as Array<keyof T>).forEach((key) => {
			next[key] = getParam(key)
		})
		return next
	}, [defaults, getParam, searchKey])

	return {
		params,
		setParam,
		setMultipleParams,
		resetParams,
		searchParams,
	}
}
