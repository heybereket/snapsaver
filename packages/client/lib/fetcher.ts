import {API_URL} from './constants';

export const fetcher = async (url: string, init: Partial<RequestInit> = {}) => {
    console.log(`${API_URL}/${url}`)
	return await fetch(`${API_URL}/${url}`, {
		mode: 'cors',
		...init,
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			...init.headers,
		},
	}).then(res => res.json());
};