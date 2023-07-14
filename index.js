// Get head and body element
const BODY = document.body
const HEAD = document.head


// Get initial window dimensions
const initialWindowDimensions = [window.innerWidth, window.innerHeight];



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


// Handle color values
/** 
 * @param {String|Array[Int32]} input
 * @param {String} colorType 
 * @description valid color types - hex, rgb, rgb_list
*/
class Color {
    constructor(input, colorType) {
        switch (colorType) {
            case 'hex':
                this.rgb_list = Color.hexToRgb(input);
                break;
            case 'rgb_list':
                this.rgb_list = input;
                break;
            case 'rgb':
                this.rgb_list = input.slice(4, -1).split(',').map(v => Number(v));
                break;
            default:
                throw EvalError('Invalid color type: ' + colorType)
        }
        this.r = this.rgb_list[0];
        this.g = this.rgb_list[1];
        this.b = this.rgb_list[2];
        this.hex = Color.rgbListToHex(...this.rgb_list);
        let [c1, c2, c3] = this.rgb_list;
        this.rgb = `rgb(${c1},${c2},${c3})`;

    }

    static hexToRgb(hex = '#000000') {
        hex = hex.replace('#', '');
        if (hex.length != 6) {
            throw "Only six-digit hex colors are allowed.";
        }

        var aRgbHex = hex.match(/.{1,2}/g);
        var aRgb = [
            parseInt(aRgbHex[0], 16),
            parseInt(aRgbHex[1], 16),
            parseInt(aRgbHex[2], 16)
        ];
        return aRgb;
    }

    static rgbListToHex(r, g, b) {
        let componentToHex = (c) => {
            const hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    static random(exclude = (val => val < 10 || val > 255)) {
        let col = () => Math.abs(randInt(0, 255, exclude));
        return new Color([col(), col(), col()], 'rgb_list')
    }


}


class ThemeColor {
    constructor(canvas) {
        this.canvas = canvas;
        this.rootSelector = document.querySelector(':root');
        let D = ['--d1', '--d2', '--d3'].map(
            d => eval(getComputedStyle(this.rootSelector).getPropertyValue(d).slice(5, -1).replaceAll(' ', ''))
        );


        this.color = new Color(getComputedStyle(this.rootSelector).getPropertyValue('--theme-color'), 'rgb');
        this.opposite = new Color(D, 'rgb_list');

        // Get theme tags
        this.tabColorTag = document.getElementById('tab-color');
        this.randomizeCanvasColorTag = document.getElementById('randomize-canvas-color');
        this.pickCanvasColorTag = document.getElementById('bg-color-picker');
        this.pickCanvasColorPngTag = document.getElementById('bg-color-picker-png');
        // Get opposite theme tags
        this.randomizeLineColorTag = document.getElementById('randomize-line-color');
        this.pickLineColorTag = document.getElementById('line-color-picker');
        this.pickLineColorPngTag = document.getElementById('line-color-picker-png');

        // Set theme tags attributes
        this.set(this.color);
        this.randomizeCanvasColorTag.addEventListener('click', () => this.set(Color.random()));
        this.pickCanvasColorTag.addEventListener('input', () => this.set(new Color(this.pickCanvasColorTag.value, 'hex')));
        // Set opposite theme tags attributes
        this.setOpposite(this.opposite);
        this.randomizeLineColorTag.addEventListener('click', () => this.setOpposite(Color.random()));
        this.pickLineColorTag.addEventListener('input', () => this.setOpposite(new Color(this.pickLineColorTag.value, 'hex')));
    }

    set(color=this.color) {
        this.rootSelector.style.setProperty('--c1', color.r);
        this.rootSelector.style.setProperty('--c2', color.g);
        this.rootSelector.style.setProperty('--c3', color.b);
        this.color = new Color(getComputedStyle(this.rootSelector).getPropertyValue('--theme-color'), 'rgb');
        this.pickCanvasColorTag.defaultValue = this.pickCanvasColorTag.value = this.color.hex;
        this.pickCanvasColorPngTag.style.fill = this.color.hex;
        this.tabColorTag.content = this.color.hex;
    };
    
    setOpposite(color=this.opposite) {
        this.rootSelector.style.setProperty('--d1', color.r);
        this.rootSelector.style.setProperty('--d2', color.g);
        this.rootSelector.style.setProperty('--d3', color.b);
        this.opposite = new Color(getComputedStyle(this.rootSelector).getPropertyValue('--theme-color-opposite'), 'rgb');
        this.pickLineColorTag.defaultValue = this.pickLineColorTag.value = this.opposite.hex;
        this.pickLineColorPngTag.style.fill = this.opposite.hex;
        this.canvas.lineColor = this.opposite.hex;
    };
}




function bouncingPoints(radius, coordinates = randCoord(), velocity, canvas) {
    this.color = canvas.lineColor;
    this.radius = radius;
    this.coordinates = coordinates;

    let [x, y] = this.coordinates;
    let [dx, dy] = this.velocity = velocity;

    this.bounceWall = () => {
        // Ensure point does not go past wall
        let xImpactWall = x >= window.innerWidth || x <= 0;
        let yImpactWall = y >= window.innerHeight || y <= 0;

        if (xImpactWall) dx *= -1;
        if (yImpactWall) dy *= -1;

        x += dx; y += dy;

        this.coordinates[0] = x; this.coordinates[1] = y;
        this.velocity[0] = dx; this.velocity[1] = dy;
    }

    this.bounceRadius = (currentIndex, points = []) => {
        this.color = canvas.lineColor;
        for (const point of points.slice(0, currentIndex)) {
            if (distance(this.coordinates, point.coordinates) <= (this.radius + point.radius + canvas.lineLength))
                canvas.line(this.coordinates, point.coordinates, 2, this.color);
        }
    }
}


class Canvas {

    constructor(render) {
        // Access variables
        this.THEME_COLOR = new ThemeColor(this);
        this.lineColor = this.THEME_COLOR.opposite.hex;
        this.lineLength = 10;
        this.defaultColor = this.THEME_COLOR.color.hex;

        // Create tag and assign attributes
        this.tag = document.createElement('canvas');
        this.tag.id = 'main-canvas';
        this.tag.width = window.innerWidth;
        this.tag.height = window.innerHeight;
        window.addEventListener(
            'resize',
            (event) => {
                this.tag.width = BODY.width = event.currentTarget.innerWidth;
                this.tag.height = BODY.height = event.currentTarget.innerHeight;
            }
        );
        BODY.appendChild(this.tag);

        // Get canvas context
        this.ctx = this.tag.getContext('2d');

        // Render stuff on canvas
        render(this);
    }


    line(begin = [0, 0], end = [1, 1], thickness = 1, color = this.defaultColor) {
        this.ctx.beginPath();
        this.ctx.moveTo(...begin);
        this.ctx.lineTo(...end);
        this.ctx.lineWidth = thickness;
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
    }

}


const CANVAS = new Canvas(
    (canvas) => {

        let points = [];
        let pointCount = 70;
        for (let i = 0; i < pointCount; i++) {
            points.push(
                new bouncingPoints(
                    80,
                    randCoord(50),
                    randList(2, -4, 4, (val => val == 0)),
                    canvas
                )
            );
        }

        function animate() {
            requestAnimationFrame(animate);
            canvas.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            for (let i = 0; i < points.length; i++) {
                const point = points[i];
                point.bounceWall();
                point.bounceRadius(i, points);
            }
        }
        animate()

    }
);
BODY.style.visibility = 'visible';

