export const SPACER_DESCRIPTOR = {
  type: 'spacer',
  desc: 'Prosta przerwa (odstęp) między elementami',
  fields: {
    height: { t: 'text', req: true, d: 'Wysokość przerwy (np. 2rem, 50px)', category: 'appearance' }
  },
  layouts: ['small', 'medium', 'large']
};
