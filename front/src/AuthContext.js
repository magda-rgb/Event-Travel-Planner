import {createContext, useContext, useState} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem("access_token");
        const username = localStorage.getItem("username");

        return token && username ? {username, token} : null;
    });

    const login = (username, token) => {
        localStorage.setItem("access_token", token);
        localStorage.setItem("username", username);
        setUser({username, token});
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("username");
        setUser(null);
    };
    
    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}