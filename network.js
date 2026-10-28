
class NeuralNetwork{
    constructor(neuronCounts){ // neuronCounts specifies the number of neurons in each layer
        this.levels = []; // stores the connections between layers

        for(let i = 0; i < neuronCounts.length - 1; i++){ // creates a level between each pair of consecutive layers
            this.levels.push(new Level(neuronCounts[i], neuronCounts[i + 1])); // creates a level with the specified input and output neurons
        }
    }

    static feedForward(givenInputs, network){ // processes inputs through the entire neural network
        let outputs = Level.feedForward(givenInputs, network.levels[0]); // processes sensor inputs through the first level

        for(let i = 1; i < network.levels.length; i++){ // loops through any remaining levels
            outputs = Level.feedForward(outputs, network.levels[i]); // uses the previous level's outputs as the next level's inputs
        }

        return outputs; // returns the final decisions for forward, left, right, and reverse
    }

    static mutate(network, amount = 1){ // randomly adjusts the network's weights and biases
        network.levels.forEach(level => { // loops through each level in the network

            for(let i = 0; i < level.biases.length; i++){ // loops through each bias
                level.biases[i] = lerp(
                    level.biases[i], // current bias
                    Math.random() * 2 - 1, // random target value between -1 and 1
                    amount // controls how much the bias changes
                );
            }

            for(let i = 0; i < level.weights.length; i++){ // loops through each input neuron's weights
                for(let j = 0; j < level.weights[i].length; j++){ // loops through its connections to output neurons
                    level.weights[i][j] = lerp(
                        level.weights[i][j], // current weight
                        Math.random() * 2 - 1, // random target value between -1 and 1
                        amount // controls how much the weight changes
                    );
                }
            }
        });
    }
}

class Level{ // represents the connections between two consecutive neural network layers
    constructor(inputCount, outputCount){
        this.inputs = new Array(inputCount); // input neuron values
        this.outputs = new Array(outputCount); // output neuron values
        this.biases = new Array(outputCount); // one activation threshold for each output neuron

        this.weights = []; // connection weights between inputs and outputs

        for(let i = 0; i < inputCount; i++){ // creates a row of weights for each input neuron
            this.weights[i] = new Array(outputCount); // each input connects to every output neuron
        }

        Level.#randomize(this); // initializes the weights and biases with random values
    }

    static #randomize(level){ // assigns random weights and biases when a level is created
        for(let i = 0; i < level.inputs.length; i++){ // loops through input neurons
            for(let j = 0; j < level.outputs.length; j++){ // loops through each outputneeron
                level.weights[i][j] = (Math.random() * 2) - 1; // assigns a random weight between -1 and 1
            }
        }

        for(let i = 0; i < level.biases.length; i++){ // loops through output neuron biases
            level.biases[i] = (Math.random() * 2) - 1; // assigns a random bias between -1 and 1
        }
    }

    static feedForward(givenInputs, level){ // calculates the output values of one level
        for(let i = 0; i < level.inputs.length; i++){ // loops through input neurons
            level.inputs[i] = givenInputs[i]; // assigns the provided input values to the level
        }

        for(let i = 0; i < level.outputs.length; i++){ // calculates each output neuron
            let sum = 0; // starts the weighted sum at zero

            for(let j = 0; j < level.inputs.length; j++){ // loops through every input neuron
                sum += level.inputs[j] * level.weights[j][i]; // adds each input multiplied by its connection weight
            }

            if(sum > level.biases[i]){ // activates the neuron if the weighted sum exceeds its bias
                level.outputs[i] = 1; // neuron is active
            }
            else{
                level.outputs[i] = 0; // neuron is inactive
            }
        }

        return level.outputs; // returns the calculated output values
    }
}
