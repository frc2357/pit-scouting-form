import type { DrawnLine } from "../FieldDrawing";

export interface FormState {
    scouterName: string;
    teamNumber: string;
    fieldDrawing: DrawnLine[];
    robotWeight: string;
    robotDimensions: string;
    fuelIntaking: string[];
    cycleTravelLocation: string[];
    estimatedMaxFuelCapacity: string;
    passingFeeding: string;
    driverExperience: string;
    shooterType: string;
    intakeType: string;
    robotAutomation: string[];
    notes: string;
}

export const initialFormState: FormState = {
    scouterName: "",
    teamNumber: "",
    fieldDrawing: [],
    robotWeight: "",
    robotDimensions: "",
    fuelIntaking: [],
    cycleTravelLocation: [],
    estimatedMaxFuelCapacity: "",
    passingFeeding: "",
    driverExperience: "",
    shooterType: "",
    intakeType: "",
    robotAutomation: [],
    notes: "",
};
