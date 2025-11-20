import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const CarouselLayout = ({ content, siteId, siteConfig }) => {
    const {
        title = 'Opinie klientów',
        subtitle = '',
        showForm = true,
        displayLimit = 5,
        showSummary = false
    } = content;

    const [testimonials, setTestimonials] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTestimonials();
    }, [siteId]);

    const loadTestimonials = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/testimonials/?site_id=${siteId}&sort=-created_at&limit=${displayLimit}`
            );
            const data = await response.json();
            setTestimonials(data.results || data);
        } catch (error) {
            console.error('Failed to load testimonials:', error);
        } finally {
            setLoading(false);
        }
    };

    const nextTestimonial = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const theme = siteConfig?.theme || {};
    const primaryColor = theme.colors?.light?.primary || '#920020';
    const bgColor = theme.colors?.light?.background || '#e4e5da';

    if (loading || testimonials.length === 0) {
        return null;
    }

    const currentTestimonial = testimonials[currentIndex];

    return (
        <section className="py-20 px-4" style={{ backgroundColor: bgColor }}>
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl font-bold mb-4" style={{ color: primaryColor }}>
                    {title}
                </h2>
                {subtitle && <p className="text-lg mb-12 opacity-80">{subtitle}</p>}

                <div className="relative p-12 rounded-2xl shadow-2xl bg-white">
                    <div className="flex items-center justify-center gap-1 mb-6">
                        {[...Array(5)].map((_, i) => (
                            <span
                                key={i}
                                className={`text-4xl ${i < currentTestimonial.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                    <p className="text-xl leading-relaxed mb-8 italic">
                        "{currentTestimonial.content}"
                    </p>
                    <div>
                        <p className="font-bold text-lg">{currentTestimonial.author_name}</p>
                        <p className="text-sm opacity-60">
                            {new Date(currentTestimonial.created_at).toLocaleDateString('pl-PL')}
                        </p>
                    </div>

                    {testimonials.length > 1 && (
                        <>
                            <button
                                onClick={prevTestimonial}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:shadow-xl"
                                style={{ backgroundColor: primaryColor, color: 'white' }}
                            >
                                ‹
                            </button>
                            <button
                                onClick={nextTestimonial}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:shadow-xl"
                                style={{ backgroundColor: primaryColor, color: 'white' }}
                            >
                                ›
                            </button>
                        </>
                    )}
                </div>

                {testimonials.length > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-3 h-3 rounded-full transition-all ${
                                    index === currentIndex ? 'w-8' : 'opacity-50'
                                }`}
                                style={{ backgroundColor: primaryColor }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

CarouselLayout.propTypes = {
    content: PropTypes.object.isRequired,
    siteId: PropTypes.number.isRequired,
    siteConfig: PropTypes.object.isRequired
};

export default CarouselLayout;
