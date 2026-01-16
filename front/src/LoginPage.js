import { useState } from 'react';
import {LOGIN_URL} from "./constants";
import {useNavigate} from "react-router-dom";
import {useAuth} from "./AuthContext";

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const {login} = useAuth();
    const [themeOn, setThemeOn] = useState(
        document.documentElement.classList.contains("dark")
    );
    
    function toggleTheme() {
        setThemeOn((prev) => {
            const next = !prev;
            document.documentElement.classList.toggle("dark", next);
            localStorage.theme = next ? "dark" : "light";
            return next;
        });
    }
    
    async function handleLogin(e) {
        e.preventDefault();
        try {
            const requestBody = {username: username, password: password};
            const response = await fetch(LOGIN_URL, {
                method: 'POST',
                body: new URLSearchParams(requestBody),
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/x-www-form-urlencoded",
                }
            });
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            
            const data = await response.json();
            
            login(username, data.access_token)
            
            navigate('/');
        } catch (error) {
            console.error(error.message);
        }
      
    }
    
    return (
        <div className="page">
            <section className="heading">
                <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => navigate(-1)}>
                    Back
                </button>
                <section className="buttons-sth">
                    <button type="button" className="ghost-btn">
                        ENG/PL
                    </button>

                    <button
                        type="button"
                        className={`toggle ${themeOn ? "is-on" : ""}`}
                        onClick={toggleTheme}
                        aria-label="Motyw"
                    >
                        <span className="toggle-knob" />
                    </button>

                </section>
            </section>
        <section className="login-card">
        <div className="login">
        <form onSubmit={handleLogin} className="login-form-space">
            <div className="eyebrow">
                <label className="login-form">UserName
                    <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}/>
                </label>
            </div>
            <div className="eyebrow">
            <label className="login-form">Password
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}/>
                </label>
            </div>
            <div className="login-form">
                <button type="submit">Zaloguj</button>
            </div>
        </form>
        </div>
        </section>
        </div>
    )
}
export default LoginPage;