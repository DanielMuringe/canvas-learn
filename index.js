const bodyTag = document.getElementsByTagName('body')[0]
const headTag = document.getElementsByTagName('head')[0]


// Sum of items in array
let sum = (numbers=[])=>{
    let value = 0;
    for (const number of numbers) value += number;
    return value;
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
let intersection = (firstPoint, secondPoint, ratio)=>{
    let [a, b] = [ratio[1]/sum(ratio), ratio[0]/sum(ratio)];
    let [x, y] = [(a*firstPoint[0]+b*secondPoint[0]), (a*firstPoint[1]+b*secondPoint[1])];
    return [x, y]
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


class Canvas {


    constructor() {
        // Create tag and assign attributes
        this.tag = document.createElement('canvas');
        this.tagSetter();
        bodyTag.appendChild(this.tag);

        // Draw using context
        this.ctx = this.tag.getContext('2d');
        this.defaultColor = '#000000';

        // Add object to locate position of mouse
        this.mouse = { position: [], inWindow: false}
        window.addEventListener('mousemove', event => this.mouse.position = [event.x, event.y]);
        window.addEventListener('mouseover',  event => this.mouse.inWindow = true);
        window.addEventListener('mouseout',  event => this.mouse.inWindow = false);

        // Render stuff on canvas
        this.render();
    }

    render(obj = this) {

        function bouncingBalls(radius, centre = randCoord(), velocity, color = obj.defaultColor) {
            this.radius = radius;
            this.centre = centre;
            this.mass = (4/3)*Math.PI*(this.radius**3);

            this.color = color;
            
            let [x, y] = this.centre;
            let [dx, dy] = this.velocity = velocity;
            
            this.inProximity = (...coord) => distance(coord, this.centre) <= this.radius;
            
            this.draw = () => {
                // Mouse interactivity
                let mouseProximity = this.inProximity(...obj.mouse.position);
                if (mouseProximity&&obj.mouse.inWindow) this.radius = radius*2;
                else this.radius = radius;

                // Draw circle on canvas
                obj.circle(this.radius, this.centre, this.color);
            }

            this.bounceWall = () => {
                // Create bounding effect of circle
                let xImpactWall = x + this.radius >= window.innerWidth || x - this.radius <= 0;
                let yImpactWall = y + this.radius >= window.innerHeight || y - this.radius <= 0;

                if (xImpactWall) dx *= -1;
                if (yImpactWall) dy *= -1;

                x += dx; y += dy;

                this.centre[0] = x; this.centre[1] = y;
                this.velocity[0] = dx; this.velocity[1] = dy;
            }

            this.bounceBall = (currentIndex, balls = []) => {
                for (const ball of balls.slice(0, currentIndex)) {
                    if (distance(this.centre, ball.centre) <= (this.radius+ball.radius+10)) {
                        obj.line(this.centre, ball.centre, 'cyan');
                    }
                }
            }
        }

        let balls = [];
        let ballCount = 20;
        let col = () => randInt(0, 255, (val => val <= 10));
        for (let i = 0; i < ballCount; i++) {
            balls.push(
                new bouncingBalls(
                    randInt(20, 40),
                    randCoord(50),
                    randList(2, -3, 3, (val => val == 0)),
                    `rgb(${col()},${col()},${col()})`
                )
            );
        }

        function animate() {
            requestAnimationFrame(animate);
            obj.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            for (let i = 0; i < balls.length; i++) {
                const ball = balls[i];
                ball.draw();
                ball.bounceWall();
                ball.bounceBall(i, balls);
            }
        }
        animate()

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
        )
    }

    line(begin = [0, 0], end = [1, 1], color = this.defaultColor, func = (context) => null) {
        this.ctx.beginPath();
        this.ctx.moveTo(...begin);
        this.ctx.lineTo(...end);
        this.ctx.strokeStyle = color;
        func(this.context);
        this.ctx.stroke();
    }

    square(dimensions = [100, 100], position = [0, 0], color = this.defaultColor, func = (context) => null) {
        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        func(this.ctx);
        this.ctx.fillRect(...position, ...dimensions);
    }

    circle(radius = 1, centre = [0, 0], color = this.defaultColor, fill = true, func = (context) => null) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
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

