import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { TRANSPORT_URL } from './constants';
import PageHeader from './components/PageHeader';

function PodrozPage() {
    const { state } = useLocation();
    const [from, setFrom] = useState('');
    const [to, setTo] = useState(state?.city || '');
    const [date, setDate] = useState(state?.date || '');
    const [opcje, setOpcje] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSearch(e) {
        e.preventDefault();
        if (!from || !to || !date) return;
        setIsLoading(true);
        setError('');
        setOpcje([]);
        try {
            const r = await fetch(TRANSPORT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ from_city: from, to_city: to, depart_date: date }),
            });
            const data = await r.json();
            if (!r.ok) throw new Error(data?.detail || `HTTP ${r.status}`);
            setOpcje(data.options || []);
            if (!(data.options || []).length) {
                setError('Brak połączeń dla tej trasy i daty.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="page">
            <PageHeader />
            <section className="events-page">
                <header className="section-header">
                    <h2>Wybierz transport</h2>
                </header>

                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Skąd"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        aria-label="Skąd"
                    />
                    <input
                        type="text"
                        placeholder="Dokąd"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        aria-label="Dokąd"
                    />
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        aria-label="Data"
                    />
                    <button type="submit">Szukaj</button>
                </form>

                {isLoading ? <p className="muted">Ładowanie…</p> : null}
                {error ? <p className="muted">{error}</p> : null}

                <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                    {opcje.map((o) => {
                        const times = o.depart && o.arrive ? `${o.depart} → ${o.arrive}` : '';
                        const label = [o.summary, times, o.duration_text].filter(Boolean).join(' • ');
                        return (
                            <li key={o.id} style={{ padding: '8px 0' }}>
                                {o.url ? (
                                    <a href={o.url} target="_blank" rel="noreferrer noopener">
                                        {label}
                                    </a>
                                ) : (
                                    <span>{label}</span>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </section>
        </div>
    );
}

export default PodrozPage;
