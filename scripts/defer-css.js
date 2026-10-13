
// El patrón media="print" onload="this.media='all'" causaba FOUC (Flash of Unstyled Content)
// y un Cumulative Layout Shift (CLS) inaceptable de 0.288 en Desktop.
// Next.js gestiona la carga de hojas de estilo de forma nativa sin generar layout shifts.
console.log('defer-css: omitido intencionalmente para prevenir Cumulative Layout Shift (CLS).');
 