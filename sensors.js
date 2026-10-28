
class Sensors{
    constructor(car){
        this.car = car; // stores a reference to the car these sensors belong to
        this.rayCount = 5; // number of sensor rays
        this.rayLength = 100; // max distance each ray can detect
        this.raySpread = Math.PI * 0.5; // total angle covered by the rays

        this.rays = []; // stores the start and end points of each ray
        this.readings = []; // stores the closest obstacle detected by each ray
    }

    update(roadBorders, traffic){ // updates the rays and checks for obstacles
        this.#castRays(); // recalculates the rays based on the car's current position and angle
        this.readings = []; // clears the previous sensor readings

        for(let i = 0; i < this.rays.length; i++){ // checks every sensor ray
            this.readings.push(
                this.#getReading(this.rays[i], roadBorders, traffic) // finds the closest intersection for this ray
            );
        }
    }

    #getReading(ray, roadBorders, traffic){ // finds the closest obstacle intersecting a sensor ray
        let touches = []; // stores all intersections detected along the ray

        for(let i = 0; i < roadBorders.length; i++){ // checks the ray against each road boundary
            const touch = getIntersection(
                ray[0], ray[1], roadBorders[i][0], roadBorders[i][1]
            ); // calculates where the ray intersects the road border

            if(touch){
                touches.push(touch); // saves the intersection if one exists
            }
        }

        for(let i = 0; i < traffic.length; i++){ // checks every traffic car
            const poly = traffic[i].polygon; // gets the traffic car's four corners

            for(let j = 0; j < poly.length; j++){ // checks every edge of the traffic car
                const value = getIntersection(
                    ray[0], ray[1], poly[j], poly[(j + 1) % poly.length]
                ); // checks whether the sensor ray intersects this edge

                if(value){
                    touches.push(value); // saves the intersection if one exists
                }
            }
        }

        if(touches.length == 0){ // checks if the ray detected nothing
            return null; // no obstacle within the rays range
        }
        else{
            const offsets = touches.map(e => e.offsets); // gets the distance ratio for each intersection
            const minOffset = Math.min(...offsets); // finds the smallst ratio (closest obstacle)
            return touches.find(e => e.offsets == minOffset); // returns the closest intersection
        }
    }

    #castRays(){ // creates sensor rays pointing in different directions
        this.rays = []; // clears the previous rays

        for(let i = 0; i < this.rayCount; i++){ // creates therays
            const rayAngle = lerp(
                this.raySpread / 2, // starting angle on one side
                -this.raySpread / 2, // ending angle on the other side
                this.rayCount == 1 ? 0.5 : i / (this.rayCount - 1) // evenly spaces the rays across the angle
            ) + this.car.angle; // rotates the rays with the car

            const start = {x: this.car.x, y: this.car.y}; // each ray starts at the car's center

            const end = {
                x: this.car.x - Math.sin(rayAngle) * this.rayLength, // calculates the rays endpoint x coordinate
                y: this.car.y - Math.cos(rayAngle) * this.rayLength // '' y coordinate
            };

            this.rays.push([start, end]); // rays starting and ending coordinates
        }
    }

    draw(ctx){ // draws the sensor rays on the canvas
        for(let i = 0; i < this.rayCount; i++){ // loops through each sensor ray
            let end = this.rays[i][1]; // assumes the ray reaches its full length

            if(this.readings[i]){
                end = this.readings[i]; // shortens the visible ray to the closest detected obstacle
            }

            ctx.beginPath(); // starts drawing the visible part of the ray
            ctx.lineWidth = 2; // sets line thickness
            ctx.strokeStyle = "yellow"; // yellow represents the unobstructed part of the ray
            ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y); // starts at the car
            ctx.lineTo(end.x, end.y); // draws to the obstacle or full ray endpoint
            ctx.stroke(); // renders the yellow line

            ctx.beginPath(); // starts drawing the remaining part of the ray
            ctx.lineWidth = 2;
            ctx.strokeStyle = "black"; // black represents the portion beyond detected obstacle
            ctx.moveTo(this.rays[i][1].x, this.rays[i][1].y); // starts at the full ray endpoint
            ctx.lineTo(end.x, end.y); // connects back to detected obstacle
            ctx.stroke(); // renders black line
        }
    }
}
