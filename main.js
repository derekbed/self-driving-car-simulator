const carCanvas = document.getElementById("carCanvas"); // gets car canvas from HTML
//canvas.height = window.innerHeight;
carCanvas.width = 200; // sets car canvas width to 200 pixels

const networkCanvas = document.getElementById("networkCanvas"); // gets neural network canvas from HTML
networkCanvas.width = 300; // sets network canvas width to 300 pixels

const carCtx = carCanvas.getContext("2d"); // gets tools needed to draw on car canvas
const networkCtx = networkCanvas.getContext("2d"); // gets tools needed to draw on network canvas

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9); // creates a road centered on canvas, using 90% of its width

const car = new Car(road.getLaneCenter(1), 100, 30, 50, "AI", 6); // creates an AI car in middle lane (currently unused)

const N = 1000; // numner of AI cars in each generation
const cars = generateCars(N); // creates AI cars
let bestCar = cars[0]; // initially selects first car as best car

if(localStorage.getItem("bestBrain")){ // checks if a previously saved neural network exists
    for(let i = 0; i < cars.length; i++){ // loops through every AI car
        cars[i].brain = JSON.parse(localStorage.getItem("bestBrain")); // gives each car its own copy of saved brain
        if(i != 0){ // keeps first car's brain unchanged
            NeuralNetwork.mutate(cars[i].brain, 0.1); // slightly randomizes other brains to explore new behaviors
        }
    }
}

const traffic = []; // stores all traffic cars

function addTraffic(lanes, y, speed = 2){ // adds traffic cars in specified lanes and y position
    for(const lane of lanes){ // loops through each lane in array
        traffic.push(
            new Car(road.getLaneCenter(lane), y, 30, 50, "DUMMY", speed) // creates a traffic car that drives forward automatically
        );
    }
}

generateTraffic(); // creates a new random obstacle course every time page loads

animate(); // starts simulation and animation loop

function generateTraffic(){ // randomly places rows of traffic so every run is a different course
    let y = -200; // first row starts just ahead of AI cars

    for(let i = 0; i < 60; i++){ // creates 60 rows of traffic
        if(Math.random() < 0.5){ // half rows block one lane
            addTraffic([Math.floor(Math.random() * 3)], y); // places one car in a random lane (0, 1, or 2)
            y -= 150 + Math.random() * 200; // moves 150-350 pixels ahead for next row
        }
        else{ // other half block two lanes
            const openLane = Math.floor(Math.random() * 3); // picks one lane that stays open, so there's always a way through
            addTraffic([(openLane + 1) % 3, (openLane + 2) % 3], y); // blocks other two lanes
            y -= 250 + Math.random() * 200; // leaves extra room (250-450 pixels) to weave around two cars
        }
    }
}

function save(){
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain)); // converts best brain to a string and saves it in browser storage

    const history = JSON.parse(localStorage.getItem("distanceHistory") || "[]"); // gets previously saved distances (or an empty list)
    history.push(Math.round(100 - bestCar.y)); // adds how far best car traveled this run (cars start at y = 100)
    localStorage.setItem("distanceHistory", JSON.stringify(history)); // saves updated list
}

function discard(){
    localStorage.removeItem("bestBrain"); // deletes saved brain from browser storage
    localStorage.removeItem("distanceHistory"); // deletes saved distances too
}

function generateCars(N){ // creates N AI cars
    const cars = []; // array to hold generated cars
    for(let i = 0; i < N; i++){ // repeats N times
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI", 4)); // creates an AI car in middle lane
    }

    return cars; // returns array of AI cars
}

function animate(){ // runs once per animation frame to update and redraw simulation
    for(let i = 0; i < traffic.length; i++){
        traffic[i].update(road.borders, []); // moves traffic cars without checking collisions against other traffic
    }

    for(let i = 0; i < cars.length; i++){
        cars[i].update(road.borders, traffic); // updates each AI car's movement, sensors, and collisions
    }

    bestCar = cars.find(c => c.y == Math.min(...cars.map(c => c.y))); // finds car farthest ahead (smallest y value)

    carCanvas.height = window.innerHeight; // makes car canvas as tall as browser window
    networkCanvas.height = window.innerHeight; // makes network canvas as tall as browser window

    carCtx.save(); // saves current drawing settings before moving camera
    carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7); // moves camera to keep best car near 70% of canvas height

    road.draw(carCtx); // draws road
    for(let i = 0; i < traffic.length; i++){
        traffic[i].draw(carCtx, "red"); // draws traffic cars in red
    }

    carCtx.globalAlpha = 0.2; // makes AI cars mostly transparent

    for(let i = 0; i < cars.length; i++){
        cars[i].draw(carCtx, "blue"); // draws all AI cars in blue
    }

    carCtx.globalAlpha = 1; // restores full opacity
    bestCar.draw(carCtx, "blue", true); // highlights best car and draws its sensors

    carCtx.restore(); // restores drawing settings from before camera translation

    drawStats(); // shows how far best car has traveled

    Visualizer.drawNetwork(networkCtx, bestCar.brain); // draws best car's neural network

    requestAnimationFrame(animate); // schedules next animation frame, keeping simulation running
}

function drawStats(){ // draws distance info in top-left corner of car canvas
    const history = JSON.parse(localStorage.getItem("distanceHistory") || "[]"); // gets saved distances from previous runs

    carCtx.fillStyle = "white"; // white text
    carCtx.font = "12px Arial"; // sets text font
    carCtx.textAlign = "left"; // lines text up from left edge
    carCtx.fillText("distance: " + Math.round(100 - bestCar.y), 6, 16); // current distance of best car

    if(history.length > 0){ // only shows past results once something has been saved
        carCtx.fillText("runs saved: " + history.length, 6, 32); // how many runs have been saved
        carCtx.fillText("last saved: " + history[history.length - 1], 6, 48); // distnace from most recent save
    }
}