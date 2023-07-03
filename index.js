// Get head and body element
const BODY = document.body
const HEAD = document.head


// Get initial window dimensions
const initialWindowDimensions = [window.innerWidth, window.innerHeight];


// Set theme color
function themeColor(){
    const rootSelector = document.querySelector(':root');
    this.color = getComputedStyle(rootSelector).getPropertyValue('--theme-color');
    this.opposite = getComputedStyle(rootSelector).getPropertyValue('--theme-color-opposite');
    this.set = color => rootSelector.style.setProperty('--theme-color', color);
}

const THEME_COLOR = new themeColor();


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


    let value = 0;
    if (bounds.length == 1)
        value = Math.floor(Math.random() * bounds[0]);
    else if (bounds.length == 2)
        value = (Math.floor(Math.random() * (bounds[1] - bounds[0])) + bounds[0]);
    else if (bounds.length == 3) {
        value = (Math.floor(Math.random() * (bounds[1] - bounds[0])) + bounds[0]);
        while (bounds[2](value)) {
            value = (Math.floor(Math.random() * (bounds[1] - bounds[0])) + bounds[0]);
        }
    }

    return value;
};


//  Generate list of random integers
let randList = (len, ...bounds) => {
    let List = [];
    for (let index = 0; index < len; index++) List.push(randInt(...bounds));
    return List;
}


// Generate andom x and y coordinates
let xRand = (n) => randInt(n, window.innerWidth - n);
let yRand = (n) => randInt(n, window.innerHeight - n);
let randCoord = (n) => [xRand(n), yRand(n)];


// Generate random color
let randColor = (exclude=(val=>val<0||val>255)) => {
    let col = () => Math.abs(randInt(0, 255, exclude));
    let [c1, c2, c3] = [col(), col(), col()]
    return {
        col:`rgb(${c1},${c2},${c3})`,
        val: [c1, c2, c3]
    };
}


class Canvas {

    constructor() {
        // Create tag and assign attributes
        this.tag = document.createElement('canvas');
        this.tagSetter();
        BODY.appendChild(this.tag);

        // Draw using context
        this.ctx = this.tag.getContext('2d');
        this.defaultColor = THEME_COLOR.color;

        // Access variables
        this.lineColor = THEME_COLOR.opposite;
        this.partyTime = false;
        this.lineLength = 10;

        // Render stuff on canvas
        this.render();
    }

    render(obj = this) {

        const randomizeLineColorTag   = document.getElementById('randomize-line-color');
        const pickLineColorTag   = document.getElementById('line-color-picker');
        pickLineColorTag.defaultValue = '#00ffff';
        const partyTimeTag   = document.getElementById('party-time');
        const randomizeCanvasColorTag   = document.getElementById('randomize-canvas-color');
        const pickCanvasColorTag   = document.getElementById('bg-color-picker');
        pickCanvasColorTag.defaultValue = '#00ffff';

        randomizeLineColorTag.addEventListener('click', () => this.lineColor = randColor().col);
        randomizeCanvasColorTag.addEventListener('click', () => THEME_COLOR.set(randColor().col));
        partyTimeTag.addEventListener('click', () => this.partyTime = !this.partyTime);

        function bouncingPoints(radius, coordinates = randCoord(), velocity, color = obj.defaultColor) {
            this.radius = radius;
            this.coordinates = coordinates;
            this.color = obj.lineColor;

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

            this.bounceRadius = (currentIndex, points=[]) => {
                for (const point of points.slice(0, currentIndex)) {
                    let col = obj.lineColor;
                    if (obj.partyTime) col = randColor().col;
                    if (distance(this.coordinates, point.coordinates) <= (this.radius + point.radius + obj.lineLength))
                        obj.line(this.coordinates, point.coordinates, 2, col);
                }
            }
        }

        let points = [];
        let pointCount = 100;
        for (let i = 0; i < pointCount; i++) {
            points.push(
                new bouncingPoints(
                    80,
                    randCoord(50),
                    randList(2, -4, 4, (val => val == 0)),
                    this.lineColor
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

        // Set tag id
        tag.id = 'canvas';

        // Set canvas dimensions
        tag.width = window.innerWidth;
        tag.height = window.innerHeight;
        window.addEventListener(
            'resize',
            (event) => {
                let width = event.currentTarget.innerWidth;
                let height = event.currentTarget.innerHeight;
                tag.width = width; BODY.width = width;
                tag.height = height; BODY.height = height;
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

