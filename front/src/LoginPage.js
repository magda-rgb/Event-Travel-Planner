import { useState } from 'react';
import {LOGIN_URL} from "./constants";
import {useLocation, useNavigate} from "react-router-dom";
import {useAuth} from "./AuthContext";
import FormField from "./components/FormField";
import PageHeader from "./components/PageHeader";

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from;
    
    const {login} = useAuth();
    const [errorMsg, setErrorMsg] = useState('');
    const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);

  
    
    async function handleLogin(e) {
        e.preventDefault();
        setErrorMsg("");

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
            const data = await response.json().catch(() => ({}));


            if (!response.ok) {
                const msg = data?.detail || "Nie udało się zalogować";
                throw new Error(msg);
            }

            login(username, data.access_token);
            if (from){
                navigate(from,{replace:true});
            }
            else
            {
                navigate("/", {replace:true});
            }
        } catch (err) {
            setErrorMsg(err.message);
            setIsErrorDialogOpen(true);
        }
    }
    
    return (
        <div className="page">
            <PageHeader />
            <FormField title="Logowanie"
                   onSubmit={handleLogin}
                   cardClassName="login-card"
                   contentClassName="c"
                   formClassName="login-form-space"
                   buttonText="Zaloguj">
            <div className="form-field">
                <label htmlFor="login-username" className="field-label">Nazwa użytkownika</label>
                <input
                    id="login-username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div className="form-field">
                <label htmlFor="login-password" className="field-label">Hasło</label>
                <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            </FormField>

            {isErrorDialogOpen ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="login-error-title"
                >
                    <div className="w-full max-w-md rounded-2xl border border-red-300/40 bg-white p-6 shadow-2xl dark:border-red-400/40 dark:bg-slate-900">
                        <h2 id="login-error-title" className="text-lg font-semibold text-red-600 dark:text-red-400">
                            Błąd logowania
                        </h2>
                        <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">
                            {errorMsg || 'Nie udało się zalogować. Spróbuj ponownie.'}
                        </p>
                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
                                onClick={() => setIsErrorDialogOpen(false)}
                            >
                                Zamknij
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    )
}
export default LoginPage;
