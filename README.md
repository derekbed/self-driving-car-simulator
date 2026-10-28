
# Self-Driving Car Simulator

A self-driving car simulation I built from scratch using JavaScript, HTML, and CSS, without any external libraries(!)

The project uses a neural network to control cars as they drive through traffic, avoid obstacles, and try to make it as far as possible without crashing.

## Features

- Neural network built from scratch using weights and biases
- 5 ray-casting sensors to detect traffic and road boundaries
- Car physics including acceleration, steering, and friction
- Collision detection using polygon intersections
- Simulation of 1,000+ AI cars at the same time
- Real-time visualization of the best car's neural network
- Ability to save and reuse the best neural network

## How It Works

Each car has 5 sensors that measure how close obstacles are in different directions. These readings are passed into a neural network with 5 input neurons, 6 hidden neurons, and 4 output neurons.

The outputs control whether the car accelerates, turns left, turns right, or reverses.

The simulation runs 1,000 cars with different neural networks and follows whichever car has traveled the farthest. You can save that car's neural network and refresh the page to generate slightly mutated versions of it, allowing you to experiment with better driving behavior over multiple runs.

## How to Run

1. Download or clone the repository.
2. Open `index.html` in your browser.
3. Watch the cars navigate through traffic.
4. Click 💾 to save the best car's neural network.
5. Refresh the page to test new variations of the saved network.
6. Click 🗑️ to clear the saved network and start over.

## Technologies Used

- JavaScript
- HTML5 Canvas
- HTML
- CSS

## Future Improvements

- Experiment with different neural network structures
- Add more complex traffic patterns
- Track how far the best car travels across runs
