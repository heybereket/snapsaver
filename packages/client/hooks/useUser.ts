import useSWR from 'swr';

export const useUser = () => {
	const {data, error} = useSWR(`auth/google/@me`);
	const user = data?.data;

	return {
		user,
		isLoading: !error && !data,
		isError: error,
	};
};