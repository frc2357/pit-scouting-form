import { useCallback } from "react";
import { CustomFormQuestion } from "../CustomFormQuestion";
import { FieldDrawing } from "../FieldDrawing";
import type { FormState } from "../types/formState";

// Static arrays defined outside the component so their references are stable
// and React.memo() on CustomFormQuestion actually works.
const SCOUTER_NAME_OPTIONS = ["Elliott", "Tyson", "Landon"];
const FUEL_INTAKING_OPTIONS = ["Floor", "Outpost", "Depot"];
const CYCLE_TRAVEL_OPTIONS = ["Bump", "Trench"];
const SHOOTER_TYPE_OPTIONS = [
    "Single Fixed",
    "Double Fixed",
    "Drum Shooter",
    "Single Hooded Turret",
    "Double Hooded Turret",
];
const INTAKE_TYPE_OPTIONS = [
    "Full width over the bumper",
    "Less than full width over the bumper",
    "Through the bumper",
];
const ROBOT_AUTOMATION_OPTIONS = [
    "Auto Shoot/Aim",
    "Auto Pass",
    "Auto Intake",
    "Auto Trench/Bump",
];

interface PitScoutingFormFieldsProps {
    value: FormState;
    onChange: (updates: Partial<FormState>) => void;
}

export function PitScoutingFormFields({
    value,
    onChange,
}: PitScoutingFormFieldsProps) {
    const handleScouterNameChange = useCallback(
        (v: string) => onChange({ scouterName: v }),
        [onChange]
    );
    const handleTeamNumberChange = useCallback(
        (v: string) => onChange({ teamNumber: v }),
        [onChange]
    );
    const handleRobotWeightChange = useCallback(
        (v: string) => onChange({ robotWeight: v }),
        [onChange]
    );
    const handleRobotDimensionsChange = useCallback(
        (v: string) => onChange({ robotDimensions: v }),
        [onChange]
    );
    const handleFuelIntakingChange = useCallback(
        (v: string[]) => onChange({ fuelIntaking: v }),
        [onChange]
    );
    const handleCycleTravelLocationChange = useCallback(
        (v: string[]) => onChange({ cycleTravelLocation: v }),
        [onChange]
    );
    const handleEstimatedMaxFuelCapacityChange = useCallback(
        (v: string) => onChange({ estimatedMaxFuelCapacity: v }),
        [onChange]
    );
    const handlePassingFeedingChange = useCallback(
        (v: string) => onChange({ passingFeeding: v }),
        [onChange]
    );
    const handleDriverExperienceChange = useCallback(
        (v: string) => onChange({ driverExperience: v }),
        [onChange]
    );
    const handleShooterTypeChange = useCallback(
        (v: string) => onChange({ shooterType: v }),
        [onChange]
    );
    const handleIntakeTypeChange = useCallback(
        (v: string) => onChange({ intakeType: v }),
        [onChange]
    );
    const handleRobotAutomationChange = useCallback(
        (v: string[]) => onChange({ robotAutomation: v }),
        [onChange]
    );
    const handleNotesChange = useCallback(
        (v: string) => onChange({ notes: v }),
        [onChange]
    );
    const handleFieldDrawingChange = useCallback(
        (v: FormState["fieldDrawing"]) => onChange({ fieldDrawing: v }),
        [onChange]
    );

    return (
        <>
            <CustomFormQuestion
                prompt="Scouter Name"
                type="single-select"
                options={SCOUTER_NAME_OPTIONS}
                other
                value={value.scouterName}
                onChange={handleScouterNameChange}
            />

            <CustomFormQuestion
                prompt="Team Number"
                type="integer"
                value={value.teamNumber}
                onChange={handleTeamNumberChange}
            />

            <CustomFormQuestion
                prompt="Robot Weight"
                subtitle="Without bumpers and battery"
                type="double"
                value={value.robotWeight}
                onChange={handleRobotWeightChange}
            />

            <CustomFormQuestion
                prompt="Robot Dimensions"
                subtitle="Without bumpers"
                type="short-text"
                value={value.robotDimensions}
                onChange={handleRobotDimensionsChange}
            />

            <CustomFormQuestion
                prompt="Fuel Intaking"
                subtitle="Outpost = HP station, Depot = Floor bump"
                type="multi-select"
                options={FUEL_INTAKING_OPTIONS}
                value={value.fuelIntaking}
                onChange={handleFuelIntakingChange}
            />

            <CustomFormQuestion
                prompt="Cycle Travel Location"
                type="multi-select"
                options={CYCLE_TRAVEL_OPTIONS}
                value={value.cycleTravelLocation}
                onChange={handleCycleTravelLocationChange}
            />

            <CustomFormQuestion
                prompt="Estimated Maximum Fuel Capacity"
                type="integer"
                value={value.estimatedMaxFuelCapacity}
                onChange={handleEstimatedMaxFuelCapacityChange}
            />

            <CustomFormQuestion
                prompt="Passing/Feeding"
                subtitle="Not herding/bulldozing"
                type="yes-no"
                value={value.passingFeeding}
                onChange={handlePassingFeedingChange}
            />

            <CustomFormQuestion
                prompt="Driver Experience"
                subtitle="Years as Driver or CoDriver"
                type="double"
                value={value.driverExperience}
                onChange={handleDriverExperienceChange}
            />

            <CustomFormQuestion
                prompt="Shooter Type"
                type="single-select"
                options={SHOOTER_TYPE_OPTIONS}
                other
                value={value.shooterType}
                onChange={handleShooterTypeChange}
            />

            <CustomFormQuestion
                prompt="Intake Type"
                type="single-select"
                options={INTAKE_TYPE_OPTIONS}
                other
                value={value.intakeType}
                onChange={handleIntakeTypeChange}
            />

            <CustomFormQuestion
                prompt="Robot Automation"
                type="multi-select"
                options={ROBOT_AUTOMATION_OPTIONS}
                other
                value={value.robotAutomation}
                onChange={handleRobotAutomationChange}
            />

            <CustomFormQuestion
                prompt="Notes"
                type="long-text"
                value={value.notes}
                onChange={handleNotesChange}
            />

            <FieldDrawing
                value={value.fieldDrawing}
                onChange={handleFieldDrawingChange}
            />
        </>
    );
}
