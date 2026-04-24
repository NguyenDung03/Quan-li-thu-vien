
export function calculateNextCardSequence(readers: { cardNumber: string }[]): string {
	if (!readers || readers.length === 0) {
		return '00001'
	}

	
	const maxSeq = readers.reduce((max, reader) => {
		const match = reader.cardNumber.match(/(\d{5})$/)
		if (match) {
			const seq = parseInt(match[1], 10)
			return seq > max ? seq : max
		}
		return max
	}, 0)

	return (maxSeq + 1).toString().padStart(5, '0')
}


export function generateCardNumber(
	readerTypeId: string,
	readerTypes: { id: string; typeName: string }[],
	nextSequence: string
): string {
	const year = new Date().getFullYear().toString().slice(-2) 

	
	const readerType = readerTypes.find(rt => rt.id === readerTypeId)
	const typePrefix = readerType?.typeName.toUpperCase().slice(0, 3) || 'UNK'

	return `HDA-${typePrefix}-${year}${nextSequence}`
}
