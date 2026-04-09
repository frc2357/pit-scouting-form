import {
    Box,
    Button,
    CircularProgress,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Typography,
} from "@mui/material";
import { useQuery } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";

function Submissions() {
    const submissions = useQuery(api.formResponse.getAll);
    const navigate = useNavigate();

    const isEmpty = (submissions?.length ?? 0) === 0;
    const isLoading = submissions === undefined;

    return (
        <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                }}
            >
                <Typography variant="h4">Submissions</Typography>
                <Button variant="contained" onClick={() => navigate("/")}>
                    New Submission
                </Button>
            </Box>

            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                    <CircularProgress />
                </Box>
            ) : isEmpty ? (
                <Typography color="text.secondary">
                    No submissions yet.
                </Typography>
            ) : (
                <List disablePadding>
                    {submissions!.map((sub) => (
                        <ListItem key={sub._id} disablePadding divider>
                            <ListItemButton
                                onClick={() =>
                                    navigate(`/submissions/${sub._id}`)
                                }
                            >
                                <ListItemText
                                    primary={`Team ${sub.team}`}
                                    secondary={`Scouted by ${sub.scouterName} · ${new Date(sub._creationTime).toLocaleString()}`}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );
}

export default Submissions;
