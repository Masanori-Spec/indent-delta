import {review,validateManifest} from './engine.js';
self.onmessage=({data})=>{try{const manifest=validateManifest(data.manifest);self.postMessage(data.action==='validate'?{id:data.id,manifest}:{id:data.id,result:review(manifest,data.replacement)});}catch(error){self.postMessage({id:data.id,error:error.message});}};
