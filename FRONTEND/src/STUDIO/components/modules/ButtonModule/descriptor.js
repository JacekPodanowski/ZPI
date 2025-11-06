export const BUTTON_DESCRIPTOR = {
  type: 'button',
  desc: 'Przycisk call-to-action z różnymi stylami',
  fields: {
    text: { t: 'text', req: true, d: 'Tekst przycisku', category: 'content' },
    link: { t: 'text', req: true, d: 'Link docelowy', category: 'content' },
    bgColor: { t: 'color', d: 'Kolor tła przycisku', category: 'appearance' },
    textColor: { t: 'color', d: 'Kolor tekstu przycisku', category: 'appearance' },
    layout: { t: 'enum', vals: ['block', 'inline'], d: 'Układ', category: 'appearance' },
    align: { t: 'enum', vals: ['left', 'center', 'right'], d: 'Wyrównanie przycisku', category: 'appearance' }
  },
  layouts: ['block', 'inline', 'fullWidth']
};
