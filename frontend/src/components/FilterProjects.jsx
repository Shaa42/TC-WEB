import React, { useEffect, useMemo, useState } from "react";
import "../styles/FilterProjects.css";

const FilterProjects = ({ onBack, onApplyFilters, selectedLabels = [] }) => {
    const [labels, setLabels] = useState([]);
    const [selection, setSelection] = useState(selectedLabels);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setSelection(selectedLabels);
    }, [selectedLabels]);

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        setError(null);

        fetch("http://localhost:8080/api/labels")
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Erreur serveur: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                if (!isMounted) {
                    return;
                }
                const sanitized = Array.isArray(data) ? data : [];
                setLabels(sanitized);
                setIsLoading(false);
            })
            .catch((err) => {
                if (!isMounted) {
                    return;
                }
                setError(err.message || "Impossible de charger les labels");
                setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const toggleLabel = (label) => {
        setSelection((prev) => {
            if (prev.includes(label)) {
                return prev.filter((value) => value !== label);
            }
            return [...prev, label];
        });
    };

    const handleApply = () => {
        onApplyFilters(selection);
    };

    const handleReset = () => {
        setSelection([]);
    };

    const hasSelection = selection.length > 0;

    const emptyStateDescription = useMemo(() => {
        if (isLoading) {
            return "Chargement des thématiques...";
        }
        if (error) {
            return error;
        }
        return "Aucun label disponible pour le moment.";
    }, [isLoading, error]);

    return (
        <div className="filter-page">
            <div className="filter-card">
                <header className="filter-header">
                    <div>
                        <p className="eyebrow">Filtrer les projets</p>
                        <h1>Choisissez vos thématiques</h1>
                        <p className="subtitle">
                            Sélectionnez une ou plusieurs étiquettes pour ne voir que les projets qui
                            vous intéressent.
                        </p>
                    </div>
                    <div className="header-actions">
                        <button className="btn-ghost" onClick={onBack}>
                            Retour
                        </button>
                    </div>
                </header>

                {labels.length === 0 ? (
                    <div className="filter-empty-state">
                        <p>{emptyStateDescription}</p>
                        {!isLoading && !error && (
                            <button className="btn-ghost" onClick={onBack}>
                                Revenir plus tard
                            </button>
                        )}
                        {error && (
                            <button className="btn-ghost" onClick={() => window.location.reload()}>
                                Réessayer
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="labels-grid">
                        {labels.map((label) => {
                            const isChecked = selection.includes(label);
                            return (
                                <label
                                    key={label}
                                    className={`label-option ${isChecked ? "checked" : ""}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => toggleLabel(label)}
                                    />
                                    <span>{label}</span>
                                </label>
                            );
                        })}
                    </div>
                )}

                <footer className="filter-actions">
                    <button className="btn-ghost" onClick={handleReset} disabled={!hasSelection}>
                        Réinitialiser
                    </button>
                    <button className="btn-secondary" onClick={onBack}>
                        Annuler
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleApply}
                        disabled={!hasSelection}
                    >
                        Appliquer ({selection.length})
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default FilterProjects;
