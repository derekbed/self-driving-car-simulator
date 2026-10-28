
class Road{
    constructor(x, width, laneCount = 3){
        this.x = x; // horizontal position of the road's center
        this.width = width; // total width of the road
        this.laneCount = laneCount; // number of lanes

        this.left = x - width / 2; // calculates the left edge of the road
        this.right = x + width / 2; // calculates the right edge of the road

        const infinity = 1000000;
        this.top = -infinity;
        this.bottom = infinity;

        const topLeft = {x: this.left, y: this.top}; // top-left corner of the road
        const topRight = {x: this.right, y: this.top}; // top-right corner of the road
        const bottomLeft = {x: this.left, y: this.bottom}; // bottom-left corner of the road
        const bottomRight = {x: this.right, y: this.bottom}; // bottom-right corner of the road

        this.borders = [
            [topLeft, bottomLeft], // left road boundary
            [topRight, bottomRight] // right road boundary
        ];
    }

    getLaneCenter(laneIndex){ // calculates the horizontal center of a specific lane
        const laneWidth = this.width / this.laneCount; // divides the road into equal-width lanes
        return this.left + laneWidth / 2 + laneIndex * laneWidth; // returns the center x coordinate of the selected lane
    }

    getLaneCount(){ // returns the total number of lanes
        return this.laneCount;
    }

    draw(ctx){ // draws the road boundaries and lane markings
        ctx.lineWidth = 5; // sets the thickness of the road lines

        for(let i = 1; i <= this.laneCount - 1; i++){ // loops through the lines separating lanes
            const x = lerp(this.left, this.right, i / this.laneCount); // calculates the x position of each lane divider

            if(i > 0 && i < this.laneCount){ // checks if the line is an internal lane divider
                ctx.strokeStyle = "Yellow"; // makes lane dividers yellow
                ctx.setLineDash([20, 20]); // creates dashed lines with 20pixel dashes and gaps
            }
            else{
                ctx.strokeStyle = "White"; // sets the line color to white
                ctx.setLineDash([]); // creates a solid line
            }

            ctx.beginPath(); // starts drawing a new lane divider
            ctx.moveTo(x, this.top); // starts at the top of the road
            ctx.lineTo(x, this.bottom); // draws the line to the bottom of the road
            ctx.stroke(); // renders the lane divider
        }

        ctx.setLineDash([]); // resets the line style to solid

        this.borders.forEach(border =>{ // loops through the left and right road boundaries
            ctx.beginPath(); // starts drawing a road boundary
            ctx.moveTo(border[0].x, border[0].y); // starts at the top endpoint
            ctx.lineTo(border[1].x, border[1].y); // draws to the bottom endpoint
            ctx.strokeStyle = "White"; // makes road boundaries white
            ctx.stroke(); // renders the boundary
        });
    }
}
