import { logger } from "@/lib/logging/logger";

let chromiumModule: typeof import("playwright-core") | null = null;

async function getChromium() {
  if (!chromiumModule) {
    chromiumModule = await import("playwright-core");
  }
  return chromiumModule.chromium;
}

export async function fetchRenderedHtml(url: string, userAgent: string): Promise<string> {
  const chromium = await getChromium();
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage({ userAgent });
    await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
    const html = await page.content();
    return html;
  } catch (error) {
    logger.error("Playwright fetch failed", { url, error });
    throw error;
  } finally {
    await browser.close();
  }
}
