# Self-Driving Car Simulator

Self-driving car sim I built from scratch in JavaScript/HTML/CSS, no libraries(!)

Cars are controlled by a small neural network and learn to get through traffic using neuroevolution (no backprop, just mutate the best one and repeat).

## Features

- Neural network from scratch (weights, biases, feedforward)
- 5 ray-casting sensors for traffic and road borders
- Car physics (acceleration, friction, steering)
- Polygon collision detection
- 1,000 AI cars running at once
- Random traffic every run so the network can't just memorize one course
- Traffic starts easy (single cars, big gaps) and ramps up, so early generations actually learn something instead of all crashing
- Live visualization of the best car's network
- Save/load the best network + tracks how far it got each save

## How It Works

Each car has 5 sensors that return how close the nearest obstacle is (0 = nothing, 1 = touching). Those go into a 5-6-4 network. A neuron fires if its weighted sum beats its bias. The 4 outputs are forward, left, right, and reverse.

Training is basically evolution:

1. First run: 1,000 cars with random networks. Most crash right away.
2. The sim follows whichever car is farthest ahead. Hit 💾 to save its network.
3. Refresh. Car #1 gets an exact copy of the saved network, and the other 999 get mutated versions of it (weights/biases nudged 10% toward random values). The traffic is also new.
4. Save the best one again, refresh, repeat. It gets better each generation.

## How to Run

1. Clone the repo and open `index.html` in your browser.
2. Let the cars run, then click 💾 when the best car does well.
3. Refresh to start the next generation.
4. 🗑️ clears the saved network and starts over.

Tip: only save if it beat the `last saved` distance in the corner, otherwise you go backwards.

## Built With

- JavaScript
- HTML5 Canvas
- HTML
- CSS

## Future Improvements

- Test saved networks on courses they've never seen
- Automate generations instead of save + refresh
- Keep the top few cars each generation instead of just one
- Try different network sizes and mutation rates