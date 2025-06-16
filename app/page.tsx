"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Unlock, Star, Trophy, Gift, Clock, Target, ArrowLeft, Zap, Crown, Sparkles } from "lucide-react"
import Image from "next/image"

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

  const [timeLeft, setTimeLeft] = useState({
    minutes: 18,
    seconds: 43,
  })

  const [audioEnabled, setAudioEnabled] = useState(false)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)()
      setAudioContext(context)

      fetch("/sounds/cashier-quotka-chingquot-sound-effect-129698.mp3")
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => context.decodeAudioData(arrayBuffer))
        .then((decodedAudio) => setAudioBuffer(decodedAudio))
        .catch((error) => console.error("Error preloading audio:", error))
    }
  }, [])

  const playSound = async (soundType: "levelUp" | "success" | "unlock" | "chaChing") => {
    if (!audioEnabled || !audioContext || !audioBuffer) {
      console.log("Áudio não habilitado, contexto não pronto ou buffer não carregado.")
      return
    }

    try {
      if (audioContext.state === "suspended") {
        await audioContext.resume()
      }

      const source = audioContext.createBufferSource()
      source.buffer = audioBuffer

      const gainNode = audioContext.createGain()
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime)

      source.connect(gainNode)
      gainNode.connect(audioContext.destination)

      source.start(0)
      console.log(`Som ${soundType} tocado com sucesso!`)
    } catch (error) {
      console.error(`Erro ao tocar som ${soundType}:`, error)
    }
  }

  const enableAudio = async () => {
    if (!audioEnabled && audioContext) {
      try {
        if (audioContext.state === "suspended") {
          await audioContext.resume()
        }
        setAudioEnabled(true)
        console.log("Áudio habilitado!")
      } catch (error) {
        console.error("Erro ao habilitar áudio:", error)
      }
    }
  }

  const addPoints = (points: number) => {
    setState((prev) => ({ ...prev, points: prev.points + points }))
    setPointsAnimation(true)
    setTimeout(() => setPointsAnimation(false), 1000)
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
  }, [state.step, audioEnabled])

  useEffect(() => {
    if (state.step === 12) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev.seconds > 0) {
            return { ...prev, seconds: prev.seconds - 1 }
          } else if (prev.minutes > 0) {
            return { minutes: prev.minutes - 1, seconds: 59 }
          } else {
            return { minutes: 18, seconds: 43 }
          }
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [state.step])

  useEffect(() => {
    if (state.step === 1) {
      const loadingInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(loadingInterval)
            return 100
          }
          return prev + 100 / 30
        })
      }, 100)
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8">
            {/* Loading Progress */}
            <div className="mb-8">
              <div className="text-sm text-gray-600 mb-3 font-medium">Carregando... {Math.round(loadingProgress)}%</div>
              <div className="relative">
                <Progress value={loadingProgress} className="w-full h-3 bg-gray-200" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
              </div>
            </div>

            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Baixe Agora:{" "}
                <span className="text-red-600 relative">
                  O Script Gerador de Inícios
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </span>
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Você está a poucas fases de destravar seus inícios e crescer absurdamente sua equipe a partir de hoje.
              </p>
            </div>

            {/* Hero Image */}
            <div className="relative my-12">
              <div className="relative w-full max-w-2xl mx-auto">
                <div className="aspect-[16/10] relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                  <Image
                    src="/pink-car-app-interface.png"
                    alt="Script de Inícios"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                {/* Floating elements */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Crown className="w-6 h-6 text-yellow-800" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-green-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Zap className="w-6 h-6 text-green-800" />
                </div>
              </div>
            </div>

            {/* Game Rules */}
            <Card className="max-w-2xl mx-auto bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
              <CardContent className="p-8">
                <h3 className="font-bold text-xl mb-6 text-center text-purple-800">
                  🎮 A cada fase que você avançar aqui:
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 font-medium">Um bônus é desbloqueado.</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">Você acumula pontos.</span>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl border-2 border-yellow-300">
                    <Trophy className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700 font-medium leading-relaxed">
                      No final, se chegar a 100 pontos, você desbloqueia e baixa o{" "}
                      <strong className="text-purple-700">
                        Script de Inícios Automáticos completo + bônus exclusivos
                      </strong>{" "}
                      — e já pode começar a fazer novos inícios ainda hoje.
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA Button */}
            <div className="space-y-6">
              <Button
                onClick={() => {
                  enableAudio()
                  nextStep(0)
                }}
                className="w-full max-w-md mx-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-8 text-lg font-bold rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-200 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                <span className="relative flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Sim, quero desbloquear meus inícios
                  <Sparkles className="w-5 h-5" />
                </span>
              </Button>

              {/* Social Proof */}
              <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-green-500 max-w-md mx-auto">
                <p className="text-sm font-bold text-gray-800">{notificationText || "Carregando..."}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Corra! Faltam menos de <strong className="text-red-600">{currentVacancies}</strong> vagas para
                  encerrar hoje.
                </p>
              </div>
            </div>
          </motion.div>
        )
      case 2:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8">
            {/* Points Achievement */}
            <div className="relative">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-2xl border-2 border-purple-300">
                <div className="flex items-center justify-center gap-2 text-purple-700 font-bold text-lg mb-2">
                  <Star className="w-6 h-6 text-yellow-500" />🎯 Você conquistou: 15 pontos até agora!
                  <Star className="w-6 h-6 text-yellow-500" />
                </div>
                <div className="text-sm text-purple-600">Parabéns! Você subiu de nível! 🎉</div>
              </div>
            </div>

            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Isso aqui também não é pra te vender um "coach ou cursinho motivacional"....
              </h1>
              <div className="max-w-3xl mx-auto">
                <p className="text-lg text-gray-600 leading-relaxed">
                  Estamos aqui{" "}
                  <strong className="text-purple-700">
                    pra te mostrar como iniciar pessoas todos os dias com um mecanismo simples
                  </strong>
                  , que pode ser aplicado mesmo que você esteja sem tempo, travada ou sem saber o que fazer.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <Button
                onClick={() => {
                  enableAudio()
                  nextStep(15)
                }}
                className="w-full max-w-md mx-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-8 text-lg font-bold rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Quero continuar mesmo assim
              </Button>
              <p className="text-sm text-gray-500 italic max-w-md mx-auto">
                Clique no botão acima para <strong>subir de nível</strong> e receber as próximas instruções.
              </p>
            </div>
          </motion.div>
        )
      case 3:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8">
            {/* Points Display */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-2xl border-2 border-purple-300">
              <div className="flex items-center justify-center gap-2 text-purple-700 font-bold text-lg">
                <Star className="w-6 h-6 text-yellow-500" />🎯 Você conquistou: {state.points} pontos até agora!
                <Star className="w-6 h-6 text-yellow-500" />
              </div>
            </div>

            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Você não precisa saber como começar
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Mas precisa <strong className="text-purple-700">querer começar!</strong> Escolha uma opção abaixo:
              </p>
            </div>

            {/* Interactive Options */}
            <div className="max-w-2xl mx-auto">
              <RadioGroup onValueChange={(value) => handleOptionSelect("startChoice", value)} className="space-y-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center space-x-4 p-6 border-2 rounded-2xl hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 hover:border-green-300 transition-all cursor-pointer"
                >
                  <RadioGroupItem value="strategy" id="strategy" className="w-5 h-5" />
                  <Label htmlFor="strategy" className="text-left flex-1 cursor-pointer font-medium text-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Zap className="w-4 h-4 text-green-600" />
                      </div>
                      Quero iniciar usando uma estratégia simples, validada e pronta.
                    </div>
                  </Label>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center space-x-4 p-6 border-2 rounded-2xl hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 hover:border-red-300 transition-all cursor-pointer"
                >
                  <RadioGroupItem value="later" id="later" className="w-5 h-5" />
                  <Label htmlFor="later" className="text-left flex-1 cursor-pointer font-medium text-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-red-600" />
                      </div>
                      Prefiro deixar pra outro dia.
                    </div>
                  </Label>
                </motion.div>
              </RadioGroup>
            </div>

            <div className="space-y-6">
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 max-w-md mx-auto">
                <p className="text-purple-700 text-sm font-bold flex items-center justify-center gap-2">
                  <Gift className="w-4 h-4" />✓ Você irá desbloquear +1 bônus ao responder
                </p>
              </div>
              {state.selectedOptions.startChoice && (
                <Button
                  onClick={() => {
                    enableAudio()
                    if (state.selectedOptions.startChoice === "strategy") {
                      unlockBonus("Gerador de Cadastros")
                      addPoints(15)
                      setTimeout(() => goToStep(5), 500)
                    } else {
                      goToStep(4)
                    }
                  }}
                  className="w-full max-w-md mx-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-8 text-lg font-bold rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-200"
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
            className="text-center space-y-8"
          >
            <div className="relative">
              <div className="text-6xl md:text-7xl font-bold text-red-600 mb-8 font-mono tracking-wider">
                VOCÊ
                <br />
                PERDEU
              </div>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">💔</span>
              </div>
            </div>

            <div className="relative w-64 h-64 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-red-200 rounded-full"></div>
              <Image
                src="/placeholder.svg?height=256&width=256&text=Game+Over"
                alt="Você perdeu"
                width={256}
                height={256}
                className="relative z-10 rounded-full"
              />
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-800">Você não está pronta.</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Infelizmente nosso script não é para você. Precisamos de pessoas comprometidas, pois ao aplicar o que
                vamos te ensinar você terá resultados incríveis.
              </p>
            </div>

            <Button
              onClick={() => goToStep(3)}
              className="w-full max-w-md mx-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-8 text-lg font-bold rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Voltar e tentar novamente.
            </Button>
          </motion.div>
        )
      case 5:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8">
            {/* Achievement Header */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-2xl border-2 border-purple-300">
              <div className="flex items-center justify-center gap-2 text-purple-700 font-bold text-lg mb-2">
                <Star className="w-6 h-6 text-yellow-500" />🎯 Você conquistou: {state.points} pontos até agora + um
                super bônus!
                <Star className="w-6 h-6 text-yellow-500" />
              </div>
            </div>

            {/* Unlock Animation */}
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl"
              >
                <Unlock className="w-12 h-12 text-white" />
              </motion.div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <Sparkles className="w-4 h-4 text-yellow-800" />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Bônus 1 desbloqueado!
              </h1>
              <h2 className="text-xl text-gray-600 font-semibold">Gerador de cadastros infinitos desbloqueado</h2>
            </div>

            {/* Bonus Card */}
            <Card className="max-w-lg mx-auto bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200 shadow-2xl">
              <CardContent className="p-8">
                <div className="relative mb-6">
                  <div className="aspect-video w-full relative rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src="/gerador-cadastros-bonus.png"
                      alt="Gerador de Cadastros"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute -top-3 -right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                    NOVO!
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-gray-400 line-through text-lg">DE R$ 97,00</div>
                  <div className="text-3xl font-bold text-green-600 flex items-center justify-center gap-2">
                    <Gift className="w-6 h-6" />
                    POR ZERO
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <div className="max-w-2xl mx-auto space-y-6">
              <h3 className="text-2xl font-bold text-gray-800">Comece a atrair novos inícios ainda hoje.</h3>
              <p className="text-lg text-purple-600 font-semibold">(sem precisar correr atrás)</p>

              <div className="grid gap-4">
                {[
                  "Enquanto você dorme, esse mecanismo atrai mulheres interessadas em fazer parte da sua equipe.",
                  "Quando acordar, já vai ter nomes esperando por você — prontas pra começar.",
                  "E o melhor? Sem ter que ficar enviando mensagens aleatórias ou forçar convite.",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={() => {
                enableAudio()
                nextStep(20)
              }}
              className="w-full max-w-md mx-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-8 text-lg font-bold rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Sim, quero desbloquear o próximo nível!
            </Button>
          </motion.div>
        )
      case 6:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8">
            {/* Points Display */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-2xl border-2 border-purple-300">
              <div className="flex items-center justify-center gap-2 text-purple-700 font-bold text-lg">
                <Star className="w-6 h-6 text-yellow-500" />🎯 Você conquistou: {state.points} pontos até agora!
                <Star className="w-6 h-6 text-yellow-500" />
              </div>
            </div>

            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Você não está sozinha. Elas também achavam que já tinham tentado de tudo...
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Nossas alunas do Script/Robô gerador de inícios aplicaram com dedicação tudo que aprenderam e{" "}
                <span className="text-purple-600 font-bold">estão iniciando todos os dias.</span>
              </p>
            </div>

            {/* Video Section */}
            <div className="max-w-4xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black">
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    id="panda-c0fd1497-990b-4ea7-abc1-d689539df929"
                    src="https://player-vz-c232c405-6bd.tv.pandavideo.com.br/embed/?v=c0fd1497-990b-4ea7-abc1-d689539df929"
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                    allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture"
                    allowFullScreen={true}
                    fetchPriority="high"
                  />
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                { src: "/whatsapp-testimonial-1.png", alt: "Depoimento WhatsApp 1" },
                { src: "/whatsapp-testimonial-2.png", alt: "Depoimento WhatsApp 2" },
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="relative"
                >
                  <div className="relative aspect-[9/16] max-w-sm mx-auto rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                    <Image
                      src={testimonial.src || "/placeholder.svg"}
                      alt={testimonial.alt}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button
              onClick={() => {
                enableAudio()
                nextStep(15)
              }}
              className="w-full max-w-md mx-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-8 text-lg font-bold rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Continuar para a próxima fase
            </Button>
          </motion.div>
        )
      case 7:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8">
            {/* Enhanced Points Display */}
            <div className="relative">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-8 rounded-3xl border-4 border-purple-300 shadow-xl">
                <div className="flex items-center justify-center gap-3 text-purple-700 font-bold text-xl mb-3">
                  <Star className="w-8 h-8 text-yellow-500 animate-pulse" />
                  Você conquistou: {state.points} pontos até agora!
                  <Star className="w-8 h-8 text-yellow-500 animate-pulse" />
                </div>
                <div className="text-purple-600 font-semibold">
                  🔥 Você está quase lá! Faltam poucos pontos para os 100!
                </div>
                <div className="mt-4">
                  <Progress value={(state.points / 100) * 100} className="w-full h-4" />
                  <div className="text-sm text-purple-600 mt-2">
                    {100 - state.points} pontos restantes para o prêmio final!
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">Hora da Sinceridade</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">O que mais te impede de fazer inícios hoje?</p>
            </div>

            {/* Enhanced Options */}
            <div className="max-w-3xl mx-auto">
              <RadioGroup onValueChange={(value) => handleOptionSelect("obstacle", value)} className="space-y-4">
                {[
                  { value: "time", label: "Falta de tempo", icon: Clock, color: "blue" },
                  { value: "fear", label: 'Medo de continuar ouvindo "Não"', icon: Target, color: "red" },
                  { value: "approach", label: "Não sei como oferecer a oportunidade", icon: Gift, color: "orange" },
                  { value: "ready", label: "Nada me impede, estou pronta!", icon: Zap, color: "green" },
                ].map((opt) => (
                  <motion.div
                    key={opt.value}
                    whileHover={{ scale: 1.02 }}
                    className={`flex items-center space-x-4 p-6 border-2 rounded-2xl hover:bg-gradient-to-r hover:from-${opt.color}-50 hover:to-${opt.color}-100 hover:border-${opt.color}-300 transition-all cursor-pointer shadow-sm hover:shadow-lg`}
                  >
                    <RadioGroupItem value={opt.value} id={opt.value} className="w-6 h-6" />
                    <Label htmlFor={opt.value} className="text-left flex-1 cursor-pointer font-medium text-gray-700">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 bg-${opt.color}-100 rounded-full flex items-center justify-center`}>
                          <opt.icon className={`w-6 h-6 text-${opt.color}-600`} />
                        </div>
                        <span className="text-lg">{opt.label}</span>
                      </div>
                    </Label>
                  </motion.div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200 max-w-lg mx-auto">
                <p className="text-purple-700 font-bold flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5" />✨ Você irá desbloquear +1 bônus de nível maior ao responder
                </p>
                <p className="text-sm text-purple-600">Esta é uma das últimas etapas para chegar aos 100 pontos!</p>
              </div>
              {state.selectedOptions.obstacle && (
                <Button
                  onClick={() => {
                    enableAudio()
                    const stepMap = { time: 8, fear: 9, approach: 10, ready: 11 }
                    addPoints(15)
                    setTimeout(() => goToStep(stepMap[state.selectedOptions.obstacle as keyof typeof stepMap]), 500)
                  }}
                  className="w-full max-w-md mx-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-8 text-lg font-bold rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Continuar para os 100 pontos!
                </Button>
              )}
            </div>
          </motion.div>
        )
      // Continue with cases 8-12 following the same enhanced pattern...
      case 8: // Falta de tempo
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8">
            <div className="relative">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-8 rounded-3xl border-4 border-purple-300 shadow-xl">
                <div className="flex items-center justify-center gap-3 text-purple-700 font-bold text-xl mb-3">
                  <Star className="w-8 h-8 text-yellow-500 animate-pulse" />
                  Você conquistou: {state.points} pontos até agora!
                  <Star className="w-8 h-8 text-yellow-500 animate-pulse" />
                </div>
                <div className="text-purple-600 font-semibold">🔥 Quase lá! Você está a poucos pontos dos 100!</div>
              </div>
            </div>

            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Só 10 minutos por dia podem destravar seus inícios. Topa tentar?
              </h1>
              <div className="max-w-3xl mx-auto space-y-4">
                <p className="text-lg text-gray-600 leading-relaxed">
                  O que você vai ter acesso é tão direto que cabe até no intervalo de uma reunião ou antes de dormir.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  E se aplicar só uma parte do que vai receber,{" "}
                  <strong className="text-purple-700">já vai sentir diferença nos seus resultados</strong>
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-6 rounded-2xl border-2 border-yellow-300 max-w-lg mx-auto">
              <p className="text-yellow-800 font-bold flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />⏰ 10 minutos por dia é tudo que você precisa para transformar seus
                resultados!
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => {
                  enableAudio()
                  addPoints(20)
                  setTimeout(() => goToStep(11), 500)
                }}
                className="w-full max-w-lg mx-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-8 text-lg font-bold rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Me comprometo com meus próximos inícios
              </Button>
              <p className="text-sm text-gray-500 italic max-w-md mx-auto">
                Clique no botão acima para <strong>conquistar os 100 pontos!</strong>
              </p>
            </div>
          </motion.div>
        )
      case 9: // Medo de ouvir "não"
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8">
            <div className="relative">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-8 rounded-3xl border-4 border-purple-300 shadow-xl">
                <div className="flex items-center justify-center gap-3 text-purple-700 font-bold text-xl mb-3">
                  <Star className="w-8 h-8 text-yellow-500 animate-pulse" />
                  Você conquistou: {state.points} pontos até agora!
                  <Star className="w-8 h-8 text-yellow-500 animate-pulse" />
                </div>
                <div className="text-purple-600 font-semibold">🔥 Quase lá! Você está a poucos pontos dos 100!</div>
              </div>
            </div>

            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Ouvir "não" toda hora não é normal. Falta método.
              </h1>
              <div className="max-w-3xl mx-auto space-y-6">
                <p className="text-lg text-gray-600">O problema não é o "não".</p>
                <p className="text-lg text-gray-600">
                  O problema é falar com pessoas erradas, do jeito errado, sem confiança e sem estrutura.
                </p>
                <p className="text-xl text-purple-600 font-bold">O Script resolve isso.</p>
                <p className="text-lg text-gray-600">
                  Ele mostra <strong className="text-purple-700">exatamente o que fazer</strong> — com quem falar, como
                  abordar, o que dizer, e como manter tudo leve e natural.
                </p>
                <p className="text-lg text-gray-600">
                  Quando você segue um passo a passo que funciona, o medo vai embora.
                </p>
                <p className="text-lg text-gray-600">A insegurança vira clareza.</p>
                <p className="text-lg text-gray-600 font-semibold">E quem tem clareza, age.</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-100 to-blue-100 p-6 rounded-2xl border-2 border-green-300 max-w-lg mx-auto">
              <p className="text-green-800 font-bold flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />💪 Com o método certo, você vai ouvir mais "SIM" do que imagina!
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => {
                  enableAudio()
                  addPoints(20)
                  setTimeout(() => goToStep(11), 500)
                }}
                className="w-full max-w-lg mx-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-8 text-lg font-bold rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Quero destravar meus inícios automáticos
              </Button>
              <p className="text-sm text-gray-500 italic max-w-md mx-auto">
                Clique no botão acima para <strong>conquistar os 100 pontos!</strong>
              </p>
            </div>
          </motion.div>
        )
      case 10: // Não sabe como oferecer
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8">
            <div className="relative">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-8 rounded-3xl border-4 border-purple-300 shadow-xl">
                <div className="flex items-center justify-center gap-3 text-purple-700 font-bold text-xl mb-3">
                  <Star className="w-8 h-8 text-yellow-500 animate-pulse" />
                  Você conquistou: {state.points} pontos até agora!
                  <Star className="w-8 h-8 text-yellow-500 animate-pulse" />
                </div>
                <div className="text-purple-600 font-semibold">🔥 Quase lá! Você está a poucos pontos dos 100!</div>
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl">
                <Gift className="w-10 h-10 text-white" />
              </div>
            </div>

            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Não saber o que dizer é mais comum do que você imagina.
              </h1>
              <p className="text-xl text-purple-600 font-bold">E a boa notícia: você não precisa inventar nada.</p>

              <div className="max-w-3xl mx-auto space-y-6">
                <p className="text-lg text-gray-600 leading-relaxed">
                  A maioria trava porque tenta oferecer do jeito errado — sem clareza, sem sequência, sem saber como
                  começar.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  É por isso que criamos um <strong className="text-purple-700">método testado e pronto</strong>, com
                  tudo o que você precisa.
                </p>
                <p className="text-xl text-purple-600 font-bold">✨ Só copiar, adaptar ao seu jeito, e aplicar.</p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Mesmo quem nunca teve coragem de oferecer, sente segurança logo no primeiro passo.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-6 rounded-2xl border-2 border-blue-300 max-w-lg mx-auto">
              <p className="text-blue-800 font-bold flex items-center justify-center gap-2">
                <span className="text-2xl">📝</span>
                Scripts prontos para você nunca mais ficar sem saber o que dizer!
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => {
                  enableAudio()
                  addPoints(20)
                  setTimeout(() => goToStep(11), 500)
                }}
                className="w-full max-w-lg mx-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-8 text-lg font-bold rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Quero receber o Script de Inícios Automáticos
              </Button>
            </div>
          </motion.div>
        )
      case 11: // "Estou pronta!"
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8">
            {/* Victory Display */}
            <div className="relative">
              <div className="bg-gradient-to-r from-green-100 to-yellow-100 p-8 rounded-3xl border-4 border-green-400 shadow-2xl">
                <div className="text-green-700 font-semibold mb-2">Você conquistou:</div>
                <div className="text-4xl font-bold text-green-600 mb-4 flex items-center justify-center gap-2">
                  <Trophy className="w-10 h-10 text-yellow-500" />
                  100 pontos, parabéns!
                  <Trophy className="w-10 h-10 text-yellow-500" />
                </div>
                <Progress value={100} className="w-full h-6 mb-4" />
                <div className="text-green-600 font-bold">🎉 MISSÃO CUMPRIDA! 🎉</div>
              </div>
              {/* Celebration elements */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <Crown className="w-6 h-6 text-yellow-800" />
              </div>
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="w-6 h-6 text-green-800" />
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative w-full max-w-2xl mx-auto">
              <div className="aspect-[16/10] relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                <Image src="/pink-car-app-interface.png" alt="Script de Inícios" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>

            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                É disso que a gente precisa: decisão.
              </h1>
              <div className="max-w-3xl mx-auto space-y-4">
                <p className="text-lg text-gray-600 leading-relaxed">
                  Quem chega até aqui pronta pra agir já tá à frente de 95% das pessoas.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Agora você vai desbloquear o acesso ao material que vai te garantir inícios todos os dias com
                  consistência.
                </p>
                <p className="text-xl text-purple-600 font-bold">E transformar sua rotina, sua renda e sua equipe.</p>
              </div>
            </div>

            <Button
              onClick={() => {
                enableAudio()
                setState((prev) => ({ ...prev, points: 100 }))
                nextStep(0)
              }}
              className="w-full max-w-md mx-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 px-8 text-xl font-bold rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-200 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              <span className="relative flex items-center justify-center gap-2">
                <Trophy className="w-6 h-6" />
                Resgatar todos os bônus agora!
                <Trophy className="w-6 h-6" />
              </span>
            </Button>
          </motion.div>
        )
      case 12: // Final Pitch - Enhanced
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            {/* Progress Complete */}
            <div className="relative">
              <div className="bg-gradient-to-r from-green-100 to-yellow-100 p-6 rounded-3xl border-4 border-green-400 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold text-green-700">Progresso Completo!</span>
                  <span className="text-lg font-bold text-green-700">100%</span>
                </div>
                <Progress value={100} className="w-full h-6 bg-green-200 mb-4" />
                <div className="flex justify-center">
                  <div className="flex items-center gap-2">
                    <Star className="w-6 h-6 text-yellow-500 fill-current" />
                    <Star className="w-6 h-6 text-yellow-500 fill-current" />
                    <Star className="w-6 h-6 text-yellow-500 fill-current" />
                  </div>
                </div>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-2xl shadow-2xl">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Clock className="w-6 h-6 animate-pulse" />
                  <span className="font-bold text-xl">OFERTA EXPIRA EM:</span>
                </div>
                <div className="text-5xl font-bold font-mono tracking-wider mb-2">
                  {String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
                </div>
                <p className="text-sm opacity-90">⚡ Condição especial válida apenas hoje!</p>
              </div>
            </div>

            {/* Achievement Banner */}
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-100 to-yellow-100 text-green-800 px-8 py-4 rounded-full text-lg font-bold border-2 border-green-300">
                <Trophy className="w-6 h-6" />
                MISSÃO CUMPRIDA - 100 PONTOS!
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                🎉 Parabéns!
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Você desbloqueou TODOS os bônus!</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Agora você tem acesso ao <strong>Script de Inícios Automáticos completo</strong> + todos os bônus
                exclusivos por uma condição especial que nunca mais se repetirá.
              </p>
            </div>

            {/* Bonus Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                  className="bg-white p-8 rounded-2xl shadow-xl border-4 border-green-200 hover:border-green-300 transition-all hover:shadow-2xl"
                >
                  <div className="text-center space-y-4">
                    <h3 className="font-bold text-xl text-green-600">{bonus.title}</h3>
                    <h4 className="font-semibold text-gray-800 text-lg">{bonus.subtitle}</h4>
                    <div>
                      <span className="text-gray-400 line-through text-lg">DE {bonus.value}</span>
                      <div className="text-3xl font-bold text-green-600 flex items-center justify-center gap-2">
                        <Gift className="w-6 h-6" />
                        GRÁTIS
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{bonus.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Main Offer Section */}
            <div className="bg-gradient-to-br from-white via-purple-50 to-pink-50 p-8 md:p-12 rounded-3xl shadow-2xl border-4 border-purple-200">
              <div className="text-center space-y-8">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 rounded-full text-xl font-bold shadow-xl animate-pulse">
                  <span className="text-2xl">🔥</span>
                  <span>OFERTA ESPECIAL - 61% OFF</span>
                </div>

                <div className="relative w-full max-w-md mx-auto">
                  <div className="aspect-[3/4] relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                    <Image
                      src="/woman-laptop-pink-blazer.png"
                      alt="Mentora Script de Inícios"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
                    Script Gerador de <br />
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Inícios Automáticos
                    </span>
                  </h2>
                  <div className="max-w-3xl mx-auto">
                    <p className="text-xl md:text-2xl text-gray-600 leading-relaxed mb-8">
                      Pelos próximos minutos você terá acesso ao método completo que já transformou a vida de
                    </p>
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-3xl border-4 border-purple-300">
                      <div className="text-4xl md:text-5xl font-bold text-purple-700 mb-2">+13.847 consultoras</div>
                      <p className="text-purple-600 font-bold text-lg">por uma condição jamais vista</p>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  <div className="bg-white p-6 rounded-2xl shadow-xl border-4 border-green-200 hover:border-green-300 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16">
                        <Image src="/90-days-guarantee.png" alt="Garantia" fill className="object-contain" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-green-700 text-lg">Garantia Blindada</div>
                        <div className="text-green-600">90 dias em dobro</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-xl border-4 border-blue-200 hover:border-blue-300 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-32">
                        <Image src="/hotmart-logo.png" alt="Hotmart" fill className="object-contain" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-blue-700 text-lg">Pagamento Seguro</div>
                        <div className="text-blue-600">Plataforma confiável</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl border-4 border-green-400">
              <div className="text-center space-y-8">
                <div className="space-y-4">
                  <p className="text-xl text-gray-600">Valor total dos bônus:</p>
                  <div className="text-3xl text-gray-400 line-through">R$ 988,00</div>
                  <p className="text-xl text-gray-600">Preço normal do Script:</p>
                  <div className="text-4xl text-gray-400 line-through">R$ 197,00</div>

                  <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-8 rounded-2xl shadow-xl">
                    <p className="text-2xl mb-4">🎯 Sua condição especial HOJE:</p>
                    <div className="text-6xl md:text-7xl font-bold mb-4">R$ 67,00</div>
                    <div className="text-2xl mb-2">ou 9x de R$ 8,80</div>
                    <p className="text-lg opacity-90">💳 Sem juros no cartão</p>
                  </div>

                  <div className="bg-yellow-50 border-4 border-yellow-300 p-6 rounded-2xl">
                    <p className="text-yellow-800 font-bold text-xl">⚡ ECONOMIA DE R$ 1.118,00!</p>
                    <p className="text-yellow-700 text-lg">Você está pagando apenas 5% do valor real</p>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    enableAudio()
                    playSound("success")
                    window.open("https://pay.hotmart.com/Y22978658D?off=5le6e7pp&checkoutMode=10", "_blank")
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-6 px-8 text-xl md:text-2xl font-bold rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-200 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  <span className="relative flex items-center justify-center gap-3">
                    <Trophy className="w-8 h-8" />
                    <div className="text-center leading-tight">
                      QUERO MEU SCRIPT +<br />
                      TODOS OS BÔNUS!
                    </div>
                    <Trophy className="w-8 h-8" />
                  </span>
                </Button>

                <div className="flex items-center justify-center gap-3 text-gray-600">
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold">
                    <strong>127 pessoas</strong> compraram nas últimas 2 horas
                  </span>
                </div>

                <p className="text-gray-500">🔒 Compra 100% segura • ⚡ Acesso imediato • 🎯 Garantia de 90 dias</p>
              </div>
            </div>

            {/* What You Get Section */}
            <div className="bg-gray-50 p-8 md:p-12 rounded-3xl shadow-xl">
              <h3 className="text-3xl font-bold text-center mb-8 text-gray-800">🎁 Tudo que você vai receber HOJE:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  "Script de Inícios Ativo e Receptivo (mensagens prontas e persuasivas)",
                  "Sistema Gerador de pessoas interessadas em ser consultora independente",
                  "Acesso ao Grupo VIP de Iniciadoras no WhatsApp",
                  "Disparador automático para enviar mensagens em massa",
                  "Acesso vitalício e suporte direto",
                  "Aulas em vídeo completas passo a passo",
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <span className="text-green-600 font-bold text-2xl">✅</span>
                    <span className="text-gray-700 font-medium leading-relaxed">{item}</span>
                  </motion.div>
                ))}
              </div>
              <div className="mt-8 p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl border-2 border-purple-300">
                <p className="text-purple-800 font-bold text-center text-lg leading-relaxed">
                  💎 Ou seja: não é só um PDF. É um kit completo de crescimento de equipe, feito para você iniciar mais
                  pessoas e pontuar mais, mesmo com pouco tempo disponível.
                </p>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="space-y-6">
              <h4 className="text-3xl font-bold text-center text-gray-800">❓ Perguntas Mais Frequentes</h4>
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
                    className="bg-white border-4 border-gray-200 rounded-2xl p-8 hover:border-purple-300 transition-all shadow-lg hover:shadow-xl"
                  >
                    <summary className="font-bold cursor-pointer text-purple-600 hover:text-purple-800 text-xl flex items-center gap-3">
                      <span className="text-3xl">❓</span>
                      {faq.question}
                    </summary>
                    <div className="mt-6 text-gray-600 leading-relaxed pl-12 text-lg">{faq.answer}</div>
                  </details>
                ))}
              </div>
            </div>

            {/* Urgency Section */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-4 border-red-200 p-8 rounded-2xl text-center shadow-xl">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-bold text-red-700 text-2xl">ATENÇÃO: Vagas Limitadas!</span>
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-red-700 text-xl mb-2">
                <strong>Apenas 23 vagas restantes</strong> para essa condição especial
              </p>
              <p className="text-red-600 text-lg">
                Após esgotar, o preço volta para R$ 197,00 + você perde todos os bônus
              </p>
            </div>
          </motion.div>
        )
      default:
        return <div>Etapa não encontrada</div>
    }
  }

  const ConfettiPiece = ({ id }: { id: number }) => (
    <motion.div
      key={id}
      className="absolute w-3 h-3 rounded-full"
      style={{
        backgroundColor: ["#9333ea", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"][Math.floor(Math.random() * 5)],
        left: `${Math.random() * 100}%`,
        top: "-10px",
      }}
      initial={{ y: -10, rotate: 0, opacity: 1 }}
      animate={{
        y: typeof window !== "undefined" ? window.innerHeight + 100 : 1000,
        rotate: Math.random() * 360,
        opacity: 0,
        x: Math.random() * 200 - 100,
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay: Math.random() * 0.5,
        ease: "linear",
      }}
    />
  )

  const ConfettiEffect = () => {
    if (typeof window === "undefined") return null
    const confettiPieces = Array.from({ length: 100 }, (_, i) => <ConfettiPiece key={i} id={i} />)
    return <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">{confettiPieces}</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Enhanced Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b-2 border-purple-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {state.step > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setState((prev) => ({ ...prev, step: prev.step - 1 }))}
                className="hover:bg-purple-100 rounded-xl p-3"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div className="flex items-center gap-3 flex-1 justify-center">
              <div className="relative">
                <Image
                  src="/scriptdeinicios-logo-pink-gradient.png"
                  alt="Script de Inícios"
                  width={200}
                  height={52}
                  priority
                  className="drop-shadow-lg"
                />
              </div>
            </div>
            {state.points > 0 && (
              <motion.div
                className={`flex items-center gap-3 bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-3 rounded-2xl border-2 border-purple-300 shadow-lg ${pointsAnimation ? "animate-pulse bg-gradient-to-r from-yellow-200 to-orange-200 border-yellow-400" : ""}`}
                animate={
                  pointsAnimation
                    ? {
                        scale: [1, 1.2, 1],
                        boxShadow: [
                          "0 0 0 0 rgba(147, 51, 234, 0.4)",
                          "0 0 0 15px rgba(147, 51, 234, 0)",
                          "0 0 0 0 rgba(147, 51, 234, 0)",
                        ],
                      }
                    : {}
                }
                transition={{ duration: 0.6 }}
              >
                <Star className="w-6 h-6 text-purple-600" />
                <span className="text-xl font-bold text-purple-600">{state.points} pts</span>
              </motion.div>
            )}
            {state.step === 1 && state.points === 0 && <div className="w-24"></div>}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.step}
            initial={{ opacity: 0, x: isAnimating && state.step > 1 ? 20 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Enhanced Notifications */}
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: "-50%" }}
          animate={{ opacity: 1, y: 20, x: "-50%" }}
          exit={{ opacity: 0, y: -50, x: "-50%" }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-2xl shadow-2xl z-[60] border-2 border-green-400"
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span className="font-semibold">{notificationText}</span>
          </div>
        </motion.div>
      )}

      {showConfetti && <ConfettiEffect />}
    </div>
  )
}
