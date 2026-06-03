const fs = require('fs');

const fixes = [
  ['ImobiliÃ¡ria', 'Imobiliária'],
  ['ImobiliÃ\u00A1ria', 'Imobiliária'],
  ['famÃ­lia', 'família'],
  ['fam\u00C3\u00ADlia', 'família'],
  ['confianÃ§a', 'confiança'],
  ['confian\u00C3\u00A7a', 'confiança'],
  ['imÃ³veis', 'imóveis'],
  ['im\u00C3\u00B3veis', 'imóveis'],
  ['ImÃ³veis', 'Imóveis'],
  ['Im\u00C3\u00B3veis', 'Imóveis'],
  ['regiÃ£o', 'região'],
  ['regi\u00C3\u00A3o', 'região'],
  ['experiÃªncia', 'experiência'],
  ['experi\u00C3\u00AAncia', 'experiência'],
  ['seguranÃ§a', 'segurança'],
  ['seguran\u00C3\u00A7a', 'segurança'],
  ['NegÃ³cios', 'Negócios'],
  ['Neg\u00C3\u00B3cios', 'Negócios'],
  ['negÃ³cios', 'negócios'],
  ['JacarÃ©', 'Jacaré'],
  ['Jacar\u00C3\u00A9', 'Jacaré'],
  ['ChÃ¡cara', 'Chácara'],
  ['Ch\u00C3\u00A1cara', 'Chácara'],
  ['SÃ­tio', 'Sítio'],
  ['S\u00C3\u00ADtio', 'Sítio'],
  ['atuaÃ§Ã£o', 'atuação'],
  ['atua\u00C3\u00A7\u00C3\u00A3o', 'atuação'],
  ['AtuaÃ§Ã£o', 'Atuação'],
  ['Atua\u00C3\u00A7\u00C3\u00A3o', 'Atuação'],
  ['transparÃªncia', 'transparência'],
  ['transpar\u00C3\u00AAncia', 'transparência'],
  ['negociaÃ§Ã£o', 'negociação'],
  ['negocia\u00C3\u00A7\u00C3\u00A3o', 'negociação'],
  ['mÃ¡xima', 'máxima'],
  ['m\u00C3\u00A1xima', 'máxima'],
  ['atenÃ§Ã£o', 'atenção'],
  ['aten\u00C3\u00A7\u00C3\u00A3o', 'atenção'],
  ['cartÃ³rios', 'cartórios'],
  ['cart\u00C3\u00B3rios', 'cartórios'],
  ['jurÃ­dica', 'jurídica'],
  ['jur\u00C3\u00ADdica', 'jurídica'],
  ['AvaliaÃ§Ã£o', 'Avaliação'],
  ['Avalia\u00C3\u00A7\u00C3\u00A3o', 'Avaliação'],
  ['avaliaÃ§Ã£o', 'avaliação'],
  ['avalia\u00C3\u00A7\u00C3\u00A3o', 'avaliação'],
  ['PortfÃ³lio', 'Portfólio'],
  ['Portf\u00C3\u00B3lio', 'Portfólio'],
  ['disponÃ­veis', 'disponíveis'],
  ['dispon\u00C3\u00ADveis', 'disponíveis'],
  ['construÃ­do', 'construído'],
  ['constru\u00C3\u00ADdo', 'construído'],
  ['InÃ­cio', 'Início'],
  ['In\u00C3\u00ADcio', 'Início'],
  ['Ã©', 'é'],
  ['\u00C3\u00A9', 'é'],
  ['Ã\u00A9', 'é'],
  ['Â·', '·'],
  ['\u00C2\u00B7', '·'],
  ['â€"', '—'],
  ['\u00E2\u0080\u0094', '—'],
  ['aÃ§Ã£o', 'ação'],
  ['a\u00C3\u00A7\u00C3\u00A3o', 'ação'],
  ['participaÃ§Ã£o', 'participação'],
  ['orienta\u00C3\u00A7\u00C3\u00A3o', 'orientação'],
  ['Ã\u00A3', 'ã'],
  ['Ã£', 'ã'],
  ['profissionais', 'profissionais'],
  ['corretora', 'corretora'],
];

function fixFile(path) {
  let content = fs.readFileSync(path, 'utf8');
  fixes.forEach(([bad, good]) => {
    while (content.includes(bad)) {
      content = content.split(bad).join(good);
    }
  });
  fs.writeFileSync(path, content, 'utf8');
  console.log('Corrigido: ' + path);
}

fixFile('app/page.tsx');
fixFile('app/admin/page.tsx');
