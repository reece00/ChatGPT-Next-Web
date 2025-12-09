import { NextResponse } from "next/server";
import { getServerSideConfig } from "../../config/server";

const serverConfig = getServerSideConfig();

// Danger! Don not write any secret value here!
// 警告！不要在这里写入任何敏感信息！
interface DangerConfigOnly {
  needCode: boolean;
  hideUserApiKey: boolean;
  disableGPT4: boolean;
  hideBalanceQuery: boolean;
}

declare global {
  type DangerConfig = DangerConfigOnly;
}

async function handle() {
  const DANGER_CONFIG: DangerConfigOnly = {
    needCode: serverConfig.needCode,
    hideUserApiKey: serverConfig.hideUserApiKey,
    disableGPT4: serverConfig.disableGPT4,
    hideBalanceQuery: serverConfig.hideBalanceQuery,
  };

  return NextResponse.json(DANGER_CONFIG);
}

export const GET = handle;
export const POST = handle;

export const runtime = "edge";
