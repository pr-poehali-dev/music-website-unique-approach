import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import AudioPlayer from '@/components/AudioPlayer';

interface Track {
  id: number;
  title: string;
  duration: string;
  url?: string;
}

export default function Index() {
  const [activeSection, setActiveSection] = useState('home');
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTracks();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'music', 'bio'];
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchTracks = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/dcb4a166-4423-4618-af6d-90fc6c42d2b3');
      const data = await response.json();
      setTracks(data.tracks || []);
    } catch (error) {
      console.error('Failed to fetch tracks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePlayTrack = (track: Track) => {
    setCurrentTrack(track);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              НЕСТАНДАРТНЫЙ ПОДХОД
            </h1>
            <div className="flex gap-8">
              {[
                { id: 'home', label: 'Главная' },
                { id: 'music', label: 'Музыка' },
                { id: 'bio', label: 'Биография' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`font-heading text-sm font-medium transition-colors relative group ${
                    activeSection === item.id ? 'text-primary' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all ${
                      activeSection === item.id ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <section
        id="home"
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://cdn.poehali.dev/projects/7ea5e62b-967e-43ec-beca-a975ddb7c057/files/c16f70a4-7454-4460-9b2a-2838d9995471.jpg)',
            filter: 'brightness(0.4)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-primary/20" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h2 className="font-heading text-7xl md:text-9xl font-black mb-6 tracking-tighter">
              НЕСТАНДАРТНЫЙ
              <br />
              <span className="bg-gradient-to-r from-primary via-pink-500 to-primary bg-clip-text text-transparent">
                ПОДХОД
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-white/60 mb-12 font-light">
              Музыка, которая бросает вызов стандартам
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-heading font-semibold px-8"
                onClick={() => scrollToSection('music')}
              >
                <Icon name="Play" size={20} className="mr-2" />
                Слушать музыку
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 hover:bg-white/10 font-heading font-semibold px-8"
                onClick={() => scrollToSection('bio')}
              >
                Узнать больше
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="music" className="min-h-screen py-24 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading text-5xl md:text-6xl font-black">
                  МУЗЫКА
                </h3>
                <p className="text-white/60 text-lg mt-2">
                  Последние релизы и популярные треки
                </p>
              </div>
              <Button
                variant="outline"
                className="border-primary/50 hover:bg-primary/10 text-primary"
                onClick={() => window.location.href = '/admin'}
              >
                <Icon name="Upload" size={18} className="mr-2" />
                Загрузить музыку
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <Icon name="Loader2" size={32} className="text-primary animate-spin mx-auto" />
                <p className="text-white/50 mt-4">Загрузка треков...</p>
              </div>
            ) : tracks.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="Music" size={48} className="text-white/20 mx-auto mb-4" />
                <p className="text-white/50 mb-4">Пока нет загруженных треков</p>
                <Button
                  variant="outline"
                  className="border-primary/50 hover:bg-primary/10 text-primary"
                  onClick={() => window.location.href = '/admin'}
                >
                  Загрузить первый трек
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 mt-12">
                {tracks.map((track, index) => (
                <Card
                  key={track.id}
                  className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 hover:border-primary/50 group cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
                        <Icon name="Music" size={28} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-heading font-semibold text-lg group-hover:text-primary transition-colors">
                          {track.title}
                        </h4>
                        <p className="text-white/50 text-sm">Нестандартный подход</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-white/50 font-mono text-sm">{track.duration}</span>
                      <Button
                        size="icon"
                        className="bg-primary/20 hover:bg-primary text-white border-0"
                        onClick={() => handlePlayTrack(track)}
                      >
                        <Icon name="Play" size={18} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              </div>
            )}

            {tracks.length > 0 && (
              <div className="mt-12 grid grid-cols-3 gap-4">
                <Card className="bg-white/5 border-white/10 p-6 text-center">
                  <div className="flex justify-center mb-3">
                    <Icon name="Music2" size={32} className="text-primary" />
                  </div>
                  <p className="text-3xl font-heading font-bold mb-1">{tracks.length}</p>
                  <p className="text-white/50 text-sm">Треков</p>
                </Card>
              <Card className="bg-white/5 border-white/10 p-6 text-center">
                <div className="flex justify-center mb-3">
                  <Icon name="Users" size={32} className="text-primary" />
                </div>
                <p className="text-3xl font-heading font-bold mb-1">5.2K</p>
                <p className="text-white/50 text-sm">Слушателей</p>
              </Card>
              <Card className="bg-white/5 border-white/10 p-6 text-center">
                <div className="flex justify-center mb-3">
                  <Icon name="Disc3" size={32} className="text-primary" />
                </div>
                <p className="text-3xl font-heading font-bold mb-1">3</p>
                <p className="text-white/50 text-sm">Альбома</p>
              </Card>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="bio" className="min-h-screen py-24 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h3 className="font-heading text-5xl md:text-6xl font-black mb-4">
              БИОГРАФИЯ
            </h3>
            <p className="text-white/60 text-lg mb-12">
              История артиста и музыкальный путь
            </p>

            <div className="space-y-8">
              <Card className="bg-white/5 border-white/10 p-0 overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0">
                  <div 
                    className="h-64 md:h-auto bg-cover bg-center"
                    style={{
                      backgroundImage: 'url(https://cdn.poehali.dev/projects/7ea5e62b-967e-43ec-beca-a975ddb7c057/files/0136f0ca-88a1-4054-84e7-c1fafdef8fd6.jpg)'
                    }}
                  />
                  <div className="p-8">
                    <h4 className="font-heading text-2xl font-bold mb-4 text-primary">
                      О проекте
                    </h4>
                    <p className="text-white/70 leading-relaxed mb-4">
                      «Нестандартный подход» — это больше, чем просто музыка. Это философия создания 
                      звука, который не вписывается в традиционные рамки жанров. Проект родился из 
                      желания экспериментировать с формой и содержанием, создавая уникальное звучание.
                    </p>
                    <p className="text-white/70 leading-relaxed">
                      Каждый трек — это исследование границ между электроникой, акустикой и 
                      эмоциональной глубиной. Музыка создаётся не для фона, а для полного погружения.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="bg-white/5 border-white/10 p-8">
                <h4 className="font-heading text-2xl font-bold mb-6 text-primary">
                  Творческий путь
                </h4>
                <div className="space-y-6">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                        <Icon name="Calendar" size={24} className="text-primary" />
                      </div>
                    </div>
                    <div>
                      <h5 className="font-heading font-semibold text-lg mb-2">2020 — Начало</h5>
                      <p className="text-white/60">
                        Запуск проекта и первые эксперименты со звуком. Выпуск дебютного EP.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                        <Icon name="Disc" size={24} className="text-primary" />
                      </div>
                    </div>
                    <div>
                      <h5 className="font-heading font-semibold text-lg mb-2">2022 — Прорыв</h5>
                      <p className="text-white/60">
                        Релиз первого полноформатного альбома, получившего признание критиков.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                        <Icon name="Sparkles" size={24} className="text-primary" />
                      </div>
                    </div>
                    <div>
                      <h5 className="font-heading font-semibold text-lg mb-2">2024 — Сегодня</h5>
                      <p className="text-white/60">
                        Продолжение экспериментов, коллаборации и создание новых звуковых ландшафтов.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="flex gap-4 justify-center pt-8">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 hover:bg-white/10 font-heading"
                >
                  <Icon name="Instagram" size={20} className="mr-2" />
                  Instagram
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 hover:bg-white/10 font-heading"
                >
                  <Icon name="Youtube" size={20} className="mr-2" />
                  YouTube
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 hover:bg-white/10 font-heading"
                >
                  <Icon name="Music" size={20} className="mr-2" />
                  Spotify
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-white/40 text-sm">
              © 2024 Нестандартный подход. Все права защищены.
            </p>
          </div>
        </div>
      </footer>

      <AudioPlayer track={currentTrack} onClose={() => setCurrentTrack(null)} />
    </div>
  );
}