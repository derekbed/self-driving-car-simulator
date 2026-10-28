
class Car{
    constructor(x, y, width, height, controlType, maxSpeed = 3){
        this.x = x; // horizontal position of the car
        this.y = y; // vertical position of the car
        this.width = width; // width of the car
        this.height = height; // height of the car
        this.speed = 0; // car starts at rest
        this.acceleration = 0.06; // how quickly the car speeds up
        this.maxSpeed = maxSpeed; // maximum forward speed
        this.friction = 0.03; // gradually slows the car down
        this.angle = 0; // direction the car is facing
        this.damaged = false; // tracks whether the car has crashed
        this.useBrain = controlType == "AI"; // determines whether the neural network controls the car

        if(controlType != "DUMMY"){
            this.sensors = new Sensors(this); // creates sensors attached to car
            this.brain = new NeuralNetwork([this.sensors.rayCount, 6, 4]); // creates a neural network w sensor inputs, 6 hidden neurons, and 4 outputs
        }

        this.controls = new Controls(controlType); // sets up ai, keyboard, or automatic controls
    }

    update(roadBorders, traffic){ // updates the car's position, collisions, and sensor readings
        if(!this.damaged){ // only moves the car if it hasn't crashed
            this.#move(); // updates speed, steering, and position
            this.polygon = this.#createPolygon(); // calculates the car's rotated corners
            this.damaged = this.#assessDamage(roadBorders, traffic); // checks whether the car collided with anything
        }

        if(this.sensors){ // only runs if the car has sensors
            this.sensors.update(roadBorders, traffic); // updates sensor rays and obstacle distances
            const offsets = this.sensors.readings.map(s => s == null ? 0 : 1 - s.offsets); // converts sensor readings into inputs between 0 and 1
            const outputs = NeuralNetwork.feedForward(offsets, this.brain); // passes sensor inputs through the neural network

            if(this.useBrain){ // AI cars use the network outputs to control movement
                this.controls.forward = outputs[0]; // first output controls acceleration
                this.controls.left = outputs[1]; // second output controls left steering
                this.controls.right = outputs[2]; // third output controls right steering
                this.controls.reverse = outputs[3]; // fourth output controls reversing
            }
        }
    }

    #assessDamage(roadBorders, traffic){ // checks whether the car has collided with the road or traffic
        for(let i = 0; i < roadBorders.length; i++){ // checks each road boundary
            if(polyIntersect(this.polygon, roadBorders[i])){ // checks if the car intersects the boundary
                return true; // marks the car as damaged if a collision occurs
            }
        }

        for(let i = 0; i < traffic.length; i++){ // checks each traffic car
            if(polyIntersect(this.polygon, traffic[i].polygon)){ // checks if the two car polygons intersect
                return true; // collision detected
            }
        }

        return false; // no collisions detected
    }

    #createPolygon(){ // calculates the four corners of the car based on its position and rotation
        const points = []; // stores the four corner coordinates
        const radius = Math.hypot(this.width, this.height) / 2; // distance from the car's center to a corner
        const alpha = Math.atan2(this.width, this.height); // angle between the car's forward direction and its diagonal

        points.push(
            {x: this.x - Math.sin(this.angle - alpha) * radius,
            y: this.y - Math.cos(this.angle - alpha) * radius}); // first corner

        points.push(
            {x: this.x - Math.sin(this.angle + alpha) * radius,
            y: this.y - Math.cos(this.angle + alpha) * radius}); // second corner

        points.push(
            {x: this.x - Math.sin(Math.PI + this.angle - alpha) * radius,
            y: this.y - Math.cos(Math.PI + this.angle - alpha) * radius}); // third corner

        points.push(
            {x: this.x - Math.sin(Math.PI + this.angle + alpha) * radius,
            y: this.y - Math.cos(Math.PI + this.angle + alpha) * radius}); // fourth corner

        return points; // returns the car's four corners for drawing and collision detection
    }

    #move(){ // updates the car's speed, direction, and position
        if(this.controls.forward){ // accelerates when moving forward
            this.speed += this.acceleration;
        }

        if(this.controls.reverse){ // decreases speed when reversing
            this.speed -= this.acceleration;
        }

        if(this.speed != 0){ // only allows steering when the car is moving
            const flip = this.speed > 0 ? 1 : -1; // reverses steering direction when driving backward

            if(this.controls.left){
                this.angle += 0.03 * flip; // turns the car left
            }

            if(this.controls.right){
                this.angle -= 0.03 * flip; // turns the car right
            }
        }

        if(this.speed > this.maxSpeed){ // prevents exceeding maximum forward speed
            this.speed = this.maxSpeed;
        }

        if(this.speed < -this.maxSpeed / 2){ // limits reverse speed to half the forward maximum
            this.speed = -this.maxSpeed / 2;
        }

        if(this.speed > 0){ // friction slows forward movement
            this.speed -= this.friction;
        }

        if(this.speed < 0){ // friction slows backward movement
            this.speed += this.friction;
        }

        if(Math.abs(this.speed) < this.friction){ // stops the car completely when its speed is very small
            this.speed = 0;
        }

        this.x -= Math.sin(this.angle) * this.speed; // updates horizontal position based on direction and speed
        this.y -= Math.cos(this.angle) * this.speed; // updates vertical position (negative y means forward)
    }

    draw(ctx, color, drawSensors = false){ // draws the car and optionally its sensor rays
        if(this.damaged){
            ctx.fillStyle = "gray"; // crashed cars appear gray
        }
        else{
            ctx.fillStyle = color; // otherwise uses the specified car color
        }

        ctx.beginPath(); // starts drawing the car's polygon
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y); // moves to the first corner

        for(let i = 1; i < this.polygon.length; i++){
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y); // connects the remaining corners
        }

        ctx.fill(); // fills the car's polygon with its color

        if(this.sensors && drawSensors){ // only draws sensor rays when requested
            this.sensors.draw(ctx);
        }

        /* // old drawing method using a rotated rectangle instead of a polygon
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(-this.angle);
        ctx.beginPath();
        ctx.rect(
            -(this.width)/2,
            -(this.height)/2,
            this.width,
            this.height
        );

        ctx.fill();

        ctx.restore();
        */
    }
}
