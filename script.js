// Game State
const gameState = {
  step: 1,
  points: 0,
  selectedOptions: {},
  formData: {},
  unlockedBonuses: [],
  loadingProgress: 0,
  currentVacancies: 147,
  timeLeft: { minutes: 18, seconds: 43 },
  audioEnabled: false,
  audioContext: null,
  audioBuffer: null,
}

// DOM Elements
const stepContent = document.getElementById("step-content")
const backBtn = document.getElementById("back-btn")
const pointsDisplay = document.getElementById("points-display")
const pointsValue = document.getElementById("points-value")
const notification = document.getElementById("notification")
const notificationText = document.getElementById("notification-text")
const confettiContainer = document.getElementById("confetti-container")
const audioElement = document.getElementById("audio-element")

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  initializeAudio()
  renderStep()
  setupEventListeners()

  // Start step 1 effects
  if (gameState.step === 1) {
    startLoadingProgress()
    startNotifications()
  }
})

// Audio Setup
async function initializeAudio() {
  try {
    gameState.audioContext = new (window.AudioContext || window.webkitAudioContext)()

    const response = await fetch("sounds/cashier-quotka-chingquot-sound-effect-129698.mp3")
    const arrayBuffer = await response.arrayBuffer()
    gameState.audioBuffer = await gameState.audioContext.decodeAudioData(arrayBuffer)
  } catch (error) {
    console.error("Error loading audio:", error)
  }
}

async function enableAudio() {
  if (!gameState.audioEnabled && gameState.audioContext) {
    try {
      if (gameState.audioContext.state === "suspended") {
        await gameState.audioContext.resume()
      }
      gameState.audioEnabled = true
      console.log("Áudio habilitado!")
    } catch (error) {
      console.error("Erro ao habilitar áudio:", error)
    }
  }
}

async function playSound(soundType) {
  if (!gameState.audioEnabled || !gameState.audioContext || !gameState.audioBuffer) {
    console.log("Áudio não habilitado ou não carregado.")
    return
  }

  try {
    if (gameState.audioContext.state === "suspended") {
      await gameState.audioContext.resume()
    }

    const source = gameState.audioContext.createBufferSource()
    source.buffer = gameState.audioBuffer

    const gainNode = gameState.audioContext.createGain()
    gainNode.gain.setValueAtTime(0.4, gameState.audioContext.currentTime)

    source.connect(gainNode)
    gainNode.connect(gameState.audioContext.destination)

    source.start(0)
    console.log(`Som ${soundType} tocado com sucesso!`)
  } catch (error) {
    console.error(`Erro ao tocar som ${soundType}:`, error)
  }
}

// Event Listeners
function setupEventListeners() {
  backBtn.addEventListener("click", () => {
    if (gameState.step > 1) {
      gameState.step--
      renderStep()
    }
  })
}

// Game Logic
function addPoints(points) {
  gameState.points += points
  updatePointsDisplay()
  animatePoints()
  showConfetti()
  playSound("chaChing")
}

function updatePointsDisplay() {
  if (gameState.points > 0) {
    pointsDisplay.style.display = "flex"
    pointsValue.textContent = `${gameState.points} pts`
  } else {
    pointsDisplay.style.display = "none"
  }

  // Update back button visibility
  backBtn.style.display = gameState.step > 1 ? "block" : "none"
}

function animatePoints() {
  pointsDisplay.classList.add("animate")
  setTimeout(() => {
    pointsDisplay.classList.remove("animate")
  }, 600)
}

function nextStep(pointsToAdd = 0) {
  if (pointsToAdd > 0) {
    addPoints(pointsToAdd)
  }

  setTimeout(
    () => {
      gameState.step++
      renderStep()
    },
    pointsToAdd > 0 ? 500 : 0,
  )
}

function goToStep(step) {
  gameState.step = step
  renderStep()
}

function handleOptionSelect(key, value, nextStepNum) {
  gameState.selectedOptions[key] = value
  if (nextStepNum) {
    setTimeout(() => goToStep(nextStepNum), 300)
  }
}

function unlockBonus(bonusName) {
  gameState.unlockedBonuses.push(bonusName)
  playSound("unlock")
}

// Loading Progress (Step 1)
function startLoadingProgress() {
  const interval = setInterval(() => {
    gameState.loadingProgress += 100 / 30
    if (gameState.loadingProgress >= 100) {
      gameState.loadingProgress = 100
      clearInterval(interval)
    }
    updateLoadingProgress()
  }, 100)
}

function updateLoadingProgress() {
  const progressText = document.querySelector(".loading-text")
  const progressBar = document.querySelector(".progress-bar")

  if (progressText) {
    progressText.textContent = `Carregando... ${Math.round(gameState.loadingProgress)}%`
  }
  if (progressBar) {
    progressBar.style.width = `${gameState.loadingProgress}%`
  }
}

// Notifications (Step 1)
function startNotifications() {
  const names = [
    "Mariane",
    "Carla",
    "Ana",
    "Juliana",
    "Patricia",
    "Fernanda",
    "Roberta",
    "Camila",
    "Beatriz",
    "Luciana",
  ]

  let notificationCount = 0
  const interval = setInterval(() => {
    if (notificationCount < 10) {
      const randomName = names[Math.floor(Math.random() * names.length)]
      showNotification(`${randomName} acabou de baixar o Script de inícios!`)
      gameState.currentVacancies = Math.max(93, gameState.currentVacancies - Math.floor(Math.random() * 6) - 3)
      notificationCount++
    } else {
      clearInterval(interval)
    }
  }, 5000)
}

function showNotification(text) {
  notificationText.textContent = text
  notification.classList.add("show")
  setTimeout(() => {
    notification.classList.remove("show")
  }, 3000)
}

// Countdown Timer (Step 12)
function startCountdown() {
  const interval = setInterval(() => {
    if (gameState.timeLeft.seconds > 0) {
      gameState.timeLeft.seconds--
    } else if (gameState.timeLeft.minutes > 0) {
      gameState.timeLeft.minutes--
      gameState.timeLeft.seconds = 59
    } else {
      gameState.timeLeft = { minutes: 18, seconds: 43 }
    }
    updateCountdown()
  }, 1000)
}

function updateCountdown() {
  const countdownTime = document.querySelector(".countdown-time")
  if (countdownTime) {
    const minutes = String(gameState.timeLeft.minutes).padStart(2, "0")
    const seconds = String(gameState.timeLeft.seconds).padStart(2, "0")
    countdownTime.textContent = `${minutes}:${seconds}`
  }
}

// Confetti Effect
function showConfetti() {
  const colors = ["#9333ea", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"]

  for (let i = 0; i < 100; i++) {
    setTimeout(() => {
      createConfettiPiece(colors[Math.floor(Math.random() * colors.length)])
    }, Math.random() * 500)
  }

  setTimeout(() => {
    confettiContainer.innerHTML = ""
  }, 5000)
}

function createConfettiPiece(color) {
  const piece = document.createElement("div")
  piece.className = "confetti-piece"
  piece.style.backgroundColor = color
  piece.style.left = Math.random() * 100 + "%"
  piece.style.top = "-10px"

  confettiContainer.appendChild(piece)

  // Animate the piece
  const duration = 3000 + Math.random() * 2000
  const endY = window.innerHeight + 100
  const endX = Math.random() * 200 - 100

  piece.animate(
    [
      { transform: "translateY(-10px) translateX(0) rotate(0deg)", opacity: 1 },
      { transform: `translateY(${endY}px) translateX(${endX}px) rotate(${Math.random() * 360}deg)`, opacity: 0 },
    ],
    {
      duration: duration,
      easing: "linear",
    },
  ).onfinish = () => {
    if (piece.parentNode) {
      piece.parentNode.removeChild(piece)
    }
  }
}

// Step Rendering
function renderStep() {
  updatePointsDisplay()

  switch (gameState.step) {
    case 1:
      renderStep1()
      break
    case 2:
      renderStep2()
      break
    case 3:
      renderStep3()
      break
    case 4:
      renderStep4()
      break
    case 5:
      renderStep5()
      break
    case 6:
      renderStep6()
      break
    case 7:
      renderStep7()
      break
    case 8:
      renderStep8()
      break
    case 9:
      renderStep9()
      break
    case 10:
      renderStep10()
      break
    case 11:
      renderStep11()
      break
    case 12:
      renderStep12()
      break
    default:
      stepContent.innerHTML = '<div class="text-center">Etapa não encontrada</div>'
  }
}

function renderStep1() {
  stepContent.innerHTML = `
        <div class="text-center space-y-8">
            <!-- Loading Progress -->
            <div class="mb-8">
                <div class="loading-text text-sm text-gray-600 mb-3 font-medium">Carregando... ${Math.round(gameState.loadingProgress)}%</div>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${gameState.loadingProgress}%"></div>
                    <div class="progress-glow"></div>
                </div>
            </div>

            <!-- Main Title -->
            <div class="space-y-4">
                <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                    Baixe Agora: 
                    <span class="text-red-600">O Script Gerador de Inícios</span>
                </h1>
                <p class="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Você está a poucas fases de destravar seus inícios e crescer absurdamente sua equipe a partir de hoje.
                </p>
            </div>

            <!-- Hero Image -->
            <div class="hero-image">
                <div class="hero-image-container">
                    <img src="pink-car-app-interface.png" alt="Script de Inícios">
                    <div class="hero-overlay"></div>
                </div>
                <div class="floating-icon top-left">
                    <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z"/>
                        <path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z"/>
                        <path d="M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z"/>
                    </svg>
                </div>
                <div class="floating-icon bottom-right">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
                    </svg>
                </div>
            </div>

            <!-- Game Rules -->
            <div class="card card-gradient max-w-2xl mx-auto">
                <div class="card-content">
                    <h3 class="font-bold text-xl mb-6 text-center text-purple-800">
                        🎮 A cada fase que você avançar aqui:
                    </h3>
                    <div class="space-y-4">
                        <div class="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
                            <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span class="text-white font-bold">✓</span>
                            </div>
                            <span class="text-gray-700 font-medium">Um bônus é desbloqueado.</span>
                        </div>
                        <div class="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
                            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                                </svg>
                            </div>
                            <span class="text-gray-700 font-medium">Você acumula pontos.</span>
                        </div>
                        <div class="flex items-start gap-4 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl border-2 border-yellow-300">
                            <svg class="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.22 49.22 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Z"/>
                            </svg>
                            <span class="text-gray-700 font-medium leading-relaxed">
                                No final, se chegar a 100 pontos, você desbloqueia e baixa o 
                                <strong class="text-purple-700">Script de Inícios Automáticos completo + bônus exclusivos</strong> 
                                — e já pode começar a fazer novos inícios ainda hoje.
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CTA Button -->
            <div class="space-y-6">
                <button onclick="enableAudio(); nextStep(0);" class="btn btn-primary btn-large w-full max-w-md mx-auto" style="position: relative; overflow: hidden;">
                    <div style="position: absolute; inset: 0; background: rgba(255,255,255,0.2); animation: pulse 2s infinite;"></div>
                    <span style="position: relative; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                        <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
                        </svg>
                        Sim, quero desbloquear meus inícios
                        <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
                        </svg>
                    </span>
                </button>

                <!-- Social Proof -->
                <div class="bg-white p-4 rounded-xl shadow-lg border-l-4 border-green-500 max-w-md mx-auto">
                    <p class="text-sm font-bold text-gray-800">${notificationText.textContent || "Carregando..."}</p>
                    <p class="text-xs text-gray-600 mt-1">
                        Corra! Faltam menos de <strong class="text-red-600">${gameState.currentVacancies}</strong> vagas para encerrar hoje.
                    </p>
                </div>
            </div>
        </div>
    `
}

function renderStep2() {
  stepContent.innerHTML = `
        <div class="text-center space-y-8">
            <!-- Points Achievement -->
            <div class="achievement-banner">
                <div class="points-text points-text-large">
                    <svg class="w-6 h-6 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                    🎯 Você conquistou: 15 pontos até agora!
                    <svg class="w-6 h-6 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                </div>
                <div class="text-sm text-purple-600">Parabéns! Você subiu de nível! 🎉</div>
            </div>

            <div class="space-y-6">
                <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                    Isso aqui também não é pra te vender um "coach ou cursinho motivacional"....
                </h1>
                <div class="max-w-3xl mx-auto">
                    <p class="text-lg text-gray-600 leading-relaxed">
                        Estamos aqui <strong class="text-purple-700">pra te mostrar como iniciar pessoas todos os dias com um mecanismo simples</strong>, que pode ser aplicado mesmo que você esteja sem tempo, travada ou sem saber o que fazer.
                    </p>
                </div>
            </div>

            <div class="space-y-6">
                <button onclick="enableAudio(); nextStep(15);" class="btn btn-primary btn-large w-full max-w-md mx-auto">
                    Quero continuar mesmo assim
                </button>
                <p class="text-sm text-gray-500 italic max-w-md mx-auto">
                    Clique no botão acima para <strong>subir de nível</strong> e receber as próximas instruções.
                </p>
            </div>
        </div>
    `
}

function renderStep3() {
  stepContent.innerHTML = `
        <div class="text-center space-y-8">
            <!-- Points Display -->
            <div class="achievement-banner">
                <div class="points-text points-text-large">
                    <svg class="w-6 h-6 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                    🎯 Você conquistou: ${gameState.points} pontos até agora!
                    <svg class="w-6 h-6 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                </div>
            </div>

            <div class="space-y-6">
                <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                    Você não precisa saber como começar
                </h1>
                <p class="text-lg text-gray-600 max-w-2xl mx-auto">
                    Mas precisa <strong class="text-purple-700">querer começar!</strong> Escolha uma opção abaixo:
                </p>
            </div>

            <!-- Interactive Options -->
            <div class="radio-group">
                <div class="radio-option green" onclick="selectOption('startChoice', 'strategy')">
                    <input type="radio" name="startChoice" value="strategy" class="radio-input">
                    <div class="radio-content">
                        <div class="radio-icon green">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
                            </svg>
                        </div>
                        <span class="radio-label">Quero iniciar usando uma estratégia simples, validada e pronta.</span>
                    </div>
                </div>
                <div class="radio-option red" onclick="selectOption('startChoice', 'later')">
                    <input type="radio" name="startChoice" value="later" class="radio-input">
                    <div class="radio-content">
                        <div class="radio-icon red">
                            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12,6 12,12 16,14"/>
                            </svg>
                        </div>
                        <span class="radio-label">Prefiro deixar pra outro dia.</span>
                    </div>
                </div>
            </div>

            <div class="space-y-6">
                <div class="bg-purple-50 p-4 rounded-xl border border-purple-200 max-w-md mx-auto">
                    <p class="text-purple-700 text-sm font-bold flex items-center justify-center gap-2">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20,6 9,17 4,12"/>
                            <path d="M21 8v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8"/>
                            <path d="M16 2v4"/>
                            <path d="M8 2v4"/>
                        </svg>
                        ✓ Você irá desbloquear +1 bônus ao responder
                    </p>
                </div>
                <button id="continue-btn-step3" onclick="continueStep3()" class="btn btn-primary btn-large w-full max-w-md mx-auto" style="display: none;">
                    Continuar
                </button>
            </div>
        </div>
    `
}

function selectOption(key, value) {
  gameState.selectedOptions[key] = value

  // Update radio buttons
  const radios = document.querySelectorAll(`input[name="${key}"]`)
  radios.forEach((radio) => {
    radio.checked = radio.value === value
  })

  // Show continue button
  const continueBtn = document.getElementById("continue-btn-step3")
  if (continueBtn) {
    continueBtn.style.display = "block"
  }
}

function continueStep3() {
  enableAudio()
  if (gameState.selectedOptions.startChoice === "strategy") {
    unlockBonus("Gerador de Cadastros")
    addPoints(15)
    setTimeout(() => goToStep(5), 500)
  } else {
    goToStep(4)
  }
}

function renderStep4() {
  stepContent.innerHTML = `
        <div class="text-center space-y-8">
            <div style="position: relative;">
                <div class="text-6xl md:text-7xl font-bold text-red-600 mb-8" style="font-family: 'Courier New', monospace; letter-spacing: 0.1em;">
                    VOCÊ
                    <br />
                    PERDEU
                </div>
                <div style="position: absolute; top: -1rem; left: 50%; transform: translateX(-50%); width: 4rem; height: 4rem; background-color: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 2rem;">💔</span>
                </div>
            </div>

            <div style="position: relative; width: 16rem; height: 16rem; margin: 0 auto;">
                <div style="position: absolute; inset: 0; background: linear-gradient(135deg, #fee2e2, #fecaca); border-radius: 50%;"></div>
                <img src="/placeholder.svg?height=256&width=256&text=Game+Over" alt="Você perdeu" style="position: relative; z-index: 10; width: 100%; height: 100%; border-radius: 50%;">
            </div>

            <div class="space-y-6">
                <h2 class="text-3xl font-bold text-gray-800">Você não está pronta.</h2>
                <p class="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    Infelizmente nosso script não é para você. Precisamos de pessoas comprometidas, pois ao aplicar o que vamos te ensinar você terá resultados incríveis.
                </p>
            </div>

            <button onclick="goToStep(3)" class="btn btn-primary btn-large w-full max-w-md mx-auto">
                Voltar e tentar novamente.
            </button>
        </div>
    `
}

function renderStep5() {
  stepContent.innerHTML = `
        <div class="text-center space-y-8">
            <!-- Achievement Header -->
            <div class="achievement-banner">
                <div class="points-text points-text-large">
                    <svg class="w-6 h-6 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                    🎯 Você conquistou: ${gameState.points} pontos até agora + um super bônus!
                    <svg class="w-6 h-6 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                </div>
            </div>

            <!-- Unlock Animation -->
            <div style="position: relative;">
                <div style="width: 6rem; height: 6rem; margin: 0 auto; background: linear-gradient(135deg, #7c3aed, #ec4899); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); animation: bounce 0.8s ease-out;">
                    <svg style="width: 3rem; height: 3rem; color: white;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <circle cx="12" cy="16" r="1"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                </div>
                <div style="position: absolute; top: -0.5rem; right: -0.5rem; width: 2rem; height: 2rem; background-color: #fbbf24; border-radius: 50%; display: flex; align-items: center; justify-content: center; animation: bounce 2s infinite;">
                    <svg style="width: 1rem; height: 1rem; color: #92400e;" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
                    </svg>
                </div>
            </div>

            <div class="space-y-4">
                <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight" style="background: linear-gradient(135deg, #7c3aed, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                    Bônus 1 desbloqueado!
                </h1>
                <h2 class="text-xl text-gray-600 font-semibold">Gerador de cadastros infinitos desbloqueado</h2>
            </div>

            <!-- Bonus Card -->
            <div class="card max-w-lg mx-auto" style="background: linear-gradient(135deg, white, #fdf2f8); border: 2px solid #e879f9; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
                <div class="card-content">
                    <div style="position: relative; margin-bottom: 1.5rem;">
                        <div style="aspect-ratio: 16/9; width: 100%; position: relative; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
                            <img src="gerador-cadastros-bonus.png" alt="Gerador de Cadastros" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div style="position: absolute; top: -0.75rem; right: -0.75rem; background-color: #ef4444; color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 700; animation: pulse 2s infinite;">
                            NOVO!
                        </div>
                    </div>
                    <div class="text-center space-y-2">
                        <div class="price-old">DE R$ 97,00</div>
                        <div class="price-new">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20,6 9,17 4,12"/>
                                <path d="M21 8v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8"/>
                                <path d="M16 2v4"/>
                                <path d="M8 2v4"/>
                            </svg>
                            POR ZERO
                        </div>
                    </div>
                </div>
            </div>

            <!-- Benefits -->
            <div class="max-w-2xl mx-auto space-y-6">
                <h3 class="text-2xl font-bold text-gray-800">Comece a atrair novos inícios ainda hoje.</h3>
                <p class="text-lg text-purple-600 font-semibold">(sem precisar correr atrás)</p>

                <div class="space-y-4">
                    <div class="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm">
                        <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span class="text-white text-xs font-bold">✓</span>
                        </div>
                        <p class="text-gray-700 leading-relaxed">Enquanto você dorme, esse mecanismo atrai mulheres interessadas em fazer parte da sua equipe.</p>
                    </div>
                    <div class="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm">
                        <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span class="text-white text-xs font-bold">✓</span>
                        </div>
                        <p class="text-gray-700 leading-relaxed">Quando acordar, já vai ter nomes esperando por você — prontas pra começar.</p>
                    </div>
                    <div class="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm">
                        <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span class="text-white text-xs font-bold">✓</span>
                        </div>
                        <p class="text-gray-700 leading-relaxed">E o melhor? Sem ter que ficar enviando mensagens aleatórias ou forçar convite.</p>
                    </div>
                </div>
            </div>

            <button onclick="enableAudio(); nextStep(20);" class="btn btn-primary btn-large w-full max-w-md mx-auto">
                Sim, quero desbloquear o próximo nível!
            </button>
        </div>
    `
}

function renderStep6() {
  stepContent.innerHTML = `
        <div class="text-center space-y-8">
            <!-- Points Display -->
            <div class="achievement-banner">
                <div class="points-text points-text-large">
                    <svg class="w-6 h-6 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                    🎯 Você conquistou: ${gameState.points} pontos até agora!
                    <svg class="w-6 h-6 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                </div>
            </div>

            <div class="space-y-6">
                <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                    Você não está sozinha. Elas também achavam que já tinham tentado de tudo...
                </h1>
                <p class="text-lg text-gray-600 max-w-3xl mx-auto">
                    Nossas alunas do Script/Robô gerador de inícios aplicaram com dedicação tudo que aprenderam e 
                    <span class="text-purple-600 font-bold">estão iniciando todos os dias.</span>
                </p>
            </div>

            <!-- Video Section -->
            <div class="video-container">
                <div class="video-wrapper">
                    <iframe
                        id="panda-c0fd1497-990b-4ea7-abc1-d689539df929"
                        src="https://player-vz-c232c405-6bd.tv.pandavideo.com.br/embed/?v=c0fd1497-990b-4ea7-abc1-d689539df929"
                        allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture"
                        allowfullscreen
                        fetchpriority="high">
                    </iframe>
                </div>
            </div>

            <!-- Testimonials -->
            <div class="testimonial-grid">
                <div class="testimonial-card">
                    <div class="testimonial-image">
                        <img src="whatsapp-testimonial-1.png" alt="Depoimento WhatsApp 1">
                    </div>
                    <div class="testimonial-badge">✓</div>
                </div>
                <div class="testimonial-card">
                    <div class="testimonial-image">
                        <img src="whatsapp-testimonial-2.png" alt="Depoimento WhatsApp 2">
                    </div>
                    <div class="testimonial-badge">✓</div>
                </div>
            </div>

            <button onclick="enableAudio(); nextStep(15);" class="btn btn-primary btn-large w-full max-w-md mx-auto">
                Continuar para a próxima fase
            </button>
        </div>
    `
}

function renderStep7() {
  stepContent.innerHTML = `
        <div class="text-center space-y-8">
            <!-- Points Display -->
            <div class="achievement-banner">
                <div class="points-text points-text-large">
                    <svg class="w-6 h-6 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                    🎯 Você conquistou: ${gameState.points} pontos até agora!
                    <svg class="w-6 h-6 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                </div>
            </div>

            <div class="space-y-6">
                <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                    Bônus 2 desbloqueado!
                </h1>
                <h2 class="text-xl text-gray-600 font-semibold">Estratégia de engajamento desbloqueada</h2>
            </div>

            <!-- Bonus Card -->
            <div class="card max-w-lg mx-auto" style="background: linear-gradient(135deg, white, #fdf2f8); border: 2px solid #e879f9; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
                <div class="card-content">
                    <div style="position: relative; margin-bottom: 1.5rem;">
                        <div style="aspect-ratio: 16/9; width: 100%; position: relative; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
                            <img src="engajamento-bonus.png" alt="Estratégia de Engajamento" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div style="position: absolute; top: -0.75rem; right: -0.75rem; background-color: #ef4444; color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 700; animation: pulse 2s infinite;">
                            NOVO!
                        </div>
                    </div>
                    <div class="text-center space-y-2">
                        <div class="price-old">DE R$ 97,00</div>
                        <div class="price-new">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20,6 9,17 4,12"/>
                                <path d="M21 8v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8"/>
                                <path d="M16 2v4"/>
                                <path d="M8 2v4"/>
                            </svg>
                            POR ZERO
                        </div>
                    </div>
                </div>
            </div>

            <!-- Benefits -->
            <div class="max-w-2xl mx-auto space-y-6">
                <h3 class="text-2xl font-bold text-gray-800">Aprenda a engajar com potenciais inícios.</h3>
                <p class="text-lg text-purple-600 font-semibold">(sem precisar correr atrás)</p>

                <div class="space-y-4">
                    <div class="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm">
                        <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span class="text-white text-xs font-bold">✓</span>
                        </div>
                        <p class="text-gray-700 leading-relaxed">Enquanto você dorme, esse mecanismo atrai mulheres interessadas em fazer parte da sua equipe.</p>
                    </div>
                    <div class="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm">
                        <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span class="text-white text-xs font-bold">✓</span>
                        </div>
                        <p class="text-gray-700 leading-relaxed">Quando acordar, já vai ter nomes esperando por você — prontas pra começar.</p>
                    </div>
                    <div class="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm">
                        <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span class="text-white text-xs font-bold">✓</span>
                        </div>
                        <p class="text-gray-700 leading-relaxed">E o melhor? Sem ter que ficar enviando mensagens aleatórias ou forçar convite.</p>
                    </div>
                </div>
            </div>

            <button onclick="enableAudio(); nextStep(25);" class="btn btn-primary btn-large w-full max-w-md mx-auto">
                Sim, quero desbloquear o próximo nível!
            </button>
        </div>
    `
}

function renderStep8() {
  stepContent.innerHTML = `
        <div class="text-center space-y-8">
            <!-- Points Display -->
            <div class="achievement-banner">
                <div class="points-text points-text-large">
                    <svg class="w-6 h-6 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                    🎯 Você conquistou: ${gameState.points} pontos até agora!
                    <svg class="w-6 h-6 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                </div>
            </div>

            <div class="space-y-6">
                <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                    Bônus 3 desbloqueado!
                </h1>
                <h2 class="text-xl text-gray-600 font-semibold">Automatização de mensagens desbloqueada</h2>
            </div>

            <!-- Bonus Card -->
            <div class="card max-w-lg mx-auto" style="background: linear-gradient(135deg, white, #fdf2f8); border: 2px solid #e879f9; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
                <div class="card-content">
                    <div style="position: relative; margin-bottom: 1.5rem;">
                        <div style="aspect-ratio: 16/9; width: 100%; position: relative; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
                            <img src="automatizacao-bonus.png" alt="Automatização de Mensagens" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div style="position: absolute; top: -0.75rem; right: -0.75rem; background-color: #ef4444; color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 700; animation: pulse 2s infinite;">
                            NOVO!
                        </div>
                    </div>
                    <div class="text-center space-y-2">
                        <div class="price-old">DE R$ 97,00</div>
                        <div class="price-new">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20,6 9,17 4,12"/>
                                <path d="M21 8v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8"/>
                                <path d="M16 2v4"/>
                                <path d="M8 2v4"/>
                            </svg>
                            POR ZERO
                        </div>
                    </div>
                </div>
            </div>

            <!-- Benefits -->
            <div class="max-w-2xl mx-auto space-y-6">
                <h3 class="text-2xl font-bold text-gray-800">Automatize suas mensagens de início.</h3>
                <p class="text-lg text-purple-600 font-semibold">(sem precisar correr atrás)</p>

                <div class="space-y-4">
                    <div class="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm">
                        <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span class="text-white text-xs font-bold">✓</span>
                        </div>
                        <p class="text-gray-700 leading-relaxed">Enquanto você dorme, esse mecanismo atrai mulheres interessadas em fazer parte da sua equipe.</p>
                    </div>
                    <div class="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm">
                        <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span class="text-white text-xs font-bold">✓</span>
                        </div>
                        <p class="text-gray-700 leading-relaxed">Quando acordar, já vai ter nomes esperando por você — prontas pra começar.</p>
                    </div>
                    <div class="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm">
                        <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span class="text-white text-xs font-bold">✓</span>
                        </div>
                        <p class="text-gray-700 leading-relaxed">E o melhor? Sem ter que ficar enviando mensagens aleatórias ou forçar convite.</p>
                    </div>
                </div>
            </div>

            <button onclick="enableAudio(); nextStep(30);" class="btn btn-primary btn-large w-full max-w-md mx-auto">
                Sim, quero desbloquear o próximo nível!
            </button>
        </div>
    `
}

function renderStep9() {
  stepContent.innerHTML = `
        <div class="text-center space-y-8">
            <!-- Points Display -->
            <div class="achievement-banner">
                <div class="points-text points-text-large">
                    <svg class="w-6 h-6 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                    🎯 Você conquistou: ${gameState.points} pontos até agora!
                    <svg class="w-6 h-6 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                </div>
            </div>

            <div class="space-y-6">
                <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                    Bônus 4 desbloqueado!
                </h1>
                <h2 class="text-xl text-gray-600 font-semibold">Monitoramento de atividade desbloqueado</h2>
            </div>

            <!-- Bonus Card -->
            <div class="card max-w-lg mx-auto" style="background: linear-gradient(135deg, white, #fdf2f8); border: 2px solid #e879f9; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
                <div class="card-content">
                    <div style="position: relative; margin-bottom: 1.5rem;">
                        <div style="aspect-ratio: 16/9; width: 100%; position: relative; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
                            <img src="monitoramento-bonus.png" alt="Monitoramento de Atividade" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div style="position: absolute; top: -0.75rem; right: -0.75rem; background-color: #ef4444; color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 700; animation: pulse 2s infinite;">
                            NOVO!
                        </div>
                    </div>
                    <div class="text-center space-y-2">
                        <div class="price-old">DE R$ 97,00</div>
                        <div class="price-new">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20,6 9,17 4,12"/>
                                <path d="M21 8v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8"/>
                                <path d="M16 2v4"/>
                                <path d="M8 2v4"/>
                            </svg>
                            POR ZERO
                        </div>
                    </div>
                </div>
            </div>

            <!-- Benefits -->
            <div class="max-w-2xl mx-auto space-y-6">
                <h3 class="text-2xl font-bold text-gray-800">Monitore a atividade de seus inícios.</h3>
                <p class="text-lg text-purple-600 font-semibold">(sem precisar correr atrás)</p>

                <div class="space-y-4">
                    <div class="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm">
                        <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span class="text-white text-xs font-bold">✓</span>
                        </div>
                        <p class="text-gray-700 leading-relaxed">Enquanto você dorme, esse mecanismo atrai mulheres interessadas em fazer parte da sua equipe.</p>
                    </div>
                    <div class="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm">
                        <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span class="text-white text-xs font-bold">✓</span>
                        </div>
                        <p class="text-gray-700 leading-relaxed">Quando acordar, já vai ter nomes esperando por você — prontas pra começar.</p>
                    </div>
                    <div class="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm">
                        <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span class="text-white text-xs font-bold">✓</span>
                        </div>
                        <p class="text-gray-700 leading-relaxed">E o melhor? Sem ter que ficar enviando mensagens aleatórias ou forçar convite.</p>
                    </div>
                </div>
            </div>

            <button onclick="enableAudio(); nextStep(35);" class="btn btn-primary btn-large w-full max-w-md mx-auto">
                Sim, quero desbloquear o próximo nível!
            </button>
        </div>
    `
}

function renderStep10() {
  stepContent.innerHTML = `
        <div class="text-center space-y-8">
            <!-- Points Display -->
            <div class="achievement-banner">
                <div class="points-text points-text-large">
                    <svg class="w-6 h-6 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                    🎯 Você conquistou: ${gameState.points} pontos até agora!
                    <svg class="w-6 h-6 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                </div>
            </div>

            <div class="space-y-6">
                <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                    Bônus 5 desbloqueado!
                </h1>
                <h2 class="text-xl text-gray-600 font-semibold">Relatórios de desempenho desbloqueados</h2>
            </div>

            <!-- Bonus Card -->
            <div class="card max-w-lg mx-auto" style="background: linear-gradient(135deg, white, #fdf2f8); border: 2px solid #e879f9; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
                <div class="card-content">
                    <div style="position: relative; margin-bottom: 1.5rem;">
                        <div style="aspect-ratio: 16/9; width: 100%; position: relative; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
                            <img src="relatorios-bonus.png" alt="Relatórios de Desempenho" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div style="position: absolute; top: -0.75rem; right: -0.75rem; background-color: #ef4444; color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 700; animation: pulse 2s infinite;">
                            NOVO!
                        </div>
                    </div>
                    <div class="text-center space-y-2">
                        <div class="price-old">DE R$ 97,00</div>
                        <div class="price-new">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20,6 9,17 4,12"/>
                                <path d="M21 8v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8"/>
                                <path d="M16 2v4"/>
                                <path d="M8 2v4"/>
                            </svg>
                            POR ZERO
                        </div>
                    </div>
                </div>
            </div>

            <!-- Benefits -->
            <div class="max-w-2xl mx-auto space-y-6">
                <h3 class="text-2xl font-bold text-gray-800">Acompanhe o desempenho de seus inícios.</h3>
                <p class="text-lg text-purple-600 font-semibold">(sem precisar correr atrás)</p>

                <div class="space-y-4">
                    <div class="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm">
                        <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span class="text-white text-xs font-bold">✓</span>
                        </div>
                        <p class="text-gray-700 leading-relaxed">Enquanto você dorme, esse mecanismo atrai mulheres interessadas em fazer parte da sua equipe.</p>
                    </div>
                    <div class="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm">
                        <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span class="text-white text-xs font-bold">✓</span>
                        </div>
                        <p class="text-gray-700 leading-relaxed">Quando acordar, já vai ter nomes esperando por você — prontas pra começar.</p>
                    </div>
                    <div class="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm">
                        <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span class="text-white text-xs font-bold">✓</span>
                        </div>
                        <p class="text-gray-700 leading-relaxed">E o melhor? Sem ter que ficar enviando mensagens aleatórias ou forçar convite.</p>
                    </div>
                </div>
            </div>

            <button onclick="enableAudio(); nextStep(40);" class="btn btn-primary btn-large w-full max-w-md mx-auto">
                Sim, quero desbloquear o próximo nível!
            </button>
        </div>
    `
}

function renderStep11() {
  stepContent.innerHTML = `
        <div class="text-center space-y-8">
            <!-- Points Display -->
            <div class="achievement-banner">
                <div class="points-text points-text-large">
                    <svg class="w-6 h-6 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                    🎯 Você conquistou: ${gameState.points} pontos até agora!
                    <svg class="w-6 h-6 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                </div>
            </div>

            <div class="space-y-6">
                <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                    Bônus 6 desbloqueado!
                </h1>
                <h2 class="text-xl text-gray-600 font-semibold">Suporte ao cliente desbloqueado</h2>
            </div>

            <!-- Bonus Card -->
            <div class="card max-w-lg mx-auto" style="background: linear-gradient(135deg, white, #fdf2f8); border: 2px solid #e879f9; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
                <div class="card-content">
                    <div style="position: relative; margin-bottom: 1.5rem;">
                        <div style="aspect-ratio: 16/9; width: 100%; position: relative; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
                            <img src="suporte-bonus.png" alt="Suporte ao Cliente" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div style="position: absolute; top: -0.75rem; right: -0.75rem; background-color: #ef4444; color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 700; animation: pulse 2s infinite;">
                            NOVO!
                        </div>
                    </div>
                    <div class="text-center space-y-2">
                        <div class="price-old">DE R$ 97,00</div>
                        <div class="price-new">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20,6 9,17 4,12"/>
                                <path d="M21 8v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8"/>
                                <path d="M16 2v4"/>
                                <path d="M8 2v4"/>
                            </svg>
                            POR ZERO
                        </div>
                    </div>
                </div>
            </div>

            <!-- Benefits -->
            <div class="max-w-2xl mx-auto space-y-6">
                <h3 class="text-2xl font-bold text-gray-800">Obtenha suporte ao cliente dedicado.</h3>
                <p class="text-lg text-purple-600 font-semibold">(sem precisar correr atrás)</p>

                <div class="space-y-4">
                    <div class="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm">
                        <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span class="text-white text-xs font-bold">✓</span>
                        </div>
                        <p class="text-gray-700 leading-relaxed">Enquanto você dorme, esse mecanismo atrai mulheres interessadas em fazer parte da sua equipe.</p>
                    </div>
                    <div class="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm">
                        <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span class="text-white text-xs font-bold">✓</span>
                        </div>
                        <p class="text-gray-700 leading-relaxed">Quando acordar, já vai ter nomes esperando por você — prontas pra começar.</p>
                    </div>
                    <div class="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm">
                        <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span class="text-white text-xs font-bold">✓</span>
                        </div>
                        <p class="text-gray-700 leading-relaxed">E o melhor? Sem ter que ficar enviando mensagens aleatórias ou forçar convite.</p>
                    </div>
                </div>
            </div>

            <button onclick="enableAudio(); nextStep(45);" class="btn btn-primary btn-large w-full max-w-md mx-auto">
                Sim, quero desbloquear o próximo nível!
            </button>
        </div>
    `
}

function renderStep12() {
  stepContent.innerHTML = `
        <div class="text-center space-y-8">
            <!-- Points Display -->
            <div class="achievement-banner">
                <div class="points-text points-text-large">
                    <svg class="w-6 h-6 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                    🎯 Você conquistou: ${gameState.points} pontos até agora!
                    <svg class="w-6 h-6 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                </div>
            </div>

            <div class="space-y-6">
                <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                    Parabéns! Você completou o Script de Inícios Automáticos.
                </h1>
                <p class="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    Você agora tem acesso ao Script de Inícios Automáticos completo e a todos os bônus exclusivos.
                </p>
            </div>

            <!-- Bonus Card -->
            <div class="card max-w-lg mx-auto" style="background: linear-gradient(135deg, white, #fdf2f8); border: 2px solid #e879f9; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
                <div class="card-content">
                    <div style="position: relative; margin-bottom: 1.5rem;">
                        <div style="aspect-ratio: 16/9; width: 100%; position: relative; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
                            <img src="script-completo-bonus.png" alt="Script Completo" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div style="position: absolute; top: -0.75rem; right: -0.75rem; background-color: #ef4444; color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 700; animation: pulse 2s infinite;">
                            NOVO!
                        </div>
                    </div>
                    <div class="text-center space-y-2">
                        <div class="price-old">DE R$ 97,00</div>
                        <div class="price-new">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20,6 9,17 4,12"/>
                                <path d="M21 8v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8"/>
                                <path d="M16 2v4"/>
                                <path d="M8 2v4"/>
                            </svg>
                            POR ZERO
                        </div>
                    </div>
                </div>
            </div>

            <!-- Benefits -->
            <div class="max-w-2xl mx-auto space-y-6">
                <h3 class="text-2xl font-bold text-gray-800">Comece a fazer novos inícios hoje.</h3>
                <p class="text-lg text-purple-600 font-semibold">(sem precisar correr atrás)</p>

                <div class="space-y-4">
                    <div class="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm">
                        <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span class="text-white text-xs font-bold">✓</span>
                        </div>
                        <p class="text-gray-700 leading-relaxed">Enquanto você dorme, esse mecanismo atrai mulheres interessadas em fazer parte da sua equipe.</p>
                    </div>
                    <div class="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm">
                        <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span class="text-white text-xs font-bold">✓</span>
                        </div>
                        <p class="text-gray-700 leading-relaxed">Quando acordar, já vai ter nomes esperando por você — prontas pra começar.</p>
                    </div>
                    <div class="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm">
                        <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span class="text-white text-xs font-bold">✓</span>
                        </div>
                        <p class="text-gray-700 leading-relaxed">E o melhor? Sem ter que ficar enviando mensagens aleatórias ou forçar convite.</p>
                    </div>
                </div>
            </div>

            <button onclick="enableAudio(); nextStep(50);" class="btn btn-primary btn-large w-full max-w-md mx-auto">
                Baixar Script Completo
            </button>
        </div>
    `
}
