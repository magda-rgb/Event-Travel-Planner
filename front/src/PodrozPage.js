import { useMemo, useState } from 'react';
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
    const connectionsCountLabel = useMemo(() => {
        const n = Array.isArray(opcje) ? opcje.length : 0;
        return `Znaleziono ${n} połączeń`;
    }, [opcje]);

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
            <section className="transport-page">
                <section className="transport-card">
                    <header className="transport-header">
                        <h2>Wybierz transport</h2>
                        <p className="muted">Wyszukaj najlepsze połączenia w wybranym terminie</p>
                    </header>

                    <form onSubmit={handleSearch} className="transport-form">
                        <div className="transport-field">
                            <label className="transport-label" htmlFor="transport-from">Skąd</label>
                            <input
                                id="transport-from"
                                type="text"
                                placeholder="np. Gdańsk"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                aria-label="Skąd"
                            />
                        </div>

                        <div className="transport-field">
                            <label className="transport-label" htmlFor="transport-to">Dokąd</label>
                            <input
                                id="transport-to"
                                type="text"
                                placeholder="np. Warszawa"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                aria-label="Dokąd"
                            />
                        </div>

                        <div className="transport-field">
                            <label className="transport-label" htmlFor="transport-date">Data</label>
                            <input
                                id="transport-date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                aria-label="Data"
                            />
                        </div>

                        <div className="transport-actions">
                            <button type="submit" disabled={isLoading || !from || !to || !date}>
                                Szukaj połączeń
                            </button>
                        </div>
                    </form>
                </section>

                <section className="transport-card">
                    <header className="transport-results-header">
                        <div>
                            <h3>Dostępne połączenia</h3>
                            <p className="muted">{connectionsCountLabel}</p>
                        </div>
                    </header>

                    {isLoading ? <p className="muted">Ładowanie…</p> : null}
                    {error ? <p className="muted">{error}</p> : null}

                    {opcje.length ? (
                        <div className="transport-list" role="list">
                            {opcje.map((o) => {
                                const times = o.depart && o.arrive ? `${o.depart} → ${o.arrive}` : '—';
                                const duration = o.duration_text || '';
                                return (
                                    <div key={o.id} className="transport-row" role="listitem">
                                        <div className="transport-row-main">
                                            <div className="transport-row-title">{o.summary || 'Połączenie'}</div>
                                            <div className="transport-row-sub">{o.id ? `IC ${o.id}` : ''}</div>
                                        </div>

                                        <div className="transport-row-time">{o.depart || '—'}</div>
                                        <div className="transport-row-arrow" aria-hidden="true">→</div>
                                        <div className="transport-row-time">{o.arrive || '—'}</div>

                                        <div className="transport-row-meta">{duration}</div>

                                        <div className="transport-row-actions">
                                            {o.url ? (
                                                <a
                                                    className="transport-details"
                                                    href={o.url}
                                                    target="_blank"
                                                    rel="noreferrer noopener"
                                                >
                                                    Szczegóły
                                                </a>
                                            ) : (
                                                <button type="button" className="transport-details" disabled>
                                                    Szczegóły
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="transport-empty muted">
                            {error ? null : 'Wpisz trasę i datę, a potem wyszukaj połączenia.'}
                        </div>
                    )}
                </section>
            </section>
        </div>
    );
}

export default PodrozPage;
