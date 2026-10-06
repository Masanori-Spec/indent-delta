// Small uncompressed ZIP writer. File data is never sent to a server.
export function zip(files){
 const encode=s=>new TextEncoder().encode(s);const parts=[],central=[];let offset=0;
 const put=(length,values)=>{const bytes=new Uint8Array(length),view=new DataView(bytes.buffer);for(const [pos,size,value]of values)view[size===2?'setUint16':'setUint32'](pos,value,true);return bytes;};
 for(const [name,text]of Object.entries(files)){const n=encode(name),data=encode(text);let crc=0xffffffff;for(const byte of data){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}crc=(crc^0xffffffff)>>>0;
 const local=put(30,[[0,4,0x04034b50],[4,2,20],[6,2,0x800],[14,4,crc],[18,4,data.length],[22,4,data.length],[26,2,n.length]]);
 const entry=put(46,[[0,4,0x02014b50],[4,2,20],[6,2,20],[8,2,0x800],[16,4,crc],[20,4,data.length],[24,4,data.length],[28,2,n.length],[42,4,offset]]);parts.push(local,n,data);central.push(entry,n);offset+=local.length+n.length+data.length;
 }
 const centralLength=central.reduce((a,b)=>a+b.length,0),count=Object.keys(files).length;return new Blob([...parts,...central,put(22,[[0,4,0x06054b50],[8,2,count],[10,2,count],[12,4,centralLength],[16,4,offset]])],{type:'application/zip'});
}
