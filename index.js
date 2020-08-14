document.addEventListener('keypress', function (e) {
    if (e.keyCode === 32) {
        control()
    }
})

document.addEventListener('keypress', function (e) {
    if (e.code === "KeyE") {
        console.log("Document cookie: " + document.cookie)
    }
})

/* DOM objects */
const footballPitch = document.querySelector('.footballPitch')
const grid = document.querySelector('.grid')
const attacker = document.querySelector('.hkane')
const score = document.querySelector('#score')
const highScore = document.querySelector('#HSSpan')
const gameOver = document.querySelector('.gameOver')

/* Sounds */
const jumpWav = document.createElement("AUDIO")
const gameOverWav = document.createElement("AUDIO")
const milestone = document.createElement("AUDIO")
jumpWav.src = "resources/sounds/jump.wav"
gameOverWav.src = "resources/sounds/gameOver.wav"
milestone.src = "resources/sounds/milestone.wav"

let isJumping = false
const gravity = 0.9
let points = 0

let button = document.querySelector("#restartButton")
button.addEventListener("click", function () {
    window.location.reload()
})

setHighScore()

function control() {
    if (!isJumping) {
        isJumping = true
        jump()
    }
}

let position = 0

function jump() {
    jumpWav.play()
    let count = 0
    let timerId = setInterval(function () {
        /* When count is 15, move attacker back to original position */
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
                attacker.style.bottom = position + 'px'
                // attacker.style.left = position + 'px'

            }, 20)
        }

        isJumping = true
        count++
        position += 30
        position = position * gravity
        attacker.style.bottom = position + 'px'
        // attacker.style.left = position + 'px'
    }, 20)
}

generateObstacles()

function generateObstacles() {
    let stopTimeout
    let random = Math.random() * 4000
    let obstaclePosition = 1000
    const obstacle = document.createElement('div')
    obstacle.classList.add('defender')
    grid.appendChild(obstacle)
    obstacle.style.left = obstaclePosition + 'px'



    let obstacleTimer = setInterval(function () {
        // score.style.animation = 'none'
        obstaclePosition -= 20
        obstacle.style.left = obstaclePosition + 'px'

        /* If the attacker and defender collide, stop the game */
        if (obstaclePosition > 0 && obstaclePosition < 60 && position < 60) {
            if (grid.lastChild.className === 'defender') grid.removeChild(grid.lastChild)
            clearInterval(obstacleTimer)
            clearTimeout(stopTimeout)
            gameOverWav.play()

            /* Stop the pitch scroll effect and pause in place */
            let computedStyle = window.getComputedStyle(footballPitch)
            let leftOffset = computedStyle.left
            footballPitch.style.animation = 'none'
            footballPitch.style.left = leftOffset

            if (points > Number(document.cookie.substr(10,11))) {
                document.cookie = "highScore=" + points + "; expires=Sun, 3 Feb 2030 12:00:00 UTC; path=/"
                setHighScore()
            }

            /* Show game over div */
            gameOver.style.display = 'block'
            console.log(document.cookie)

        }

        /* Remove any defenders once they move left of the attacker, increment score */
        while (grid.hasChildNodes()) {
            let child = grid.lastChild
            if (Number(child.className === 'defender' && child.style.left.replace('px', '')) < -100 ) {
               grid.removeChild(grid.lastChild)
                points++
                score.innerHTML = points.toString()
                if (points % 10 === 0) milestone.play()
                /*score.animate(KeyframeEffect.)*/
                score.style.animation = 'scoreIncrement 1s linear infinite'
            } else {
                break
            }

        }

    }, 20)

    stopTimeout = setTimeout(generateObstacles, random)
}

function setHighScore() {
    if (document.cookie.length > 0) highScore.innerHTML = document.cookie.substr(10, 11);
}

