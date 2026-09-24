import type { FarmerProfile, CropAdvisory } from "@workspace/db";

function nullableNumber(value: string | number | null): number | null {
  if (value === null) return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function serializeProfile(profile: FarmerProfile) {
  return {
    id: profile.id,
    fullName: profile.fullName,
    phone: profile.phone ?? null,
    village: profile.village ?? null,
    district: profile.district ?? null,
    state: profile.state ?? null,
    country: profile.country,
    farmingType: profile.farmingType ?? null,
    farmSizeAcres: nullableNumber(profile.farmSizeAcres),
    preferredLanguage: profile.preferredLanguage ?? null,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

export function serializeAdvisory(advisory: CropAdvisory) {
  return {
    id: advisory.id,
    cropName: advisory.cropName,
    cropVariety: advisory.cropVariety ?? null,
    location: advisory.location,
    soilType: advisory.soilType ?? null,
    soilPh: nullableNumber(advisory.soilPh),
    growthStage: advisory.growthStage ?? null,
    sowingDate: advisory.sowingDate ?? null,
    irrigationMethod: advisory.irrigationMethod ?? null,
    irrigationFrequency: advisory.irrigationFrequency ?? null,
    fertilizerUsage: advisory.fertilizerUsage ?? null,
    symptoms: advisory.symptoms ?? null,
    pestObservations: advisory.pestObservations ?? null,
    diseaseObservations: advisory.diseaseObservations ?? null,
    weatherConditions: advisory.weatherConditions ?? null,
    mainConcern: advisory.mainConcern,
    additionalNotes: advisory.additionalNotes ?? null,
    status: advisory.status,
    riskLevel: advisory.riskLevel ?? null,
    confidence: advisory.confidence ?? null,
    advisoryResult: advisory.advisoryResult ?? null,
    aiModel: advisory.aiModel ?? null,
    errorMessage: advisory.errorMessage ?? null,
    createdAt: advisory.createdAt,
    updatedAt: advisory.updatedAt,
  };
}

export function serializeAdvisorySummary(advisory: CropAdvisory) {
  return {
    id: advisory.id,
    cropName: advisory.cropName,
    location: advisory.location,
    mainConcern: advisory.mainConcern,
    status: advisory.status,
    riskLevel: advisory.riskLevel ?? null,
    confidence: advisory.confidence ?? null,
    createdAt: advisory.createdAt,
  };
}