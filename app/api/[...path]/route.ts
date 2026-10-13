import { api } from '../../../server/api.mjs';
import { getRuntime, publicRequest } from '../../../server/node-runtime.mjs';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function GET(request: Request) {
 try { return await api(publicRequest(request),await getRuntime()); }
 catch(error) { console.error('Store runtime initialization failed');return Response.json({error:'O serviço da loja está temporariamente indisponível.'},{status:503}); }
}
export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
