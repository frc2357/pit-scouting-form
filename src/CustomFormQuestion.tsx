import {
    Box,
    Checkbox,
    FormControlLabel,
    FormGroup,
    FormLabel,
    Radio,
    RadioGroup,
    TextField,
    Typography,
} from "@mui/material";
import { memo, useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BaseProps = {
    prompt: string;
    subtitle?: string;
};

type SingleSelectProps = BaseProps & {
    type: "single-select";
    options: string[];
    other?: boolean;
    value: string;
    onChange: (value: string) => void;
};

type MultiSelectProps = BaseProps & {
    type: "multi-select";
    options: string[];
    other?: boolean;
    value: string[];
    onChange: (value: string[]) => void;
};

type IntegerProps = BaseProps & {
    type: "integer";
    value: string;
    onChange: (value: string) => void;
};

type DoubleProps = BaseProps & {
    type: "double";
    value: string;
    onChange: (value: string) => void;
};

type YesNoProps = BaseProps & {
    type: "yes-no";
    value: string;
    onChange: (value: string) => void;
};

type LongTextProps = BaseProps & {
    type: "long-text";
    value: string;
    onChange: (value: string) => void;
};

type ShortTextProps = BaseProps & {
    type: "short-text";
    value: string;
    onChange: (value: string) => void;
};

export type CustomFormQuestionProps =
    | SingleSelectProps
    | MultiSelectProps
    | IntegerProps
    | DoubleProps
    | YesNoProps
    | LongTextProps
    | ShortTextProps;

// ---------------------------------------------------------------------------
// Sub-renderers
// ---------------------------------------------------------------------------

function SingleSelectRenderer({
    options,
    other,
    value,
    onChange,
}: SingleSelectProps) {
    const [isOtherActive, setIsOtherActive] = useState(
        () => !!other && value !== "" && !options.includes(value)
    );

    const activateOther = () => {
        if (!isOtherActive) {
            setIsOtherActive(true);
            onChange("");
        }
    };

    return (
        <RadioGroup
            value={isOtherActive ? "__other__" : value}
            onChange={(e) => {
                if (e.target.value === "__other__") {
                    activateOther();
                } else {
                    setIsOtherActive(false);
                    onChange(e.target.value);
                }
            }}
        >
            {options.map((opt) => (
                <FormControlLabel
                    key={opt}
                    value={opt}
                    control={<Radio />}
                    label={opt}
                />
            ))}
            {other && (
                <FormControlLabel
                    value="__other__"
                    control={<Radio />}
                    label={
                        <TextField
                            size="small"
                            value={isOtherActive ? value : ""}
                            onChange={(e) => onChange(e.target.value)}
                            onClick={(e) => {
                                e.stopPropagation();
                                activateOther();
                            }}
                            slotProps={{
                                htmlInput: { placeholder: "Other" },
                            }}
                        />
                    }
                />
            )}
        </RadioGroup>
    );
}

function MultiSelectRenderer({
    options,
    other,
    value,
    onChange,
}: MultiSelectProps) {
    // Any value in the array that isn't a known option is the "other" text
    const otherText = value.find((v) => !options.includes(v)) ?? "";
    const [isOtherChecked, setIsOtherChecked] = useState(
        () => !!other && otherText !== ""
    );

    const handleOptionChange = (opt: string, checked: boolean) => {
        if (checked) {
            onChange([...value, opt]);
        } else {
            onChange(value.filter((v) => v !== opt));
        }
    };

    const handleOtherTextChange = (text: string) => {
        const withoutOther = value.filter((v) => options.includes(v));
        onChange(text !== "" ? [...withoutOther, text] : withoutOther);
    };

    return (
        <FormGroup>
            {options.map((opt) => (
                <FormControlLabel
                    key={opt}
                    label={opt}
                    control={
                        <Checkbox
                            checked={value.includes(opt)}
                            onChange={(e) =>
                                handleOptionChange(opt, e.target.checked)
                            }
                        />
                    }
                />
            ))}
            {other && (
                <FormControlLabel
                    label={
                        <TextField
                            size="small"
                            value={otherText}
                            onChange={(e) => {
                                if (!isOtherChecked) setIsOtherChecked(true);
                                handleOtherTextChange(e.target.value);
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!isOtherChecked) setIsOtherChecked(true);
                            }}
                            slotProps={{
                                htmlInput: { placeholder: "Other" },
                            }}
                        />
                    }
                    control={
                        <Checkbox
                            checked={isOtherChecked}
                            onChange={(e) => {
                                setIsOtherChecked(e.target.checked);
                                if (!e.target.checked)
                                    handleOtherTextChange("");
                            }}
                        />
                    }
                />
            )}
        </FormGroup>
    );
}

function NumberRenderer({
    value,
    onChange,
    step,
}: {
    value: string;
    onChange: (v: string) => void;
    step: number;
}) {
    const [local, setLocal] = useState(value);
    // Sync if the parent changes the value externally (e.g. form reset).
    useEffect(() => {
        setLocal(value);
    }, [value]);
    return (
        <TextField
            fullWidth
            size="small"
            type="number"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            onBlur={() => onChange(local)}
            slotProps={{
                htmlInput: { min: 0, step, placeholder: "Enter your answer" },
            }}
        />
    );
}

function YesNoRenderer({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <RadioGroup
            row
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="No" control={<Radio />} label="No" />
        </RadioGroup>
    );
}

function LongTextRenderer({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const [local, setLocal] = useState(value);
    useEffect(() => {
        setLocal(value);
    }, [value]);
    return (
        <TextField
            fullWidth
            size="small"
            multiline
            minRows={4}
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            onBlur={() => onChange(local)}
            slotProps={{ htmlInput: { placeholder: "Enter your answer" } }}
        />
    );
}

function ShortTextRenderer({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const [local, setLocal] = useState(value);
    useEffect(() => {
        setLocal(value);
    }, [value]);
    return (
        <TextField
            fullWidth
            size="small"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            onBlur={() => onChange(local)}
            slotProps={{ htmlInput: { placeholder: "Enter your answer" } }}
        />
    );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const CustomFormQuestion = memo(function CustomFormQuestion(
    props: CustomFormQuestionProps
) {
    const { prompt, subtitle } = props;

    const renderInput = () => {
        switch (props.type) {
            case "single-select":
                return <SingleSelectRenderer {...props} />;
            case "multi-select":
                return <MultiSelectRenderer {...props} />;
            case "integer":
                return (
                    <NumberRenderer
                        value={props.value}
                        onChange={props.onChange}
                        step={1}
                    />
                );
            case "double":
                return (
                    <NumberRenderer
                        value={props.value}
                        onChange={props.onChange}
                        step={0.1}
                    />
                );
            case "yes-no":
                return (
                    <YesNoRenderer
                        value={props.value}
                        onChange={props.onChange}
                    />
                );
            case "long-text":
                return (
                    <LongTextRenderer
                        value={props.value}
                        onChange={props.onChange}
                    />
                );
            case "short-text":
                return (
                    <ShortTextRenderer
                        value={props.value}
                        onChange={props.onChange}
                    />
                );
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
            <FormLabel sx={{ mb: subtitle ? 0 : 0.5 }}>{prompt}</FormLabel>
            {subtitle && (
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 0.5 }}
                >
                    {subtitle}
                </Typography>
            )}
            {renderInput()}
        </Box>
    );
});
