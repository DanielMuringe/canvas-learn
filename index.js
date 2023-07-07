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


// Get distance between 2 points
let distance = (...points) => {
    let [firstPoint, secondPoint] = points;
    return Math.sqrt(sqr(firstPoint[0] - secondPoint[0]) + sqr(firstPoint[1] - secondPoint[1]));
}


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
            throw EvalError('Vectors lengths do not match');
            return false;
        }
        return true;
    }

    biVectorOperation(otherVector, operation) {
        let resultVector = new Vector();
        this.assertLengthsMatch(otherVector);
        for (let i = 0; i < this.length; i++) {
            resultVector.push(operation(this[i], otherVector[i]));
        }
        return resultVector;
    }

    uniVectorOperation(operation) {
        let resultVector = new Vector();
        for (let i = 0; i < this.length; i++) {
            resultVector.push(operation(this[i]));
        }
        return resultVector;
    }

    add(otherVector) {
        return this.biVectorOperation(otherVector, (v1, v2) => v1 + v2);
    }

    subtract(otherVector) {
        return this.biVectorOperation(otherVector, (v1, v2) => v1 - v2);
    }

    innerProduct(otherVector) {
        return sum(this.biVectorOperation(otherVector, (v1, v2) => v1 * v2));
    }

    scale(scalar) {
        return this.uniVectorOperation(v => v * scalar);
    }

    transform(matrix) {
        return this.biVectorOperation(matrix, (v, row) => this.innerProduct(row));
    }

    getMagnitude() {
        return distance([0, 0], this);
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

    constructor(position = new Vector(0, 0), velocity = new Vector(1, 1), acceleration = new Vector(0, 0), maxVelocity = Infinity, dimension=2) {

        this.acceleration = acceleration;

        this.velocity = velocity;

        this.position = position;
    }

    move() {
        this.velocity = this.velocity.add(this.acceleration);
        this.position = this.position.add(this.velocity);
    }

    reverse_x() {
        let xReverseMatrix = [[-1, 0], [0, 1]];
        this.acceleration = this.acceleration.transform(xReverseMatrix);
        this.velocity = this.velocity.transform(xReverseMatrix);
    }

    reverse_y() {
        let yReverseMatrix = [[1, 0], [0, -1]];
        this.acceleration = this.acceleration.transform(yReverseMatrix);
        this.velocity = this.velocity.transform(yReverseMatrix);
    }

    collision(otherMovingObject) {

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
        canvas
    ) {

        super(centre, velocity, acceleration, 40, 2);

        this.radius = radius;

        this.mass = (4 / 3) * Math.PI * (this.radius ** 3);

        this.scale = [1, 1];

        this.canvas = canvas;

        this.color = color;

        this.fill = fill;

        this.thickness = thickness;

        this.inProximity = (...coord) => distance(coord, this.position) <= this.radius;
    }

    draw() {
        // Mouse interactivity
        let mouseProximity = this.inProximity(...this.canvas.mouse.position) && this.canvas.mouse.inWindow;
        let radiusFactor = mouseProximity ? 2 : 1;
        let radius = this.radius * radiusFactor;

        // Draw circle on canvas
        this.canvas.circle(radius, this.position, this.color, this.thickness, this.fill);

        // Contain circle on wall
        let xImpactWall = this.position[0] + this.radius >= window.innerWidth || this.position[0] - this.radius <= 0;
        if (xImpactWall) {
            this.reverse_x();
        }

        let yImpactWall = this.position[1] + this.radius >= window.innerHeight || this.position[1] - this.radius <= 0;
        if (yImpactWall) {
            this.reverse_y();
        }

        // Move ball
        this.move();
    }

    impactBall(currentIndex, balls = []) {
        for (const ball of balls.slice(0, currentIndex)) {
            let other_centre = ball.position;
            if (distance(this.position, other_centre) <= (this.radius + other_centre + 10)) {
                this.canvas.line(this.position, other_centre, 1, this.color);
            }
        }
    }
}


class Canvas {


    render(obj = this) {

        let balls = [];
        let ballCount = (window.innerWidth + window.innerHeight) / 60;

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


    line(begin = [0, 0], end = [1, 1], thickness = 1, color = this.defaultColor, func = (context) => null) {
        this.ctx.lineWidth = thickness;
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(...begin);
        this.ctx.lineTo(...end);
        func(this.context);
        this.ctx.stroke();
    }


    square(dimensions = [100, 100], position = [0, 0], color = this.defaultColor, func = (context) => null) {
        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        func(this.ctx);
        this.ctx.fillRect(...position, ...dimensions);
    }


    circle(radius = 1, centre = [0, 0], color = this.defaultColor, thickness = 1, fill = true, func = (context) => null) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = thickness;
        this.ctx.beginPath();
        this.ctx.arc(...centre, radius, 0, degreesToRadians(360), 1);
        if (fill) {
            this.ctx.fillStyle = color;
            this.ctx.fill();
        }
        func(this.ctx);
        this.ctx.stroke();
    }
}


CANVAS = new Canvas();

