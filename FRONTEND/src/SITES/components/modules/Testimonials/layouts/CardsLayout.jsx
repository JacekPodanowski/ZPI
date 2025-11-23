import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import EditableText from '../../../../../STUDIO/components/EditableText';
import useNewEditorStore from '../../../../../STUDIO/store/newEditorStore';

const CardsLayout = ({ content, siteId, siteConfig, isEditing, moduleId, pageId }) => {
    const updateModuleContent = useNewEditorStore((state) => state.updateModuleContent);

    const handleTitleSave = (newValue) => {
        updateModuleContent(pageId, moduleId, { title: newValue });
    };

    const handleSubtitleSave = (newValue) => {
        updateModuleContent(pageId, moduleId, { subtitle: newValue });
    };

    const handleFormTitleSave = (newValue) => {
        updateModuleContent(pageId, moduleId, { formTitle: newValue });
    };

    const handleFormNameLabelSave = (newValue) => {
        updateModuleContent(pageId, moduleId, { formNameLabel: newValue });
    };

    const handleFormEmailLabelSave = (newValue) => {
        updateModuleContent(pageId, moduleId, { formEmailLabel: newValue });
    };

    const handleFormRatingLabelSave = (newValue) => {
        updateModuleContent(pageId, moduleId, { formRatingLabel: newValue });
    };

    const handleFormContentLabelSave = (newValue) => {
        updateModuleContent(pageId, moduleId, { formContentLabel: newValue });
    };

    const {
        title = 'Co mówią nasi klienci',
        subtitle = '',
        showForm = true,
        displayLimit = 6,
        showSummary = true
    } = content;

    const [testimonials, setTestimonials] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAllTestimonials, setShowAllTestimonials] = useState(false);
    const [formData, setFormData] = useState({
        author_name: '',
        author_email: '',
        rating: 5,
        content: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState(null);

    useEffect(() => {
        loadTestimonials();
        if (showSummary) {
            loadSummary();
        }
    }, [siteId]);

    const loadTestimonials = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/testimonials/?site_id=${siteId}&sort=-created_at`
            );
            const data = await response.json();
            setTestimonials(data.results || data);
        } catch (error) {
            console.error('Failed to load testimonials:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadSummary = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/testimonials/summary/?site_id=${siteId}`
            );
            if (response.ok) {
                const data = await response.json();
                setSummary(data);
            }
        } catch (error) {
            console.error('Failed to load summary:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitMessage(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/testimonials/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    site: siteId
                })
            });

            if (response.ok) {
                setSubmitMessage({ type: 'success', text: 'Dziękujemy za opinię! Pojawi się po zatwierdzeniu.' });
                setFormData({ author_name: '', author_email: '', rating: 5, content: '' });
                setTimeout(() => loadTestimonials(), 1000);
            } else {
                setSubmitMessage({ type: 'error', text: 'Nie udało się wysłać opinii. Spróbuj ponownie.' });
            }
        } catch (error) {
            setSubmitMessage({ type: 'error', text: 'Wystąpił błąd. Spróbuj ponownie później.' });
        } finally {
            setSubmitting(false);
        }
    };

    const displayedTestimonials = showAllTestimonials
        ? testimonials
        : testimonials.slice(0, displayLimit);

    // Get theme colors from siteConfig
    const theme = siteConfig?.theme || {};
    const primaryColor = theme.colors?.light?.primary || '#920020';
    const bgColor = theme.colors?.light?.background || '#e4e5da';
    const textColor = theme.colors?.light?.text || '#1e1e1e';

    return (
        <section className="py-16 px-4" style={{ backgroundColor: bgColor, color: textColor }}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    {(isEditing || title) && (
                        isEditing ? (
                            <EditableText
                                value={title || ''}
                                onSave={handleTitleSave}
                                as="h2"
                                className="text-4xl font-bold mb-4"
                                style={{ color: primaryColor }}
                                placeholder="Click to edit title..."
                                multiline
                                isModuleSelected={true}
                            />
                        ) : (
                            <h2 className="text-4xl font-bold mb-4" style={{ color: primaryColor }}>
                                {title}
                            </h2>
                        )
                    )}
                    {(isEditing || subtitle) && (
                        isEditing ? (
                            <EditableText
                                value={subtitle || ''}
                                onSave={handleSubtitleSave}
                                as="p"
                                className="text-lg opacity-80 max-w-2xl mx-auto"
                                placeholder="Click to edit subtitle..."
                                multiline
                                isModuleSelected={true}
                            />
                        ) : (
                            <p className="text-lg opacity-80 max-w-2xl mx-auto">
                                {subtitle}
                            </p>
                        )
                    )}
                </div>

                {/* AI Summary */}
                {showSummary && summary && summary.average_rating !== undefined && (
                    <div className="mb-12 p-6 rounded-xl" style={{
                        backgroundColor: 'rgba(146, 0, 32, 0.05)',
                        border: `1px solid ${primaryColor}33`
                    }}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xl font-semibold">Podsumowanie opinii</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                                    {summary.average_rating.toFixed(1)}
                                </span>
                                <span className="text-yellow-500">★</span>
                                <span className="text-sm opacity-70">({summary.total_count || 0} opinii)</span>
                            </div>
                        </div>
                        <p className="text-base leading-relaxed opacity-90">
                            {summary.summary}
                        </p>
                    </div>
                )}

                {/* Testimonials Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: primaryColor }}></div>
                    </div>
                ) : displayedTestimonials.length === 0 ? (
                    <div className="text-center py-12 opacity-60">
                        <p>Brak opinii do wyświetlenia. Bądź pierwszą osobą, która zostawi opinię!</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {displayedTestimonials.map((testimonial) => (
                                <div
                                    key={testimonial.id}
                                    className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                                    style={{
                                        backgroundColor: 'white',
                                        border: '1px solid rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="font-semibold text-lg">{testimonial.author_name}</h4>
                                            <p className="text-sm opacity-60">
                                                {new Date(testimonial.created_at).toLocaleDateString('pl-PL')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <span
                                                    key={i}
                                                    className={i < testimonial.rating ? 'text-yellow-500' : 'text-gray-300'}
                                                >
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-base leading-relaxed opacity-90">
                                        {testimonial.content}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Load More Button */}
                        {testimonials.length > displayLimit && !showAllTestimonials && (
                            <div className="text-center">
                                <button
                                    onClick={() => setShowAllTestimonials(true)}
                                    className="px-8 py-3 rounded-lg font-semibold transition-all hover:shadow-lg"
                                    style={{
                                        backgroundColor: primaryColor,
                                        color: 'white'
                                    }}
                                >
                                    Pokaż wszystkie ({testimonials.length})
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Feedback Form */}
                {showForm && (
                    <div className="mt-16 max-w-2xl mx-auto">
                        <div className="p-8 rounded-xl shadow-lg" style={{ backgroundColor: 'white' }}>
                            {isEditing ? (
                                <EditableText
                                    value={content.formTitle || 'Podziel się swoją opinią'}
                                    onSave={handleFormTitleSave}
                                    as="h3"
                                    className="text-2xl font-bold mb-6"
                                    style={{ color: primaryColor }}
                                    placeholder="Click to edit form title..."
                                    multiline
                                    isModuleSelected={true}
                                />
                            ) : (
                                <h3 className="text-2xl font-bold mb-6" style={{ color: primaryColor }}>
                                    {content.formTitle || 'Podziel się swoją opinią'}
                                </h3>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    {isEditing ? (
                                        <EditableText
                                            value={content.formNameLabel || 'Twoje imię *'}
                                            onSave={handleFormNameLabelSave}
                                            as="label"
                                            className="block mb-2 font-medium"
                                            placeholder="Click to edit label..."
                                            isModuleSelected={true}
                                        />
                                    ) : (
                                        <label className="block mb-2 font-medium">{content.formNameLabel || 'Twoje imię *'}</label>
                                    )}
                                    <input
                                        type="text"
                                        required
                                        value={formData.author_name}
                                        onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2"
                                        style={{ focusRingColor: primaryColor }}
                                    />
                                </div>
                                <div>
                                    {isEditing ? (
                                        <EditableText
                                            value={content.formEmailLabel || 'Email (opcjonalnie)'}
                                            onSave={handleFormEmailLabelSave}
                                            as="label"
                                            className="block mb-2 font-medium"
                                            placeholder="Click to edit label..."
                                            isModuleSelected={true}
                                        />
                                    ) : (
                                        <label className="block mb-2 font-medium">{content.formEmailLabel || 'Email (opcjonalnie)'}</label>
                                    )}
                                    <input
                                        type="email"
                                        value={formData.author_email}
                                        onChange={(e) => setFormData({ ...formData, author_email: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2"
                                        style={{ focusRingColor: primaryColor }}
                                    />
                                </div>
                                <div>
                                    {isEditing ? (
                                        <EditableText
                                            value={content.formRatingLabel || 'Ocena *'}
                                            onSave={handleFormRatingLabelSave}
                                            as="label"
                                            className="block mb-2 font-medium"
                                            placeholder="Click to edit label..."
                                            isModuleSelected={true}
                                        />
                                    ) : (
                                        <label className="block mb-2 font-medium">{content.formRatingLabel || 'Ocena *'}</label>
                                    )}
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((rating) => (
                                            <button
                                                key={rating}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, rating })}
                                                className="text-3xl transition-colors"
                                                style={{
                                                    color: rating <= formData.rating ? '#fbbf24' : '#d1d5db'
                                                }}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    {isEditing ? (
                                        <EditableText
                                            value={content.formContentLabel || 'Twoja opinia *'}
                                            onSave={handleFormContentLabelSave}
                                            as="label"
                                            className="block mb-2 font-medium"
                                            placeholder="Click to edit label..."
                                            isModuleSelected={true}
                                        />
                                    ) : (
                                        <label className="block mb-2 font-medium">{content.formContentLabel || 'Twoja opinia *'}</label>
                                    )}
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2"
                                        style={{ focusRingColor: primaryColor }}
                                    />
                                </div>
                                {submitMessage && (
                                    <div
                                        className={`p-4 rounded-lg ${
                                            submitMessage.type === 'success'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {submitMessage.text}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-3 rounded-lg font-semibold transition-all hover:shadow-lg disabled:opacity-50"
                                    style={{
                                        backgroundColor: primaryColor,
                                        color: 'white'
                                    }}
                                >
                                    {submitting ? 'Wysyłanie...' : 'Wyślij opinię'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

CardsLayout.propTypes = {
    content: PropTypes.object.isRequired,
    siteId: PropTypes.number.isRequired,
    siteConfig: PropTypes.object.isRequired
};

export default CardsLayout;
