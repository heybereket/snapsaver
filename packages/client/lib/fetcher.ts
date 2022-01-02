import axios from 'axios';
import {API_URL} from './constants';

import useSWR from 'swr';

export const useUser = () => {
    const {data, error} = useSWR('auth/google/@me');
    const user = data?.data;

    return {
        user,
        isLoading: !error && !data,
        isError: error,
    };
};

export const fetcher = async (url: string, init: Partial<RequestInit> = {}) => {
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