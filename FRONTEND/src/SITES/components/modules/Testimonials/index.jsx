import React from 'react';
import PropTypes from 'prop-types';
import { TESTIMONIALS_DEFAULTS } from './defaults';
import { TESTIMONIALS_DESCRIPTOR } from './descriptor';
import CardsLayout from './layouts/CardsLayout';
import CarouselLayout from './layouts/CarouselLayout';

const Testimonials = ({ content = {}, layout = 'cards', siteId, siteConfig }) => {
    // Merge defaults with provided content
    const defaults = TESTIMONIALS_DEFAULTS[layout] || TESTIMONIALS_DEFAULTS.cards;
    const mergedContent = { ...defaults, ...content };

    // Select layout component
    const LayoutComponent = {
        cards: CardsLayout,
        carousel: CarouselLayout,
        masonry: CardsLayout, // Using cards as fallback for masonry
    }[layout] || CardsLayout;

    return (
        <LayoutComponent
            content={mergedContent}
            siteId={siteId}
            siteConfig={siteConfig}
        />
    );
};

Testimonials.propTypes = {
    content: PropTypes.object,
    layout: PropTypes.oneOf(['cards', 'carousel', 'masonry']),
    siteId: PropTypes.number.isRequired,
    siteConfig: PropTypes.object.isRequired
};

// Attach descriptor for AI integration
Testimonials.descriptor = TESTIMONIALS_DESCRIPTOR;

export default Testimonials;
