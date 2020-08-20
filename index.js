/* DOM objects */
const stadium = document.querySelector('.stadium')
const grass = document.querySelector('.grass')
const grid = document.querySelector('.grid')
const player = document.querySelector('.player')
const score = document.querySelector('#score')
const highScore = document.querySelector('#hsScore')
const gameOverDiv = document.querySelector('.gameOver')
const goSpan = document.querySelector('#GOspan')

/* Sounds */
const jumpWav = document.createElement("AUDIO")
const gameOverWav = document.createElement("AUDIO")
const milestone = document.createElement("AUDIO")
const point = document.createElement('AUDIO')
jumpWav.src = "resources/sounds/jump.wav"
gameOverWav.src = "resources/sounds/gameOver.wav"
milestone.src = "resources/sounds/milestone.wav"
point.src = "resources/sounds/point.wav"

/* Paths to images */
const defenders = ["resources/img/defender_run1.png", "resources/img/defender_run1.png", "resources/img/defender_run1.png"]
let defImage = 0

let isJumping = false
const gravity = 0.9
let points = 0
let startGame = false
let gameOver = false

/* Event listeners */

document.addEventListener('keypress', function (e) {
    if (e.keyCode === 32) {
        control()
    }
})

document.getElementById('startGame').addEventListener('click', function (e) {

    // todo: remove this not sure I need it
    let myWorker = new Worker('worker.js')
    myWorker.postMessage('message sent to worker')
    myWorker.onmessage = function (e) {
        console.log('worker reply in index.js: ' + e.data)
    }

    startGame = true
    document.querySelector('.playGame').style.display = "none"
    document.querySelector('.scoreBoard').style.display = "block"
    stadium.style.animation = "slideshow 10s linear infinite"
    grass.style.animation = "slideshow 20s linear infinite"
    // todo: start all animations!
    generateObstacles()
    setInterval(changePlayerBG, 200, "attacker")
})

document.addEventListener('keypress', function (e) {
    if (e.code === "KeyE") {
        console.log("Document cookie: " + document.cookie)
    }
})

document.querySelector("#restartButton").addEventListener("click", function () {
    window.location.reload()
})


/* If there is a highScore cookie display the value in the HSSpan */
setHighScore()


function control() {
    if (!isJumping) {
        isJumping = true
        jump()
    }
}

let playerImage = 0;
// let clearPlayerAnimation = setInterval(changePlayerBG, 200, "attacker")
// setTimeout(changePlayerBG, 1000)

/* Pass in a string of the player type , refactor player to attacker? */
function changePlayerBG(playerType) {
    if (!gameOver) {
        playerImage++
        player.style.backgroundImage = "url(\"resources/img/" + playerType + "_run" + playerImage.toString() + ".png\")"
        if (playerImage === 2) playerImage = 0
    }
}

function changeDefenderBG(obstacle) {
    console.log("bg: " + obstacle.style.backgroundImage)
    if (obstacle.style.backgroundImage === 'url(\"resources/img/defender_run1.png\")') {
        console.log('henlo')
        obstacle.style.backgroundImage = "url(\"resources/img/defender_run2.png\")"
    } else obstacle.style.backgroundImage = "url(\"resources/img/defender_run1.png\")"
}

let position = 0

function jump() {
    jumpWav.play()
    let count = 0
    let timerId = setInterval(function () {
        /* When count is 15, move player back to original position */
        if (count === 15) {
            clearInterval(timerId)
            let downTimerId = setInterval(function () {
                if (count === 0) {
                    clearInterval(downTimerId)
                    isJumping = false
                }
                position -= 5
                count--
                position = position * gravity
                if (position < 0) position = 0
                player.style.bottom = position + 'px'
                // player.style.left = position + 'px'

            }, 20)
        }

        isJumping = true
        count++
        position += 30
        position = position * gravity
        player.style.bottom = position + 'px'
        // player.style.left = position + 'px'
    }, 20)
}


let clearDefAnimArray = []

function generateObstacles() {
    let stopTimeout
    let random = Math.random() * 3000
    console.log('random: ' + random)
    /* Prevents (near) instant spawning of defender */
    if (random < 200) random = 200

    let obstaclePosition = 1000

    const obstacle = document.createElement('div')
    obstacle.classList.add('defender')

    /* Stores all setInterval return values so we can use them with clearInterval later */
    clearDefAnimArray.push(setInterval(changeDefenderBG, 200, obstacle))
    console.log(clearDefAnimArray)



    grid.appendChild(obstacle)
    obstacle.style.left = obstaclePosition + 'px'



    let obstacleTimer = setInterval(function () {
        // score.style.animation = 'none'
        obstaclePosition -= 20
        obstacle.style.left = obstaclePosition + 'px'

        /* If the player and defender collide, stop the game */
        if (obstaclePosition > 0 && obstaclePosition < 60 && position < 60) {
            if (grid.lastChild.className === 'defender') grid.removeChild(grid.lastChild)
            clearInterval(obstacleTimer)
            clearTimeout(stopTimeout)

            gameOverWav.play()

            /* Remove any children divs that are continuously moving left */ // todo: put code in function?
            while (grid.hasChildNodes()) {
                let child = grid.lastChild
                if (child.className === 'defender') {
                    grid.removeChild(grid.lastChild)
                } else break

            }
            for (let i = 0; i < clearDefAnimArray.length; i++) {
                console.log(clearDefAnimArray[i])
                clearInterval(clearDefAnimArray[i])
            }

            /* Stop the pitch scroll effect and pause in place */
            let computedStyle = window.getComputedStyle(stadium)
            let stadiumOffset = computedStyle.left
            stadium.style.animation = 'none'
            stadium.style.left = stadiumOffset
            stadium.style.opacity = "50%"

            /* Stop the grass scroll effect and pause in place */
            let grassComputed = window.getComputedStyle(grass)
            let grassOffset = grassComputed.left
            grass.style.animation = 'none'
            grass.style.left = grassOffset
            grass.style.opacity = "50%"

            // todo re:factor^2
            gameOver = true

            /* Update the high score cookie if scored points > cookie data */
            if (points > Number(document.cookie.substr(10,11))) {
                document.cookie = "highScore=" + points + "; expires=Sun, 3 Feb 2030 12:00:00 UTC; path=/"
                highScore.style.animation = 'scoreHighlight 1s linear infinite'
                setHighScore()
            }

            /* Show game over div */
            gameOverDiv.style.display = 'block'
            // goSpan.style.animation = "gameOverAnim 10s linear infinite"
            // console.log(document.cookie)

        }

        /* Remove any defenders once they move left of the player, increment score */
        while (grid.hasChildNodes()) {
            let child = grid.lastChild
            if (child.className === 'defender'
                && Number(child.style.left.replace('px', '')) < -100 ) {
                grid.removeChild(grid.lastChild)
                points++
                /* Asynchronously increment the score? Don't skip points? */
                setTimeout(scoreIncrementer, 300)
                // score.innerHTML = points.toString()
                // point.play()
                if (points % 10 === 0) milestone.play()
                score.style.animation = 'scoreHighlight 1s linear infinite'
                /* This allows adding the animation again and again, waits until animation completed */
                setTimeout(removeAnimation, 1000)

                /* Clears all intervals from any defender obstacles which have been created */
                console.log('clearDefAnimArray;' + clearDefAnimArray)
                for (let i = 0; i < clearDefAnimArray.length; i++) {
                    console.log(clearDefAnimArray[i])
                    clearInterval(clearDefAnimArray[i])
                }
                clearDefAnimArray = []
            } else {
                break
            }
        }
    }, 20)

    stopTimeout = setTimeout(generateObstacles, random)
}

function removeAnimation() {
    score.style.animation = 'none'
}

function scoreIncrementer() {
    score.innerHTML = points.toString()
    point.play()
}

function setHighScore() {
    if (document.cookie.length > 0) highScore.innerHTML = document.cookie.substr(10, 11);
}

