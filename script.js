// Variáveis globais
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let playerX = 0;
let nivel = 1;
let speed = 3;               // velocidade dos objetos (pixels por frame)
let gameContainer;
let gameInterval;
let stars = [];
const playerSpeed = 50;     // pixels por movimento
const pointsPerLevel = 10;   // pontos necessários para subir 1 nível
const speedIncrement = 1.0;
let isPlayerDisabled = false;
const disableDuration = 4000;
let vidas = 6;
let healthBar;
const maxVidas = 6;
const gameOverSound = new Audio('game_over.mp3');
const meteoroSound = new Audio('explosao.mp3');
const loseLifeSound = new Audio('perder.mp3');
let isPaused = false;
let disableTimeout = null;
let disableStartedAt = null;
let disableRemaining = disableDuration;

// Inicializa o jogo
window.onload = function() {
    player = document.getElementById('player');
    gameContainer = document.getElementById('game-container');
    healthBar = document.getElementById('health-bar-container');
    playerX = (gameContainer.clientWidth / 2 - player.offsetWidth / 2);
    player.style.left = playerX + "px";


    // 2. Chame a função de inicialização AQUI!
    initializeHealthBar();

    // Configura controles
    setupControls();

    // Exibe HUD inicial (garanta que exista um elemento com id="level" no HTML)
    document.getElementById('score').innerText = `Pontos: ${score}`;
    document.getElementById('level').innerText = `Nível: ${nivel}`;
    document.getElementById("recorde").textContent = "Recorde: " + highScore;
    document.getElementById('pause-btn').addEventListener('click', togglePause);


    // Inicia o loop do jogo
    gameInterval = setInterval(gameLoop, 35); // 20 FPS

    // Cria estrelas a cada 2.5 segundos
    setInterval(() => {
        if (!isPaused)createStar();
    }, 2500);
    
    // cria meteoros a cada 4.5 segundos
    this.setInterval(() => {
        if (!isPaused)createMeteoro();
    }, 4500);

    // cria vida a cada 30 segundos
    setInterval(() => {
        if (!isPaused)createvida();
    }, 30000);

}

function atualizarPlacar() {
    document.getElementById("score").textContent = "Pontos: " + score;
    document.getElementById("level").textContent = "Nível: " + nivel;
    document.getElementById("recorde").textContent = "Recorde: " + highScore;
}



function initializeHealthBar() {
    for (let i = 0; i < maxVidas; i++) {
        const square = document.createElement('div');
        square.classList.add('health-square');
        // Usamos um ID para que possamos referenciá-lo facilmente mais tarde
        square.id = `hp-${i}`; 
        healthBar.appendChild(square);
    }
}


function loseLife() {
    if (vidas <= 0) return; // Evita quebra se já estiver em Game Over

    // 1. Diminui a contagem de vida
    vidas--;


    loseLifeSound.pause();
    loseLifeSound.currentTime = 0;
    loseLifeSound.play();



    // 2. Atualiza o visual (torna o último quadrado visível em preto)
    const squareToRemove = document.getElementById(`hp-${vidas}`);
    if (squareToRemove) {
        // Remove a cor vermelha para "sumir" o quadrado
        squareToRemove.style.backgroundColor = 'transparent';
        squareToRemove.style.borderColor = 'transparent';
    }

    // 3. Verifica Game Over
    if (vidas <= 0) {
        gameOver();
    }
}

function recoverLife() {
    if (vidas >= maxVidas) return; // Evita ultrapassar o máximo
    
    //recupera uma vida
    vidas++;

    //restaura quadrado correrspondente
    const squareToRestore = document.getElementById(`hp-${vidas - 1}`);

    if (squareToRestore) {
        squareToRestore.style.backgroundColor = 'red';
        squareToRestore.style.borderColor = 'red';
    }
}

function gameOver() {
    
    // ✅ 1. Toca o som de Game Over
    gameOverSound.pause();
    gameOverSound.currentTime = 0;
    gameOverSound.volume = 1.0;
    gameOverSound.play();

    // 2. Para o loop do jogo
    clearInterval(gameInterval);

   if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }

    atualizarPlacar(); // para garantir que o recorde apareça atualizado
    document.getElementById("final-score").textContent = "Sua pontuação: " + score;
    document.getElementById("game-over-screen").style.display = "block";
    document.getElementById("pause-btn").style.display = "none";


    // ✅ 3. Mostra a tela de Game Over
    const gameOverScreen = document.getElementById('game-over-screen');
    document.getElementById('final-score').innerText = `Seus Pontos: ${score}`;
    gameOverScreen.style.display = 'flex'; // Torna a tela visível
}

function setupControls() {
    document.addEventListener('keydown', function(e) {
        if (isPaused) return; // Se o jogo estiver pausado, não processa movimentos

        // 🔊 Desbloqueia som
        if (!gameOverSound._unlocked) {
            gameOverSound.play().then(() => {
                gameOverSound.pause();
                gameOverSound.currentTime = 0;
                gameOverSound._unlocked = true;
            }).catch(err => console.log(err));
        }

        if (isPlayerDisabled) return;

        const containerWidth = gameContainer.clientWidth;
        const playerWidth = player.offsetWidth;

        switch(e.key) {
            case 'ArrowLeft':
                playerX -= playerSpeed;
                if (playerX < 0) playerX = 0;
                break;

            case 'ArrowRight':
                playerX += playerSpeed;
                if (playerX > containerWidth - playerWidth) {
                    playerX = containerWidth - playerWidth;
                }
                break;
        }

        player.style.left = playerX + "px";
    });
}



function createStar() {
    const star = document.createElement('div');
    star.classList.add('star');

    // Posição horizontal aleatória
    const randomX = Math.random() * (gameContainer.clientWidth - 30);
    star.style.left = randomX + 'px';

    // começa acima da tela (ou do container)
    star.style.top = '-40px';

    gameContainer.appendChild(star);
    stars.push(star);
}

function createMeteoro() {
    const meteoro = document.createElement('div');
    meteoro.classList.add('meteoro');

    // Posição horizontal aleatória
    const randomX = Math.random() * (gameContainer.clientWidth - 30);
    meteoro.style.left = randomX + 'px';

    // começa acima da tela
    meteoro.style.top = '-40px';

    gameContainer.appendChild(meteoro);
    // por enquanto tratamos meteoros como estrelas
    stars.push(meteoro);
}

function createvida() {
    const vida = document.createElement('div');
    vida.classList.add('vida');

    // Posição horizontal aleatória
    const randomX = Math.random() * (gameContainer.clientWidth - 30);
    vida.style.left = randomX + 'px';

    // começa acima da tela
    vida.style.top = '-40px';

    gameContainer.appendChild(vida);
    stars.push(vida);
}

function gameLoop() {
    if (isPaused) return; // Se o jogo estiver pausado, não atualiza nada

    // Verifica colisões
    const playerRect = player.getBoundingClientRect();

    for (let i = stars.length - 1; i >= 0; i--) {
        const star = stars[i];

        // Move o objeto para baixo usando a velocidade atual
        // usa style.top (se existir) ou offsetTop como fallback
        const currentTop = parseFloat(star.style.top) || star.offsetTop || 0;
        star.style.top = (currentTop + speed) + "px";

        // obtém a posição atualizada
        const starRect = star.getBoundingClientRect();

        // Verifica se a estrela saiu da tela (remove)
        if (star.offsetTop > gameContainer.clientHeight) {
            star.remove();
            stars.splice(i, 1);
            if (star.classList.contains('star')) {
                loseLife(); }
            continue;
        }

        // Verifica colisão com o jogador
        if (
            playerRect.left < starRect.right &&
            playerRect.right > starRect.left &&
            playerRect.top < starRect.bottom &&
            playerRect.bottom > starRect.top
        ) {
            // Coletou a estrela (ou bomba tratada como estrela por ora)
            star.remove();
            stars.splice(i, 1);

            if (star.classList.contains('meteoro') || star.classList.contains('meteoro')) {
                handleMeteoroCollision();
            } else if (star.classList.contains('vida')) {
                recoverLife();
            } else {
                // É uma estrela
                score++;
                document.getElementById('score').innerText = `Pontos: ${score}`;

                // Verifica subida de nível e aumenta velocidade
                const newLevel = Math.floor(score / pointsPerLevel) + 1;
                if (newLevel > nivel) {
                    nivel = newLevel;
                    speed += speedIncrement; // Aumenta a velocidade
                    document.getElementById('level').innerText = `Nível: ${nivel}`;
                }
            }
        }
    }
}

function handleMeteoroCollision() {
    // Se o jogador já estiver desabilitado, ignora
    if (isPlayerDisabled) return;

    meteoroSound.pause();
    meteoroSound.currentTime = 0;
    meteoroSound.play();

    // 1. Entra em estado de paralisação
    isPlayerDisabled = true;
    
    // Opcional: Adiciona um efeito visual
    player.style.opacity = '0.5'; 
    player.style.filter = 'grayscale(100%)';

    console.log(`Colisão com Meteoro! Jogador paralisado por ${disableDuration / 1000}s.`);
    
    // 2. Agenda a função para reativar o jogador após o tempo
    // Aqui ficava o blocosetTimeout

    disableRemaining = disableDuration; // Reset para o tempo total
    schedulePlayerReactivation();
}

function pauseGame() {
    if (isPaused) return; // Já está pausado
    isPaused = true;

    //preserva o tempo restante se o jogador estiver desabilitado
    if (disableTimeout !== null) {
        clearTimeout(disableTimeout);
        disableTimeout = null;

        const elapsed = Date.now() - disableStartedAt;
        disableRemaining = Math.max(
            0,
            disableRemaining - elapsed
        );
    }
        
    document.getElementById('pause-btn').textContent = '▶ Continuar';
}

function resumeGame() {
    if (!isPaused) return; // Já está em execução
    isPaused = false;

    // Se o jogador estava desabilitado, retoma o tempo restante
    if (isPlayerDisabled) {
        schedulePlayerReactivation();
    }

    document.getElementById('pause-btn').textContent = '⏸ Pausar';
}

function togglePause() {
    if (isPaused) {
        resumeGame();
    } else {
        pauseGame();
    }
}

function schedulePlayerReactivation() {
    if (disableTimeout !== null) {
        clearTimeout(disableTimeout);
    }

    disableStartedAt = Date.now();

    disableTimeout = setTimeout(() => {
        disableTimeout = null;
        disableRemaining = disableDuration; // Reset para a próxima vez
        isPlayerDisabled = false;

        player.style.opacity = '1';
        player.style.filter = 'none';


        console.log("Jogador reativado!");
    }, disableRemaining);

}


function restartGame() {
    isPaused = false;
    if (disableTimeout !== null) {
        clearTimeout(disableTimeout);
        disableTimeout = null;
    }

    disableRemaining = disableDuration;
    disableStartedAt = null;


    // 1. Reseta variáveis
    score = 0;
    nivel = 1;
    speed = 3;
    vidas = maxVidas;
    isPlayerDisabled = false;
    player.style.opacity = '1';
    player.style.filter = 'none';

    document.getElementById('pause-btn').textContent =
    '⏸ Pausar';
    document.getElementById('pause-btn').style.display = 'block';

    // 2. Remove estrelas e meteoros existentes
    stars.forEach(star => star.remove());
    stars = [];

    // 3. Atualiza HUD
    atualizarPlacar();

    // 4. Reseta o player (posição inicial)
    player.style.left = (gameContainer.clientWidth / 2 - player.offsetWidth / 2) + 'px';

    // 5. Reseta a barra de vida
    healthBar.innerHTML = '';
    initializeHealthBar();

    // 6. Esconde a tela de Game Over
    document.getElementById('game-over-screen').style.display = 'none';

    // 7. Reinicia o loop do jogo
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 35);
}

document.getElementById('restart-btn').addEventListener('click', restartGame);
