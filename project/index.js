const canvas = document.getElementById('drawing-area')
const rectangleArray = [] //tableau des rectangles
var coordArrayMD = [] //tableau des coordonées du mouse down

//on force la height et width du canvas pour qu'elle s'adapte à l'écran
//on est obligé de faire comme ça, sinon le canvas bug
canvas.setAttribute('height', canvas.parentElement.scrollHeight)
canvas.setAttribute('width', canvas.parentElement.scrollWidth)

const startDrawing = (event) => {
    console.log(event)
    coordArrayMD = [event.offsetX, event.offsetY]
    canvas.addEventListener('mouseup', stopDrawing)
}

const stopDrawing = (event) => {
    console.log(event)
    let coordArrayMU = [event.offsetX, event.offsetY]
    //initialisation des data pour le rectangle
    let dataRect = [...coordArrayMD, Math.abs(coordArrayMD[0] - coordArrayMU[0]), Math.abs(coordArrayMD[1] - coordArrayMU[1])]

    if (coordArrayMD[0] > coordArrayMU[0]) {
        dataRect[0] = coordArrayMU[0]
    }

    if (coordArrayMD[1] > coordArrayMU[1]) {
        dataRect[1] = coordArrayMU[1]
    }

    let rectangle = canvas.getContext('2d')
    rectangle.fillStyle = getRandomColor()
    console.log(dataRect)
    rectangle.fillRect(...dataRect)
    canvas.removeEventListener('mouseup', stopDrawing)
}

/**
 * Génère une couleur aléatoire sous la forme '#XXXXXX'
 * 
 * La fonction est écrite de manière plus classique uniquement pour montrer que je sais initialiser une fonction de multiple manière.
 */
function getRandomColor() {
    //génère un hexadécimal aléatoire
    let color = Math.round(0xffffff * Math.random()).toString(16);

    //au cas où le résultat est trop petit, rempli le reste de 0 pour éviter les bug
    const filler = '000000'
    color = filler.substring(0, 6 - color.length) + color

    return `#${color}`
}

canvas.addEventListener('mousedown', startDrawing)