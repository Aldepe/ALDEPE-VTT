import { useEffect, useRef, useState } from 'react'
import { Sparkles, Volume1, Volume2, VolumeX } from 'lucide-react'
import type { AudioSettings } from '@domain/entities/audio'

interface AudioControlsProps {
  settings: AudioSettings
  onSetVolume: (volume: number) => Promise<void>
  onToggle: () => Promise<void>
}

function playUiTone(volume: number) {
  const audioWindow = window as typeof window & { webkitAudioContext?: typeof AudioContext }
  const AudioContextConstructor = window.AudioContext ?? audioWindow.webkitAudioContext
  if (!AudioContextConstructor) {
    return undefined
  }

  const context = new AudioContextConstructor()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = 620
  gain.gain.value = Math.max(0.02, volume * 0.12)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start()
  oscillator.stop(context.currentTime + 0.08)
  return context
}

export function AudioControls({ settings, onSetVolume, onToggle }: AudioControlsProps) {
  const contextRef = useRef<AudioContext | undefined>(undefined)
  const [reducedStimulation, setReducedStimulation] = useState(() => window.localStorage.getItem('aldepe-reduced-stimulation') === 'true')
  const Icon = settings.enabled ? (settings.volume > 0.5 ? Volume2 : Volume1) : VolumeX

  useEffect(() => {
    document.documentElement.classList.toggle('reduced-stimulation', reducedStimulation)
    window.localStorage.setItem('aldepe-reduced-stimulation', String(reducedStimulation))
  }, [reducedStimulation])

  async function toggleAudio() {
    await onToggle()
    if (!settings.enabled) {
      contextRef.current = playUiTone(settings.volume)
    }
  }

  async function setVolume(volume: number) {
    await onSetVolume(volume)
    if (settings.enabled) {
      contextRef.current = playUiTone(volume)
    }
  }

  return (
    <div className="audio-controls" aria-label="Controles de sonido">
      <button
        aria-pressed={settings.enabled}
        className="icon-button"
        onClick={() => void toggleAudio()}
        title={settings.enabled ? 'Silenciar sonido' : 'Activar sonido'}
        type="button"
      >
        <Icon size={17} aria-hidden="true" />
        <span className="sr-only">{settings.enabled ? 'Silenciar sonido' : 'Activar sonido'}</span>
      </button>
      <label className="volume-slider">
        <span className="sr-only">Volumen</span>
        <input
          aria-label="Volumen"
          max={1}
          min={0}
          onChange={(event) => void setVolume(Number(event.target.value))}
          step={0.05}
          type="range"
          value={settings.volume}
        />
      </label>
      <button
        aria-pressed={reducedStimulation}
        className={reducedStimulation ? 'icon-button is-active' : 'icon-button'}
        onClick={() => setReducedStimulation((current) => !current)}
        title={reducedStimulation ? 'Activar luces completas' : 'Modo menos estimulos'}
        type="button"
      >
        <Sparkles size={17} aria-hidden="true" />
        <span className="sr-only">{reducedStimulation ? 'Activar luces completas' : 'Modo menos estimulos'}</span>
      </button>
    </div>
  )
}
