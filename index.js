document.addEventListener('keypress', function (e) {
    if (e.keyCode === 32) {
        control()
    }

})

/* DOM objects */
const footballPitch = document.querySelector('.footballPitch')
const grid = document.querySelector('.grid')
const attacker = document.querySelector('.hkane')
const score = document.querySelector('#score')
const gameOver = document.querySelector('.gameOver')

/* Sounds */
const jumpWav = document.createElement("AUDIO")
const gameOverWav = document.createElement("AUDIO")
jumpWav.src = "resources/sounds/jump.wav"
gameOverWav.src = "resources/sounds/gameOver.wav"

let isJumping = false
let gravity = 0.9
let points = 0

let button = document.querySelector("#restartButton")
button.addEventListener("click", function () {
    window.location.reload()
})

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

            }, 20)

        }

        isJumping = true
        count++
        position += 30
        position = position * gravity
        attacker.style.bottom = position + 'px'
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
            clearInterval(obstacleTimer)
            clearTimeout(stopTimeout)
            gameOverWav.play()
            footballPitch.style.animation = 'none'
            gameOver.style.display = 'block'
            if (grid.lastChild.className === 'defender') grid.removeChild(grid.lastChild)

        }

        /* Remove any defenders once they move left of the attacker, increment score */
        while (grid.hasChildNodes()) {
            let child = grid.lastChild
            if (Number(child.className === 'defender' && child.style.left.replace('px', '')) < -100 ) {
               grid.removeChild(grid.lastChild)
                points++
                score.innerHTML = points.toString()

                score.style.animation = 'scoreIncrement 1s linear infinite'
            } else {
                break
            }

        }

    }, 20)

    stopTimeout = setTimeout(generateObstacles, random)
}

