export const API_URL = process.env.NEXT_PUBLIC_API_URL
	? `${process.env.NEXT_PUBLIC_API_URL}/v1`
	: 'http://localhost:8080/v1';