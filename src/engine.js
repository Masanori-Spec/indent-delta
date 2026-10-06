import {parseFromFilesSync, parseString} from 'editorconfig';
import {Buffer} from 'buffer';

export const LIMITS = Object.freeze({configs:32,paths:512,bytes:1048576,sections:512,glob:256,lines:8192,absent:4096});
export const ENGINE = 'editorconfig 3.0.2 / @one-ini/wasm 0.2.1';
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const utf8=s=>new TextEncoder().encode(s).length;
export function canonicalPath(value, config=false){
  if(typeof value!=='string'||!value.startsWith('/')||value==='/'||value.includes('\\')||/[\x00-\x1f\x7f]/.test(value)||value.length>1024||value.split('/').slice(1).some(s=>!s||s==='.'||s==='..')) throw Error(`Use an absolute, normalized POSIX path: ${String(value).slice(0,80)}`);
  if(config&&/[{}\[\]*?]/.test(value.slice(0,value.lastIndexOf('/'))))throw Error('Config directory paths cannot contain glob metacharacters in this cross-core subset');
  if(config&&!value.endsWith('/.editorconfig')) throw Error(`Config path must end in /.editorconfig: ${value}`);
  if(!config&&value.endsWith('/.editorconfig')) throw Error(`Review file paths, not .editorconfig files: ${value}`);
  return value;
}
function validateGlob(glob){
 if(!glob||/[#;\s]/.test(glob)||glob.length>LIMITS.glob||glob.startsWith('!')||/[!+@?*]\(/.test(glob)||glob.includes('\\')) throw Error('Unsupported glob: use EditorConfig wildcards without escapes, extglobs, or leading negation (maximum 256 characters)');
 let open=false,braces=0,alternatives=2**(glob.match(/\*\*/g)?.length??0);if(alternatives>64)throw Error('Too many globstars; at most 64 implicit globstar alternatives');
 for(const c of glob){if(c==='['){if(open)throw Error('Nested character classes are unsupported');open=true;}if(c===']'){if(!open)throw Error('Unbalanced character class');open=false;}if(!open&&c==='{'){if(braces)throw Error('Nested brace expansions are unsupported');braces++;}if(!open&&c==='}'){if(!braces)throw Error('Unbalanced brace expansion');braces--;}}
 if(open||braces)throw Error('Unbalanced glob');
 if(glob.includes('[]')||glob.includes('[!]'))throw Error('Empty character classes are unsupported');
 for(const m of glob.matchAll(/\[([^\[\]]*)\]/g)){
  if(!/^(?:[A-Za-z0-9]-[A-Za-z0-9]|[A-Za-z0-9])+$/.test(m[1]))throw Error('Character classes support only positive ASCII letters/digits and ascending same-kind ranges');
  for(const r of m[1].matchAll(/([A-Za-z0-9])-([A-Za-z0-9])/g))if(r[1]>r[2]||!(/[a-z]/.test(r[1])&&/[a-z]/.test(r[2])||/[A-Z]/.test(r[1])&&/[A-Z]/.test(r[2])||/[0-9]/.test(r[1])&&/[0-9]/.test(r[2])))throw Error('Character class ranges must be ascending and both lowercase, uppercase, or digits');
 }
 for(const m of glob.matchAll(/\{([^{}]*)\}/g)){
  const range=m[1].match(/^(-?\d+)\.\.(-?\d+)$/);
  if(!range&&(m[1].includes('..')||!m[1].includes(',')||m[1].split(',').some(v=>!(/^[A-Za-z0-9_.-]+$/.test(v)))))throw Error('Brace lists require two or more nonempty simple tokens, or an ascending integer range');
  if(range&&(String(Number(range[1]))!==range[1]||String(Number(range[2]))!==range[2]||!Number.isSafeInteger(Number(range[1]))||!Number.isSafeInteger(Number(range[2]))||Number(range[1])>Number(range[2])))throw Error('Numeric ranges must be ascending canonical integers without zero padding');
  const count=range?Number(range[2])-Number(range[1])+1:m[1].split(',').length;
  if(!Number.isSafeInteger(count)||count>100||(alternatives*=count)>256)throw Error('Glob expansion exceeds the bounded 256-alternative / 100-value range limit');
 }
}
export function validateConfig(text){
 if(typeof text!=='string'||utf8(text)>LIMITS.bytes)throw Error('Config content must be UTF-8 text within the 1 MiB project limit');
 if(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(text)||/\r(?!\n)/.test(text))throw Error('Config has unsupported control characters or lone CR line endings');
 const lines=text.split(/\r?\n/);if(lines.length>LIMITS.lines)throw Error('Config exceeds 8192 lines');
 let section=false,sections=0;
 for(let i=0;i<lines.length;i++){
  if(!/^[#;]/.test(lines[i])&&/[^\S \t\r\n]/u.test(lines[i]))throw Error('Non-ASCII whitespace and byte-order marks outside column-one comments are unsupported');
  const line=lines[i].trim();if(!line)continue;if(/^[#;]/.test(line)){if(/^[ \t]/.test(lines[i]))throw Error('Comments must begin in column one for cross-core compatibility');continue;}
  if(line.startsWith('[')&&line.endsWith(']')){validateGlob(line.slice(1,-1));section=true;if(++sections>LIMITS.sections)throw Error('Config exceeds 512 sections');continue;}
  const m=line.match(/^([A-Za-z0-9_.-]+)\s*=\s*(.+)$/);
  if(!m)throw Error(`Unsupported or malformed syntax at line ${i+1}; use key = value, whole-line comments, and [glob] sections`);
  const key=m[1].toLowerCase(),value=m[2].trim();
  if(m[1]!==key)throw Error('Property keys, including root, must be lowercase in this cross-core subset');
  if(['__proto__','constructor','prototype'].includes(key))throw Error(`Reserved property at line ${i+1}`);
  if(key.length>128||value.length>1024||!(/^[A-Za-z0-9_+.-]+$/.test(value)))throw Error(`Unsupported property value at line ${i+1}; this release accepts single-token scalar values`);
  if(!section&&(key!=='root'||!['true','false'].includes(value)))throw Error('Only root = true or root = false is supported before the first section');
  if(section&&key==='root')throw Error('root belongs before the first section');
  try{const v=JSON.parse(value);if(typeof v==='number'&&String(v)!==value)throw Error(`Noncanonical numeric value at line ${i+1}`);}catch(e){if(e.message.startsWith('Noncanonical'))throw e;}
 }
 const parsed=parseString(text);return {root:parsed[0][1].root==='true',sections:sections,properties:[...new Set(parsed.slice(1).flatMap(s=>Object.keys(s[1])))]};
}
export function validateManifest(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Import a JSON manifest object');
 if(!Array.isArray(input.configs)||input.configs.length<1||input.configs.length>LIMITS.configs)throw Error('Import 1–32 configuration files');
 if(!Array.isArray(input.paths)||input.paths.length<1||input.paths.length>LIMITS.paths)throw Error('Supply 1–512 finite file paths');
 if(!Array.isArray(input.absent)||input.absent.length>LIMITS.absent)throw Error('Include an absent array of explicitly checked missing .editorconfig paths');
 let bytes=0,totalSections=0;const propertyNames=new Set(['indent_size','tab_width']);const seen=new Set();
 const configs=input.configs.map(c=>{canonicalPath(c.path,true);if(seen.has(c.path))throw Error(`Duplicate config path: ${c.path}`);seen.add(c.path);bytes+=utf8(c.content??'');const checked=validateConfig(c.content);totalSections+=checked.sections;for(const p of checked.properties)propertyNames.add(p);return {path:c.path,content:c.content};});
 if(totalSections>2048)throw Error('At most 2048 sections across all configs');
 if(bytes>LIMITS.bytes)throw Error('Imported config content exceeds 1 MiB');
 const absent=input.absent.map(p=>{canonicalPath(p,true);if(seen.has(p))throw Error(`Conflicting or duplicate ancestry entry: ${p}`);seen.add(p);return p;});
 const paths=input.paths.map(p=>canonicalPath(p));if(new Set(paths).size!==paths.length)throw Error('Duplicate file paths are not allowed');
 const target=canonicalPath(input.target,true);if(!configs.some(c=>c.path===target))throw Error('Selected replacement target must be an imported config');
 const assertions=input.assertions??[];if(!Array.isArray(assertions)||assertions.length>1024)throw Error('At most 1024 assertions');
 for(const a of assertions){propertyNames.add(a.property);if(!paths.includes(a.path)||typeof a.property!=='string'||a.property.length>128||(a.value!==undefined&&(typeof a.value!=='string'||a.value.length>1024))||!(/^[a-z0-9_.-]+$/.test(a.property))||!['stay','change','value'].includes(a.expect))throw Error('Each assertion needs an imported path, lowercase property, and stay/change/value expectation');if(a.expect==='value'&&typeof a.value!=='string')throw Error('Value assertions require a string value (use <absent> for no property)');}
 if(propertyNames.size>32)throw Error('At most 32 distinct properties across configs and assertions, including derived indent_size/tab_width');
 return {format:'indent-delta/1',configs,absent,paths,target,assertions:assertions.map(a=>({path:a.path,property:a.property,expect:a.expect,...(a.value!==undefined?{value:a.value}:{})}))};
}
function ancestry(path, configs, absent){
 const selected=[],missing=[];let dir=path.slice(0,path.lastIndexOf('/'));
 while(true){const p=dir+'/.editorconfig';const c=configs.find(c=>c.path===p);if(c){selected.push(c);if(c.root)break;}else if(!absent.includes(p))missing.push(p);if(dir==='')break;dir=dir.slice(0,dir.lastIndexOf('/'));}
 return {selected,missing};
}
function resolve(path,selected,cache){
 const sources=[];const values=parseFromFilesSync(path,selected.map(c=>({name:c.path,contents:Buffer.from(c.content)})),{files:sources,unset:false,cache});
 return {values:Object.fromEntries(Object.entries(values).map(([k,v])=>[k,String(v)])),sources:sources.map(s=>({path:s.fileName,glob:s.glob}))};
}
export function state(values,property){return own(values,property)?{kind:values[property]==='unset'?'unset':'value',value:values[property]}:{kind:'absent',value:null};}
const equal=(a,b)=>a.kind===b.kind&&a.value===b.value;
export function review(manifest,replacement){
 const m=validateManifest(manifest);validateConfig(replacement);if(m.configs.reduce((n,c)=>n+utf8(c.path===m.target?replacement:c.content),0)>LIMITS.bytes)throw Error('Replacement pushes config content above 1 MiB');
 const beforeConfigs=m.configs.map(c=>({...c,root:validateConfig(c.content).root}));
 const afterConfigs=m.configs.map(c=>{const content=c.path===m.target?replacement:c.content;return {...c,content,root:validateConfig(content).root};});
 if(afterConfigs.reduce((n,c)=>n+validateConfig(c.content).sections,0)>2048)throw Error('Replacement exceeds 2048 total sections');
 const beforeCache=new Map(),afterCache=new Map();let sourceCount=0;
 const allProps=new Set(['indent_size','tab_width',...m.assertions.map(a=>a.property),...beforeConfigs.flatMap(c=>validateConfig(c.content).properties),...afterConfigs.flatMap(c=>validateConfig(c.content).properties)]);if(allProps.size>32)throw Error('Replacement exceeds the 32-property matrix limit');
 const missing=[];const rows=m.paths.map(path=>{const before=ancestry(path,beforeConfigs,m.absent),after=ancestry(path,afterConfigs,m.absent);for(const [phase,a] of [['before',before],['after',after]])for(const p of a.missing){missing.push({path,phase,config:p});if(missing.length>4096)throw Error('Review exceeds 4096 unknown-ancestry trace entries; reduce paths or complete the hierarchy');}const b=before.missing.length?null:resolve(path,before.selected,beforeCache),a=after.missing.length?null:resolve(path,after.selected,afterCache);sourceCount+=(b?.sources.length??0)+(a?.sources.length??0);if(sourceCount>4096)throw Error('Review exceeds 4096 matched-section trace entries; reduce paths or sections');return {path,before:b,after:a};});
 const properties=[...new Set(rows.flatMap(r=>[...Object.keys(r.before?.values??{}),...Object.keys(r.after?.values??{})]).concat(m.assertions.map(a=>a.property)))].sort();
 for(const row of rows){row.changes=row.before&&row.after?properties.filter(p=>!equal(state(row.before.values,p),state(row.after.values,p))):null;}
 const assertions=m.assertions.map(a=>{const row=rows.find(r=>r.path===a.path);const before=row.before?state(row.before.values,a.property):null,after=row.after?state(row.after.values,a.property):null;const passed=!!before&&!!after&&(a.expect==='stay'?equal(before,after):a.expect==='change'?!equal(before,after)&&(a.value===undefined||(a.value==='<absent>'?after.kind==='absent':after.value===a.value)):a.value==='<absent>'?after.kind==='absent':after.value===a.value);return {...a,before,after,passed};});
 return {format:'indent-delta-review/1',engine:ENGINE,scope:'Only imported configuration hierarchy and listed paths. This is not a whole-repository guarantee.',complete:missing.length===0,status:missing.length?'incomplete':assertions.some(a=>!a.passed)?'assertions-failed':assertions.length?'assertions-passed':'no-assertions',missing,rows,properties,assertions,changedPaths:rows.filter(r=>r.changes?.length).length,target:m.target};
}
export function downloads(manifest,replacement,result){
 const m=validateManifest(manifest);return {'replacement.editorconfig':replacement,'original.editorconfig':m.configs.find(c=>c.path===m.target).content,'path-manifest.json':JSON.stringify(m,null,2)+'\n','review-report.json':JSON.stringify({...result,replacement,original:m.configs.find(c=>c.path===m.target).content},null,2)+'\n'};
}
