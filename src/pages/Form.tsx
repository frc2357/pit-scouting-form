import { Box, Button, Typography } from "@mui/material";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PitScoutingFormFields } from "../components/PitScoutingFormFields";
import { type FormState, initialFormState } from "../types/formState";
import { compressPayload } from "../utils/compress";

function Form() {
    const [form, setForm] = useState<FormState>(initialFormState);
    const navigate = useNavigate();
    const createResponse = useMutation(api.formResponse.create);

    const handleChange = useCallback(
        (updates: Partial<FormState>) =>
            setForm((prev) => ({ ...prev, ...updates })),
        []
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createResponse(compressPayload(form));
        setForm(initialFormState);
        navigate("/submissions");
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                maxWidth: 600,
                mx: "auto",
                p: 3,
                display: "flex",
                flexDirection: "column",
                gap: 3,
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Typography variant="h4">Pit Scouting Form</Typography>
                <Button
                    variant="outlined"
                    onClick={() => navigate("/submissions")}
                >
                    View Submissions
                </Button>
            </Box>

            <PitScoutingFormFields value={form} onChange={handleChange} />

            <Button type="submit" variant="contained" size="large">
                Submit
            </Button>
        </Box>
    );
}

export default Form;
