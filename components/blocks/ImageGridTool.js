// Custom Editor.js block: upload several images at once, laid out as a grid.
// Column count (2/3/4) is chosen per-block. Uses the same uploadMedia() helper
// as the rest of the admin (config.uploadMedia is passed in from BlockEditor.jsx).
export default class ImageGridTool {
  static get toolbox() {
    return {
      title: 'Image Grid',
      icon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" stroke-width="2"/><rect x="13" y="3" width="8" height="8" rx="1" stroke="currentColor" stroke-width="2"/><rect x="3" y="13" width="8" height="8" rx="1" stroke="currentColor" stroke-width="2"/><rect x="13" y="13" width="8" height="8" rx="1" stroke="currentColor" stroke-width="2"/></svg>'
    };
  }

  static get isReadOnlySupported() {
    return true;
  }

  constructor({ data, config }) {
    this.data = { images: data.images || [], columns: data.columns || 2 };
    this.config = config || {};
    this.wrapper = null;
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'ce-image-grid';
    this._renderUI();
    return this.wrapper;
  }

  _renderUI() {
    this.wrapper.innerHTML = '';

    const toolbar = document.createElement('div');
    toolbar.style.cssText = 'display:flex;gap:8px;margin-bottom:10px;align-items:center;flex-wrap:wrap;';

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.textContent = '+ Tambah Gambar';
    addBtn.style.cssText = 'padding:6px 10px;font-size:12.5px;border-radius:6px;border:1px solid #333;background:#1a1a1a;color:#ccc;cursor:pointer;';
    addBtn.onclick = () => this._pickFiles();
    toolbar.appendChild(addBtn);

    [2, 3, 4].forEach((n) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = `${n} kolom`;
      const active = this.data.columns === n;
      b.style.cssText = `padding:6px 10px;font-size:12.5px;border-radius:6px;border:1px solid #333;cursor:pointer;background:${active ? '#2f8f5b' : '#1a1a1a'};color:${active ? '#fff' : '#ccc'};`;
      b.onclick = () => {
        this.data.columns = n;
        this._renderUI();
      };
      toolbar.appendChild(b);
    });

    this.wrapper.appendChild(toolbar);

    if (this.data.images.length === 0) {
      const empty = document.createElement('p');
      empty.textContent = 'Belum ada gambar — klik "Tambah Gambar" di atas.';
      empty.style.cssText = 'font-size:13px;color:#777;margin:0;';
      this.wrapper.appendChild(empty);
      return;
    }

    const grid = document.createElement('div');
    grid.style.cssText = `display:grid;grid-template-columns:repeat(${this.data.columns},1fr);gap:8px;`;

    this.data.images.forEach((img, idx) => {
      const cell = document.createElement('div');
      cell.style.cssText = 'position:relative;border-radius:6px;overflow:hidden;border:1px solid #333;aspect-ratio:1/1;';

      const image = document.createElement('img');
      image.src = img.url;
      image.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      cell.appendChild(image);

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.textContent = '×';
      removeBtn.title = 'Hapus gambar ini';
      removeBtn.style.cssText = 'position:absolute;top:4px;right:4px;width:22px;height:22px;border-radius:50%;border:none;background:rgba(0,0,0,.7);color:#fff;cursor:pointer;line-height:1;font-size:14px;';
      removeBtn.onclick = () => {
        this.data.images.splice(idx, 1);
        this._renderUI();
      };
      cell.appendChild(removeBtn);

      grid.appendChild(cell);
    });

    this.wrapper.appendChild(grid);
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
          this.data.images.push({ url: result.url, caption: '' });
        } catch (err) {
          alert('Upload gagal: ' + err.message);
        }
      }
      this._renderUI();
    };
    input.click();
  }

  save() {
    return { images: this.data.images, columns: this.data.columns };
  }
}
