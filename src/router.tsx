import { createBrowserRouter } from "react-router-dom";
import Form from "./pages/Form";
import Submissions from "./pages/Submissions";
import EditSubmission from "./pages/EditSubmission";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Form />,
    },
    {
        path: "/submissions",
        element: <Submissions />,
    },
    {
        path: "/submissions/:id",
        element: <EditSubmission />,
    },
]);
