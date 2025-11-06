export const TEXT_DESCRIPTOR = {
  type: 'text',
  desc: 'Moduł do wyświetlania tekstu z różnymi układami',
  fields: {
    content: { t: 'richtext', req: true, d: 'Treść HTML', category: 'content' },
    fontSize: { t: 'text', d: 'Rozmiar czcionki (np. 16px, 1.2rem)', category: 'appearance' },
    textColor: { t: 'color', d: 'Kolor tekstu', category: 'appearance' },
    align: { t: 'enum', vals: ['left', 'center', 'right', 'justify'], d: 'Wyrównanie tekstu', category: 'appearance' },
    layout: { t: 'enum', vals: ['block', 'inline'], d: 'Układ', category: 'advanced' }
  },
  layouts: ['block', 'inline', 'centered']
};
