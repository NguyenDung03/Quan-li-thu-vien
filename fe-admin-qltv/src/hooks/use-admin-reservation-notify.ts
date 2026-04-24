import { useEffect } from 'react'
import { TOKEN_KEY } from '@/constants/auth-storage'
import { getBackendApiRoot } from '@/apis/axios-client'
import { reservationApi } from '@/apis/reservation.api'

export type ReservationCreatedEvent = {
	type: 'reservation_created'
	message: string
	reservationId: string
	readerId: string
	bookId: string
}

type UseAdminReservationNotifyOptions = {
	onReservationCreated?: (payload: ReservationCreatedEvent) => void
}

export function useAdminReservationNotify(options?: UseAdminReservationNotifyOptions) {
	const onReservationCreated = options?.onReservationCreated

	useEffect(() => {
		const token = localStorage.getItem(TOKEN_KEY)
		if (!token) return

		let eventSource: EventSource | null = null
		let cancelled = false

		const baseUrl = getBackendApiRoot()

		const connect = async () => {
			try {
				const { ticket } = await reservationApi.mintAdminSseTicket()
				if (cancelled) return

				const streamUrl = `${baseUrl}/reservations/notifications/admin/stream?ticket=${encodeURIComponent(ticket)}`
				eventSource = new EventSource(streamUrl)

				eventSource.onmessage = (event) => {
					try {
						const payload = JSON.parse(event.data) as
							| ReservationCreatedEvent
							| { type: 'ping' }

						if (payload.type !== 'reservation_created') return
						onReservationCreated?.(payload)
					} catch {
						void 0
					}
				}

				eventSource.onerror = () => {
					void 0
				}
			} catch {
				void 0
			}
		}

		void connect()

		return () => {
			cancelled = true
			eventSource?.close()
		}
	}, [onReservationCreated])
}
