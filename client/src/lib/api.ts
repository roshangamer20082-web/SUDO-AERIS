// Orbital Command reminder: the UI owns orchestration, while heavy S2DR3 inference stays behind a replaceable backend boundary.
import type { InferenceRequest, InferenceResponse } from "@/types/inference";

const inferenceApiUrl = import.meta.env.VITE_INFERENCE_API_URL || "/api/inference";

export async function requestInference(payload: InferenceRequest): Promise<InferenceResponse> {
  const response = await fetch(inferenceApiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("INFERENCE_BACKEND_UNAVAILABLE");
  }
  return (await response.json()) as InferenceResponse;
}
