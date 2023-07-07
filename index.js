// Access document head and body
const BODY = document.body;
const HEAD = document.head;


// Sum of items in a numeric array
let sum = (numbers = []) => {
    let value = 0;
    for (const number of numbers) value += number;
    return value;
}


// Subtract n from each item of a numeric array
let reduceN = (numbers = [], n) => {
    let newNumbers = [];
    for (const number of numbers) newNumbers.push(number - n);
    return newNumbers;
}


// Square function
let sqr = num => num ** 2;


// Convert degrees value to radians
let degreesToRadians = degrees => (2 * Math.PI) * (degrees / 360)


// Get intersection of 2 points based on ratio
let intersection = (firstPoint, secondPoint, ratio) => {
    let [a, b] = [ratio[1] / sum(ratio), ratio[0] / sum(ratio)];
    let [x, y] = [(a * firstPoint[0] + b * secondPoint[0]), (a * firstPoint[1] + b * secondPoint[1])];
    return [x, y]
}


// Class for handling vectors
class Vector extends Array {

    constructor(...vals) {
        for (const val of vals) {
            if (!(typeof val == 'number')) {
                throw EvalError('Vector item is not of type number');
            }
        }
        super(...vals);
    }

    assertLengthsMatch(otherVector) {
        if (this.length != otherVector.length) {
            console.error(otherVector);
            throw EvalError('Vectors lengths do not match');
        }
        return true;
    }

    iBiVectorOperation(otherVector, operation) {
        this.assertLengthsMatch(otherVector);
        for (let i = 0; i < this.length; i++) {
            this[i] = operation(this[i], otherVector[i]);
        }
    }

    iUniVectorOperation(operation) {
        for (let i = 0; i < this.length; i++) {
            this[i] = operation(this[i]);
        }
    }

    iAdd(otherVector) {
        this.iBiVectorOperation(otherVector, (v1, v2) => v1 + v2);
    }

    iSub(otherVector) {
        this.iBiVectorOperation(otherVector, (v1, v2) => v1 - v2);
    }

    innerProduct(otherVector) {
        this.assertLengthsMatch(otherVector);
        let resultVector = new Vector();
        for (let i = 0; i < this.length; i++) {
            resultVector.push(otherVector[i] * this[i]);
        }
        return sum(resultVector);
    }

    iScale(scalar) {
        this.iUniVectorOperation(v => v * scalar);
    }

    iTransform(matrix) {
        let resultVector = new Vector();
        for (let i = 0; i < this.length; i++) {
            resultVector.push(this.innerProduct(matrix[i]));
        }
        this.iBiVectorOperation(resultVector, (v1, v2) => v2);
    }

    distance(otherVector) {
        let copyVector = new Vector();
        this.forEach(v => copyVector.push(v));
        copyVector.iSub(otherVector);
        copyVector.iUniVectorOperation(v1 => v1**2);
        return Math.sqrt(sum(copyVector));
    }

}


// Generate random integers between 0 and num
let randInt = (...bounds) => {
    if (1 > bounds.length > 3)
        throw Error('A maximum of 3 numbers can be passed as arguments, (stop only) or (start and stop)');


    let val = 0;
    if (bounds.length == 1)
        val = Math.floor(Math.random() * bounds[0]);
    else if (bounds.length == 2)
        val = (Math.floor(Math.random() * (bounds[1] - bounds[0])) + bounds[0]);
    else if (bounds.length == 3) {
        while (bounds[2](val)) {
            val = (Math.floor(Math.random() * (bounds[1] - bounds[0])) + bounds[0]);
        }
    }

    return val;

};


//  Generate list of random integers
let randList = (len, ...bounds) => {
    let List = [];
    for (let index = 0; index < len; index++) List.push(randInt(...bounds));
    return List;
}


// Random x and y coordinates
let xRand = (n) => randInt(n, window.innerWidth - n);
let yRand = (n) => randInt(n, window.innerHeight - n);
let randCoord = (n) => [xRand(n), yRand(n)];

//Generate random color
let randColor = () => {
    let col = () => randInt(0, 255);
    return `rgb(${col()},${col()},${col()})`;
}


// Object in motion
class MovingObject {

    constructor(position = new Vector(0, 0), velocity = new Vector(1, 1), acceleration = new Vector(0, 0), mass = 0, maxVelocity = Infinity, dimension = 2) {
        this.acceleration = acceleration;
        this.velocity = velocity;
        this.position = position;
        this.mass = mass;
    }

    move() {
        this.velocity.iAdd(this.acceleration);
        this.position.iAdd(this.velocity);
    }

    reverse_x() {
        let xReverseMatrix = [[-1, 0], [0, 1]];
        this.acceleration.iTransform(xReverseMatrix);
        this.velocity.iTransform(xReverseMatrix);
    }

    reverse_y() {
        let yReverseMatrix = [[1, 0], [0, -1]];
        this.acceleration.iTransform(yReverseMatrix);
        this.velocity.iTransform(yReverseMatrix);
    }

    collision(otherMovingObject, contactPoint) {
    }

}


// Create bouncing balls
class bouncingBalls extends MovingObject {

    constructor(
        radius,
        centre = new Vector(...randCoord()),
        velocity = new Vector(1, 1),
        acceleration = new Vector(0, 0),
        color,
        thickness = 1,
        fill = true,
        canvas) {

        super(centre, velocity, acceleration, (4 / 3) * Math.PI * (radius ** 3), 40, 2);

        this.radius = radius;

        this.scale = [1, 1];

        this.canvas = canvas;

        this.color = color;

        this.fill = fill;

        this.thickness = thickness;

        this.inProximity = (...coord) => this.position.distance(coord) <= this.radius;
    }

    draw() {
        // Mouse interactivity
        let mouseProximity = this.inProximity(...this.canvas.mouse.position) && this.canvas.mouse.inWindow;
        let radiusFactor = mouseProximity ? 2 : 1;
        let radius = this.radius * radiusFactor;

        // Contain circle on wall
        let xImpactWall = this.position[0] + this.radius >= window.innerWidth || this.position[0] - this.radius <= 0;
        if (xImpactWall) {
            this.reverse_x();
        }

        let yImpactWall = this.position[1] + this.radius >= window.innerHeight || this.position[1] - this.radius <= 0;
        if (yImpactWall) {
            this.reverse_y();
        }

        // Draw circle on canvas
        this.canvas.circle(radius, this.position, this.color, this.thickness, this.fill);

        // Move ball
        this.move();
    }

    impactBall(currentIndex, balls = []) {
        for (const ball of balls.slice(0, currentIndex)) {
            let otherCentre = ball.position;
            let impactPoint = intersection(this.position, otherCentre, [this.radius, ball.radius]);
            if (this.position.distance(otherCentre) <= (this.radius + ball.radius)) {
                this.canvas.line(this.position, impactPoint, 1, this.color);
            }
        }
    }
}


class Canvas {


    render(obj = this) {

        let balls = [];
        let ballCount = 10;

        for (let i = 0; i < ballCount; i++) {
            let ball = new bouncingBalls(
                randInt((window.innerWidth + window.innerHeight) / 70, (window.innerWidth + window.innerHeight) / 50),
                new Vector(...randCoord(50)),
                new Vector(...randList(2, -4, 4, (val => val == 0))),
                new Vector(...[0, 0]),
                randColor(),
                randInt(1, 4),
                false,
                this
            );
            balls.push(ball);
        }

        function animate() {
            requestAnimationFrame(animate);
            obj.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            for (let i = 0; i < balls.length; i++) {
                const ball = balls[i];
                ball.draw();
                ball.impactBall(i, balls);
            }
        }
        animate()

    }


    constructor() {
        // Create tag and assign attributes
        this.tag = document.createElement('canvas');
        this.tagSetter();
        BODY.appendChild(this.tag);

        // Draw using context
        this.ctx = this.tag.getContext('2d');
        this.defaultColor = '#000000';

        // Add object to locate position of mouse
        this.mouse = { position: [], inWindow: false }
        window.addEventListener('mousemove', event => this.mouse.position = [event.x, event.y]);
        window.addEventListener('mouseover', event => this.mouse.inWindow = true);
        window.addEventListener('mouseout', event => this.mouse.inWindow = false);

        // Render stuff on canvas
        this.render();
    }


    tagSetter(tag = this.tag) {

        // Add styling to canvas
        this.styling = {
            'background-color': 'rgb(0, 15, 46)'
        }
        for (const key in this.styling)
            tag.style.setProperty(key, this.styling[key]);

        // Set canvas dimensions
        tag.width = window.innerWidth;
        tag.height = window.innerHeight;
        window.addEventListener(
            'resize',
            (event) => {
                tag.width = event.currentTarget.innerWidth;
                tag.height = event.currentTarget.innerHeight;
            }
        );
    }


    line(begin = [0, 0], end = [1, 1], thickness = 1, color = this.defaultColor) {
        this.ctx.lineWidth = thickness;
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(...begin);
        this.ctx.lineTo(...end);
        this.ctx.stroke();
    }


    square(dimensions = [100, 100], position = [0, 0], color = this.defaultColor) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.fillRect(...position, ...dimensions);
    }


    circle(radius = 1, centre = [0, 0], color = this.defaultColor, thickness = 1, fill = true) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = thickness;
        this.ctx.beginPath();
        this.ctx.arc(...centre, radius, 0, degreesToRadians(360), 1);
        if (fill) {
            this.ctx.fillStyle = color;
            this.ctx.fill();
        }
        this.ctx.stroke();
    }
}


CANVAS = new Canvas();

