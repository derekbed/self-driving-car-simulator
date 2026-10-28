# Self-Driving Car Simulator

A self-driving car simulation built in plain JavaScript, HTML, and CSS, with no external libraries. Cars are controlled by small neural networks that learn to weave through traffic through **neuroevolution**. There's no labeled training data and no backpropagation: the best driver from each generation is saved and slightly mutated to create the next one.

## Features

- Feedforward neural network implemented from scratch (weights, biases, and layer-by-layer feedforward)
- 5 ray-casting sensors that detect traffic and road borders
- Car physics with acceleration, friction, max speed, and steering
- Collision detection using line-segment and polygon intersection
- 1,000 AI cars simulated at the same time each generation
- Randomly generated traffic, so every run is a new course and a network can't just memorize one track
- Live visualization of the best car's neural network
- Saving and reusing the best network across generations
- Distance tracking that records how far the best car traveled in each saved generation

## Quick Start

1. Download or clone the repository.
2. Open `index.html` in your browser. No installs or server needed.
3. Watch 1,000 cars try to drive. Most of them crash almost immediately, which is expected at first.
4. When the farthest car is clearly doing well (or everything has crashed), click 💾 to save it.
5. Refresh the page to start the next generation, built from the car you saved.
6. Repeat steps 4–5. Each generation should get a little farther.
7. To start over from scratch, click 🗑️ and refresh.

## How Training Works

The cars learn the way evolution works: try many variations, keep the best one, and build on it.

**Generation 1.** With no saved network, all 1,000 cars get completely random weights and biases. Nearly all of them drive badly, but by chance a few get a bit farther than the rest.

**Picking the best car.** At every frame, the simulator follows whichever car has traveled the farthest up the road. That car is drawn solid blue with its sensors visible, and its network is shown on the right. Everything else is drawn faded.

**Saving (💾).** Clicking save stores that best car's network in your browser's `localStorage`. It also records how far the car got, so you can track progress across generations.

**The next generation (refresh).** When the page reloads with a saved network:
- **Car #1 gets an exact copy** of the saved network. This guarantees the new generation is never worse than the last one, as long as the course is similar.
- **The other 999 cars get mutated copies.** Every weight and bias is nudged 10% of the way toward a new random value, so each car drives a little differently from its parent.
- **A brand-new random traffic course** is generated, so the network has to handle situations it hasn't seen before.

**Repeat.** The best of those 1,000 becomes the parent of the next generation. Over many generations, the behavior that keeps cars alive (braking for traffic, changing lanes, staying off the walls) gets selected for and refined.

### Training tips

- **Only save when the best car did better than last time.** Saving a worse car becomes the new starting point and undoes your progress. The `last saved` number in the corner tells you what to beat.
- **You don't have to wait for every car to crash.** Once the leader is clearly the best, you can save. Watch for leaders that stop or slowly back up, though: they never crash, but they don't get anywhere either.
- **If progress stalls for many generations,** click 🗑️ and train again from random networks. Some starting points are just better than others.
- Because each refresh is a new course, a network that keeps improving has actually learned to drive, rather than memorizing where the traffic is.

## How a Car Thinks

Every frame, each car runs the same loop: **sense → think → act**.

**1. Sense.** Five sensor rays fan out over a 90° arc in front of the car, each up to 100 pixels long. Each ray reports how close the nearest obstacle is, from `0` (nothing detected) to `1` (touching the car).

**2. Think.** The 5 readings go into a neural network with 5 input neurons, 6 hidden neurons, and 4 output neurons. Each neuron adds up its inputs multiplied by their weights. If that sum is greater than the neuron's bias, it turns on (`1`); otherwise it stays off (`0`).

**3. Act.** The 4 output neurons are the controls:

| Output | Label | Action |
|---|---|---|
| 1 | F | Accelerate forward |
| 2 | L | Steer left |
| 3 | R | Steer right |
| 4 | B | Reverse / brake |

More than one can be on at once, for example accelerating while steering left.

**Crashing.** Each car is a rotated rectangle. If any of its edges intersects a road border or a traffic car, it's marked damaged, turns gray, and stops moving and thinking.

## Reading the Screen

**Road (left canvas)**
- **Red** cars are traffic, driving forward at a constant speed.
- **Faded blue** cars are the rest of the generation.
- **Solid blue** is the current best car.
- **Gray** cars have crashed.
- **Yellow sensor rays** show what the best car can see. The black part of a ray is beyond the obstacle it hit.
- **Top-left stats:**
  - `distance` is how far the best car has traveled.
  - `runs saved` is how many generations you've saved.
  - `last saved` is the distance from your most recent save, so you know what to beat.

**Network (right canvas)**
- **Bottom row:** the 5 sensor inputs.
- **Middle row:** the 6 hidden neurons.
- **Top row:** the 4 outputs, labeled F, L, R, B.
- **Filled yellow** neurons are on; **black** neurons are off.
- **Yellow connections** are positive weights; **blue connections** are negative weights.

## Project Structure

| File | What it does |
|---|---|
| `index.html` | Page layout: the two canvases and the save/discard buttons |
| `main.js` | Sets up the simulation, generates traffic, creates each generation, runs the animation loop |
| `car.js` | Car physics, polygon shape, collision checks, and connecting sensors to the network |
| `sensors.js` | Casts the sensor rays and finds the closest obstacle on each one |
| `network.js` | The neural network: feedforward and mutation |
| `visualizer.js` | Draws the best car's network on the right-hand canvas |
| `road.js` | Road borders, lanes, and lane markings |
| `controls.js` | Keyboard controls (for manual driving) and forward-only controls for traffic |
| `utils.js` | Math helpers: linear interpolation and line/polygon intersection |
| `style.css` | Page styling |

## Technologies Used

- JavaScript
- HTML5 Canvas
- HTML
- CSS

## Future Improvements

- Test saved networks on new courses they've never seen, and compare against networks trained on a single fixed course
- Automate generations so training can run without clicking save and refresh
- Keep the top few cars each generation instead of just one, and combine their networks
- Experiment with different network sizes and mutation amounts