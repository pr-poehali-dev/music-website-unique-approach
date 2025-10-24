import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';

interface Track {
  id: number;
  title: string;
  duration: string;
  url?: string;
}

interface AudioPlayerProps {
  track: Track | null;
  onClose: () => void;
}

export default function AudioPlayer({ track, onClose }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (track && audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [track]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!track) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-white/10 z-50">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      >
        <source src={track.url || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'} type="audio/mpeg" />
      </audio>

      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center flex-shrink-0">
              <Icon name="Music" size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-heading font-semibold text-white truncate">{track.title}</h4>
              <p className="text-white/50 text-sm">Нестандартный подход</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-[2]">
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/10"
              onClick={togglePlayPause}
            >
              <Icon name={isPlaying ? 'Pause' : 'Play'} size={24} />
            </Button>

            <div className="flex items-center gap-3 flex-1">
              <span className="text-xs text-white/50 font-mono w-12 text-right">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="flex-1"
              />
              <span className="text-xs text-white/50 font-mono w-12">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Icon name="Volume2" size={18} className="text-white/50" />
            <Slider
              value={[volume]}
              max={100}
              step={1}
              onValueChange={(value) => setVolume(value[0])}
              className="w-24"
            />
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="text-white/50 hover:text-white hover:bg-white/10"
            onClick={onClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
