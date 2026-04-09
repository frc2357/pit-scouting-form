import type { DrawnLine } from "../FieldDrawing";
import type { FormState } from "../types/formState";

interface CompressedLine {
    points: [number, number][];
    color: string;
    size: number;
}

export interface CompressedPayload {
    scouterName: string;
    team: string;
    auto: CompressedLine[];
    weight: string;
    dimensions: string;
    intaking: string[];
    travelLocation: string[];
    capacity: string;
    passing: 1 | 0 | null;
    driverExperience: string;
    shooterType: string;
    intakeType: string;
    automation: string[];
    notes: string;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Compress a DrawnLine into a CompressedLine.
 * - Flattens {x, y} objects into a single interleaved number array.
 * - Rounds each coordinate to 1 decimal place.
 * - Replaces the color hex string with its palette index.
 */
function compressLine(line: DrawnLine): CompressedLine {
    const points: [number, number][] = line.points.map((pt) => [
        Math.round(pt.x * 10) / 10,
        Math.round(pt.y * 10) / 10,
    ]);
    return {
        points,
        color: line.color,
        size: Math.round(line.size),
    };
}

// ---------------------------------------------------------------------------
// Decompression helpers
// ---------------------------------------------------------------------------

/**
 * The shape of a form response as stored in (and returned from) the database.
 * Matches `CompressedPayload` but uses `number[][]` for line points instead of
 * the tuple `[number, number][]`, reflecting how Convex deserialises the data.
 */
type StoredFormResponse = Omit<CompressedPayload, "auto"> & {
    auto: { points: number[][]; color: string; size: number }[];
};

function decompressLine(line: {
    points: number[][];
    color: string;
    size: number;
}): DrawnLine {
    return {
        points: line.points.map((pt) => ({ x: pt[0], y: pt[1] })),
        color: line.color,
        size: line.size,
    };
}

/**
 * Reconstructs a `FormState` from a stored `CompressedPayload` (or a Convex
 * document), reversing the transformations applied by `compressPayload`.
 */
export function decompressPayload(payload: StoredFormResponse): FormState {
    return {
        scouterName: payload.scouterName,
        teamNumber: payload.team,
        fieldDrawing: payload.auto.map(decompressLine),
        robotWeight: payload.weight,
        robotDimensions: payload.dimensions,
        fuelIntaking: payload.intaking,
        cycleTravelLocation: payload.travelLocation,
        estimatedMaxFuelCapacity: payload.capacity,
        passingFeeding:
            payload.passing === 1 ? "Yes" : payload.passing === 0 ? "No" : "",
        driverExperience: payload.driverExperience,
        shooterType: payload.shooterType,
        intakeType: payload.intakeType,
        robotAutomation: payload.automation,
        notes: payload.notes,
    };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Converts a `FormState` into a `CompressedPayload` ready for Convex.
 *
 * - Renames/abbreviates fields to match the database schema.
 * - Flattens `fieldDrawing` points to `[x, y]` arrays and rounds to 1 decimal.
 * - Converts `passingFeeding` to `1 | 0 | null`.
 */
export function compressPayload(form: FormState): CompressedPayload {
    return {
        scouterName: form.scouterName,
        team: form.teamNumber,
        auto: form.fieldDrawing.map(compressLine),
        weight: form.robotWeight,
        dimensions: form.robotDimensions,
        intaking: form.fuelIntaking,
        travelLocation: form.cycleTravelLocation,
        capacity: form.estimatedMaxFuelCapacity,
        passing:
            form.passingFeeding === "Yes"
                ? 1
                : form.passingFeeding === "No"
                  ? 0
                  : null,
        driverExperience: form.driverExperience,
        shooterType: form.shooterType,
        intakeType: form.intakeType,
        automation: form.robotAutomation,
        notes: form.notes,
    };
}
