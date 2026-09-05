// Custom Editor.js block: a list of Q&A pairs. The public article page turns
// this into both a visible accordion AND a schema.org FAQPage JSON-LD block
// (see lib/render-blocks.jsx -> getFaqJsonLd), so this is the block editors
// should use whenever an article should be eligible for Google's FAQ rich result.
export default class FaqTool {
  static get toolbox() {
    return {
      title: 'FAQ',
      icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M9.5 9a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1.4.9-1.4 1.9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17" r="0.9" fill="currentColor"/></svg>'
    };
  }

  static get isReadOnlySupported() {
    return true;
  }

  constructor({ data }) {
    this.data = { items: data.items && data.items.length ? data.items : [{ q: '', a: '' }] };
    this.wrapper = null;
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'ce-faq';
    this._renderUI();
    return this.wrapper;
  }

  _renderUI() {
    this.wrapper.innerHTML = '';

    this.data.items.forEach((item, idx) => {
      const row = document.createElement('div');
      row.style.cssText = 'border:1px solid #333;border-radius:8px;padding:10px;margin-bottom:8px;';

      const qInput = document.createElement('input');
      qInput.placeholder = 'Pertanyaan';
      qInput.value = item.q;
      qInput.style.cssText = 'width:100%;box-sizing:border-box;margin-bottom:6px;padding:6px 8px;border-radius:6px;border:1px solid #333;background:#111;color:#fff;font-weight:600;';
      qInput.oninput = () => {
        item.q = qInput.value;
      };

      const aInput = document.createElement('textarea');
      aInput.placeholder = 'Jawaban';
      aInput.value = item.a;
      aInput.rows = 2;
      aInput.style.cssText = 'width:100%;box-sizing:border-box;padding:6px 8px;border-radius:6px;border:1px solid #333;background:#111;color:#ccc;font-family:inherit;';
      aInput.oninput = () => {
        item.a = aInput.value;
      };

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.textContent = 'Hapus pertanyaan ini';
      removeBtn.style.cssText = 'margin-top:6px;font-size:12px;color:#e66;background:none;border:none;cursor:pointer;padding:0;';
      removeBtn.onclick = () => {
        this.data.items.splice(idx, 1);
        this._renderUI();
      };

      row.appendChild(qInput);
      row.appendChild(aInput);
      row.appendChild(removeBtn);
      this.wrapper.appendChild(row);
    });

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.textContent = '+ Tambah FAQ';
    addBtn.style.cssText = 'padding:6px 10px;font-size:12.5px;border-radius:6px;border:1px solid #333;background:#1a1a1a;color:#ccc;cursor:pointer;';
    addBtn.onclick = () => {
      this.data.items.push({ q: '', a: '' });
      this._renderUI();
    };
    this.wrapper.appendChild(addBtn);
  }

  save() {
    return { items: this.data.items.filter((i) => i.q.trim() || i.a.trim()) };
  }
}
