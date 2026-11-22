export const APP_URL = typeof window !== "undefined" ? window.location.origin : "";

/** Share with the phone's own share sheet, or copy to the clipboard. Returns what happened. */
export async function shareText(title: string, text: string, url: string): Promise<"shared" | "copied" | "failed"> {
  try {
    if (navigator.share) {
      await navigator.share({ title, text, url });
      return "shared";
    }
  } catch (e) {
    if ((e as Error)?.name === "AbortError") return "failed";
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    return "copied";
  } catch {
    return "failed";
  }
}
