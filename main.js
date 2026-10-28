
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

// creates the traffic obstacle course (negative y values place cars farther ahead)
addTraffic([1], -200);
addTraffic([0, 2], -400);
addTraffic([0, 1], -650);
addTraffic([1, 2], -900);
addTraffic([0, 2], -1150);
addTraffic([0, 1], -1450);
addTraffic([1, 2], -1800);
addTraffic([0, 1], -2150);
addTraffic([0, 2], -2500);
addTraffic([1, 2], -2850);
addTraffic([0], -3100);
addTraffic([2], -3240);
addTraffic([1], -3380);
addTraffic([0], -3520);
addTraffic([2], -3660);
addTraffic([1], -3800);
addTraffic([0], -3940);
addTraffic([2], -4080);
addTraffic([0, 2], -4400);
addTraffic([0, 2], -4650);
addTraffic([1, 2], -4950);
addTraffic([1, 2], -5200);
addTraffic([0, 1], -5500);
addTraffic([0, 1], -5750);
addTraffic([1], -6000);
addTraffic([0, 2], -6200);
addTraffic([0], -6400);
addTraffic([1, 2], -6650);
addTraffic([2], -6900);
addTraffic([0, 1], -7150);
addTraffic([0, 1], -7500);
addTraffic([1, 2], -7850);
addTraffic([0, 2], -8200);
addTraffic([0, 1], -8550);
addTraffic([1, 2], -8900);
addTraffic([0, 2], -9250);
addTraffic([1], -9500);
addTraffic([0, 2], -9750);
addTraffic([1], -10000);
addTraffic([0, 1], -10250);
addTraffic([2], -10500);
addTraffic([1, 2], -10750);
addTraffic([0, 2], -11100);
addTraffic([0, 1], -11450);
addTraffic([1, 2], -11800);
addTraffic([0, 2], -12150);
addTraffic([0, 1], -12500);
addTraffic([1, 2], -12850);
addTraffic([0, 2], -13200);
addTraffic([0, 1], -13550);
addTraffic([1, 2], -13900);
addTraffic([0, 2], -14250);

animate(); // starts the simulation and animation loop

function save(){
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain)); // converts the best brain to a string and saves it in browser storage
}

function discard(){
    localStorage.removeItem("bestBrain"); // deletes the saved brain from browser storage
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

    Visualizer.drawNetwork(networkCtx, bestCar.brain); // draws the best car's neural network

    requestAnimationFrame(animate); // schedules the next animation frame, keeping the simulation running
}
