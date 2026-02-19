import { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

/**
 * Searchable select with autocomplete for large lists.
 * Props:
 *   options: [{ value, label, sublabel? }]
 *   value: selected value
 *   onChange: (value) => void
 *   placeholder: string
 *   required: boolean
 */
export default function SearchableSelect({ options, value, onChange, placeholder = 'Buscar...', required = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    const selectedOption = options.find(o => o.value === value);

    const filtered = options.filter(o => {
        if (!search) return true;
        const q = search.toLowerCase();
        return o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q) || (o.sublabel && o.sublabel.toLowerCase().includes(q));
    });

    // Limit visible results for performance
    const visibleResults = filtered.slice(0, 50);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleOpen = () => {
        setIsOpen(true);
        setSearch('');
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const handleSelect = (opt) => {
        onChange(opt.value);
        setIsOpen(false);
        setSearch('');
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange('');
        setSearch('');
    };

    return (
        <div ref={containerRef} style={{ position: 'relative' }}>
            {/* Hidden input for form validation */}
            {required && (
                <input
                    type="text"
                    value={value || ''}
                    required
                    onChange={() => { }}
                    style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }}
                    tabIndex={-1}
                />
            )}

            {/* Trigger button */}
            <div
                onClick={handleOpen}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    border: '1px solid var(--gray-200)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    background: 'white',
                    minHeight: '40px',
                    fontSize: 'var(--text-sm)',
                    transition: 'border-color 0.15s',
                    borderColor: isOpen ? 'var(--primary-500)' : 'var(--gray-200)',
                    boxShadow: isOpen ? '0 0 0 3px rgba(59, 105, 180, 0.1)' : 'none'
                }}
            >
                <span style={{
                    color: selectedOption ? 'var(--gray-900)' : 'var(--gray-400)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1
                }}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    {value && (
                        <button
                            type="button"
                            onClick={handleClear}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                padding: '2px', display: 'flex', color: 'var(--gray-400)'
                            }}
                        >
                            <X size={14} />
                        </button>
                    )}
                    <ChevronDown size={16} style={{ color: 'var(--gray-400)' }} />
                </div>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    background: 'white',
                    border: '1px solid var(--gray-200)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 1000,
                    maxHeight: '300px',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Search input */}
                    <div style={{
                        padding: '8px',
                        borderBottom: '1px solid var(--gray-100)',
                        position: 'sticky',
                        top: 0,
                        background: 'white',
                        zIndex: 1
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 10px',
                            border: '1px solid var(--gray-200)',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--gray-50)'
                        }}>
                            <Search size={14} style={{ color: 'var(--gray-400)', flexShrink: 0 }} />
                            <input
                                ref={inputRef}
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Escribí nombre o Nº de interno..."
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    background: 'transparent',
                                    width: '100%',
                                    fontSize: 'var(--text-sm)',
                                    color: 'var(--gray-900)'
                                }}
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        padding: '2px', display: 'flex', color: 'var(--gray-400)'
                                    }}
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Results */}
                    <div style={{ overflowY: 'auto', maxHeight: '240px' }}>
                        {visibleResults.length > 0 ? visibleResults.map(opt => (
                            <div
                                key={opt.value}
                                onClick={() => handleSelect(opt)}
                                style={{
                                    padding: '8px 12px',
                                    cursor: 'pointer',
                                    fontSize: 'var(--text-sm)',
                                    background: opt.value === value ? 'var(--primary-50)' : 'transparent',
                                    borderBottom: '1px solid var(--gray-50)',
                                    transition: 'background 0.1s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                                onMouseLeave={e => e.currentTarget.style.background = opt.value === value ? 'var(--primary-50)' : 'transparent'}
                            >
                                <div style={{ fontWeight: 500, color: 'var(--gray-900)' }}>
                                    {opt.label}
                                </div>
                                {opt.sublabel && (
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', marginTop: '2px' }}>
                                        {opt.sublabel}
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div style={{
                                padding: '16px',
                                textAlign: 'center',
                                color: 'var(--gray-400)',
                                fontSize: 'var(--text-sm)'
                            }}>
                                {search
                                    ? `No se encontraron resultados para "${search}"`
                                    : 'No hay opciones disponibles'
                                }
                            </div>
                        )}
                        {filtered.length > 50 && (
                            <div style={{
                                padding: '8px 12px',
                                textAlign: 'center',
                                color: 'var(--gray-400)',
                                fontSize: 'var(--text-xs)',
                                borderTop: '1px solid var(--gray-100)'
                            }}>
                                Mostrando 50 de {filtered.length} resultados — escribí para filtrar más
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
