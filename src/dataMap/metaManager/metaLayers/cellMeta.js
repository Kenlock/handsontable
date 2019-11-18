import { extend } from '../../../helpers/object';
import { expandMetaType, assert, isFiniteSignedNumber } from '../utils';
import LazyFactoryMap from '../lazyFactoryMap';

export default class CellMeta {
  constructor(columnMeta) {
    this.columnMeta = columnMeta;
    this.metas = new LazyFactoryMap(() => this._createRow());
  }

  updateMeta(physicalRow, physicalColumn, settings) {
    const meta = this.getMeta(physicalRow, physicalColumn);

    extend(meta, settings);
    extend(meta, expandMetaType(settings));
  }

  createRow(physicalRow, amount) {
    this.metas.insert(physicalRow, amount);
  }

  createColumn(physicalColumn, amount) {
    for (let i = 0; i < this.metas.size(); i++) {
      this.metas.obtain(i).insert(physicalColumn, amount);
    }
  }

  removeRow(physicalRow, amount) {
    this.metas.remove(physicalRow, amount);
  }

  removeColumn(physicalColumn, amount) {
    for (let i = 0; i < this.metas.size(); i++) {
      this.metas.obtain(i).remove(physicalColumn, amount);
    }
  }

  clearCache() {
    this.metas.clear();
  }

  getMeta(physicalRow, physicalColumn, key) {
    const cellMeta = this.metas.obtain(physicalRow).obtain(physicalColumn);

    if (key === void 0) {
      return cellMeta;
    }

    return cellMeta[key];
  }

  setMeta(physicalRow, physicalColumn, key, value) {
    const cellMeta = this.metas.obtain(physicalRow).obtain(physicalColumn);

    cellMeta[key] = value;
  }

  removeMeta(physicalRow, physicalColumn, key) {
    const cellMeta = this.metas.obtain(physicalRow).obtain(physicalColumn);

    delete cellMeta[key];
  }

  getMetas() {
    const metas = [];
    const rows = Array.from(this.metas.values());

    for (let row = 0; row < rows.length; row++) {
      metas.push(...rows[row].values());
    }

    return metas;
  }

  getMetasAtRow(physicalRow) {
    assert(() => isFiniteSignedNumber(physicalRow), 'Expecting a signed finite number.');

    const rowsMeta = new Map(this.metas);

    return rowsMeta.has(physicalRow) ? Array.from(rowsMeta.get(physicalRow).values()) : [];
  }

  _createRow() {
    return new LazyFactoryMap(physicalColumn => this._createMeta(physicalColumn));
  }

  _createMeta(physicalColumn) {
    const ColumnMeta = this.columnMeta.getMetaConstructor(physicalColumn);

    return new ColumnMeta();
  }
}
