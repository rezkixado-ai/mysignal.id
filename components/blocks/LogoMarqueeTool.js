// Custom Editor.js block: a list of institution/partner logos, rendered as
// an auto-scrolling horizontal marquee on the public page (see
// lib/render-blocks.jsx -> case 'logoMarquee'). Uses the same uploadMedia()
// helper as the rest of the admin (config.uploadMedia passed from BlockEditor.jsx).
export default class LogoMarqueeTool {
  static get toolbox() {
    return {
      title: 'Logo Marquee',
      icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="9" width="6" height="6" rx="1" stroke="currentColor" stroke-width="2"/><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" stroke-width="2"/><rect x="16" y="9" width="6" height="6" rx="1" stroke="currentColor" stroke-width="2"/></svg>'
    };
  }

  static get isReadOnlySupported() {
    return true;
  }

  constructor({ data, config }) {
    this.data = { logos: data.logos || [] };
    this.config = config || {};
    this.wrapper = null;
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'ce-logo-marquee-editor';
    this._renderUI();
    return this.wrapper;
  }

  _renderUI() {
    this.wrapper.innerHTML = '';

    const toolbar = document.createElement('div');
    toolbar.style.cssText = 'margin-bottom:10px;';
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.textContent = '+ Tambah Logo';
    addBtn.style.cssText = 'padding:6px 10px;font-size:12.5px;border-radius:6px;border:1px solid #333;background:#1a1a1a;color:#ccc;cursor:pointer;';
    addBtn.onclick = () => this._pickFiles();
    toolbar.appendChild(addBtn);
    this.wrapper.appendChild(toolbar);

    if (this.data.logos.length === 0) {
      const empty = document.createElement('p');
      empty.textContent = 'Belum ada logo instansi — klik "Tambah Logo" di atas.';
      empty.style.cssText = 'font-size:13px;color:#777;margin:0;';
      this.wrapper.appendChild(empty);
      return;
    }

    const list = document.createElement('div');
    list.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;';

    this.data.logos.forEach((logo, idx) => {
      const item = document.createElement('div');
      item.style.cssText = 'position:relative;border:1px solid #333;border-radius:8px;padding:10px;width:150px;';

      const img = document.createElement('img');
      img.src = logo.url;
      img.style.cssText = 'width:100%;height:50px;object-fit:contain;margin-bottom:6px;background:#fff;border-radius:4px;';
      item.appendChild(img);

      const nameInput = document.createElement('input');
      nameInput.placeholder = 'Nama instansi';
      nameInput.value = logo.name || '';
      nameInput.style.cssText = 'width:100%;box-sizing:border-box;padding:4px 6px;font-size:12px;border-radius:6px;border:1px solid #333;background:#111;color:#fff;';
      nameInput.oninput = () => { logo.name = nameInput.value; };
      item.appendChild(nameInput);

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.textContent = '×';
      removeBtn.title = 'Hapus logo ini';
      removeBtn.style.cssText = 'position:absolute;top:4px;right:4px;width:20px;height:20px;border-radius:50%;border:none;background:rgba(0,0,0,.75);color:#fff;cursor:pointer;font-size:12px;line-height:1;';
      removeBtn.onclick = () => {
        this.data.logos.splice(idx, 1);
        this._renderUI();
      };
      item.appendChild(removeBtn);

      list.appendChild(item);
    });

    this.wrapper.appendChild(list);
  }

  _pickFiles() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async () => {
      const files = Array.from(input.files || []);
      for (const file of files) {
        try {
          const result = await this.config.uploadMedia(file);
          this.data.logos.push({ url: result.url, name: '' });
        } catch (err) {
          alert('Upload gagal: ' + err.message);
        }
      }
      this._renderUI();
    };
    input.click();
  }

  save() {
    return { logos: this.data.logos };
  }
}
