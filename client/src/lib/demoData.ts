// Orbital Command reminder: demo mode must be explicit and must never imply live inference or invented scientific output.
import type { InferenceResponse } from "@/types/inference";

export const demoScenes = [
  {
    id: "scene-01",
    name: "Himalayan foothill / Scene 01",
    latitude: 27.9881,
    longitude: 86.925,
    date: "2024-05-18",
    aoiSize: 1,
    inputImageUrl: "",
    superResolvedImageUrl: "",
    metrics: {
      inputResolution: "10 m",
      outputResolution: "1 m",
      model: "S2DR3",
      psnr: undefined,
      ssim: undefined,
      processingTime: undefined,
    },
  },
  {
    id: "scene-02",
    name: "Coastal delta / Scene 02",
    latitude: 22.5726,
    longitude: 88.3639,
    date: "2024-02-11",
    aoiSize: 2,
    inputImageUrl: "",
    superResolvedImageUrl: "",
    metrics: {
      inputResolution: "10 m",
      outputResolution: "1 m",
      model: "S2DR3",
      psnr: undefined,
      ssim: undefined,
      processingTime: undefined,
    },
  },
  {
    id: "scene-03",
    name: "Deccan plateau / Scene 03",
    latitude: 17.385,
    longitude: 78.4867,
    date: "2023-11-04",
    aoiSize: 1,
    inputImageUrl: "",
    superResolvedImageUrl: "",
    metrics: {
      inputResolution: "10 m",
      outputResolution: "1 m",
      model: "S2DR3",
      psnr: undefined,
      ssim: undefined,
      processingTime: undefined,
    },
  },
] as const;

export const demoResponseFor = (sceneId: string): InferenceResponse | null => {
  const scene = demoScenes.find((item) => item.id === sceneId);
  if (!scene) return null;
  return {
    status: "success",
    inputImageUrl: scene.inputImageUrl || undefined,
    superResolvedImageUrl: scene.superResolvedImageUrl || undefined,
    metrics: scene.metrics,
    analysis: {},
    metadata: {
      latitude: scene.latitude,
      longitude: scene.longitude,
      acquisitionDate: scene.date,
      aoiSize: scene.aoiSize,
    },
  };
};
