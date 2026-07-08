import pathlib

# 1. Update docs/index.html
p_index = pathlib.Path('docs/index.html')
if p_index.exists():
    c = p_index.read_text(encoding='utf-8')
    c = c.replace('Excaliup', 'Excali Up')
    c = c.replace('Excali<span>up</span>', 'Excali<span>Up</span>')
    c = c.replace('logo-excali">Excali</span><span class="logo-up">up</span>', 'logo-excali">Excali</span><span class="logo-up">Up</span>')
    c = c.replace('logo-excali">Excali</span><span style="color:var(--color-primary)">up</span>', 'logo-excali">Excali</span><span style="color:var(--color-primary)">Up</span>')
    c = c.replace('sim-logo-light">up</span>', 'sim-logo-light">Up</span>')
    p_index.write_text(c, encoding='utf-8')
    print("docs/index.html updated successfully")

# 2. Update docs/app.js
p_app = pathlib.Path('docs/app.js')
if p_app.exists():
    c = p_app.read_text(encoding='utf-8')
    c = c.replace('Excaliup', 'Excali Up')
    p_app.write_text(c, encoding='utf-8')
    print("docs/app.js updated successfully")

# 3. Update docs/privacy.html
p_priv = pathlib.Path('docs/privacy.html')
if p_priv.exists():
    c = p_priv.read_text(encoding='utf-8')
    c = c.replace('Excaliup', 'Excali Up')
    c = c.replace('logo-excali">Excali</span><span class="logo-gif">Gif</span>', 'logo-excali">Excali</span><span class="logo-up">Up</span>')
    c = c.replace('logo-excali">Excali</span><span class="logo-gif">up</span>', 'logo-excali">Excali</span><span class="logo-up">Up</span>')
    p_priv.write_text(c, encoding='utf-8')
    print("docs/privacy.html updated successfully")

# 4. Update popup.js
p_pop = pathlib.Path('popup.js')
if p_pop.exists():
    c = p_pop.read_text(encoding='utf-8')
    c = c.replace('Excaliup', 'Excali Up')
    p_pop.write_text(c, encoding='utf-8')
    print("popup.js updated successfully")

# 5. Update content.js
p_cont = pathlib.Path('content.js')
if p_cont.exists():
    c = p_cont.read_text(encoding='utf-8')
    c = c.replace('[Excaliup]', '[Excali Up]')
    p_cont.write_text(c, encoding='utf-8')
    print("content.js updated successfully")

# 6. Update inject.js
p_inj = pathlib.Path('inject.js')
if p_inj.exists():
    c = p_inj.read_text(encoding='utf-8')
    c = c.replace('// Excaliup injected script', '// Excali Up injected script')
    p_inj.write_text(c, encoding='utf-8')
    print("inject.js updated successfully")
