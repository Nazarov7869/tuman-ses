import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Microscope, 
  Users, 
  FileText, 
  ArrowRight, 
  Activity,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Clock
} from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const newsItems = [
  {
    id: 1,
    title: "Yangi suv sifati standartlari joriy etildi",
    excerpt: "Barcha tumanlarda xavfsiz ichimlik suvini ta'minlash uchun munitsipal suv tekshiruvi qoidalari yangilandi.",
    date: "2024-yil 2-dekabr",
    category: "Qoidalar",
    icon: Droplets,
    status: "new"
  },
  {
    id: 2,
    title: "Mavsumiy gripp kuzatuvi hisoboti",
    excerpt: "Haftalik epidemiologik hisobot shimoliy mintaqalarda o'rtacha gripp faolligini ko'rsatmoqda.",
    date: "2024-yil 1-dekabr",
    category: "Epidemiologiya",
    icon: Activity,
    status: "urgent"
  },
  {
    id: 3,
    title: "Oziq-ovqat xavfsizligi tekshiruvi natijalari",
    excerpt: "4-chorak tekshiruv natijalari ro'yxatdan o'tgan muassasalar orasida 94% muvofiqlik darajasini ko'rsatdi.",
    date: "2024-yil 30-noyabr",
    category: "Sanitariya",
    icon: CheckCircle2,
    status: "completed"
  },
  {
    id: 4,
    title: "Kasallik tarqalishi ogohlantirish tizimi yangilandi",
    excerpt: "Barcha sog'liqni saqlash muassasalarida real vaqt rejimida kuzatish imkoniyatlari faollashtirildi.",
    date: "2024-yil 28-noyabr",
    category: "Ogohlantirish",
    icon: AlertTriangle,
    status: "new"
  },
];

const stats = [
  { label: "Faol ro'yxatlar", value: "2,847", icon: Users },
  { label: "Bu oydagi tekshiruvlar", value: "456", icon: FileText },
  { label: "Muvofiqlik darajasi", value: "94%", icon: CheckCircle2 },
  { label: "Javob vaqti", value: "< 24 soat", icon: Clock },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">SanEpi</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="outline" size="lg">
                Admin kirish
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 min-h-[600px] flex items-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-sidebar/95 via-sidebar/80 to-sidebar/60" />
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-2xl animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary-foreground mb-6">
              <Microscope className="w-4 h-4" />
              <span className="text-sm font-medium">Sanitariya va Epidemiologiya Boshqaruvi</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-sidebar-foreground mb-6 leading-tight">
              Ma'lumotlarga asoslangan{" "}
              <span className="text-sidebar-primary">yechimlar</span> orqali jamoat salomatligini himoya qilish
            </h1>
            <p className="text-lg text-sidebar-foreground/80 mb-8 leading-relaxed">
              Barcha ro'yxatdan o'tgan muassasalarda sanitariya monitoringi, epidemiologik kuzatuv 
              va jamoat salomatligi muvofiqligini kuzatish uchun kompleks boshqaruv tizimi.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/login">
                <Button variant="hero" size="xl">
                  Admin portaliga kirish
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button variant="outline" size="xl" className="bg-sidebar-foreground/10 border-sidebar-foreground/20 text-sidebar-foreground hover:bg-sidebar-foreground/20">
                Hisobotlarni ko'rish
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/50 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="flex items-center gap-4 p-4 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground mb-2">So'nggi yangiliklar</h2>
              <p className="text-muted-foreground">Sanitariya va epidemiologiya bo'yicha eng so'nggi ma'lumotlardan xabardor bo'ling</p>
            </div>
            <Button variant="ghost" className="hidden md:flex">
              Barchasini ko'rish <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {newsItems.map((item, index) => (
              <article 
                key={item.id}
                className="group p-6 bg-card rounded-2xl border border-border shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    item.status === 'urgent' ? 'bg-destructive/10' : 
                    item.status === 'completed' ? 'bg-success/10' : 'bg-primary/10'
                  }`}>
                    <item.icon className={`w-6 h-6 ${
                      item.status === 'urgent' ? 'text-destructive' : 
                      item.status === 'completed' ? 'text-success' : 'text-primary'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        item.status === 'urgent' ? 'bg-destructive/10 text-destructive' : 
                        item.status === 'completed' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                      }`}>
                        {item.category}
                      </span>
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                    </div>
                    <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.excerpt}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Admin portal modullari
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Jamoat salomatligini saqlash operatsiyalarini kompleks boshqarish uchun ixtisoslashtirilgan boshqaruv panellariga kirish
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-card rounded-2xl border border-border shadow-card hover:shadow-card-hover transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-3">Asosiy boshqaruv</h3>
              <p className="text-muted-foreground mb-4">
                Tizim umumiy ko'rinishi, foydalanuvchilarni boshqarish va operatsion statistika uchun markaziy boshqaruv paneli.
              </p>
              <Link to="/login" className="text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                Boshqaruv paneliga kirish <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="p-8 bg-card rounded-2xl border border-border shadow-card hover:shadow-card-hover transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-3">To'lovlarni boshqarish</h3>
              <p className="text-muted-foreground mb-4">
                Ro'yxatdan o'tish to'lovlari, tekshiruv to'lovlari va moliyaviy hisobotlarni boshqarish.
              </p>
              <Link to="/login" className="text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                Boshqaruv paneliga kirish <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="p-8 bg-card rounded-2xl border border-border shadow-card hover:shadow-card-hover transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-3">Ro'yxatdan o'tganlarni boshqarish</h3>
              <p className="text-muted-foreground mb-4">
                Muassasalarni ro'yxatdan o'tkazish, muvofiqlikni kuzatish va sertifikatlash holatini boshqarish.
              </p>
              <Link to="/login" className="text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                Boshqaruv paneliga kirish <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-sidebar text-sidebar-foreground border-t border-sidebar-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
                <Shield className="w-4 h-4 text-sidebar-primary-foreground" />
              </div>
              <span className="font-display font-semibold">SanEpi Boshqaruv Tizimi</span>
            </div>
            <p className="text-sm text-sidebar-foreground/60">
              © 2024 Sanitariya va Epidemiologiya bo'limi. Barcha huquqlar himoyalangan.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;