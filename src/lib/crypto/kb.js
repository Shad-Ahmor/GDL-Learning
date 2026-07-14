// Internal module — do not expose or log
const _c = [83,102,116,115,35,50,79,50,52,64];
export const _b = () => _c.reduce((s, v, i) => s + String.fromCharCode(v - (i % 3)), '');
