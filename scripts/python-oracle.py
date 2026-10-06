"""Independent official Python core on physical original/replacement hierarchies."""
import json,sys,tempfile,pathlib,re
import editorconfig
assert editorconfig.__version__ == '0.17.1'
x=json.load(sys.stdin);result={}
def destination(root, logical, config=False):
 if not isinstance(logical,str) or not logical.startswith('/') or len(logical)>1024 or '\\' in logical or re.search(r'[\x00-\x1f\x7f]',logical) or any(part in ('','.','..') for part in logical.split('/')[1:]):
  raise ValueError('Expected a canonical absolute POSIX fixture path')
 if logical.endswith('/.editorconfig') != config:
  raise ValueError('Fixture config/file path type mismatch')
 dest=(root/logical.lstrip('/')).resolve()
 dest.relative_to(root.resolve())
 return dest
# Validate every path before creating any fixture files.
for config in x['manifest']['configs']:
 destination(pathlib.Path('/virtual-boundary'),config['path'],True)
for logical in x['manifest']['paths']:
 destination(pathlib.Path('/virtual-boundary'),logical)

for phase in ['before','after']:
 with tempfile.TemporaryDirectory(prefix='indentdelta-oracle-') as directory:
  base=pathlib.Path(directory);root=base/'scope';root.mkdir()
  # Empty parent boundary contains physical lookup without adding properties.
  (base/'.editorconfig').write_text('root = true\n',encoding='utf-8')
  for config in x['manifest']['configs']:
   dest=destination(root,config['path'],True);dest.parent.mkdir(parents=True,exist_ok=True)
   dest.write_text(x['replacement'] if phase=='after' and config['path']==x['manifest']['target'] else config['content'],encoding='utf-8')
  result[phase]={}
  for path in x['manifest']['paths']:
   dest=destination(root,path);dest.parent.mkdir(parents=True,exist_ok=True);dest.touch()
   result[phase][path]=dict(editorconfig.get_properties(str(dest)))
print(json.dumps(result))
