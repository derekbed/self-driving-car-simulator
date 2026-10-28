
class Controls{
    constructor(type){
        this.forward = false; // tracks whether the car should accelerate
        this.left = false; // tracks whether the car should turn left
        this.right = false; // tracks whether the car should turn right
        this.reverse = false; // tracks whether the car should reverse

        switch(type){ // sets up controls based on the type of car
            case "KEYS": this.#addKeyboardListeners(); break; // allows the arrow keys to control the car
            case "DUMMY": this.forward = true; break; // makes traffic cars drive forward automatically
        }
    }

    #addKeyboardListeners(){ // listens for keyboard inputs to control the car
        document.onkeydown = (event) =>{ // runs whenever a key is pressed
            switch(event.key){ // checks which key was pressed
                case "ArrowLeft": this.left = true; break; // starts turning left
                case "ArrowRight": this.right = true; break; // starts turning right
                case "ArrowUp": this.forward = true; break; // starts accelerating
                case "ArrowDown": this.reverse = true; break; // starts reversing
            }
        }

        document.onkeyup = (event) =>{ // runs whenever a key is released
            switch(event.key){ // checks which key was released
                case "ArrowLeft": this.left = false; break; // stops turning left
                case "ArrowRight": this.right = false; break; // stops turning right
                case "ArrowUp": this.forward = false; break; // stops accelerating
                case "ArrowDown": this.reverse = false; break; // stops reversing
            }
        }
    }
}
