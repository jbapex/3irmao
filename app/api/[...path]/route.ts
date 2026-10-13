import { env } from 'cloudflare:workers';
import { api } from '../../../server/api.mjs';
export const dynamic = 'force-dynamic';
export const GET = (request: Request) => api(request, env);
export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
