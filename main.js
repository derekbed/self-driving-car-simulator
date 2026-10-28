const carCanvas = document.getElementById("carCanvas"); // gets the car canvas from the HTML
//canvas.height = window.innerHeight;
carCanvas.width = 200; // sets the car canvas width to 200 pixels

const networkCanvas = document.getElementById("networkCanvas"); // gets the neural network canvas from the HTML
networkCanvas.width = 300; // sets the network canvas width to 300 pixels

const carCtx = carCanvas.getContext("2d"); // gets the tools needed to draw on the car canvas
const networkCtx = networkCanvas.getContext("2d"); // gets the tools needed to draw on the network canvas

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9); // creates a road centered on the canvas, using 90% of its width

const car = new Car(road.getLaneCenter(1), 100, 30, 50, "AI", 6); // creates an AI car in the middle lane (currently unused)

const N = 1000; // number of AI cars in each generation
const cars = generateCars(N); // creates the AI cars
let bestCar = cars[0]; // initially selects the first car as the best car

if(localStorage.getItem("bestBrain")){ // checks if a previously saved neural network exists
    for(let i = 0; i < cars.length; i++){ // loops through every AI car
        cars[i].brain = JSON.parse(localStorage.getItem("bestBrain")); // gives each car its own copy of the saved brain
        if(i != 0){ // keeps the first car's brain unchanged
            NeuralNetwork.mutate(cars[i].brain, 0.1); // slightly randomizes the other brains to explore new behaviors
        }
    }
}

const traffic = []; // stores all the traffic cars

function addTraffic(lanes, y, speed = 2){ // adds traffic cars in the specified lanes and y position
    for(const lane of lanes){ // loops through each lane in the array
        traffic.push(
            new Car(road.getLaneCenter(lane), y, 30, 50, "DUMMY", speed) // creates a traffic car that drives forward automatically
        );
    }
}

generateTraffic(); // creates a new random obstacle course every time the page loads

animate(); // starts the simulation and animation loop

function generateTraffic(){ // randomly places rows of traffic so every run is a different course
    let y = -300; // the first row starts a little ahead of the AI cars

    for(let i = 0; i < 100; i++){ // creates 100 rows of traffic
        const difficulty = i < 5 ? 0 : Math.min((i - 5) / 20, 1); // first 5 rows are easy (0), then ramps up to full difficulty (1) by row 25

        if(i == 0){ // the very first car is never in the middle lane, so cars that just drive straight still make progress
            addTraffic([Math.random() < 0.5 ? 0 : 2], y); // places it in the left or right lane
            y -= 400; // big gap before the next row
        }
        else if(Math.random() >= 0.5 * difficulty){ // single-car rows: every early row, then about half the rows once it's fully difficult
            addTraffic([Math.floor(Math.random() * 3)], y); // places one car in a random lane (0, 1, or 2)
            y -= 150 + Math.random() * 200 + (1 - difficulty) * 300; // 150-350 pixels to the next row, plus up to 300 extra early on
        }
        else{ // two-car rows: never at the start, then more common as difficulty increases
            const openLane = Math.floor(Math.random() * 3); // picks the one lane that stays open, so there's always a way through
            addTraffic([(openLane + 1) % 3, (openLane + 2) % 3], y); // blocks the other two lanes
            y -= 250 + Math.random() * 200 + (1 - difficulty) * 300; // 250-450 pixels to weave around two cars, plus extra early on
        }
    }
}

function save(){
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain)); // converts the best brain to a string and saves it in browser storage

    const history = JSON.parse(localStorage.getItem("distanceHistory") || "[]"); // gets the previously saved distances (or an empty list)
    history.push(Math.round(100 - bestCar.y)); // adds how far the best car traveled this run (cars start at y = 100)
    localStorage.setItem("distanceHistory", JSON.stringify(history)); // saves the updated list
}

function discard(){
    localStorage.removeItem("bestBrain"); // deletes the saved brain from browser storage
    localStorage.removeItem("distanceHistory"); // deletes the saved distances too
}

function generateCars(N){ // creates N AI cars
    const cars = []; // array to hold the generated cars
    for(let i = 0; i < N; i++){ // repeats N times
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI", 4)); // creates an AI car in the middle lane
    }

    return cars; // returns the array of AI cars
}

function animate(){ // runs once per animation frame to update and redraw the simulation
    for(let i = 0; i < traffic.length; i++){
        traffic[i].update(road.borders, []); // moves traffic cars without checking collisions against other traffic
    }

    for(let i = 0; i < cars.length; i++){
        cars[i].update(road.borders, traffic); // updates each AI car's movement, sensors, and collisions
    }

    bestCar = cars.find(c => c.y == Math.min(...cars.map(c => c.y))); // finds the car farthest ahead (smallest y value)

    carCanvas.height = window.innerHeight; // makes the car canvas as tall as the browser window
    networkCanvas.height = window.innerHeight; // makes the network canvas as tall as the browser window

    carCtx.save(); // saves the current drawing settings before moving the camera
    carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7); // moves the camera to keep the best car near 70% of the canvas height

    road.draw(carCtx); // draws the road
    for(let i = 0; i < traffic.length; i++){
        traffic[i].draw(carCtx, "red"); // draws traffic cars in red
    }

    carCtx.globalAlpha = 0.2; // makes the AI cars mostly transparent

    for(let i = 0; i < cars.length; i++){
        cars[i].draw(carCtx, "blue"); // draws all AI cars in blue
    }

    carCtx.globalAlpha = 1; // restores full opacity
    bestCar.draw(carCtx, "blue", true); // highlights the best car and draws its sensors

    carCtx.restore(); // restores the drawing settings from before the camera translation

    drawStats(); // shows how far the best car has traveled

    Visualizer.drawNetwork(networkCtx, bestCar.brain); // draws the best car's neural network

    requestAnimationFrame(animate); // schedules the next animation frame, keeping the simulation running
}

function drawStats(){ // draws the distance info in the top-left corner of the car canvas
    const history = JSON.parse(localStorage.getItem("distanceHistory") || "[]"); // gets the saved distances from previous runs

    carCtx.fillStyle = "rgba(0, 0, 0, 0.7)"; // dark see-through box so the text is readable over the road lines
    carCtx.fillRect(0, 0, carCanvas.width, history.length > 0 ? 56 : 24); // only as tall as the lines of text being shown

    carCtx.fillStyle = "white"; // white text
    carCtx.font = "12px Arial"; // sets the text font
    carCtx.textAlign = "left"; // lines the text up from the left edge
    carCtx.fillText("distance: " + Math.round(100 - bestCar.y), 6, 16); // current distance of the best car

    if(history.length > 0){ // only shows past results once something has been saved
        carCtx.fillText("runs saved: " + history.length, 6, 32); // how many runs have been saved
        carCtx.fillText("last saved: " + history[history.length - 1], 6, 48); // distance from the most recent save
    }
}