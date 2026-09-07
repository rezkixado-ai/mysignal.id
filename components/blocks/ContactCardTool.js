// Custom Editor.js block: a list of contact channels (email, phone,
// WhatsApp, address, socials). Renders as clickable info cards on the
// public page (see lib/render-blocks.jsx -> case 'contactCard').
const TYPES = ['email', 'phone', 'whatsapp', 'address', 'instagram', 'tiktok', 'youtube', 'other'];

export default class ContactCardTool {
  static get toolbox() {
    return {
      title: 'Contact Card',
      icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2"/><path d="M3 7l9 6 9-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
    };
  }

  static get isReadOnlySupported() {
    return true;
  }

  constructor({ data }) {
    this.data = { items: data.items && data.items.length ? data.items : [{ type: 'email', label: '', value: '' }] };
    this.wrapper = null;
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'ce-contact-card-editor';
    this._renderUI();
    return this.wrapper;
  }

  _renderUI() {
    this.wrapper.innerHTML = '';

    this.data.items.forEach((item, idx) => {
      const row = document.createElement('div');
      row.style.cssText = 'border:1px solid #333;border-radius:8px;padding:10px;margin-bottom:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;';

      const typeSelect = document.createElement('select');
      TYPES.forEach((t) => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        if (t === item.type) opt.selected = true;
        typeSelect.appendChild(opt);
      });
      typeSelect.style.cssText = 'padding:6px 8px;border-radius:6px;border:1px solid #333;background:#111;color:#fff;';
      typeSelect.onchange = () => { item.type = typeSelect.value; };
      row.appendChild(typeSelect);

      const labelInput = document.createElement('input');
      labelInput.placeholder = 'Label (mis. Email Kami)';
      labelInput.value = item.label;
      labelInput.style.cssText = 'flex:1;min-width:120px;padding:6px 8px;border-radius:6px;border:1px solid #333;background:#111;color:#fff;';
      labelInput.oninput = () => { item.label = labelInput.value; };
      row.appendChild(labelInput);

      const valueInput = document.createElement('input');
      valueInput.placeholder = 'Value (mis. hello@mysignal.id atau URL)';
      valueInput.value = item.value;
      valueInput.style.cssText = 'flex:1;min-width:180px;padding:6px 8px;border-radius:6px;border:1px solid #333;background:#111;color:#fff;';
      valueInput.oninput = () => { item.value = valueInput.value; };
      row.appendChild(valueInput);

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.textContent = '×';
      removeBtn.title = 'Hapus kontak ini';
      removeBtn.style.cssText = 'background:none;border:none;color:#e66;cursor:pointer;font-size:18px;line-height:1;padding:4px;';
      removeBtn.onclick = () => {
        this.data.items.splice(idx, 1);
        this._renderUI();
      };
      row.appendChild(removeBtn);

      this.wrapper.appendChild(row);
    });

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.textContent = '+ Tambah Kontak';
    addBtn.style.cssText = 'padding:6px 10px;font-size:12.5px;border-radius:6px;border:1px solid #333;background:#1a1a1a;color:#ccc;cursor:pointer;';
    addBtn.onclick = () => {
      this.data.items.push({ type: 'email', label: '', value: '' });
      this._renderUI();
    };
    this.wrapper.appendChild(addBtn);
  }

  save() {
    return { items: this.data.items.filter((i) => i.value.trim()) };
  }
}
