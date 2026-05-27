import { useEffect,useState } from 'react';
import {USER_ME_URL,DELETE_USER_URL, UPDATE_USER_URL} from "./constants";
import {useNavigate} from "react-router-dom";
import {useAuth} from "./AuthContext";
import PageHeader from "./components/PageHeader";
import FormField from "./components/FormField";

function UserPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [deletePassword, setDeletePassword] = useState('');
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const {user,logout} =useAuth();
    const [userData, setUserData] = useState(''); 
    
    useEffect(() => {
        if (!user?.token){
            navigate('/')
            return;
        }
        fetch(USER_ME_URL, {
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        })
        .then(res => res.json())
        .then(data => setUserData(data))
        .catch(err => console.error(err));
    }, [navigate, user?.token]);

    async function handleChangeUser(e) {
        e.preventDefault();
        try {
            const response = await fetch(UPDATE_USER_URL, {
                method: 'PUT',
                body: JSON.stringify({
                    username,
                    password,
                    fullname,
                    email,
                }),
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                }
            });
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            const meResponse = await fetch(USER_ME_URL, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });

            const meData = await meResponse.json();
            setUserData(meData);
            
            setUsername('');
            setPassword('');
            setFullname('');
            setEmail('');
            
        } catch (error) {
            console.error(error.message);
        }

    }

    async function handleDeleteUser(e) {
        e.preventDefault();
        try {
            const response = await fetch(DELETE_USER_URL, {
                method: 'DELETE',
                body: JSON.stringify({
                    password: deletePassword,
                }),
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                }
            });
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            logout();
            navigate('/');
        } catch (error) {
            console.error(error.message);
        }
    }

    return (
        <div className="page">
            <PageHeader />
            <section className="user-page">
                <FormField
                    title="Zmiana danych"
                    subtitle="Zaktualizuj swoje dane kontaktowe"
                    icon={
                        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path
                                fill="currentColor"
                                d="M12 12a4 4 0 1 0-4-4a4 4 0 0 0 4 4Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z"
                            />
                        </svg>
                    }
                    onSubmit={handleChangeUser}
                    cardClassName="account-card"
                    contentClassName="data"
                    formClassName="data-form-space"
                    buttonText="Zapisz zmiany"
                    headingTag="h2"
                >
                            <div className="form-field">
                                <label htmlFor="user-username" className="field-label">Nazwa użytkownika</label>
                                <input
                                    id="user-username"
                                    type="text"
                                    autoComplete="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div className="form-field">
                                <label htmlFor="user-fullname" className="field-label">Imię i nazwisko</label>
                                <input
                                    id="user-fullname"
                                    type="text"
                                    autoComplete="name"
                                    value={fullname}
                                    onChange={(e) => setFullname(e.target.value)}
                                />
                            </div>
                            <div className="form-field">
                                <label htmlFor="user-password" className="field-label">Nowe hasło (pozostaw puste, jeśli bez zmian)</label>
                                <input
                                    id="user-password"
                                    type="password"
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="form-field">
                                <label htmlFor="user-email" className="field-label">E-mail</label>
                                <input
                                    id="user-email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                </FormField>
                <section className="account-card">
                    <div className="profile">
                        <div className="card-header">
                            <div className="card-header-icon" aria-hidden="true">
                                <svg width="20" height="20" viewBox="0 0 24 24" focusable="false">
                                    <path
                                        fill="currentColor"
                                        d="M12 12a4 4 0 1 0-4-4a4 4 0 0 0 4 4Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z"
                                    />
                                </svg>
                            </div>
                            <div className="card-header-text">
                                <h2 className="auth-panel-title">Profil użytkownika</h2>
                                <p className="auth-panel-subtitle">Twoje dane profilowe</p>
                            </div>
                        </div>
                        {userData ? (
                            <div className="profile-list">
                                <div className="profile-row">
                                    <div className="profile-row-text">
                                        <div className="profile-row-label">Nazwa użytkownika</div>
                                        <div className="profile-row-value">{userData.username || '—'}</div>
                                    </div>
                                </div>
                                <div className="profile-row">
                                    <div className="profile-row-text">
                                        <div className="profile-row-label">Imię i nazwisko</div>
                                        <div className="profile-row-value">{userData.fullname || '—'}</div>
                                    </div>
                                </div>
                                <div className="profile-row">
                                    <div className="profile-row-text">
                                        <div className="profile-row-label">E-mail</div>
                                        <div className="profile-row-value">{userData.email || '—'}</div>
                                    </div>
                                </div>
                                <div className="profile-row">
                                    <div className="profile-row-text">
                                        <div className="profile-row-label">Status konta</div>
                                        <div className="profile-row-value">
                                            <span className={`status-pill ${userData.disabled ? 'is-off' : 'is-on'}`}>
                                                {userData.disabled ? "Zablokowane" : "Aktywne"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="muted">Ładowanie danych użytkownika…</p>
                        )}
                    </div>
                </section>
                <FormField
                    title="Usuwanie konta"
                    subtitle="Trwale usuń swoje konto"
                    icon={
                        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path
                                fill="currentColor"
                                d="M12 2a10 10 0 0 0-10 10a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2Zm1 14h-2v-2h2Zm0-4h-2V6h2Z"
                            />
                        </svg>
                    }
                    onSubmit={handleDeleteUser}
                    cardClassName="account-card"
                    contentClassName="delete"
                    formClassName="delete-form-space"
                    buttonText="Usuń konto"
                    headingTag="h2"
                >
                            <div className="form-field">
                                <label htmlFor="delete-password" className="field-label">Potwierdź hasłem</label>
                                <input
                                    id="delete-password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                />
                            </div>
                            <div className="danger-note" role="note">
                                <b>Uwaga:</b> Ta operacja jest nieodwracalna. Wszystkie Twoje dane zostaną trwale usunięte.
                            </div>
                </FormField>
            </section>
        </div>
    );
}
export default UserPage;
