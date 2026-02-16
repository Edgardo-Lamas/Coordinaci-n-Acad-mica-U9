import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { CURSOS } from '../data/mockData';
import { Clock } from 'lucide-react';

export default function CalendarWidget() {
    const [date, setDate] = useState(new Date());
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedEvents, setSelectedEvents] = useState([]);

    // Update clock every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Get events for specific date
    const getEventsForDate = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        const events = [];

        CURSOS.forEach(curso => {
            if (curso.fecha_inicio === dateStr) {
                events.push({ type: 'inicio', curso });
            }
            if (curso.fecha_fin === dateStr) {
                events.push({ type: 'fin', curso });
            }
        });
        return events;
    };

    // Handle date click
    const handleDateClick = (value) => {
        setDate(value);
        setSelectedEvents(getEventsForDate(value));
    };

    // Custom tile content to show dots
    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const events = getEventsForDate(date);
            if (events.length > 0) {
                return (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px' }}>
                        {events.map((evt, idx) => (
                            <div
                                key={idx}
                                style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    backgroundColor: evt.type === 'inicio' ? 'var(--success)' : 'var(--danger)'
                                }}
                            />
                        ))}
                    </div>
                );
            }
        }
        return null;
    };

    return (
        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{
                display: 'flex',
                flexDirection: 'column', // Stack clock and title/controls
                alignItems: 'center',
                gap: 'var(--space-4)',
                paddingBottom: 'var(--space-6)',
                borderBottom: '1px solid var(--gray-200)'
            }}>
                {/* Large Digital Clock */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--space-4) var(--space-8)',
                    background: 'linear-gradient(135deg, var(--gray-900), var(--gray-800))', // Dark theme for clock
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 4px 6px rgba(0,0,0,0.1)',
                    color: '#fff',
                    width: '100%',
                    maxWidth: '400px'
                }}>
                    <span style={{
                        fontWeight: '700',
                        fontSize: '3.5rem',
                        fontFamily: 'monospace',
                        lineHeight: 1,
                        letterSpacing: '2px',
                        textShadow: '0 0 10px rgba(59, 130, 246, 0.5)' // Glow effect
                    }}>
                        {currentTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span style={{
                        fontSize: '1rem',
                        color: 'var(--gray-400)',
                        marginTop: 'var(--space-2)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        {currentTime.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <h2 className="card-title">Agenda Académica</h2>
                    <button className="btn btn-secondary btn-sm" title="Configurar Alarma">
                        <Clock size={16} style={{ marginRight: 6 }} /> Alarma
                    </button>
                </div>
            </div>

            <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingTop: 'var(--space-6)' }}>
                {/* Horizontal Layout for Calendar and Events on large screens */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
                    {/* Calendar */}
                    <div className="calendar-container-custom">
                        <Calendar
                            onChange={handleDateClick}
                            value={date}
                            tileContent={tileContent}
                            className="custom-calendar"
                        />
                    </div>

                    {/* Selected Date Events */}
                    <div style={{
                        background: 'var(--gray-50)',
                        padding: 'var(--space-4)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--gray-200)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: '600', color: 'var(--gray-500)', marginBottom: 'var(--space-3)', textTransform: 'uppercase' }}>
                            Eventos del {date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
                        </h3>

                        {selectedEvents.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', overflowY: 'auto', maxHeight: '250px' }}>
                                {selectedEvents.map((evt, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-2)',
                                        padding: 'var(--space-2)',
                                        background: '#fff',
                                        borderRadius: 'var(--radius-sm)',
                                        borderLeft: `3px solid ${evt.type === 'inicio' ? 'var(--success)' : 'var(--danger)'}`,
                                        boxShadow: 'var(--shadow-xs)'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            paddingRight: 'var(--space-2)',
                                            borderRight: '1px solid var(--gray-100)',
                                            minWidth: '50px'
                                        }}>
                                            <span style={{ fontSize: 'var(--text-xs)', fontWeight: '700', color: evt.type === 'inicio' ? 'var(--success-dark)' : 'var(--danger-dark)' }}>
                                                {evt.type === 'inicio' ? 'INICIO' : 'FIN'}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-700)', fontWeight: 500 }}>
                                            {evt.curso.nombre}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--gray-400)' }}>
                                <p style={{ fontStyle: 'italic' }}>Sin eventos</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Inline Styles for Calendar Customization */}
            <style>{`
                .calendar-container-custom .react-calendar {
                    width: 100%;
                    max-width: 100%;
                    border: none;
                    background: transparent;
                    font-family: var(--font-family);
                }
                .calendar-container-custom .react-calendar__navigation button {
                    color: var(--primary-700);
                    min-width: 44px;
                    background: none;
                    font-size: 16px;
                    font-weight: 600;
                }
                .calendar-container-custom .react-calendar__navigation button:enabled:hover,
                .calendar-container-custom .react-calendar__navigation button:enabled:focus {
                    background-color: var(--gray-100);
                    border-radius: var(--radius-sm);
                }
                .calendar-container-custom .react-calendar__month-view__weekdays {
                    text-transform: uppercase;
                    font-weight: 600;
                    font-size: 0.75em;
                    color: var(--gray-400);
                }
                .calendar-container-custom .react-calendar__tile {
                    max-width: 100%;
                    padding: 10px 6.6667px;
                    background: none;
                    text-align: center;
                    line-height: 16px;
                    font-size: var(--text-sm);
                    border-radius: var(--radius-md);
                    transition: all 0.2s;
                }
                .calendar-container-custom .react-calendar__tile:enabled:hover,
                .calendar-container-custom .react-calendar__tile:enabled:focus {
                    background-color: var(--primary-50);
                    color: var(--primary-600);
                }
                .calendar-container-custom .react-calendar__tile--now {
                    background: var(--accent-50);
                    color: var(--accent-700);
                    font-weight: bold;
                }
                .calendar-container-custom .react-calendar__tile--active {
                    background: var(--primary-600) !important;
                    color: white !important;
                }
            `}</style>
        </div>
    );
}
