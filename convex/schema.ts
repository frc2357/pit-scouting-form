import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    formResponses: defineTable({
        scouterName: v.string(),
        team: v.string(),
        auto: v.array(
            v.object({
                points: v.array(v.array(v.number())),
                color: v.string(),
                size: v.number(),
            })
        ),
        weight: v.string(),
        dimensions: v.string(),
        intaking: v.array(v.string()),
        travelLocation: v.array(v.string()),
        capacity: v.string(),
        passing: v.union(v.literal(1), v.literal(0), v.null()),
        driverExperience: v.string(),
        shooterType: v.string(),
        intakeType: v.string(),
        automation: v.array(v.string()),
        notes: v.string(),
    }),
});
