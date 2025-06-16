"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Unlock, Star, Trophy, Gift, Clock, Target, ArrowLeft } from "lucide-react"

interface FunnelState {
  step: number
  points: number
  selectedOptions: Record<string, string>
  formData: Record<string, string>
  unlockedBonuses: string[]
}

export default function InleadFunnel() {
  const [state, setState] = useState<FunnelState>({
    step: 1,
    points: 0,
    selectedOptions: {},
    formData: {},
    unlockedBonuses: [],
  })

  const [isAnimating, setIsAnimating] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [currentVacancies, setCurrentVacancies] = useState(147)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationText, setNotificationText] = useState("")
  const [showConfetti, setShowConfetti] = useState(false)
  const [pointsAnimation, setPointsAnimation] = useState(false)

  // Cronômetro regressivo
  const [timeLeft, setTimeLeft] = useState({
    minutes: 18,
    seconds: 43,
  })

  const [audioEnabled, setAudioEnabled] = useState(false)

  // Função simplificada e mais robusta para tocar áudio
  const playSound = async (soundType: "levelUp" | "success" | "unlock" | "chaChing") => {
    if (!audioEnabled) {
      console.log("Áudio não habilitado ainda")
      return
    }

    try {
      const audioUrl =
        "https://agenciasclick.com.br/wp-content/uploads/2025/06/cashier-quotka-chingquot-sound-effect-129698.mp3"

      console.log(`Tentando tocar som ${soundType}...`)

      // Criar novo elemento de áudio para cada reprodução
      const audio = new Audio()
      audio.volume = 0.4
      audio.preload = "auto"

      // Configurar o src após criar o elemento
      audio.src = audioUrl

      // Aguardar que o áudio esteja pronto para tocar
      const playPromise = new Promise((resolve, reject) => {
        const onCanPlay = () => {
          audio.removeEventListener("canplaythrough", onCanPlay)
          audio.removeEventListener("error", onError)
          resolve(true)
        }

        const onError = (error) => {
          audio.removeEventListener("canplaythrough", onCanPlay)
          audio.removeEventListener("error", onError)
          reject(error)
        }

        audio.addEventListener("canplaythrough", onCanPlay, { once: true })
        audio.addEventListener("error", onError, { once: true })

        // Forçar carregamento
        audio.load()
      })

      // Aguardar carregamento
      await playPromise

      // Tentar tocar
      await audio.play()
      console.log(`Som ${soundType} tocado com sucesso!`)
    } catch (error) {
      console.error(`Erro ao tocar som ${soundType}:`, error)
      // Não fazer nada em caso de erro - apenas log
    }
  }

  // Função para habilitar áudio
  const enableAudio = async () => {
    if (!audioEnabled) {
      setAudioEnabled(true)
      console.log("Áudio habilitado!")
    }
  }

  const addPoints = (points: number) => {
    setState((prev) => ({ ...prev, points: prev.points + points }))

    // Ativar animação de pontos
    setPointsAnimation(true)
    setTimeout(() => setPointsAnimation(false), 1000)

    // Mostrar confetes
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)

    playSound("chaChing")
  }

  const nextStep = (pointsToAdd = 0) => {
    setIsAnimating(true)
    if (pointsToAdd > 0) {
      addPoints(pointsToAdd)
    }
    setTimeout(() => {
      setState((prev) => ({ ...prev, step: prev.step + 1 }))
      setIsAnimating(false)
    }, 500)
  }

  const goToStep = (step: number) => {
    setState((prev) => ({ ...prev, step }))
  }

  const handleOptionSelect = (key: string, value: string, nextStepNum?: number) => {
    setState((prev) => ({
      ...prev,
      selectedOptions: { ...prev.selectedOptions, [key]: value },
    }))

    if (nextStepNum) {
      setTimeout(() => goToStep(nextStepNum), 300)
    }
  }

  const unlockBonus = (bonusName: string) => {
    setState((prev) => ({
      ...prev,
      unlockedBonuses: [...prev.unlockedBonuses, bonusName],
    }))
    playSound("unlock")
  }

  const progressPercentage = Math.min((state.step / 13) * 100, 100)

  useEffect(() => {
    if (state.step === 2) {
      playSound("levelUp")
    }
  }, [state.step])

  // Cronômetro regressivo
  useEffect(() => {
    if (state.step === 12) {
      // Apenas na página final
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev.seconds > 0) {
            return { ...prev, seconds: prev.seconds - 1 }
          } else if (prev.minutes > 0) {
            return { minutes: prev.minutes - 1, seconds: 59 }
          } else {
            // Reinicia o cronômetro quando chega a zero
            return { minutes: 18, seconds: 43 }
          }
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [state.step])

  // Adicionar após os outros useEffects
  useEffect(() => {
    if (state.step === 1) {
      // Animação de carregamento
      const loadingInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(loadingInterval)
            return 100
          }
          return prev + 100 / 30 // 3 segundos = 30 frames
        })
      }, 100)

      // Notificações de vagas
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

      const notificationInterval = setInterval(() => {
        if (notificationCount < 10) {
          const randomName = names[Math.floor(Math.random() * names.length)]
          setNotificationText(`${randomName} acabou de baixar o Script de inícios!`)
          setShowNotification(true)
          setCurrentVacancies((prev) => Math.max(93, prev - Math.floor(Math.random() * 6) - 3))

          setTimeout(() => setShowNotification(false), 3000)
          notificationCount++
        } else {
          clearInterval(notificationInterval)
        }
      }, 5000)

      return () => {
        clearInterval(loadingInterval)
        clearInterval(notificationInterval)
      }
    }
  }, [state.step])

  const renderStep = () => {
    switch (state.step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">Carregando... {Math.round(loadingProgress)}%</div>
              <Progress value={loadingProgress} className="w-full" />
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 leading-tight">
              Baixe Agora: <span className="text-red-600">O Script Gerador de Inícios</span>
            </h1>

            <p className="text-gray-600 mb-6">
              Você está a poucas fases de destravar seus inícios e crescer absurdamente sua equipe a partir de hoje.
            </p>

            <div className="my-8">
              <img src="/pink-car-app-interface.png" alt="Script de Inícios" className="mx-auto rounded-lg" />
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="font-bold text-lg mb-4">A cada fase que você avançar aqui:</h3>
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>Um bônus é desbloqueado.</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>Você acumula pontos.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span>
                    No final, se chegar a 100 pontos, você desbloqueia e baixa o{" "}
                    <strong>Script de Inícios Automáticos completo + bônus exclusivos</strong> — e já pode começar a
                    fazer novos inícios ainda hoje.
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => {
                enableAudio() // Habilita áudio na primeira interação
                nextStep(0)
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg"
            >
              Sim, quero desbloquear meus inícios
            </Button>

            <p className="text-sm text-gray-500 mt-4">
              <strong>{notificationText || "Carregando..."}</strong>
              <br />
              Corra! Faltam menos de <strong>{currentVacancies}</strong> vagas para encerrar hoje.
            </p>
          </motion.div>
        )

      case 2:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
            <div className="mb-4">
              <div className="text-sm text-purple-600 mb-2 font-bold">🎯 Você conquistou: 15 pontos até agora!</div>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 leading-tight">
              Isso aqui também não é pra te vender um "coach ou cursinho motivacional"....
            </h1>

            <div className="space-y-4 text-gray-600">
              <p>
                Estamos aqui <strong>pra te mostrar como iniciar pessoas todos os dias com um mecanismo simples</strong>
                , que pode ser aplicado mesmo que você esteja sem tempo, travada ou sem saber o que fazer.
              </p>
            </div>

            <Button
              onClick={() => {
                enableAudio()
                nextStep(15)
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg"
            >
              Quero continuar mesmo assim
            </Button>

            <p className="text-sm text-gray-500 italic">
              Clique no botão acima para <strong>subir de nível</strong> e receber as próximas instruções.
            </p>
          </motion.div>
        )

      case 3:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
            <div className="mb-4">
              <div className="text-sm text-purple-600 mb-2 font-bold">
                🎯 Você conquistou: {state.points} pontos até agora!
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 leading-tight">
              Você não precisa saber como começar
            </h1>

            <p className="text-gray-600 mb-8">
              Mas precisa <strong>querer começar!</strong> Escolha uma opção abaixo:
            </p>

            <RadioGroup onValueChange={(value) => handleOptionSelect("startChoice", value)} className="space-y-4">
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="strategy" id="strategy" />
                <Label htmlFor="strategy" className="text-left flex-1">
                  Quero iniciar usando uma estratégia simples, validada e pronta.
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="later" id="later" />
                <Label htmlFor="later" className="text-left flex-1">
                  Prefiro deixar pra outro dia.
                </Label>
              </div>
            </RadioGroup>

            <div className="mt-6">
              <p className="text-purple-600 text-sm mb-4">✓ Você irá desbloquear +1 bônus ao responder</p>

              {state.selectedOptions.startChoice && (
                <Button
                  onClick={() => {
                    enableAudio()
                    if (state.selectedOptions.startChoice === "strategy") {
                      unlockBonus("Gerador de Cadastros")
                      addPoints(15)
                      setTimeout(() => goToStep(5), 500) // Vai DIRETO para etapa 5 (Bônus desbloqueado)
                    } else {
                      goToStep(4) // "Você perdeu" apenas para "later"
                    }
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
                >
                  Continuar
                </Button>
              )}
            </div>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="text-6xl font-bold text-purple-600 mb-4" style={{ fontFamily: "monospace" }}>
              VOCÊ
              <br />
              PERDEU
            </div>

            <div className="my-8">
              <img src="/placeholder-0zc9z.png" alt="Você perdeu" className="mx-auto" />
            </div>

            <h2 className="text-2xl font-bold mb-4">Você não está pronta.</h2>

            <p className="text-gray-600 mb-8">
              Infelizmente nosso script não é para você. Precisamos de pessoas comprometidas, pois ao aplicar o que
              vamos te ensinar você terá resultados incríveis.
            </p>

            <Button onClick={() => goToStep(3)} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3">
              Voltar e tentar novamente.
            </Button>
          </motion.div>
        )

      case 5:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
            <div className="mb-4">
              <div className="text-sm text-purple-600 mb-2 font-bold">
                🎯 Você conquistou: {state.points} pontos até agora + um super bônus!
              </div>
            </div>

            <div className="flex justify-center mb-4">
              <Unlock className="w-12 h-12 text-purple-600" />
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 leading-tight">
              Bônus 1 desbloqueado!
            </h1>
            <h2 className="text-xl text-gray-600 mb-6">Gerador de cadastros infinitos desbloqueado</h2>

            <Card className="max-w-md mx-auto">
              <CardContent className="p-6">
                <div className="mb-4">
                  <img src="/gerador-cadastros-bonus.png" alt="Gerador de Cadastros" className="mx-auto rounded-lg" />
                </div>
                <div className="text-right">
                  <span className="text-gray-400 line-through">DE R$ 97,00</span>
                  <br />
                  <span className="text-2xl font-bold text-green-600">POR ZERO</span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4 mt-8">
              <h3 className="text-xl font-bold">Comece a atrair novos inícios ainda hoje.</h3>
              <p className="text-purple-600 font-medium">(sem precisar correr atrás)</p>

              <div className="text-gray-600 space-y-2">
                <p>Enquanto você dorme, esse mecanismo atrai mulheres interessadas em fazer parte da sua equipe.</p>
                <p>Quando acordar, já vai ter nomes esperando por você — prontas pra começar.</p>
                <p>
                  <em>E o melhor? Sem ter que ficar enviando mensagens aleatórias ou forçar convite.</em>
                </p>
              </div>
            </div>

            <Button
              onClick={() => {
                enableAudio()
                nextStep(20)
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
            >
              Sim, quero desbloquear o próximo nível!
            </Button>
          </motion.div>
        )

      case 6:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
            <div className="mb-4">
              <div className="text-sm text-purple-600 mb-2 font-bold">
                🎯 Você conquistou: {state.points} pontos até agora!
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 leading-tight">
              Você não está sozinha. Elas também achavam que já tinham tentado de tudo...
            </h1>

            <p className="text-gray-600 mb-4">
              Nossas alunas do Script/Robô gerador de inícios aplicaram com dedicação tudo que aprenderam e{" "}
              <span className="text-purple-600 font-bold">estão iniciando todos os dias.</span>
            </p>

            {/* Vídeo do Panda */}
            <div className="max-w-2xl mx-auto mb-6">
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  id="panda-c0fd1497-990b-4ea7-abc1-d689539df929"
                  src="https://player-vz-c232c405-6bd.tv.pandavideo.com.br/embed/?v=c0fd1497-990b-4ea7-abc1-d689539df929"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    border: "none",
                  }}
                  allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture"
                  allowFullScreen={true}
                  fetchPriority="high"
                />
              </div>
            </div>

            {/* Depoimentos WhatsApp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="max-w-sm mx-auto">
                <img
                  src="/whatsapp-testimonial-1.png"
                  alt="Depoimento WhatsApp 1"
                  className="mx-auto rounded-lg shadow-lg"
                />
              </div>
              <div className="max-w-sm mx-auto">
                <img
                  src="/whatsapp-testimonial-2.png"
                  alt="Depoimento WhatsApp 2"
                  className="mx-auto rounded-lg shadow-lg"
                />
              </div>
            </div>

            <Button
              onClick={() => {
                enableAudio()
                nextStep(15)
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
            >
              Continuar para a próxima fase
            </Button>
          </motion.div>
        )

      case 7:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
            <div className="mb-4">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg">
                <div className="text-lg text-purple-600 mb-2 font-bold flex items-center justify-center gap-2">
                  <Star className="w-5 h-5" />
                  Você conquistou: {state.points} pontos até agora!
                  <Star className="w-5 h-5" />
                </div>
                <div className="text-sm text-purple-500">🔥 Você está quase lá! Faltam poucos pontos para os 100!</div>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 leading-tight">
              Hora da Sinceridade
            </h1>
            <p className="text-gray-600 mb-8">O que mais te impede de fazer inícios hoje?</p>

            <RadioGroup onValueChange={(value) => handleOptionSelect("obstacle", value)} className="space-y-4">
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="time" id="time" />
                <Label htmlFor="time" className="text-left flex-1">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Falta de tempo
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="fear" id="fear" />
                <Label htmlFor="fear" className="text-left flex-1">
                  😰 Medo de continuar ouvindo "Não"
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="approach" id="approach" />
                <Label htmlFor="approach" className="text-left flex-1">
                  💬 Não sei como oferecer a oportunidade
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="ready" id="ready" />
                <Label htmlFor="ready" className="text-left flex-1">
                  <Target className="w-4 h-4 inline mr-2" />
                  Nada me impede, estou pronta!
                </Label>
              </div>
            </RadioGroup>

            <div className="mt-6">
              <div className="bg-purple-50 p-4 rounded-lg mb-4">
                <p className="text-purple-600 text-sm font-bold">
                  ✨ Você irá desbloquear +1 bônus de nível maior ao responder
                </p>
                <p className="text-xs text-purple-500 mt-1">
                  Esta é uma das últimas etapas para chegar aos 100 pontos!
                </p>
              </div>

              {state.selectedOptions.obstacle && (
                <Button
                  onClick={() => {
                    enableAudio()
                    const stepMap = {
                      time: 8, // Falta de tempo
                      fear: 9, // Medo de ouvir "não"
                      approach: 10, // Não sabe como oferecer
                      ready: 11, // Está pronta
                    }
                    addPoints(15)
                    setTimeout(() => goToStep(stepMap[state.selectedOptions.obstacle as keyof typeof stepMap]), 500)
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
                >
                  Continuar para os 100 pontos!
                </Button>
              )}
            </div>
          </motion.div>
        )

      // Etapa 8 - Objeção: Falta de tempo
      case 8:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
            <div className="mb-4">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg">
                <div className="text-lg text-purple-600 mb-2 font-bold flex items-center justify-center gap-2">
                  <Star className="w-5 h-5" />
                  Você conquistou: {state.points} pontos até agora!
                  <Star className="w-5 h-5" />
                </div>
                <div className="text-sm text-purple-500">🔥 Quase lá! Você está a poucos pontos dos 100!</div>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 leading-tight">
              Só 10 minutos por dia podem destravar seus inícios. Topa tentar?
            </h1>

            <div className="space-y-4 text-gray-600">
              <p>O que você vai ter acesso é tão direto que cabe até no intervalo de uma reunião ou antes de dormir.</p>
              <p>
                E se aplicar só uma parte do que vai receber,{" "}
                <strong>já vai sentir diferença nos seus resultados</strong>
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600">
                ⏰ <strong>10 minutos por dia</strong> é tudo que você precisa para transformar seus resultados!
              </p>
            </div>

            <Button
              onClick={() => {
                enableAudio()
                addPoints(20)
                setTimeout(() => goToStep(11), 500)
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 text-base md:text-lg leading-tight"
            >
              Me comprometo com meus próximos inícios
            </Button>

            <p className="text-sm text-gray-500 italic">
              Clique no botão acima para <strong>conquistar os 100 pontos!</strong>
            </p>
          </motion.div>
        )

      // Etapa 9 - Objeção: Medo de ouvir "não"
      case 9:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
            <div className="mb-4">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg">
                <div className="text-lg text-purple-600 mb-2 font-bold flex items-center justify-center gap-2">
                  <Star className="w-5 h-5" />
                  Você conquistou: {state.points} pontos até agora!
                  <Star className="w-5 h-5" />
                </div>
                <div className="text-sm text-purple-500">🔥 Quase lá! Você está a poucos pontos dos 100!</div>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 leading-tight">
              Ouvir "não" toda hora não é normal. Falta método.
            </h1>

            <div className="space-y-4 text-gray-600">
              <p>O problema não é o "não".</p>
              <p>O problema é falar com pessoas erradas, do jeito errado, sem confiança e sem estrutura.</p>
              <p className="text-purple-600 font-bold">O Script resolve isso.</p>
              <p>
                Ele mostra <strong>exatamente o que fazer</strong> — com quem falar, como abordar, o que dizer, e como
                manter tudo leve e natural.
              </p>
              <p>Quando você segue um passo a passo que funciona, o medo vai embora.</p>
              <p>A insegurança vira clareza.</p>
              <p>E quem tem clareza, age.</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-green-700">
                💪 <strong>Com o método certo</strong>, você vai ouvir mais "SIM" do que imagina!
              </p>
            </div>

            <Button
              onClick={() => {
                enableAudio()
                addPoints(20)
                setTimeout(() => goToStep(11), 500)
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 text-base md:text-lg leading-tight"
            >
              Quero destravar meus inícios automáticos
            </Button>

            <p className="text-sm text-gray-500 italic">
              Clique no botão acima para <strong>conquistar os 100 pontos!</strong>
            </p>
          </motion.div>
        )

      // Etapa 10 - Objeção: Não sabe como oferecer
      case 10:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
            <div className="mb-4">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg">
                <div className="text-lg text-purple-600 mb-2 font-bold flex items-center justify-center gap-2">
                  <Star className="w-5 h-5" />
                  Você conquistou: {state.points} pontos até agora!
                  <Star className="w-5 h-5" />
                </div>
                <div className="text-sm text-purple-500">🔥 Quase lá! Você está a poucos pontos dos 100!</div>
              </div>
            </div>

            <div className="flex justify-center mb-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <Gift className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 leading-tight">
              Não saber o que dizer é mais comum do que você imagina.
            </h1>

            <p className="text-purple-600 font-bold text-lg mb-4">E a boa notícia: você não precisa inventar nada.</p>

            <div className="space-y-4 text-gray-600">
              <p>
                A maioria trava porque tenta oferecer do jeito errado — sem clareza, sem sequência, sem saber como
                começar.
              </p>
              <p>
                É por isso que criamos um <strong>método testado e pronto</strong>, com tudo o que você precisa.
              </p>
              <p className="text-purple-600 font-bold">✨ Só copiar, adaptar ao seu jeito, e aplicar.</p>
              <p>Mesmo quem nunca teve coragem de oferecer, sente segurança logo no primeiro passo.</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-blue-700">
                📝 <strong>Scripts prontos</strong> para você nunca mais ficar sem saber o que dizer!
              </p>
            </div>

            <Button
              onClick={() => {
                enableAudio()
                addPoints(20)
                setTimeout(() => goToStep(11), 500)
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 text-base md:text-lg leading-tight"
            >
              Quero receber o Script de Inícios Automáticos
            </Button>
          </motion.div>
        )

      // Etapa 11 - "Estou pronta!" - Vai direto para 100 pontos
      case 11:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
            <div className="mb-4">
              <div className="text-sm text-purple-600 mb-2">Você conquistou:</div>
              <div className="text-2xl font-bold text-purple-600 mb-2">100 pontos, parabéns!</div>
              <Progress value={100} className="w-full h-3" />
            </div>

            <div className="my-8">
              <img src="/pink-car-app-interface.png" alt="Script de Inícios" className="mx-auto rounded-lg" />
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 leading-tight">
              É disso que a gente precisa: decisão.
            </h1>

            <div className="space-y-4 text-gray-600">
              <p>Quem chega até aqui pronta pra agir já tá à frente de 95% das pessoas.</p>
              <p>
                Agora você vai desbloquear o acesso ao material que vai te garantir inícios todos os dias com
                consistência.
              </p>
              <p className="text-purple-600 font-bold">E transformar sua rotina, sua renda e sua equipe.</p>
            </div>

            <Button
              onClick={() => {
                enableAudio()
                // Garantir que chegue a 100 pontos
                setState((prev) => ({ ...prev, points: 100 }))
                nextStep(0) // Vai para step 12 (pitch final)
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg"
            >
              Resgatar todos os bônus agora!
            </Button>
          </motion.div>
        )

      case 12:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Barra de Progresso Completa com Celebração */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-600">Progresso Completo!</span>
                <span className="text-sm font-bold text-purple-600">100%</span>
              </div>
              <Progress value={100} className="w-full h-4 bg-purple-100" />
              <div className="flex justify-center mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                </div>
              </div>
            </div>

            {/* Timer de Urgência Melhorado */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl shadow-lg mb-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-5 h-5 animate-pulse" />
                  <span className="font-bold text-lg">OFERTA EXPIRA EM:</span>
                </div>
                <div className="text-3xl font-bold font-mono tracking-wider">
                  {String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
                </div>
                <p className="text-sm opacity-90 mt-1">⚡ Condição especial válida apenas hoje!</p>
              </div>
            </div>

            {/* Título Principal com Mais Impacto */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
                <Trophy className="w-4 h-4" />
                MISSÃO CUMPRIDA - 100 PONTOS!
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 leading-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                🎉 Parabéns!
              </h1>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Você desbloqueou TODOS os bônus!</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Agora você tem acesso ao <strong>Script de Inícios Automáticos completo</strong> + todos os bônus
                exclusivos por uma condição especial que nunca mais se repetirá.
              </p>
            </div>

            {/* Grid de Bônus Melhorado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {[
                {
                  title: "🎁 Bônus 1 - GRÁTIS",
                  subtitle: "Gerador de Cadastros Infinitos",
                  value: "R$ 97,00",
                  description: "Sistema automático que atrai pessoas interessadas enquanto você dorme",
                },
                {
                  title: "🎁 Bônus 2 - GRÁTIS",
                  subtitle: "Grupo VIP de Iniciadoras",
                  value: "R$ 97,00",
                  description: "Acesso exclusivo ao grupo de WhatsApp com suporte direto",
                },
                {
                  title: "🎁 Bônus 3 - GRÁTIS",
                  subtitle: "Disparador Automático",
                  value: "R$ 297,00",
                  description: "Ferramenta para enviar milhares de mensagens automaticamente",
                },
                {
                  title: "🎁 Bônus 4 - GRÁTIS",
                  subtitle: "Aulas em Vídeo + Acesso Vitalício",
                  value: "R$ 497,00",
                  description: "Treinamento completo em vídeo com acesso para sempre",
                },
              ].map((bonus, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-lg border-2 border-green-200 hover:border-green-300 transition-all"
                >
                  <div className="text-center">
                    <h3 className="font-bold text-lg text-green-600 mb-2">{bonus.title}</h3>
                    <h4 className="font-semibold text-gray-800 mb-3">{bonus.subtitle}</h4>
                    <div className="mb-3">
                      <span className="text-gray-400 line-through">DE {bonus.value}</span>
                      <div className="text-2xl font-bold text-green-600">GRÁTIS</div>
                    </div>
                    <p className="text-sm text-gray-600">{bonus.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Seção da Mentora Redesenhada */}
            <div className="bg-gradient-to-br from-white via-purple-50 to-pink-50 p-6 md:p-10 rounded-3xl mb-8 shadow-xl border border-purple-100">
              <div className="text-center">
                {/* Badge de Oferta */}
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-full text-base md:text-lg font-bold mb-6 shadow-lg animate-pulse">
                  <span className="text-xl">🔥</span>
                  <span>OFERTA ESPECIAL - 61% OFF</span>
                </div>

                {/* Imagem da Mentora */}
                <div className="mb-8">
                  <img
                    src="/woman-laptop-pink-blazer.png"
                    alt="Mentora Script de Inícios"
                    className="mx-auto rounded-2xl w-full max-w-sm shadow-2xl border-4 border-white"
                  />
                </div>

                {/* Título Principal */}
                <div className="mb-8">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 leading-tight">
                    Script Gerador de
                    <br />
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Inícios Automáticos
                    </span>
                  </h2>

                  <div className="max-w-2xl mx-auto">
                    <p className="text-lg md:text-xl text-gray-600 mb-6 leading-relaxed">
                      Pelos próximos minutos você terá acesso ao método completo que já transformou a vida de
                    </p>

                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-2xl mb-6 border-2 border-purple-200">
                      <div className="text-3xl md:text-4xl font-bold text-purple-700 mb-2">+13.847 consultoras</div>
                      <p className="text-purple-600 font-semibold">por uma condição jamais vista</p>
                    </div>
                  </div>
                </div>

                {/* Selos de Confiança Redesenhados */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto mb-8">
                  {/* Garantia */}
                  <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-green-200 hover:border-green-300 transition-all">
                    <div className="flex items-center gap-3">
                      <img src="/90-days-guarantee.png" alt="Garantia" className="w-12 h-12" />
                      <div className="text-left">
                        <div className="font-bold text-green-700 text-sm">Garantia Blindada</div>
                        <div className="text-green-600 text-xs">90 dias em dobro</div>
                      </div>
                    </div>
                  </div>

                  {/* Hotmart */}
                  <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-blue-200 hover:border-blue-300 transition-all">
                    <div className="flex items-center gap-3">
                      <img src="/hotmart-logo.png" alt="Hotmart" className="h-8" />
                      <div className="text-left">
                        <div className="font-bold text-blue-700 text-sm">Pagamento Seguro</div>
                        <div className="text-blue-600 text-xs">Plataforma confiável</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Depoimento Rápido */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-purple-500 mb-6 max-w-2xl mx-auto">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 font-bold text-lg">"</span>
                    </div>
                    <div className="text-left">
                      <p className="text-gray-700 italic mb-2">
                        "Nos primeiros 30 dias usando eu consegui iniciar 12 pessoas usando apenas o script e o gerador.
                        Nunca pensei que seria tão simples!"
                      </p>
                      <div className="text-sm text-purple-600 font-semibold">- Carla M., Consultora há 2 anos</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção de Preço com Mais Impacto */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border-4 border-green-400 mb-8">
              <div className="text-center">
                <div className="mb-6">
                  <p className="text-lg text-gray-600 mb-2">Valor total dos bônus:</p>
                  <div className="text-2xl text-gray-400 line-through mb-2">R$ 988,00</div>
                  <p className="text-lg text-gray-600 mb-4">Preço normal do Script:</p>
                  <div className="text-3xl text-gray-400 line-through mb-4">R$ 197,00</div>

                  <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-6 rounded-xl mb-6">
                    <p className="text-lg mb-2">🎯 Sua condição especial HOJE:</p>
                    <div className="text-5xl font-bold mb-2">R$ 67,00</div>
                    <div className="text-xl">ou 9x de R$ 8,80</div>
                    <p className="text-sm opacity-90 mt-2">💳 Sem juros no cartão</p>
                  </div>

                  <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg mb-6">
                    <p className="text-yellow-800 font-bold">⚡ ECONOMIA DE R$ 1.118,00!</p>
                    <p className="text-yellow-700 text-sm">Você está pagando apenas 5% do valor real</p>
                  </div>
                </div>

                {/* CTA Principal Melhorado */}
                <Button
                  onClick={() => {
                    enableAudio()
                    playSound("success")
                    window.open("https://pay.hotmart.com/Y22978658D?off=5le6e7pp&checkoutMode=10", "_blank")
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 px-4 text-base md:text-lg font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all mb-4 min-h-[60px] flex items-center justify-center"
                >
                  <div className="text-center leading-tight">
                    <div className="flex items-center justify-center gap-2 mb-1"></div>
                    <div className="text-sm sm:text-base md:text-lg font-bold">
                      QUERO MEU SCRIPT +<br className="sm:hidden" />
                      <span className="sm:ml-1">TODOS OS BÔNUS!</span>
                    </div>
                  </div>
                </Button>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span>
                    <strong>127 pessoas</strong> compraram nas últimas 2 horas
                  </span>
                </div>

                <p className="text-xs text-gray-500">
                  🔒 Compra 100% segura • ⚡ Acesso imediato • 🎯 Garantia de 90 dias
                </p>
              </div>
            </div>

            {/* O que você vai receber - Melhorado */}
            <div className="bg-gray-50 p-8 rounded-2xl mb-8">
              <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">🎁 Tudo que você vai receber HOJE:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "✅ Script de Inícios Ativo e Receptivo (mensagens prontas e persuasivas)",
                  "✅ Sistema Gerador de pessoas interessadas em ser consultora independente",
                  "✅ Acesso ao Grupo VIP de Iniciadoras no WhatsApp",
                  "✅ Disparador automático para enviar mensagens em massa",
                  "✅ Acesso vitalício e suporte direto",
                  "✅ Aulas em vídeo completas passo a passo",
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm"
                  >
                    <span className="text-green-600 font-bold text-lg">✅</span>
                    <span className="text-gray-700">{item.replace("✅ ", "")}</span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-purple-100 rounded-lg">
                <p className="text-purple-800 font-bold text-center">
                  💎 Ou seja: não é só um PDF. É um kit completo de crescimento de equipe, feito para você iniciar mais
                  pessoas e pontuar mais, mesmo com pouco tempo disponível.
                </p>
              </div>
            </div>

            {/* FAQ Melhorado */}
            <div className="mb-8">
              <h4 className="text-2xl font-bold text-center mb-8 text-gray-800">❓ Perguntas Mais Frequentes</h4>
              <div className="space-y-4">
                {[
                  {
                    question: "O que exatamente você irá receber?",
                    answer:
                      "Você receberá o Script completo com mensagens prontas, o Sistema Gerador de cadastros, acesso ao grupo VIP, disparador automático, aulas em vídeo e suporte vitalício. É um kit completo, não apenas um PDF.",
                  },
                  {
                    question: "Será que funciona mesmo?",
                    answer:
                      "Temos mais de 2.847 alunas que estão iniciando pessoas toda semana usando esse método. E se você aplicar por 3 meses e não tiver resultado, devolvemos seu dinheiro em dobro. O risco é todo nosso.",
                  },
                  {
                    question: "Quanto tempo leva para ver resultados?",
                    answer:
                      "Muitas alunas começam a ver os primeiros resultados já na primeira semana. O método é direto e prático - você pode começar a aplicar no mesmo dia.",
                  },
                  {
                    question: "E se eu não tiver tempo?",
                    answer:
                      "O método foi pensado para pessoas ocupadas! Você precisa de apenas 10-15 minutos por dia. Muitas alunas aplicam no intervalo do almoço ou antes de dormir.",
                  },
                ].map((faq, index) => (
                  <details
                    key={index}
                    className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-all"
                  >
                    <summary className="font-bold cursor-pointer text-purple-600 hover:text-purple-800 text-lg flex items-center gap-2">
                      <span className="text-2xl">❓</span>
                      {faq.question}
                    </summary>
                    <div className="mt-4 text-gray-600 leading-relaxed pl-8">{faq.answer}</div>
                  </details>
                ))}
              </div>
            </div>

            {/* Urgência Final */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 p-6 rounded-xl text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-bold text-red-700 text-lg">ATENÇÃO: Vagas Limitadas!</span>
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-red-700 mb-2">
                <strong>Apenas 23 vagas restantes</strong> para essa condição especial
              </p>
              <p className="text-sm text-red-600">
                Após esgotar, o preço volta para R$ 197,00 + você perde todos os bônus
              </p>
            </div>
          </motion.div>
        )

      default:
        return <div>Etapa não encontrada</div>
    }
  }

  // Componente de confetes
  const Confetti = () => {
    const confettiPieces = Array.from({ length: 50 }, (_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 rounded-full"
        style={{
          backgroundColor: ["#9333ea", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"][Math.floor(Math.random() * 5)],
          left: `${Math.random() * 100}%`,
          top: "-10px",
        }}
        initial={{ y: -10, rotate: 0, opacity: 1 }}
        animate={{
          y: window.innerHeight + 100,
          rotate: Math.random() * 360,
          opacity: 0,
          x: Math.random() * 200 - 100,
        }}
        transition={{
          duration: 3,
          delay: Math.random() * 0.5,
          ease: "easeOut",
        }}
      />
    ))

    return <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">{confettiPieces}</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {state.step > 1 && (
              <Button variant="ghost" size="sm" onClick={() => setState((prev) => ({ ...prev, step: prev.step - 1 }))}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}

            <div className="flex items-center gap-2">
              <img src="/scriptdeinicios-logo-pink-gradient.png" alt="Script de Inícios" className="h-12" />
            </div>

            {state.points > 0 && (
              <motion.div
                className={`flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full border-2 border-purple-200 ${
                  pointsAnimation
                    ? "animate-pulse bg-gradient-to-r from-yellow-200 to-orange-200 border-yellow-400"
                    : ""
                }`}
                animate={
                  pointsAnimation
                    ? {
                        scale: [1, 1.2, 1],
                        boxShadow: [
                          "0 0 0 0 rgba(147, 51, 234, 0.4)",
                          "0 0 0 10px rgba(147, 51, 234, 0)",
                          "0 0 0 0 rgba(147, 51, 234, 0)",
                        ],
                      }
                    : {}
                }
                transition={{ duration: 0.6 }}
              >
                <Star className="w-5 h-5 text-purple-600" />
                <span className="text-lg font-bold text-purple-600">{state.points} pts</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-3 md:px-4 py-6 md:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Notificação flutuante */}
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -50, x: "-50%" }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
        >
          {notificationText}
        </motion.div>
      )}

      {/* Confetes */}
      {showConfetti && <Confetti />}
    </div>
  )
}
