import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";
import { PitScoutingFormFields } from "../components/PitScoutingFormFields";
import { compressPayload, decompressPayload } from "../utils/compress";
import type { FormState } from "../types/formState";

// ---------------------------------------------------------------------------
// Route wrapper — handles loading / not-found states before rendering the form
// ---------------------------------------------------------------------------

function EditSubmission() {
    const { id } = useParams<{ id: string }>();
    const doc = useQuery(
        api.formResponse.getById,
        id ? { id: id as Id<"formResponses"> } : "skip"
    );

    if (doc === undefined) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (doc === null) {
        return (
            <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
                <Typography variant="h5">Submission not found.</Typography>
                <Button
                    sx={{ mt: 2 }}
                    variant="outlined"
                    onClick={() => history.back()}
                >
                    Go back
                </Button>
            </Box>
        );
    }

    return <EditSubmissionForm doc={doc} />;
}

// ---------------------------------------------------------------------------
// Inner form — only mounted after doc is confirmed to exist, so useState can
// safely initialise from the decoded document on first render.
// ---------------------------------------------------------------------------

function EditSubmissionForm({ doc }: { doc: Doc<"formResponses"> }) {
    const navigate = useNavigate();
    const [form, setForm] = useState<FormState>(() => decompressPayload(doc));
    const updateResponse = useMutation(api.formResponse.update);

    const handleChange = useCallback(
        (updates: Partial<FormState>) =>
            setForm((prev) => ({ ...prev, ...updates })),
        []
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateResponse({ id: doc._id, ...compressPayload(form) });
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
                <Typography variant="h4">Edit Submission</Typography>
                <Button
                    variant="outlined"
                    onClick={() => navigate("/submissions")}
                >
                    Back
                </Button>
            </Box>

            <PitScoutingFormFields value={form} onChange={handleChange} />

            <Button type="submit" variant="contained" size="large">
                Save Changes
            </Button>
        </Box>
    );
}

export default EditSubmission;
