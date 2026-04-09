import {
    Box,
    IconButton,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import AutoFixNormalIcon from "@mui/icons-material/AutoFixNormal";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import {
    memo,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import fieldImage from "./assets/field.png";
import { rdp } from "./utils/simplify";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Point = { x: number; y: number };

export type DrawnLine = {
    points: Point[];
    color: string;
    size: number;
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FieldDrawingProps {
    value: DrawnLine[];
    onChange: (lines: DrawnLine[]) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type Tool = "pen" | "eraser";

const PEN_COLORS = [
    "#ffffff", // white
    "#000000", // black
    "#f44336", // red
    "#2196f3", // blue
    "#4caf50", // green
    "#ffeb3b", // yellow
    "#ff69b4", // pink
];

const CATMULL_ROM_TENSION = 1 / 30;
const RDP_EPSILON = 4;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function drawLines(
    ctx: CanvasRenderingContext2D,
    lines: DrawnLine[],
    width: number,
    height: number
) {
    ctx.clearRect(0, 0, width, height);
    for (const line of lines) {
        const pts = line.points;
        if (pts.length < 2) continue;
        ctx.beginPath();
        ctx.strokeStyle = line.color;
        ctx.lineWidth = line.size;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.moveTo(pts[0].x, pts[0].y);
        if (pts.length === 2) {
            ctx.lineTo(pts[1].x, pts[1].y);
        } else {
            // Catmull-Rom → cubic Bézier for smooth curves through the points
            for (let i = 0; i < pts.length - 1; i++) {
                const p0 = pts[Math.max(i - 1, 0)];
                const p1 = pts[i];
                const p2 = pts[i + 1];
                const p3 = pts[Math.min(i + 2, pts.length - 1)];
                const cp1x = p1.x + (p2.x - p0.x) * CATMULL_ROM_TENSION;
                const cp1y = p1.y + (p2.y - p0.y) * CATMULL_ROM_TENSION;
                const cp2x = p2.x - (p3.x - p1.x) * CATMULL_ROM_TENSION;
                const cp2y = p2.y - (p3.y - p1.y) * CATMULL_ROM_TENSION;
                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
            }
        }
        ctx.stroke();
    }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const FieldDrawing = memo(function FieldDrawing({
    value,
    onChange,
}: FieldDrawingProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const isDrawingRef = useRef(false);
    const currentLineRef = useRef<Point[]>([]);

    // Eraser stroke tracking
    const preEraseRef = useRef<DrawnLine[]>([]);
    const eraseLiveRef = useRef<DrawnLine[]>([]);

    // Stroke function refs — updated each render via useLayoutEffect so touch
    // listeners always have fresh closures without needing to re-attach.
    const startStrokeFn = useRef<(pt: Point) => void>(() => {});
    const continueStrokeFn = useRef<(pt: Point) => void>(() => {});
    const finishStrokeFn = useRef<() => void>(() => {});

    // History — managed via refs to avoid stale closures
    const historyStack = useRef<DrawnLine[][]>([[]]);
    const historyIdx = useRef(0);
    const [historyState, setHistoryState] = useState({
        canUndo: false,
        canRedo: false,
    });

    const [tool, setTool] = useState<Tool>("pen");
    const [penColor, setPenColor] = useState(PEN_COLORS[0]);
    const penSize = 20;
    const eraserSize = 20;
    const [canvasSize, setCanvasSize] = useState({ width: 1000, height: 500 });

    // ------------------------------------------------------------------
    // History helpers
    // ------------------------------------------------------------------

    /** Push a new state onto the history stack and notify the parent. */
    const commitHistory = useCallback(
        (newLines: DrawnLine[]) => {
            historyStack.current = historyStack.current.slice(
                0,
                historyIdx.current + 1
            );
            historyStack.current.push(newLines);
            historyIdx.current = historyStack.current.length - 1;
            setHistoryState({ canUndo: true, canRedo: false });
            onChange(newLines);
        },
        [onChange]
    );

    /**
     * Record a state that is already reflected in `value` (e.g. live erasing)
     * as a single undoable history entry without calling onChange again.
     */
    const commitHistorySilent = useCallback((finalLines: DrawnLine[]) => {
        historyStack.current = historyStack.current.slice(
            0,
            historyIdx.current + 1
        );
        historyStack.current.push(finalLines);
        historyIdx.current = historyStack.current.length - 1;
        setHistoryState({ canUndo: true, canRedo: false });
    }, []);

    const handleUndo = useCallback(() => {
        if (historyIdx.current <= 0) return;
        historyIdx.current--;
        const lines = historyStack.current[historyIdx.current];
        setHistoryState({
            canUndo: historyIdx.current > 0,
            canRedo: true,
        });
        onChange(lines);
    }, [onChange]);

    const handleRedo = useCallback(() => {
        if (historyIdx.current >= historyStack.current.length - 1) return;
        historyIdx.current++;
        const lines = historyStack.current[historyIdx.current];
        setHistoryState({
            canUndo: true,
            canRedo: historyIdx.current < historyStack.current.length - 1,
        });
        onChange(lines);
    }, [onChange]);

    // Keyboard shortcuts
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const mod = e.ctrlKey || e.metaKey;
            if (mod && !e.shiftKey && e.key === "z") {
                e.preventDefault();
                handleUndo();
            }
            if (mod && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
                e.preventDefault();
                handleRedo();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [handleUndo, handleRedo]);

    // Set canvas intrinsic size from the image's natural dimensions
    const handleImageLoad = () => {
        const img = imgRef.current;
        if (!img) return;
        setCanvasSize({
            width: img.naturalWidth,
            height: img.naturalHeight,
        });
    };

    // Redraw all committed lines whenever `value` changes
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        drawLines(ctx, value, canvas.width, canvas.height);
    }, [value, canvasSize]);

    /** Convert raw client coordinates to canvas-space. Works for mouse and touch. */
    const getPointFromClient = useCallback(
        (clientX: number, clientY: number): Point => {
            const canvas = canvasRef.current!;
            const rect = canvas.getBoundingClientRect();
            return {
                x: (clientX - rect.left) * (canvas.width / rect.width),
                y: (clientY - rect.top) * (canvas.height / rect.height),
            };
        },
        []
    );

    // Keep stroke fn refs fresh after every render so touch listeners never
    // capture stale state without needing to re-attach.
    useLayoutEffect(() => {
        startStrokeFn.current = (pt: Point) => {
            isDrawingRef.current = true;
            if (tool === "pen") {
                currentLineRef.current = [pt];
            } else {
                preEraseRef.current = value;
                eraseLiveRef.current = value;
            }
        };

        continueStrokeFn.current = (pt: Point) => {
            if (!isDrawingRef.current) return;
            if (tool === "pen") {
                currentLineRef.current.push(pt);
                const pts = currentLineRef.current;
                if (pts.length >= 2) {
                    const canvas = canvasRef.current!;
                    const ctx = canvas.getContext("2d")!;
                    ctx.beginPath();
                    ctx.strokeStyle = penColor;
                    ctx.lineWidth = penSize;
                    ctx.lineCap = "round";
                    ctx.lineJoin = "round";
                    ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
                    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
                    ctx.stroke();
                }
            } else {
                const radius = eraserSize / 2;
                const filtered = eraseLiveRef.current.filter(
                    (line) =>
                        !line.points.some(
                            (p) => Math.hypot(p.x - pt.x, p.y - pt.y) < radius
                        )
                );
                if (filtered.length !== eraseLiveRef.current.length) {
                    eraseLiveRef.current = filtered;
                    onChange(filtered);
                }
            }
        };

        finishStrokeFn.current = () => {
            if (!isDrawingRef.current) return;
            isDrawingRef.current = false;
            if (tool === "pen") {
                if (currentLineRef.current.length >= 2) {
                    const simplified = rdp(currentLineRef.current, RDP_EPSILON);
                    commitHistory([
                        ...value,
                        {
                            points: simplified,
                            color: penColor,
                            size: penSize,
                        },
                    ]);
                }
                currentLineRef.current = [];
            } else {
                if (eraseLiveRef.current !== preEraseRef.current) {
                    commitHistorySilent(eraseLiveRef.current);
                }
            }
        };
    });

    // Mouse handlers — thin wrappers over the stroke fn refs
    const handleMouseDown = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            startStrokeFn.current(getPointFromClient(e.clientX, e.clientY));
        },
        [getPointFromClient]
    );

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            continueStrokeFn.current(getPointFromClient(e.clientX, e.clientY));
        },
        [getPointFromClient]
    );

    const handleMouseUp = useCallback(() => {
        finishStrokeFn.current();
    }, []);

    const handleClear = () => commitHistory([]);

    // Touch event listeners attached imperatively with { passive: false } so
    // preventDefault() can block page scrolling while drawing.
    // They call through refs so they never go stale without re-attaching.
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const onTouchStart = (e: TouchEvent) => {
            e.preventDefault();
            const touch = e.touches[0];
            if (touch)
                startStrokeFn.current(
                    getPointFromClient(touch.clientX, touch.clientY)
                );
        };
        const onTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            const touch = e.touches[0];
            if (touch)
                continueStrokeFn.current(
                    getPointFromClient(touch.clientX, touch.clientY)
                );
        };
        const onTouchEnd = () => finishStrokeFn.current();

        canvas.addEventListener("touchstart", onTouchStart, { passive: false });
        canvas.addEventListener("touchmove", onTouchMove, { passive: false });
        canvas.addEventListener("touchend", onTouchEnd);
        canvas.addEventListener("touchcancel", onTouchEnd);
        return () => {
            canvas.removeEventListener("touchstart", onTouchStart);
            canvas.removeEventListener("touchmove", onTouchMove);
            canvas.removeEventListener("touchend", onTouchEnd);
            canvas.removeEventListener("touchcancel", onTouchEnd);
        };
    }, [getPointFromClient]); // getPointFromClient is stable (no deps)

    const eraserCursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${eraserSize}' height='${eraserSize}'%3E%3Ccircle cx='${eraserSize / 2}' cy='${eraserSize / 2}' r='${eraserSize / 2 - 1}' fill='none' stroke='%23555' stroke-width='1.5'/%3E%3C/svg%3E") ${eraserSize / 2} ${eraserSize / 2}, crosshair`;

    return (
        <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Field Drawing
            </Typography>

            {/* ── Toolbar ── */}
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                    alignItems: "center",
                    mb: 1.5,
                    p: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                }}
            >
                {/* Tool selector */}
                <ToggleButtonGroup
                    value={tool}
                    exclusive
                    onChange={(_, v) => v && setTool(v as Tool)}
                    size="small"
                >
                    <ToggleButton value="pen">
                        <Tooltip title="Pen">
                            <EditIcon fontSize="small" />
                        </Tooltip>
                    </ToggleButton>
                    <ToggleButton value="eraser">
                        <Tooltip title="Eraser">
                            <AutoFixNormalIcon fontSize="small" />
                        </Tooltip>
                    </ToggleButton>
                </ToggleButtonGroup>

                {/* Color swatches + native picker — pen only */}
                {tool === "pen" && (
                    <Box
                        sx={{
                            display: "flex",
                            gap: 0.75,
                            alignItems: "center",
                        }}
                    >
                        {PEN_COLORS.map((c) => (
                            <Box
                                key={c}
                                onClick={() => setPenColor(c)}
                                sx={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: "50%",
                                    bgcolor: c,
                                    // border:
                                    //     penColor === c
                                    //         ? "2px solid"
                                    //         : "1px solid",
                                    borderColor:
                                        penColor === c
                                            ? "text.primary"
                                            : "divider",
                                    cursor: "pointer",
                                    flexShrink: 0,
                                    boxSizing: "border-box",
                                    outline:
                                        penColor === c ? "2px solid" : "none",
                                    outlineColor: "outline.paper",
                                }}
                            />
                        ))}
                    </Box>
                )}

                {/* Undo / Redo */}
                <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Tooltip title="Undo (Ctrl+Z)">
                        <span>
                            <IconButton
                                onClick={handleUndo}
                                size="small"
                                disabled={!historyState.canUndo}
                            >
                                <UndoIcon fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Redo (Ctrl+Y)">
                        <span>
                            <IconButton
                                onClick={handleRedo}
                                size="small"
                                disabled={!historyState.canRedo}
                            >
                                <RedoIcon fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>

                {/* Clear */}
                <Tooltip title="Clear all">
                    <span>
                        <IconButton
                            onClick={handleClear}
                            size="small"
                            color="error"
                            disabled={value.length === 0}
                        >
                            <DeleteOutlineIcon />
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>

            {/* ── Canvas + Image ── */}
            <Box
                sx={{
                    position: "relative",
                    display: "block",
                    lineHeight: 0,
                    borderRadius: 1,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                    userSelect: "none",
                }}
            >
                <img
                    ref={imgRef}
                    src={fieldImage}
                    alt="FRC Field"
                    onLoad={handleImageLoad}
                    draggable={false}
                    style={{ display: "block", width: "100%" }}
                />
                <canvas
                    ref={canvasRef}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        cursor: tool === "pen" ? "crosshair" : eraserCursor,
                        touchAction: "none",
                    }}
                />
            </Box>
        </Box>
    );
});
