import { useEffect,useState } from 'react';
import {USER_ME_URL,DELETE_USER_URL, UPDATE_USER_URL} from "./constants";
import {useNavigate} from "react-router-dom";
import {useAuth} from "./AuthContext";

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
                    <form onSubmit={handleChangeUser} className="login-form-space">
                        <div className="eyebrow">
                            <label className="login-form">UserName
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}/>
                            </label>
                        </div>
                        <div className="eyebrow">
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
                        <div className="eyebrow">

                        </div>
                        <div className="login-form">
                            <button type="submit" >zmień dane</button>
                        </div>
                    </form>
                </div>
            </section>
            <section>
                <div>
                    <h1>Profil użytkownika</h1>
                    {userData ? (
                        <section>
                            <dl>
                                <dt><b>Nazwa użytkownika</b></dt>
                                <dd>{userData.username}</dd>

                                <dt><b>Imie i nazwisko</b></dt>
                                <dd>{userData.fullname}</dd>

                                <dt><b>e-mail</b></dt>
                                <dd>{userData.email}</dd>

                                <dt><b>Status konta</b></dt>
                                <dd>{userData.disabled ? "Zablokowane" : "Aktywne"}</dd>
                            </dl>
                        </section>
                    ) : (
                        <p>Ładowanie danych użytkownika</p>
                    )}
                </div>
            </section>
            
            
            <section className="login-card">
                <div className="login">
                    <form onSubmit={handleDeleteUser} className="login-form-space">
                        <div className="eyebrow">
                            <label className="login-form">password
                                <input
                                    type="password"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}/>
                            </label>
                            
                        </div>
                        <div className="eyebrow">

                        </div>
                        <div className="login-form">
                            <button type="submit" >Usuń użytkowanika</button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    )
}
export default UserPage;