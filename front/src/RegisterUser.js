import { useState } from 'react';
import { REGISTER_URL} from "./constants";
import {useNavigate} from "react-router-dom";

function RegisterUser() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

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

    async function handleRegister(e) {
        e.preventDefault();
        try {
            const requestBody = {username: username, fullname: fullname, password: password, email: email};
            const response = await fetch(REGISTER_URL, {
                method: 'POST',
                body: JSON.stringify({
                    username,
                    password,
                    fullname,
                    email,
                }),
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                }
            });
            if (!response.ok) {
                throw new Error(response.statusText);
            }

            const data = await response.json();


            navigate('/');
        } catch (error) {
            console.error(error.message);
        }

    }

    
    
    
    return (
        <div className="page">
            <section className="heading">
                <div className="heading-one">
                <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => navigate(-1)}>
                    Back
                </button>
                </div>
                <div className="heading-two">
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
                </div>
            </section>
            <section className="login-card">
                <div className="login">
                    <form onSubmit={handleRegister} className="login-form-space">
                        <div className="eyebrow">
                            <label className="login-form">UserName
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}/>
                            </label>
                            <label className="login-form">fullname
                                <input
                                    type="text"
                                    value={fullname}
                                    onChange={(e) => setFullname(e.target.value)}/>
                            </label>
                            <label className="login-form">password
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}/>
                            </label>
                            <label className="login-form">email
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}/>
                            </label>
                        </div>
                            
                        
                        <div className="login-form">
                            <button type="submit" >Zarejestruj się</button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    )
}
export default RegisterUser;