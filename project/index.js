const canvas = document.getElementById('drawing-area')
const context = canvas.getContext('2d')
const stateList = ['standby', 'animating', 'delete']
var rectangleArray = [] //tableau des rectangles
var coordArrayMD = [] //tableau des coordonées du mouse down

//on force la height et width du canvas pour qu'elle s'adapte à l'écran
//on est obligé de faire comme ça, sinon le canvas bug
canvas.setAttribute('height', canvas.parentElement.scrollHeight)
canvas.setAttribute('width', canvas.parentElement.scrollWidth)

/**
 * Déclenche le début du dessin
 * @param {Event} event 
 */
const startDrawing = (event) => {
    //sauvegarde des coordonées pour une réutilisation ultérieure
    coordArrayMD = [event.offsetX, event.offsetY]
    canvas.addEventListener('mouseup', stopDrawing)
}

/**
 * Indique que l'utilisateur à fini de dessiner, et trace le rectangle voulu
 * @param {Event} event 
 */
const stopDrawing = (event) => {
    let coordArrayMU = [event.offsetX, event.offsetY]
    //Si le rectangle créé ne serai pas trop petit pour interagir avec (exemple à cause d'un double click glissé)
    if (Math.abs(coordArrayMD[0] - coordArrayMU[0]) > 5
        && Math.abs(coordArrayMD[1] - coordArrayMU[1]) > 5
    ) {
        //initialisation des data pour le rectangle
        let dataRect = [/*Coordonées X et Y*/...coordArrayMD, /*Largeur*/ Math.abs(coordArrayMD[0] - coordArrayMU[0]), /*Hauteur*/Math.abs(coordArrayMD[1] - coordArrayMU[1])]

        //gestion du cas où l'utilisateur ne trace pas son rectangle de haut en bas et de droite à gauche
        if (coordArrayMD[0] > coordArrayMU[0]) {
            dataRect[0] = coordArrayMU[0]
        }
        if (coordArrayMD[1] > coordArrayMU[1]) {
            dataRect[1] = coordArrayMU[1]
        }

        //traçage du rectangle
        let rectangle = new Rectangle(...dataRect)
        rectangleArray.push(rectangle)
    }
    canvas.removeEventListener('mouseup', stopDrawing)
}

/**
 * Prend le rectangle sur lequel on clique, et le met en état animating
 * @param {Event} event 
 */
const rectangleToRotate = (event) => {
    let clickCoordinates = [event.offsetX, event.offsetY]
    //On cherche le rectangle sur lequel on à cliqué. On fait un findLast pour gérer proprement le cas
    //où l'utilisateur empile les rectangles
    let rectangleToRotate = rectangleArray.findLast((rectangle) => {
        return clickCoordinates[0] >= rectangle.x
            && clickCoordinates[0] <= rectangle.x + rectangle.width
            && clickCoordinates[1] >= rectangle.y
            && clickCoordinates[1] <= rectangle.y + rectangle.height
    })
    //on verifie qu'on à trouvé un rectangle, histoire d'éviter les erreur dans la console en cas de double click dans le vide
    if (rectangleToRotate) {
        rectangleToRotate.state = stateList[1]
    }
}

/**
 * Fonction d'animation des rectangle, est appelé dans une boucle récursive
 */
const animateRectangles = () => {
    //compteur du nombre de rectangle actuellement en animation
    let toAnimateCounter = 0
    //on efface le canvas (malheureusement j'ai eu beau tout essayer on est obligé de passer par là)
    context.clearRect(0, 0, canvas.getAttribute('width'), canvas.getAttribute('height'))
    //pour chaque rectangle, on déclenche la fonction animateRectangle, qui va dessiner le rectangle et l'animer si necessaire
    rectangleArray.forEach((rectangle) => {
        rectangle.animateRectangle()
        if (rectangle.state == stateList[1]) {
            toAnimateCounter++
        }
    })
    // on repositionne normalement le canvas
    context.setTransform(1, 0, 0, 1, 0, 0);
    //si on a plus de rectangle à animer, on supprime tout les rectangle qui ont fait un tour complet
    if (!toAnimateCounter) {
        rectangleArray = rectangleArray.filter(rectangle => rectangle.state != stateList[2])
    }
    window.requestAnimationFrame(animateRectangles)
}

/**
 * Compare les aires des rectangles, puis colore de la même couleur (générer aléatoirement) les deux rectangles qui ont la plus petite différence d'aire.
 */
const compareArea = () => {
    //gestion du cas où l'utilisateur appuie sur le bouton alors qu'il n'y a pas 2 rectangle
    if (rectangleArray.length > 1) {
        //nos deux rectangles sélectionné
        let rectangle1
        let rectangle2
        //on trie les rectangles par aire, afin que la différence d'aire entre le premier 
        //et le deuxième soit toujours plus petite que celle entre le premier et le troisième
        const compareArray = [...rectangleArray].sort((rect1, rect2) => rect1.height * rect1.width - rect2.height * rect2.width)
        //on boucle sur chaque rectangle
        compareArray.forEach((rectangle, index) => {
            //ne fait le code que si l'on est pas au dernier index
            if (compareArray[index + 1]) {
                //Initialise rectangle 1 et 2, afin de pouvoir comparer
                if (rectangle1 && rectangle2) {
                    //si la différence d'aire de nos rectangles séléctionnés est supérieure à celle des rectangles qu'on compare
                    //alors les rectangles qu'on compare deviennent les rectangle séléctionnés
                    if (rectangle2.height * rectangle2.width - rectangle1.height * rectangle1.width > compareArray[index + 1].height * compareArray[index + 1].width - rectangle.height * rectangle.width) {
                        rectangle1 = rectangle
                        rectangle2 = compareArray[index + 1]
                    }
                }
                else {
                    rectangle1 = rectangle
                    rectangle2 = compareArray[index + 1]
                }
            }
        })
        //on génère la nouvelle couleur, et on change de couleur les deux rectangles
        const newColor = getRandomColor()
        rectangleArray.find(rectangle => rectangle.x == rectangle1.x && rectangle.y == rectangle1.y).color = newColor
        rectangleArray.find(rectangle => rectangle.x == rectangle2.x && rectangle.y == rectangle2.y).color = newColor
    }
    else {
        alert('Pas assez de rectangles')
    }
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

/**
 * la classe rectangle, le squelette de tout nos objets rectangles
 */
class Rectangle {
    constructor(x, y, width, height) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.color = getRandomColor()
        this.state = stateList[0]
        this.angle = 0
    }

    /**
     * Methode privée, dessine le rectangle
     * 
     * Si tempX et tempY ne sont pas défini, utilise le x et y par défaut du rectangle
     * @param {Number} tempX 
     * @param {Number} tempY 
     */
    _drawRectangle(tempX = undefined, tempY = undefined) {
        context.fillStyle = this.color
        context.fillRect(tempX || this.x, tempY || this.y, this.width, this.height)
    }

    /**
     * dessine le rectangle et l'anime si necessaire
     */
    animateRectangle() {
        //si le rectangle est dans l'état "animating", le dessine dans son propre contexte et l'anime
        if (this.state == stateList[1]) {
            this.angle = this.angle + (2 * Math.PI) / 360
            context.setTransform(1, 0, 0, 1, this.x + this.width / 2, this.y + this.height / 2)
            context.rotate(this.angle)
            this._drawRectangle(this.width / -2, this.height / -2)
            //si le rectangle à fait un tour complet, on le supprime
            if (this.angle >= 2 * Math.PI) {
                this.state = stateList[2]
            }
        }
        //sinon le dessine dans son propre contexte sans l'animer
        else {
            context.setTransform(1, 0, 0, 1, 0, 0);
            this._drawRectangle()
        }
    }

}

canvas.addEventListener('mousedown', startDrawing)
canvas.addEventListener('dblclick', rectangleToRotate)
//déclenche les animations
window.requestAnimationFrame(animateRectangles)