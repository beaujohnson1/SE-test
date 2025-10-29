const FREEPIK_API_BASE = "https://api.freepik.com";
const GEMINI_ENDPOINT = "/v1/ai/gemini-2-5-flash-image-preview";

const RESTORATION_PROMPT = `Ultra-realistic recreation of an old vintage photo, keeping the same original face (99% likeness, no alteration). Transform into a modern high-quality digital portrait with vibrant updated colors, smooth realistic skin textures, and natural lighting. The outfit and background should be upgraded into a clean, modern aesthetic while preserving the authenticity of the original pose and expression.`;

interface GeminiTaskResponse {
  data: {
    generated: string[];
    task_id: string;
    status: "CREATED" | "PROCESSING" | "COMPLETED" | "FAILED";
  };
}

/**
 * Submit a photo restoration task to Gemini 2.5 Flash
 */
export async function restorePhoto(
  imageUrl: string
): Promise<{ taskId: string }> {
  const apiKey = process.env.FREEPIK_API_KEY;
  if (!apiKey) {
    throw new Error("FREEPIK_API_KEY is not configured");
  }

  const response = await fetch(`${FREEPIK_API_BASE}${GEMINI_ENDPOINT}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-freepik-api-key": apiKey,
    },
    body: JSON.stringify({
      prompt: RESTORATION_PROMPT,
      reference_images: [imageUrl],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const result: GeminiTaskResponse = await response.json();
  return { taskId: result.data.task_id };
}

/**
 * Check the status of a Gemini restoration task
 */
export async function checkTaskStatus(taskId: string): Promise<{
  status: string;
  generatedUrls: string[];
}> {
  const apiKey = process.env.FREEPIK_API_KEY;
  if (!apiKey) {
    throw new Error("FREEPIK_API_KEY is not configured");
  }

  const response = await fetch(
    `${FREEPIK_API_BASE}${GEMINI_ENDPOINT}/${taskId}`,
    {
      method: "GET",
      headers: {
        "x-freepik-api-key": apiKey,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const result: GeminiTaskResponse = await response.json();
  return {
    status: result.data.status,
    generatedUrls: result.data.generated,
  };
}

/**
 * Poll until restoration is complete (with timeout)
 */
export async function waitForRestoration(
  taskId: string,
  maxAttempts: number = 60,
  intervalMs: number = 3000
): Promise<string[]> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { status, generatedUrls } = await checkTaskStatus(taskId);

    if (status === "COMPLETED" && generatedUrls.length > 0) {
      return generatedUrls;
    }

    if (status === "FAILED") {
      throw new Error("Restoration task failed");
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("Restoration timeout - task took too long");
}
