
class Visualizer{
    static drawNetwork(ctx, network){ // draws entire neural network
        const width = ctx.canvas.width; // gets canvas width
        const height = ctx.canvas.height; // gets canvas height
        const margin = 45; // adds space aroundedges of network

        ctx.fillStyle = "black"; // sets background color to black
        ctx.fillRect(0, 0, width, height); // fills entire canvas with black

        const levels = network.levels; // gets all levels of neural network
        const levelHeight = (height - margin * 2) / levels.length; // calculates how much vertical space each level gets

        for(let i = 0; i < levels.length; i++){ // loops through each network level
            const top = height - margin - (i + 1) * levelHeight; // calculates top position of this level
            const bottom = height - margin - i * levelHeight; // calculates bottom position of this level

            Visualizer.drawLevel(
                ctx,
                levels[i], // current network level
                margin, // left margin
                top, // top position
                width - margin * 2, // available drawing width
                bottom - top, // height of this level
                i === levels.length - 1 // checks if this is final level
            );
        }
    }

    static drawLevel(ctx, level, left, top, width, height, isLast){ // draws one level of neural network
        const bottom = top + height; // calculates bottom position of level
        const radius = 12; // sets radius of each neuron circle

        // draws connections between input and output neurons
        for(let i = 0; i < level.inputs.length; i++){ // loops through input neurons
            for(let j = 0; j < level.outputs.length; j++){ // loops through output neurons
                const x1 = Visualizer.getX(level.inputs, i, left, width); // gets input neuron's horizontal position
                const x2 = Visualizer.getX(level.outputs, j, left, width); // gets output neuron's horizontal position
                const weight = level.weights[i][j]; // gets weight of this connection

                ctx.beginPath(); // starts drawing a connection
                ctx.moveTo(x1, bottom); // starts at input neuron
                ctx.lineTo(x2, top); // draws a line to output neuron

                ctx.strokeStyle = weight >= 0
                    ? "rgba(255, 240, 60, 0.75)" // positive weights are yellow
                    : "rgba(70, 120, 255, 0.75)"; // negative weights are blue

                ctx.lineWidth = 2; // sets connection thickness
                ctx.setLineDash([6, 6]); // makes connections dashed
                ctx.stroke(); // draws connection
            }
        }

        ctx.setLineDash([]); // resets line style to solid

        // draws input neurons
        for(let i = 0; i < level.inputs.length; i++){ // loops through each input neuron
            const x = Visualizer.getX(level.inputs, i, left, width); // calculates neuron's horizontal position
            Visualizer.drawNeuron(ctx, x, bottom, radius, level.inputs[i]); // draws input neuron
        }

        // draws output neurons
        for(let i = 0; i < level.outputs.length; i++){ // loops through each output neuron
            const x = Visualizer.getX(level.outputs, i, left, width); // calculates neuron's horizontal position
            Visualizer.drawNeuron(ctx, x, top, radius, level.outputs[i]); // draws output neuron

            if(isLast){ // only labels neurons in final output layer
                const labels = ["F", "L", "R", "B"]; // labels for forward, left, right, and reverse

                ctx.save(); // saves current drawing settings
                ctx.fillStyle = "white"; // makes labels white
                ctx.font = "bold 16px Arial"; // sets label font
                ctx.textAlign = "center"; // horizontally centers labels
                ctx.textBaseline = "middle"; // vertically centers labels
                ctx.fillText(labels[i], x, top - 35); // draws label above its output neuron
                ctx.restore(); // restores previous drawing settings
            }
        }
    }

    static getX(nodes, index, left, width){ // calculates where a neuron should be placed horizontally
        if(nodes.length === 1){ // handles levels containing only one neuron
            return left + width / 2; // centers single neuron
        }

        return left + index * width / (nodes.length - 1); // evenly spaces neurons across available width
    }

    static drawNeuron(ctx, x, y, radius, value){ // draws a single neuron as a circle
        ctx.beginPath(); // starts drawing neuron
        ctx.arc(x, y, radius, 0, Math.PI * 2); // creates a full circle

        ctx.fillStyle = value ? "yellow" : "black"; // yellow for active/nonzero neurons, black for inactive/zero neurons
        ctx.fill(); // fills circle

        ctx.strokeStyle = "rgba(255, 255, 100, 0.8)"; // sets neuron outline to yellow
        ctx.lineWidth = 2; // sets outline thickness
        ctx.setLineDash([3, 3]); // makes outline dashed
        ctx.stroke(); // draws outline

        ctx.setLineDash([]); // resets line style to solid
    }
}
