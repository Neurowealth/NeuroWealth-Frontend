// #337 — typed profile storage adapter.
// Extracts ProfileData, ProfileService, DEFAULT_PROFILE, and the mock
// implementation from mock-services into a standalone module with a
// swappable accessor so the profile page is decoupled from storage details.

export type { ProfileData, ProfileService } from "@/lib/mock-services";
export { DEFAULT_PROFILE, mockProfileService } from "@/lib/mock-services";

import { ProfileService, mockProfileService } from "@/lib/mock-services";

const activeProfileAdapter: ProfileService = mockProfileService;

export function getProfileAdapter(): ProfileService {
  return activeProfileAdapter;
}
