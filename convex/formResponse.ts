import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const compressedLineValidator = v.object({
    points: v.array(v.array(v.number())),
    color: v.string(),
    size: v.number(),
});

const formResponseFields = {
    scouterName: v.string(),
    team: v.string(),
    auto: v.array(compressedLineValidator),
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
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Return all form responses, ordered by insertion time (newest first). */
export const getAll = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("formResponses").order("desc").collect();
    },
});

/** Return a single form response by its document ID. */
export const getById = query({
    args: { id: v.id("formResponses") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Insert a new form response and return its document ID. */
export const create = mutation({
    args: formResponseFields,
    handler: async (ctx, args) => {
        return await ctx.db.insert("formResponses", args);
    },
});

/** Patch any subset of fields on an existing form response. */
export const update = mutation({
    args: {
        id: v.id("formResponses"),
        scouterName: v.optional(v.string()),
        team: v.optional(v.string()),
        auto: v.optional(v.array(compressedLineValidator)),
        weight: v.optional(v.string()),
        dimensions: v.optional(v.string()),
        intaking: v.optional(v.array(v.string())),
        travelLocation: v.optional(v.array(v.string())),
        capacity: v.optional(v.string()),
        passing: v.optional(v.union(v.literal(1), v.literal(0), v.null())),
        driverExperience: v.optional(v.string()),
        shooterType: v.optional(v.string()),
        intakeType: v.optional(v.string()),
        automation: v.optional(v.array(v.string())),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...fields } = args;
        await ctx.db.patch(id, fields);
    },
});

/** Delete a form response by its document ID. */
export const remove = mutation({
    args: { id: v.id("formResponses") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
