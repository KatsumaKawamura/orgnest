// types/register.ts
export type AvailabilityStatus = "unknown" | "available" | "taken";
export type Availability = { userId?: AvailabilityStatus };
export type Checking = { userId: boolean };
