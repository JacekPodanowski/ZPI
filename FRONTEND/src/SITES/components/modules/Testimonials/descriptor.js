// Descriptor for Testimonials module
export const TESTIMONIALS_DESCRIPTOR = {
    type: 'testimonials',
    desc: 'Display client testimonials with ratings and feedback form',
    fields: {
        title: {
            t: 'text',
            req: true,
            d: 'Section title (e.g., "What our clients say")'
        },
        subtitle: {
            t: 'text',
            req: false,
            d: 'Optional subtitle or description'
        },
        showForm: {
            t: 'boolean',
            req: false,
            d: 'Show feedback form for new testimonials'
        },
        displayLimit: {
            t: 'number',
            req: false,
            d: 'Number of testimonials to display initially (default: 5)'
        },
        showSummary: {
            t: 'boolean',
            req: false,
            d: 'Show AI-generated summary at the top'
        }
    },
    layouts: ['cards', 'carousel', 'masonry']
};
