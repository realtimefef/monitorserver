import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User } from '@/lib/api';
import { getToken, setToken, clearToken, decodeJwtPayload, isTokenExpired } from '@/lib/apiClient';
import { disconnectStomp } from '@/hooks/use-realtime';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};

function userFromToken(token: string): User | null {
    const payload = decodeJwtPayload(token);
    if (!payload) return null;
    return {
        id: payload.sub ?? payload.id ?? '',
        email: payload.email ?? '',
        username: payload.username ?? payload.email?.split('@')[0] ?? 'User',
        role: payload.role ?? 'User',
    };
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimers = () => {
        if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };

    const scheduleExpiry = (token: string) => {
        clearTimers();
        const payload = decodeJwtPayload(token);
        if (!payload?.exp) return;
        const now = Date.now();
        const msUntilExpiry = payload.exp * 1000 - now;
        const msUntilWarning = msUntilExpiry - 60_000;

        if (msUntilWarning > 0) {
            warningTimerRef.current = setTimeout(() => {
                window.dispatchEvent(new CustomEvent('monitor:session-expiring'));
            }, msUntilWarning);
        }

        if (msUntilExpiry > 0) {
            expiryTimerRef.current = setTimeout(() => {
                disconnectStomp();
                clearToken();
                setUser(null);
                window.dispatchEvent(new CustomEvent('monitor:session-expired'));
            }, msUntilExpiry);
        } else {
            clearToken();
        }
    };

    useEffect(() => {
        // Restore session on mount
        const token = getToken();
        if (token && !isTokenExpired(token)) {
            setUser(userFromToken(token));
            scheduleExpiry(token);
        } else if (token) {
            clearToken();
        }
        setLoading(false);

        // Cross-tab sync
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'monitor_token' && !e.newValue) {
                setUser(null);
                clearTimers();
            }
        };
        window.addEventListener('storage', handleStorage);

        // Handle 401 from any API call
        const handleUnauthorized = () => {
            setUser(null);
            clearTimers();
        };
        window.addEventListener('monitor:unauthorized', handleUnauthorized);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('monitor:unauthorized', handleUnauthorized);
            clearTimers();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = (token: string, serverUser: User) => {
        setToken(token);
        setUser(serverUser);
        scheduleExpiry(token);
    };

    const logout = () => {
        disconnectStomp();
        clearToken();
        setUser(null);
        clearTimers();
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
