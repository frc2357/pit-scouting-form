import type { Point } from "../FieldDrawing";

function perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point) {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag === 0)
        return Math.sqrt(
            (point.x - lineStart.x) ** 2 + (point.y - lineStart.y) ** 2
        );
    return (
        Math.abs(dx * (lineStart.y - point.y) - dy * (lineStart.x - point.x)) /
        mag
    );
}

/** Ramer-Douglas-Peucker polyline simplification. */
export function rdp(points: Point[], epsilon: number): Point[] {
    if (points.length < 3) return points;

    let maxDist = 0;
    let maxIndex = 0;

    for (let i = 1; i < points.length - 1; i++) {
        const dist = perpendicularDistance(
            points[i],
            points[0],
            points[points.length - 1]
        );
        if (dist > maxDist) {
            maxDist = dist;
            maxIndex = i;
        }
    }

    if (maxDist > epsilon) {
        const left = rdp(points.slice(0, maxIndex + 1), epsilon);
        const right = rdp(points.slice(maxIndex), epsilon);
        return [...left.slice(0, -1), ...right];
    }

    return [points[0], points[points.length - 1]];
}
