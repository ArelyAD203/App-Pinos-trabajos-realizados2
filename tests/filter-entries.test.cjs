const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const path = require('node:path');
function loadTs(file) {
  const resolved = path.resolve(file);
  const compiled = ts.transpileModule(fs.readFileSync(resolved, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const module = { exports: {} };
  vm.runInThisContext(`(function(require,module,exports){${compiled}\n})`)((name) => name.startsWith('.') ? loadTs(path.resolve(path.dirname(resolved), name + '.ts')) : require(name), module, module.exports);
  return module.exports;
}
const { filterEntries, countBy, monthCounts, categoryOf } = loadTs('workFilters.ts');
const entries = [
  { id:'1', ano:2026, mes:'Enero', persona:'Arely', trabajo:'Revisión lámpara', categoria:'Electricidad' },
  { id:'2', ano:2026, mes:'Febrero', persona:'Gabriel', trabajo:'Lavado', categoria:'Limpieza' },
  { id:'3', ano:2025, mes:'Enero', persona:'Arely', trabajo:'Pintura' },
  { id:'4', ano:2026, mes:'Septiembr', persona:'Gabriel', trabajo:'Revisión elevador', categoria:'Elevador' },
];
const all = { year:[], month:[], person:[], category:[], search:'' };
test('combina selecciones dentro de cada filtro y restringe entre filtros', () => {
  const result = filterEntries(entries, { ...all, year:['2025','2026'], month:['Enero','Febrero'], person:['Arely','Gabriel'], category:['Electricidad','Limpieza'] });
  assert.deepEqual(result.map(x=>x.id), ['1','2']);
});
test('sin selecciones muestra todo; resultados vacíos son válidos', () => {
  assert.equal(filterEntries(entries, all).length, 4);
  assert.equal(filterEntries(entries, {...all, year:['2024']}).length, 0);
});
test('búsqueda sin acentos, categoría incluida y mes histórico normalizado', () => {
  assert.equal(filterEntries(entries, {...all, search:'revision LAMPARA'}).length, 1);
  assert.equal(filterEntries(entries, {...all, search:'electricidad'}).length, 1);
  assert.equal(filterEntries(entries, {...all, month:['Septiembre']})[0].id, '4');
});
test('registros anteriores permanecen sin categoría y se pueden filtrar', () => {
  assert.equal(categoryOf(entries[2]), 'Sin categoría');
  assert.equal(filterEntries(entries, {...all, category:['Sin categoría']})[0].id, '3');
});
test('meses de diferentes años no se mezclan; agrupaciones suman el total', () => {
  const months = monthCounts(entries);
  assert.equal(months.length, 4);
  assert.equal(months[0].label, 'Enero 2025');
  for (const rows of [months, countBy(entries, x=>x.persona), countBy(entries, categoryOf)]) {
    assert.equal(rows.reduce((sum, row)=>sum+row.count,0), entries.length);
  }
});

const { parseImport } = loadTs('importEntries.ts');
test('importación conserva categorías y acepta encabezados alternativos', () => {
  const result = parseImport([{ Ano:2026, Mes:'septiembr', Persona:' Arely ', Trabajo:' Limpieza del piso ', Categoria:'Limpieza' }]);
  assert.equal(result[0].categoria, 'Limpieza');
  assert.equal(result[0].mes, 'Septiembre');
  assert.equal(result[0].persona, 'Arely');
});
test('Excel vacío o con filas incompletas se rechaza antes del reemplazo', () => {
  assert.throws(() => parseImport([]), /vacío/);
  assert.throws(() => parseImport([{ Año:2026, Mes:'Enero', Persona:'Arely' }]), /Fila 2/);
  assert.throws(() => parseImport([{ Año:'2026abc', Mes:'Enero', Persona:'Arely', Trabajo:'Prueba' }]), /Fila 2/);
});
