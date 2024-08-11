class Selector {
  checked() {
    this.checked = true;
    return this;
  }

  unchecked() {
    this.checked = false;
    return this;
  }

  toString() {
    let s = '';
    if (this.id !== undefined) {
      s += `#${this.id}`;
    }
    if (this.attrValue !== undefined) {
      s += `[${this.attr}="${this.attrValue}"]`;
    } else if (this.attrContains !== undefined) {
      s += `[${this.attr}*="${this.attrContains}"]`;
    }
    if (this.checked === true) {
      s += ':checked';
    } else if (this.checked === false) {
      s += ':not(:checked)';
    }
    return s;
  }
}

class ComplexSelector {
  constructor(selectors) {
    this.selectors = selectors;
  }

  displayBlock() {
    return this.apply('display', 'block');
  }

  content(value) {
    return this.apply('content', `"${value}"`);
  }

  apply(prop, value) {
    const conditions = this.selectors.join('');
    return `${conditions}{${prop}:${value};}`;
  }

  toString() {
    return this.selectors.join('');
  }
}

export function select(...args) {
  return new ComplexSelector(args);
}

export function id(id) {
  const s = new Selector();
  s.id = id;
  return s;
}

export function attr(attr, value) {
  const s = new Selector();
  s.attr = attr;
  s.attrValue = value;
  return s;
}

export function attrContains(attr, value) {
  const s = new Selector();
  s.attr = attr;
  s.attrContains = value;
  return s;
}

export function checked() {
  const s = new Selector();
  s.checked();
  return s;
}

export function unchecked() {
  const s = new Selector();
  s.unchecked();
  return s;
}