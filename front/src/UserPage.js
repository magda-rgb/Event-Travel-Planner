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
                <FormField title="Zmiana danych" onSubmit={handleChangeUser} cardClassName="data-card" contentClassName="data" formClassName="data-form-space" buttonText="Zapisz zmiany" headingTag="h2">
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
                <section className="data-card">
                    <div className="profile">
                        <h2 className="auth-panel-title">Profil użytkownika</h2>
                        {userData ? (
                            <section>
                                <dl>
                                    <dt className="eyebrow-tw" ><b>Nazwa użytkownika</b></dt>
                                    <dd>{userData.username}</dd>
    
                                    <dt className="eyebrow-tw"><b>Imię i nazwisko</b></dt>
                                    <dd>{userData.fullname}</dd>
    
                                    <dt className="eyebrow-tw"><b>E-mail</b></dt>
                                    <dd>{userData.email}</dd>
    
                                    <dt className="eyebrow-tw"><b>Status konta</b></dt>
                                    <dd>{userData.disabled ? "Zablokowane" : "Aktywne"}</dd>
                                </dl>
                            </section>
                        ) : (
                            <p className="muted">Ładowanie danych użytkownika…</p>
                        )}
                    </div>
                </section>
                <FormField title="Usuwanie konta" onSubmit={handleDeleteUser} contentClassName="delete" formClassName="delete-form-space"  buttonText="Usuń konto" headingTag="h2">
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
                </FormField>
            </section>
        </div>
    );
}
export default UserPage;
