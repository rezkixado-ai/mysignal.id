// Custom Editor.js block: a numbered sequence of steps, each with a title
// and short description. Renders as icon-style numbered cards on the
// public page (see lib/render-blocks.jsx -> case 'processSteps').
export default class ProcessStepsTool {
  static get toolbox() {
    return {
      title: 'Process Steps',
      icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="6" r="2.5" stroke="currentColor" stroke-width="2"/><circle cx="6" cy="18" r="2.5" stroke="currentColor" stroke-width="2"/><path d="M6 8.5V15.5M10 6H20M10 18H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
    };
  }

  static get isReadOnlySupported() {
    return true;
  }

  constructor({ data }) {
    this.data = { steps: data.steps && data.steps.length ? data.steps : [{ title: '', description: '' }] };
    this.wrapper = null;
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'ce-process-steps';
    this._renderUI();
    return this.wrapper;
  }

  _renderUI() {
    this.wrapper.innerHTML = '';

    this.data.steps.forEach((step, idx) => {
      const row = document.createElement('div');
      row.style.cssText = 'border:1px solid #333;border-radius:8px;padding:10px;margin-bottom:8px;display:flex;gap:10px;align-items:flex-start;';

      const num = document.createElement('div');
      num.textContent = String(idx + 1).padStart(2, '0');
      num.style.cssText = 'font-weight:700;color:#666;min-width:30px;padding-top:6px;';
      row.appendChild(num);

      const fields = document.createElement('div');
      fields.style.cssText = 'flex:1;';

      const titleInput = document.createElement('input');
      titleInput.placeholder = 'Judul step';
      titleInput.value = step.title;
      titleInput.style.cssText = 'width:100%;box-sizing:border-box;margin-bottom:6px;padding:6px 8px;border-radius:6px;border:1px solid #333;background:#111;color:#fff;font-weight:600;';
      titleInput.oninput = () => { step.title = titleInput.value; };

      const descInput = document.createElement('textarea');
      descInput.placeholder = 'Deskripsi singkat';
      descInput.value = step.description;
      descInput.rows = 2;
      descInput.style.cssText = 'width:100%;box-sizing:border-box;padding:6px 8px;border-radius:6px;border:1px solid #333;background:#111;color:#ccc;font-family:inherit;';
      descInput.oninput = () => { step.description = descInput.value; };

      fields.appendChild(titleInput);
      fields.appendChild(descInput);
      row.appendChild(fields);

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.textContent = '×';
      removeBtn.title = 'Hapus step ini';
      removeBtn.style.cssText = 'background:none;border:none;color:#e66;cursor:pointer;font-size:18px;line-height:1;padding:4px;';
      removeBtn.onclick = () => {
        this.data.steps.splice(idx, 1);
        this._renderUI();
      };
      row.appendChild(removeBtn);

      this.wrapper.appendChild(row);
    });

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.textContent = '+ Tambah Step';
    addBtn.style.cssText = 'padding:6px 10px;font-size:12.5px;border-radius:6px;border:1px solid #333;background:#1a1a1a;color:#ccc;cursor:pointer;';
    addBtn.onclick = () => {
      this.data.steps.push({ title: '', description: '' });
      this._renderUI();
    };
    this.wrapper.appendChild(addBtn);
  }

  save() {
    return { steps: this.data.steps.filter((s) => s.title.trim() || s.description.trim()) };
  }
}
