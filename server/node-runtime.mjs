import {mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {isIP} from 'node:net';
import {pbkdf2Sync,randomBytes} from 'node:crypto';
const sqliteSchema=`CREATE TABLE IF NOT EXISTS store_state(id TEXT PRIMARY KEY,payload TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 0,updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS admin_account(id TEXT PRIMARY KEY,password_hash TEXT NOT NULL,salt TEXT NOT NULL,must_change INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS admin_session(token_hash TEXT PRIMARY KEY,csrf TEXT NOT NULL,expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS login_throttle(key TEXT PRIMARY KEY,attempts INTEGER NOT NULL,reset_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS product_images(id TEXT PRIMARY KEY,image BLOB NOT NULL,content_type TEXT NOT NULL);`;
const mysqlSchema=[
 'CREATE TABLE IF NOT EXISTS store_state(id VARCHAR(100) PRIMARY KEY,payload LONGTEXT NOT NULL,revision INT NOT NULL DEFAULT 0,updated_at BIGINT NOT NULL)',
 'CREATE TABLE IF NOT EXISTS admin_account(id VARCHAR(100) PRIMARY KEY,password_hash VARCHAR(128) NOT NULL,salt VARCHAR(128) NOT NULL,must_change INT NOT NULL DEFAULT 1)',
 'CREATE TABLE IF NOT EXISTS admin_session(token_hash VARCHAR(64) PRIMARY KEY,csrf VARCHAR(128) NOT NULL,expires_at BIGINT NOT NULL)',
 'CREATE TABLE IF NOT EXISTS login_throttle(`key` VARCHAR(64) PRIMARY KEY,attempts INT NOT NULL,reset_at BIGINT NOT NULL)',
 'CREATE TABLE IF NOT EXISTS product_images(id VARCHAR(100) PRIMARY KEY,image LONGBLOB NOT NULL,content_type VARCHAR(80) NOT NULL)'
];
export function mysqlStatement(sql){return sql.replace(/INSERT OR IGNORE/gi,'INSERT IGNORE').replace(/ON CONFLICT\(key\) DO UPDATE SET/gi,'ON DUPLICATE KEY UPDATE').replace(/\bkey\b/gi,'`key`').replace(/DUPLICATE `key`/gi,'DUPLICATE KEY');}
function prepared(sql,execute,first){const make=args=>({bind(...values){return make(values);},first(){return first(sql,args);},run(){return execute(sql,args);},sql,args});return make([]);}
function bucket(DB,engine){return {
 async get(id){const row=await DB.prepare('SELECT image,content_type FROM product_images WHERE id = ?').bind(id).first();return row?{body:new Uint8Array(row.image),httpMetadata:{contentType:row.content_type}}:null;},
 async put(id,bytes,{httpMetadata}){const image=Buffer.from(bytes);const sql=engine==='mysql'?'INSERT INTO product_images(id,image,content_type) VALUES (?,?,?) ON DUPLICATE KEY UPDATE image = ?,content_type = ?':'INSERT INTO product_images(id,image,content_type) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET image=excluded.image,content_type=excluded.content_type';const args=engine==='mysql'?[id,image,httpMetadata.contentType,image,httpMetadata.contentType]:[id,image,httpMetadata.contentType];await DB.prepare(sql).bind(...args).run();},
 async delete(id){await DB.prepare('DELETE FROM product_images WHERE id = ?').bind(id).run();}
};}
export async function createRuntime(settings=process.env){
 let DB,close,engine='none';
 if(settings.DB_NAME||settings.DATABASE_URL){
  const {createPool}=await import('mysql2/promise');
  const pool=settings.DATABASE_URL?createPool(settings.DATABASE_URL):createPool({host:settings.DB_HOST||'localhost',port:Number(settings.DB_PORT||3306),user:settings.DB_USER,password:settings.DB_PASSWORD,database:settings.DB_NAME,connectionLimit:5,charset:'utf8mb4',supportBigNumbers:true});
  try{for(const sql of mysqlSchema)await pool.query(sql);}catch(error){await pool.end();throw error;}
  const execute=async(sql,args)=>{const [result]=await pool.execute(mysqlStatement(sql),args);return {meta:{changes:result.affectedRows}};};
  const first=async(sql,args)=>{const [rows]=await pool.execute(mysqlStatement(sql),args);return rows[0]||null;};
  DB={prepare(sql){return prepared(sql,execute,first);},async batch(statements){const connection=await pool.getConnection();try{await connection.beginTransaction();const results=[];for(const statement of statements){const [r]=await connection.execute(mysqlStatement(statement.sql),statement.args);results.push({meta:{changes:r.affectedRows}});}await connection.commit();return results;}catch(error){await connection.rollback();throw error;}finally{connection.release();}}};
  close=()=>pool.end();engine='mysql';
 }else if(settings.NODE_ENV!=='production'||settings.DATA_DIR){
  const {DatabaseSync}=await import('node:sqlite');
  const dir=resolve(settings.DATA_DIR||'.data');await mkdir(dir,{recursive:true});const sql=new DatabaseSync(join(dir,'3irmaos.sqlite'));
  sql.exec('PRAGMA journal_mode=WAL;PRAGMA busy_timeout=5000;'+sqliteSchema);
  const execute=async(statement,args)=>({meta:{changes:Number(sql.prepare(statement).run(...args).changes)}});
  const first=async(statement,args)=>sql.prepare(statement).get(...args)||null;
  DB={prepare(statement){return prepared(statement,execute,first);},async batch(statements){sql.exec('BEGIN IMMEDIATE');try{const results=statements.map(s=>({meta:{changes:Number(sql.prepare(s.sql).run(...s.args).changes)}}));sql.exec('COMMIT');return results;}catch(error){sql.exec('ROLLBACK');throw error;}}};
  close=async()=>sql.close();engine='sqlite';
 }
 let salt=settings.ADMIN_SALT,hash=settings.ADMIN_PASSWORD_HASH;
 if(!hash&&settings.ADMIN_PASSWORD){if(settings.ADMIN_PASSWORD.length<12)throw Error('ADMIN_PASSWORD must have at least 12 characters');salt=salt||randomBytes(24).toString('hex');hash=pbkdf2Sync(settings.ADMIN_PASSWORD,salt,100000,32,'sha256').toString('hex');}
 return {DB,BUCKET:DB?bucket(DB,engine):null,ADMIN_USERNAME:settings.ADMIN_USERNAME||'admin',ADMIN_SALT:salt,ADMIN_PASSWORD_HASH:hash,engine,close:close||(async()=>{})};
}
let runtimePromise;
export function getRuntime(){return runtimePromise??=(createRuntime().catch(error=>{runtimePromise=null;throw error;}));}
export function publicRequest(request){
 const url=new URL(request.url);const protocol=request.headers.get('x-forwarded-proto')?.split(',')[0].trim();if(protocol==='https'||protocol==='http')url.protocol=protocol+':';
 const host=request.headers.get('x-forwarded-host')?.split(',')[0].trim()||request.headers.get('host');if(host&&!/[\s/@\\]/.test(host)){url.port='';url.host=host;}
 const headers=new Headers(request.headers);headers.delete('cf-connecting-ip');const ip=request.headers.get('x-forwarded-for')?.split(',').at(-1).trim();if(ip&&isIP(ip))headers.set('cf-connecting-ip',ip);
 const adapted=new Request(url,request);return new Request(adapted,{headers});
}
