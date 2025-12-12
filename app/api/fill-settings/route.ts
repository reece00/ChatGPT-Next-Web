import { NextRequest, NextResponse } from "next/server";
import { getServerSideConfig } from "../../config/server";
import md5 from "spark-md5";
import { ACCESS_CODE_PREFIX } from "../../constant";

const serverConfig = getServerSideConfig();

interface FillSettingsResponse {
  openaiUrl?: string;
  apiKey?: string;
}

function checkAuthorization(req: NextRequest): boolean {
  const authToken = req.headers.get("Authorization") ?? "";
  const token = authToken.trim().replaceAll("Bearer ", "").trim();

  const isOpenAiKey = !token.startsWith(ACCESS_CODE_PREFIX);
  const accessCode = isOpenAiKey ? "" : token.slice(ACCESS_CODE_PREFIX.length);
  const apiKeyFromHeader = isOpenAiKey ? token : "";

  const hashedCode = md5.hash(accessCode ?? "").trim();

  return !serverConfig.needCode || serverConfig.codes.has(hashedCode);
}

async function handle(req: NextRequest) {
  const isAuthorized = checkAuthorization(req);

  const resp: FillSettingsResponse = {};
  if (isAuthorized) {
    if (serverConfig.baseUrl) resp.openaiUrl = serverConfig.baseUrl;
    if (serverConfig.apiKey) resp.apiKey = serverConfig.apiKey as string;
  }

  return NextResponse.json(resp);
}

export const GET = handle;
export const POST = handle;

export const runtime = "edge";
