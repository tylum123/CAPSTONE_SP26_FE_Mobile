# Codebase Refactoring Plan

## Files > 250 Lines (Require Splitting)
1. `src/components/profile/LocationPicker.tsx` (349 lines)
2. `src/components/ui/JobMap.tsx` (534 lines)
3. `src/constants/demoData.ts` (344 lines)
4. `src/context/AuthContext.tsx` (385 lines)
5. `src/screens/EditProfileScreen.tsx` (489 lines)
6. `src/screens/JobDetailScreen.tsx` (569 lines)
7. `src/screens/LoginScreen.tsx` (255 lines)
8. `src/screens/OnboardingProfileScreen.tsx` (310 lines)
9. `src/screens/SubmitReportScreen.tsx` (300 lines)
10. `src/screens/WorkerHomeScreen.tsx` (463 lines)
11. `src/screens/WorkerJobsScreen.tsx` (295 lines)
12. `src/screens/WorkerProfileScreen.tsx` (267 lines)
13. `src/screens/WorkerSearchScreen.tsx` (436 lines)
14. `src/types/worker.ts` (281 lines)

## Generic Naming & Action-Based Rename Suggestions
1. `src/components/ui/index.ts` -> `export_ui_components.ts`
2. `src/config/index.ts` -> `export_configurations.ts`
3. `src/types/index.ts` -> `export_type_definitions.ts`
4. `src/services/index.ts` -> `export_services.ts`
5. `src/types/worker.ts` -> `define_worker_interfaces.ts`
6. `src/types/api.ts` -> `define_api_interfaces.ts`
7. `src/config/axios.ts` -> `configure_axios_client.ts`
8. `src/utils/helpers.ts` -> `provide_formatting_helpers.ts`
