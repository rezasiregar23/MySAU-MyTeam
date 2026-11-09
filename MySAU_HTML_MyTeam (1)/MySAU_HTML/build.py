"""Rebuild browser bundle using only Python standard library."""
from pathlib import Path
import re,posixpath
root=Path(__file__).resolve().parent
modules=[]
for path in sorted((root/'js').rglob('*.js')):
 if path.name in ('app.bundle.js','myteam.bundle.js','fit.js'):continue
 key=path.relative_to(root).as_posix();src=path.read_text()
 def imp(m):
  spec,rel=m.groups();dep=posixpath.normpath(posixpath.join(posixpath.dirname(key),rel))
  if spec.startswith('* as '):return f'const {spec[5:]} = require("{dep}");'
  return f'const {spec} = require("{dep}");'
 src=re.sub(r"import\s+(.+?)\s+from\s+['\"](.+?)['\"];",imp,src)
 names=re.findall(r'export\s+(?:const|let|function)\s+([\w$]+)',src)
 for group in re.findall(r'export\s*\{([^}]+)\};',src):names.extend(x.strip() for x in group.split(','))
 src=re.sub(r'export\s*\{[^}]+\};','',src)
 src=re.sub(r'\bexport\s+(?=const|let|function)','',src)
 modules.append(f'{key!r}: function(require) {{\n{src}\nreturn {{'+','.join(names)+'};\n}')
def write(entry,out):
 bundle='/* Generated from editable js/ modules by build.py */\n(()=>{\nconst modules={'+',\n'.join(modules)+'};\nconst cache={};function require(id){return cache[id]||(cache[id]=modules[id](require));}\nrequire("'+entry+'");\n})();\n'
 (root/out).write_text(bundle)
 print('Built',out)
write('js/main.js','js/app.bundle.js')       # MySAU (index.html, task.html, ...)
write('js/myteam/main.js','js/myteam.bundle.js')  # aplikasi My Team (myteam.html)
