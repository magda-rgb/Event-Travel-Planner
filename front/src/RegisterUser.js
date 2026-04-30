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

    

    async function handleRegister(e) {
        e.preventDefault();
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
            if (!response.ok) {
                throw new Error(response.statusText);
            }

            await response.json();


            navigate('/');
        } catch (error) {
            console.error(error.message);
        }

    }

    return (
        <div className="page">
            <PageHeader />
            <FormField
                title="Rejestracja"
                onSubmit={handleRegister}
                cardClassName="register-card"
                contentClassName="c"
                formClassName="register-form-space"
                buttonText="Zarejestruj się"
            >
                <div className="form-field">
                    <label htmlFor="reg-username" className="field-label">Nazwa użytkownika</label>
                    <input
                        id="reg-username"
                        type="text"
                        autoComplete="username"
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
            </FormField>
        </div>

    )
}
export default RegisterUser;
