import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({
    children
}) => {
    const [token, setToken] = useState(
        () =>
            localStorage.getItem(
                "codevault_token"
            )
    );

    const [user, setUser] = useState(() => {
        const storedUser =
            localStorage.getItem(
                "codevault_user"
            );

        if (!storedUser) {
            return null;
        }

        try {
            return JSON.parse(storedUser);
        } catch {
            return null;
        }
    });

    const [isLoading, setIsLoading] =
        useState(true);

    useEffect(() => {
        setIsLoading(false);
    }, []);

    const login = ({
        token: newToken,
        user: newUser
    }) => {
        localStorage.setItem(
            "codevault_token",
            newToken
        );

        localStorage.setItem(
            "codevault_user",
            JSON.stringify(newUser)
        );

        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem(
            "codevault_token"
        );

        localStorage.removeItem(
            "codevault_user"
        );

        setToken(null);
        setUser(null);
    };

    const isAuthenticated = Boolean(token);

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                isAuthenticated,
                isLoading,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
};