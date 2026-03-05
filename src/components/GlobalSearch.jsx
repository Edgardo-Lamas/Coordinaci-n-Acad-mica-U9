import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, BookOpen, X } from 'lucide-react';
import { getInternos, getCursos } from '../data/dataService';

export default function GlobalSearch() {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [results, setResults] = useState({ internos: [], cursos: [] });
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Ctrl+K / Cmd+K para enfocar
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
                setOpen(true);
            }
            if (e.key === 'Escape') close();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    // Cerrar al hacer click fuera
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                close();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Búsqueda reactiva
    useEffect(() => {
        if (!query.trim()) {
            setResults({ internos: [], cursos: [] });
            return;
        }
        const q = query.toLowerCase();
        const internos = getInternos()
            .filter(i =>
                i.nombre_completo?.toLowerCase().includes(q) ||
                String(i.numero_interno).toLowerCase().includes(q) ||
                (i.dni || '').toLowerCase().includes(q)
            )
            .slice(0, 5);
        const cursos = getCursos()
            .filter(c => c.nombre?.toLowerCase().includes(q))
            .slice(0, 4);
        setResults({ internos, cursos });
    }, [query]);

    const close = () => {
        setOpen(false);
        setQuery('');
    };

    const handleSelect = (path) => {
        navigate(path);
        close();
    };

    const total = results.internos.length + results.cursos.length;
    const showDropdown = open && query.trim().length > 0;

    return (
        <div ref={containerRef} style={{ position: 'relative', flex: 1, maxWidth: 380, margin: '0 12px' }}>
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8, padding: '7px 12px',
            }}>
                <Search size={15} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => { setQuery(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    placeholder="Buscar interno o curso…"
                    style={{
                        background: 'none', border: 'none', outline: 'none',
                        color: 'white', fontSize: 13, width: '100%',
                    }}
                />
                {query ? (
                    <button onClick={close} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'rgba(255,255,255,0.4)', padding: 0, display: 'flex'
                    }}>
                        <X size={14} />
                    </button>
                ) : (
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', flexShrink: 0, fontFamily: 'monospace' }}>
                        ⌘K
                    </span>
                )}
            </div>

            {showDropdown && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                    background: 'white', borderRadius: 10,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                    zIndex: 1000, overflow: 'hidden',
                    border: '1px solid var(--gray-100)',
                }}>
                    {total === 0 ? (
                        <div style={{
                            padding: '16px', color: 'var(--gray-400)',
                            fontSize: 13, textAlign: 'center'
                        }}>
                            Sin resultados para <strong>"{query}"</strong>
                        </div>
                    ) : (
                        <>
                            {results.internos.length > 0 && (
                                <div>
                                    <div style={{
                                        padding: '10px 14px 4px', fontSize: 10, fontWeight: 700,
                                        textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gray-400)'
                                    }}>
                                        Internos
                                    </div>
                                    {results.internos.map(i => (
                                        <button
                                            key={i.numero_interno}
                                            onClick={() => handleSelect(`/internos/${i.numero_interno}`)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 10,
                                                width: '100%', padding: '9px 14px',
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                textAlign: 'left',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                        >
                                            <div style={{
                                                width: 28, height: 28, borderRadius: 6,
                                                background: 'var(--primary-50)', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                            }}>
                                                <Users size={14} style={{ color: 'var(--primary-500)' }} />
                                            </div>
                                            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-800)', flex: 1 }}>
                                                {i.nombre_completo}
                                            </span>
                                            <span style={{ fontSize: 11, color: 'var(--gray-400)', fontFamily: 'monospace' }}>
                                                #{i.numero_interno}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {results.cursos.length > 0 && (
                                <div style={{ borderTop: results.internos.length > 0 ? '1px solid var(--gray-100)' : 'none' }}>
                                    <div style={{
                                        padding: '10px 14px 4px', fontSize: 10, fontWeight: 700,
                                        textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gray-400)'
                                    }}>
                                        Cursos
                                    </div>
                                    {results.cursos.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => handleSelect('/cursos')}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 10,
                                                width: '100%', padding: '9px 14px',
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                textAlign: 'left',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                        >
                                            <div style={{
                                                width: 28, height: 28, borderRadius: 6,
                                                background: '#f0fdf4', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                            }}>
                                                <BookOpen size={14} style={{ color: '#10b981' }} />
                                            </div>
                                            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-800)', flex: 1 }}>
                                                {c.nombre}
                                            </span>
                                            <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                                                {c.tipo}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div style={{
                                padding: '6px 14px', fontSize: 11, color: 'var(--gray-300)',
                                borderTop: '1px solid var(--gray-100)', textAlign: 'right'
                            }}>
                                {total} resultado{total !== 1 ? 's' : ''}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
