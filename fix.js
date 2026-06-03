const fs = require('fs');
let c = fs.readFileSync('app/page.tsx', 'utf8');
const map = [
  ['ImobiliÃ¡ria','Imobiliária'],['famÃ­lia','família'],['confianÃ§a','confiança'],
  ['imÃ³veis','imóveis'],['ImÃ³veis','Imóveis'],['regiÃ£o','região'],
  ['experiÃªncia','experiência'],['seguranÃ§a','segurança'],['NegÃ³cios','Negócios'],
  ['JacarÃ©','Jacaré'],['ChÃ¡cara','Chácara'],['SÃ­tio','Sítio'],
  ['atuaÃ§Ã£o','atuação'],['AtuaÃ§Ã£o','Atuação'],['transparÃªncia','transparência'],
  ['negociaÃ§Ã£o','negociação'],['mÃ¡xima','máxima'],['atenÃ§Ã£o','atenção'],
  ['cartÃ³rios','cartórios'],['jurÃ­dica','jurídica'],['AvaliaÃ§Ã£o','Avaliação'],
  ['PortfÃ³lio','Portfólio'],['disponÃ­veis','disponíveis'],['construÃ­do','construído'],
  ['InÃ­cio','Início'],['Ã©','é'],['Â·','·'],['â€"','—'],['aÃ§Ã£o','ação']
];
map.forEach(([a,b]) => { while(c.includes(a)) c = c.replace(a,b); });
fs.writeFileSync('app/page.tsx', c, 'utf8');
fs.writeFileSync('app/admin/page.tsx', (() => { let d = fs.readFileSync('app/admin/page.tsx','utf8'); map.forEach(([a,b]) => { while(d.includes(a)) d = d.replace(a,b); }); return d; })(), 'utf8');
console.log('Corrigido!');
