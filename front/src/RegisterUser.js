import { useState } from 'react';
import { REGISTER_URL} from "./constants";
import {useNavigate} from "react-router-dom";
import FormField from "./components/FormField";
import PageHeader from "./components/PageHeader";

function RegisterUser() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState('');

    async function handleRegister(e) {
        e.preventDefault();
        setErrorMsg('');
        try {
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
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const msg = data?.detail || response.statusText || 'Rejestracja nie powiodła się';
                throw new Error(msg);
            }

            navigate('/');
        } catch (error) {
            setErrorMsg(error.message);
        }

    }

    return (
        <div className="page">
            <PageHeader />
            <FormField
                title="Rejestracja"
                onSubmit={handleRegister}
                cardClassName="register-card"
                contentClassName="login"
                formClassName="register-form-space"
                buttonText="Zarejestruj się"
            >
                <div className="form-field">
                    <label htmlFor="reg-username" className="field-label">Nazwa użytkownika</label>
                    <input
                        id="reg-username"
                        type="text"
                        autoComplete="username"
                        placeholder="Wpisz nazwę użytkownika"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="form-field">
                    <label htmlFor="reg-fullname" className="field-label">Imię i nazwisko</label>
                    <input
                        id="reg-fullname"
                        type="text"
                        autoComplete="name"
                        placeholder="Wpisz imię i nazwisko"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                    />
                </div>
                <div className="form-field">
                    <label htmlFor="reg-password" className="field-label">Hasło</label>
                    <input
                        id="reg-password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Wpisz hasło"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="form-field">
                    <label htmlFor="reg-email" className="field-label">E-mail</label>
                    <input
                        id="reg-email"
                        type="email"
                        autoComplete="email"
                        placeholder="Wpisz e-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
            </FormField>
            {errorMsg ? (
                <p role="alert" className="mt-4 text-center text-sm text-red-600">
                    {errorMsg}
                </p>
            ) : null}
        </div>

    )
}
export default RegisterUser;
