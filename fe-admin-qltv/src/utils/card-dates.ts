
export function calculateCardDates(readerType: 'student' | 'teacher' | 'staff'): {
	cardIssueDate: string
	cardExpiryDate: string | null
} {
	const today = new Date()
	const cardIssueDate = today.toISOString().split('T')[0]

	let cardExpiryDate: string | null = null

	if (readerType === 'student') {
		const expiry = new Date(today)
		expiry.setFullYear(expiry.getFullYear() + 3)
		cardExpiryDate = expiry.toISOString().split('T')[0]
	}
	

	return { cardIssueDate, cardExpiryDate }
}
