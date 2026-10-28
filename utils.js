
function lerp(A, B, t){ // calculates a point between A and B based on t (0 = A, 1 = B)
    return A + (B - A) * t; // moves a fraction t of the distance from A to B
}

function getIntersection(A, B, C, D){ // checks if line segments AB and CD intersect
    const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x); // calculates the numerator for the intersection position on AB
    const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y); // calculates the numerator for the intersection position on CD
    const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y); // calculates the shared denominator

    if(bottom != 0){ // makes sure the lines aren't parallel
        const t = tTop / bottom; // calculates where the intersection falls along AB
        const u = uTop / bottom; // calculates where the intersection falls along CD

        if(t >= 0 && t <= 1 && u >= 0 && u <= 1){ // checks if the intersection lies within both line segments
            return {
                x: lerp(A.x, B.x, t), // calculates the intersection's x coordinate
                y: lerp(A.y, B.y, t), // calculates the intersection's y coordinate
                offsets: t // stores how far along AB the intersection occurs (0 to 1)
            };
        }
    }

    return null; // returns null if the segments don't intersect
}

function polyIntersect(poly1, poly2){ // checks if the edges of two polygons intersect
    for(let i = 0; i < poly1.length; i++){ // loops through each edge of the first polygon
        for(let j = 0; j < poly2.length; j++){ // compares it against each edge of the second polygon
            const touch = getIntersection(
                poly1[i], poly1[(i + 1) % poly1.length], // gets current edge of the first polygon
                poly2[j], poly2[(j + 1) % poly2.length] // gets current edge of the second polygon
            );

            if(touch){
                return true; // returns true if any two edges intersect
            }
        }
    }

    return false; // returns false if no edges intersect
}
