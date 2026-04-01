import React, { useMemo, useState } from "react";
import "../styles/SubmitProject.css";

const SubmitProject = ({ onBack, onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [longDescription, setLongDescription] = useState("");
    const [labelsInput, setLabelsInput] = useState("");
    const labelPreview = useMemo(() => {
        const seen = new Set();
        return labelsInput
            .split(",")
            .map((label) => label.trim())
            .filter((label) => {
                if (!label) {
                    return false;
                }
                const key = label.toLowerCase();
                if (seen.has(key)) {
                    return false;
                }
                seen.add(key);
                return true;
            });
    }, [labelsInput]);
    // Fonctions de bascule (Toggle)
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation basique
        if (!title.trim()) {
            setError("Le titre est requis");
            return;
        }
        if (!description.trim()) {
            setError("La description est requise");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        // --- NOUVELLE MÉTHODE : FORMDATA ---
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("description", description.trim());
        formData.append("long_description", longDescription.trim());
        if (labelPreview.length > 0) {
            formData.append("labels", labelPreview.join(","));
        }

        // Ajouter l'image (fichier réel)
        if (image) {
            formData.append("images", image);
        }

        // Ajouter la vidéo si elle existe
        if (videoFile) {
            formData.append("video", videoFile);
        }

        try {
            const response = await fetch("http://localhost:8080/api/projects", {
                method: "POST",
                // ATTENTION : Ne pas mettre de 'Content-Type': 'application/json'
                // Le navigateur va le faire tout seul et ajouter le "boundary" nécessaire
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Erreur serveur: ${response.status}`);
            }

            const data = await response.json();
            console.log("Saved:", data);
            setSuccess(true);
            setTimeout(() => {
                onBack(); // retour a l'acceuil apres 1 seconde
            }, 1000);
        } catch (err) {
            console.error(err);
            setError(
                err.message ||
                    "Impossible de publier le projet. Veuillez reessayer.",
            );
            setIsSubmitting(false);
        }
    };

    return (
        <div className="page-container">
            {/* --- MENU BURGER --- */}
            <button className="menu-burger" onClick={toggleMenu}>
                <div className="barre"></div>
                <div className="barre"></div>
                <div className="barre"></div>
            </button>

            {/* --- SIDEBAR --- */}
            <div className={`sidebar ${isMenuOpen ? "open" : ""}`}>
                <button className="close-btn" onClick={toggleMenu}>
                    ×
                </button>
                <nav className="menu-options">
                    <a
                        href="#projets"
                        onClick={(e) => {
                            e.preventDefault();
                            toggleMenu(); // Ferme le menu
                            onBack(); // Retour à la page Tinder
                        }}
                    >
                        Projets
                    </a>
                    <a
                        href="#Classement"
                        onClick={(e) => {
                            e.preventDefault();
                            onNavigate("leaderboard");
                        }}
                    >
                        Classement
                    </a>
                    <hr />
                </nav>
            </div>

            {/* Overlay pour fermer le menu au clic extérieur */}
            {isMenuOpen && <div className="overlay" onClick={toggleMenu}></div>}

            <div className="submit-card">
                <h2 className="form-title">
                    Publier un <span>Projet</span>
                </h2>

                {/* Messages d'erreur et de succes */}
                {error && (
                    <div className="form-message error-message">{error}</div>
                )}
                {success && (
                    <div className="form-message success-message">
                        Projet publie avec succes! Redirection...
                    </div>
                )}

                <form className="project-form" onSubmit={handleSubmit}>
                    {/* --- SECTION APERÇU (Ce que les autres voient en swipant) --- */}
                    <div className="form-section">
                        <h3>Apercu de la carte</h3>
                        <input
                            type="text"
                            placeholder="Titre du projet"
                            className={`input-field ${error && !title.trim() ? "input-error" : ""}`}
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                if (error) setError(null);
                            }}
                        />
                        <textarea
                            className={`input-field short-desc ${error && !description.trim() ? "input-error" : ""}`}
                            placeholder="Description courte du projet"
                            value={description}
                            onChange={(e) => {
                                setDescription(e.target.value);
                                if (error) setError(null);
                            }}
                        />

                        <div className="labels-group">
                            <label>
                                Thématiques (séparées par des virgules)
                            </label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Ex: IA, Blockchain, Santé"
                                value={labelsInput}
                                onChange={(e) => setLabelsInput(e.target.value)}
                            />
                            <p className="labels-hint">
                                Ces labels permettront aux autres d'appliquer un
                                filtrage.
                            </p>
                            {labelPreview.length > 0 && (
                                <div className="label-preview">
                                    {labelPreview.map((label) => (
                                        <span
                                            key={label}
                                            className="label-pill"
                                        >
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="file-upload-group">
                            <label>Photo du projet</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    setImage(e.target.files[0]); // Stocker le File objet directement
                                }}
                            />
                        </div>
                    </div>

                    {/* --- SECTION DÉTAILLÉE (Ce qui s'affiche au clic sur "Info") --- */}
                    <div className="form-section">
                        <h3>Détails supplémentaires</h3>
                        <textarea
                            placeholder="Explication complète du projet..."
                            className="input-field long-desc"
                            value={longDescription}
                            onChange={(e) => setLongDescription(e.target.value)} // AJOUT ICI
                        ></textarea>

                        <div className="file-upload-group">
                            <label>Vidéo de présentation (Optionnel)</label>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={(e) =>
                                    setVideoFile(e.target.files[0])
                                } // On prend le 1er fichier
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`submit-btn ${isSubmitting ? "submitting" : ""}`}
                        disabled={isSubmitting || success}
                    >
                        {isSubmitting
                            ? "Publication..."
                            : success
                              ? "Publie!"
                              : "Mettre en ligne"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SubmitProject;
