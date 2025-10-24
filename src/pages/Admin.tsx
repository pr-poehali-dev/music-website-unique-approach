import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Track {
  id: number;
  title: string;
  artist?: string;
  duration: string;
  url: string;
}

export default function Admin() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/dcb4a166-4423-4618-af6d-90fc6c42d2b3');
      const data = await response.json();
      setTracks(data.tracks || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить треки',
        variant: 'destructive',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setSelectedFile(file);
      
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        const minutes = Math.floor(audio.duration / 60);
        const seconds = Math.floor(audio.duration % 60);
        setDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      };
    } else {
      toast({
        title: 'Ошибка',
        description: 'Выберите аудиофайл',
        variant: 'destructive',
      });
    }
  };

  const handleUpload = async () => {
    if (!title || !selectedFile) {
      toast({
        title: 'Ошибка',
        description: 'Заполните название и выберите файл',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileData = e.target?.result as string;

        const response = await fetch('https://functions.poehali.dev/d3f8862d-9379-4a7c-b077-10bd733243e8', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            duration,
            fileData,
            fileName: selectedFile.name,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          toast({
            title: 'Успешно',
            description: 'Трек загружен',
          });
          
          setTitle('');
          setDuration('');
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          
          fetchTracks();
        } else {
          throw new Error(data.error || 'Upload failed');
        }
      };
      
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось загрузить трек',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h1 className="font-heading text-4xl font-black">Админ-панель</h1>
            <Button
              variant="outline"
              className="border-white/20 hover:bg-white/10"
              onClick={() => window.location.href = '/'}
            >
              <Icon name="ArrowLeft" size={20} className="mr-2" />
              На сайт
            </Button>
          </div>

          <Card className="bg-white/5 border-white/10 p-8 mb-8">
            <h2 className="font-heading text-2xl font-bold mb-6 text-primary">
              Загрузить новый трек
            </h2>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-white/80 mb-2 block">
                  Название трека
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Мой новый трек"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <Label htmlFor="duration" className="text-white/80 mb-2 block">
                  Длительность (заполнится автоматически)
                </Label>
                <Input
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="3:45"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <Label htmlFor="file" className="text-white/80 mb-2 block">
                  Аудиофайл (MP3, WAV, OGG)
                </Label>
                <Input
                  id="file"
                  type="file"
                  ref={fileInputRef}
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="bg-white/5 border-white/10 text-white file:text-white file:bg-primary/20 file:border-0 file:mr-4 file:px-4 file:py-2 file:rounded"
                />
                {selectedFile && (
                  <p className="text-sm text-white/50 mt-2">
                    Выбран: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-heading w-full"
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Icon name="Upload" size={20} className="mr-2" />
                    Загрузить трек
                  </>
                )}
              </Button>
            </div>
          </Card>

          <Card className="bg-white/5 border-white/10 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl font-bold text-primary">
                Загруженные треки
              </h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={fetchTracks}
                className="text-white/60 hover:text-white"
              >
                <Icon name="RefreshCw" size={18} className="mr-2" />
                Обновить
              </Button>
            </div>

            {tracks.length === 0 ? (
              <p className="text-white/50 text-center py-12">
                Нет загруженных треков. Загрузите первый трек выше.
              </p>
            ) : (
              <div className="space-y-3">
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
                        <Icon name="Music" size={20} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-heading font-semibold">{track.title}</h4>
                        <p className="text-sm text-white/50">{track.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white/60 hover:text-white"
                        onClick={() => window.open(track.url, '_blank')}
                      >
                        <Icon name="ExternalLink" size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
