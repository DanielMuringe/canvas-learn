const bodyTag = document.getElementsByTagName('body')[0]
const headTag = document.getElementsByTagName('head')[0]


// xUACompatible meta
const xUACompatible = document.createElement('meta');
xUACompatible.httpEquiv = 'X-UA-Compatible';
xUACompatible.content = 'IE=edge';
headTag.appendChild(xUACompatible);


// Viewport meta
const viewport = document.createElement('meta');
viewport.name = 'viewport';
viewport.content = 'width=device-width, initial-scale=1';
headTag.appendChild(viewport);


// Square function
let sqr = num => num ** 2;


// Convert degrees value to radians
let degreesToRadians = degrees => (2 * Math.PI) * (degrees / 360)


// Get distance between 2 points
let distance = (...points) => {
    let [firstPoints, secondPoints] = points;
    return Math.sqrt(sqr(firstPoints[0] - secondPoints[0]) + sqr(firstPoints[1] - secondPoints[1]));
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
        this.mouse = { x: NaN, y: NaN }
        window.addEventListener('mousemove',
            (event) => {
                this.mouse.x = event.x;
                this.mouse.y = event.y;
            }
        )

        // Render stuff on canvas
        this.render();
    }

    render(obj = this) {

        function bouncingPoints(radius, coordinates = randCoord(), velocity, color = obj.defaultColor) {
            this.radius = radius;
            this.coordinates = coordinates;
            this.color = color;

            let [x, y] = this.coordinates;
            let [dx, dy] = this.velocity = velocity;

            this.bounceWall = () => {
                // Create bounding effect of circle
                let xImpactWall = x >= window.innerWidth || x <= 0;
                let yImpactWall = y >= window.innerHeight || y <= 0;

                if (xImpactWall) dx *= -1;
                if (yImpactWall) dy *= -1;

                x += dx; y += dy;

                this.coordinates[0] = x; this.coordinates[1] = y;
                this.velocity[0] = dx; this.velocity[1] = dy;
            }

            this.bounceRadius = (currentIndex, points = []) => {

                for (const point of points.slice(0, currentIndex)) {
                    if (distance(this.coordinates, point.coordinates) <= (this.radius + point.radius + 10))
                        obj.line(this.coordinates, point.coordinates, 2, this.color);
                }
            }
        }

        let points = [];
        let pointCount = 200;
        let col = () => randInt(0, 255, (val => val <= 10));
        for (let i = 0; i < pointCount; i++) {
            points.push(
                new bouncingPoints(
                    60,
                    randCoord(50),
                    randList(2, -3, 3, (val => val == 0)),
                    'black'
                    // `rgb(${col()},${col()},${col()})`
                )
            );
        }
        function animate() {
            requestAnimationFrame(animate);
            obj.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            for (let i = 0; i < points.length; i++) {
                const point = points[i];
                point.bounceWall();
                point.bounceRadius(i, points);
            }
        }
        animate()

    }


    tagSetter(tag = this.tag) {

        // Add styling to canvas
        this.styling = {
            'background-color': 'cyan'
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

    line(begin = [0, 0], end = [1, 1], thickness=1, color = this.defaultColor, func = (context) => null) {
        this.ctx.beginPath();
        this.ctx.moveTo(...begin);
        this.ctx.lineTo(...end);
        this.ctx.lineWidth = thickness;
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

