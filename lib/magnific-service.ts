const FREEPIK_API_BASE = "https://api.freepik.com";
const MAGNIFIC_ENDPOINT = "/v1/ai/image-upscaler-precision-v2";

// Optimized settings for photo restoration upscaling
const UPSCALE_SETTINGS = {
  sharpen: 10, // Enhance facial features and text
  smart_grain: 5, // Avoid artificial texture
  ultra_detail: 40, // Recover fine details
  flavor: "photo" as const, // Optimized for photos
  scale_factor: 2, // 2x upscaling for high quality
};

interface MagnificTaskResponse {
  data: {
    generated: string[];
    task_id: string;
    status: "CREATED" | "PROCESSING" | "COMPLETED" | "FAILED";
  };
}

/**
 * Submit an upscaling task to Magnific Precision V2
 */
export async function upscalePhoto(
  imageUrl: string
): Promise<{ taskId: string }> {
  const apiKey = process.env.FREEPIK_API_KEY;
  if (!apiKey) {
    throw new Error("FREEPIK_API_KEY is not configured");
  }

  const response = await fetch(`${FREEPIK_API_BASE}${MAGNIFIC_ENDPOINT}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-freepik-api-key": apiKey,
    },
    body: JSON.stringify({
      image: imageUrl,
      ...UPSCALE_SETTINGS,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Magnific API error: ${response.status} - ${error}`);
  }

  const result: MagnificTaskResponse = await response.json();
  return { taskId: result.data.task_id };
}

/**
 * Check the status of a Magnific upscaling task
 */
export async function checkUpscaleStatus(taskId: string): Promise<{
  status: string;
  generatedUrls: string[];
}> {
  const apiKey = process.env.FREEPIK_API_KEY;
  if (!apiKey) {
    throw new Error("FREEPIK_API_KEY is not configured");
  }

  const response = await fetch(
    `${FREEPIK_API_BASE}${MAGNIFIC_ENDPOINT}/${taskId}`,
    {
      method: "GET",
      headers: {
        "x-freepik-api-key": apiKey,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Magnific API error: ${response.status} - ${error}`);
  }

  const result: MagnificTaskResponse = await response.json();
  return {
    status: result.data.status,
    generatedUrls: result.data.generated,
  };
}

/**
 * Poll until upscaling is complete (with timeout)
 */
export async function waitForUpscale(
  taskId: string,
  maxAttempts: number = 40,
  intervalMs: number = 3000
): Promise<string[]> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { status, generatedUrls } = await checkUpscaleStatus(taskId);

    if (status === "COMPLETED" && generatedUrls.length > 0) {
      return generatedUrls;
    }

    if (status === "FAILED") {
      throw new Error("Upscaling task failed");
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("Upscaling timeout - task took too long");
}
