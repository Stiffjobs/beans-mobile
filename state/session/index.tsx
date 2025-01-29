import { supabase } from '@/utils/supabase';
import { AuthError, Session, SupabaseClient } from '@supabase/supabase-js';
import React, {
	createContext,
	PropsWithChildren,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';

export type SessionContext =
	| {
			isLoading: true;
			session: null;
			error: null;
	  }
	| {
			isLoading: false;
			session: Session;
			error: null;
	  }
	| {
			isLoading: false;
			session: null;
			error: AuthError;
	  }
	| {
			isLoading: false;
			session: null;
			error: null;
	  };

const SessionContext = createContext<SessionContext>({
	isLoading: true,
	session: null,
	error: null,
});

export interface SessionContextProviderProps {
	initialSession?: Session | null;
}

export function Provider({
	initialSession = null,
	children,
}: PropsWithChildren<SessionContextProviderProps>) {
	const [session, setSession] = useState<Session | null>(initialSession);
	const [isLoading, setIsLoading] = useState<boolean>(!initialSession);
	const [error, setError] = useState<AuthError>();

	useEffect(() => {
		if (!session && initialSession) {
			setSession(initialSession);
		}
	}, [session, initialSession]);

	useEffect(() => {
		let mounted = true;

		async function getSession() {
			const {
				data: { session },
				error,
			} = await supabase.auth.getSession();

			// only update the react state if the component is still mounted
			if (mounted) {
				if (error) {
					setError(error);
					setIsLoading(false);
					return;
				}

				setSession(session);
				setIsLoading(false);
			}
		}

		getSession();

		return () => {
			mounted = false;
		};
	}, []);

	useEffect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			console.log('auth event', event);
			if (
				session &&
				(event === 'SIGNED_IN' ||
					event === 'TOKEN_REFRESHED' ||
					event === 'USER_UPDATED')
			) {
				setSession(session);
			}

			if (event === 'SIGNED_OUT') {
				setSession(null);
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	const value: SessionContext = useMemo(() => {
		if (isLoading) {
			return {
				isLoading: true,
				session: null,
				error: null,
			};
		}

		if (error) {
			return {
				isLoading: false,
				session: null,
				error,
			};
		}

		return {
			isLoading: false,
			session,
			error: null,
		};
	}, [isLoading, session, error]);

	return (
		<SessionContext.Provider value={value}>{children}</SessionContext.Provider>
	);
}

export const useSessionContext = () => {
	const context = useContext(SessionContext);
	if (context === undefined) {
		throw new Error(
			`useSessionContext must be used within a SessionContextProvider.`
		);
	}

	return context;
};

export const useSession = () => {
	const context = useContext(SessionContext);
	if (context === undefined) {
		throw new Error(`useSession must be used within a SessionContextProvider.`);
	}

	return context;
};

export const useUser = () => {
	const context = useContext(SessionContext);
	if (context === undefined) {
		throw new Error(`useUser must be used within a SessionContextProvider.`);
	}

	return context.session?.user ?? null;
};
