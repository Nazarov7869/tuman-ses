import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listClients, markPaid as apiMarkPaid, rejectPayment as apiRejectPayment } from "@/lib/clientsApi";
import { ApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { getServicePrice } from "@/lib/validations";
import { 
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  User,
  Stethoscope,
  MapPin,
  Briefcase,
  Globe,
  AlertTriangle,
  Activity,
  Newspaper,
  Users,
  CreditCard,
  Calendar
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const revenueData = [
  { month: "Iyul", revenue: 45000 },
  { month: "Avg", revenue: 52000 },
  { month: "Sen", revenue: 48000 },
  { month: "Okt", revenue: 61000 },
  { month: "Noy", revenue: 55000 },
  { month: "Dek", revenue: 67000 },
];

const paymentTypeData = [
  { name: "Ichak infeksiyasi", value: 35, color: "hsl(var(--primary))" },
  { name: "Stafilakokk tekshirish", value: 25, color: "hsl(var(--success))" },
  { name: "Brusilioz tekshirish", value: 20, color: "hsl(var(--info))" },
  { name: "Diagnostik materiallar", value: 12, color: "hsl(var(--warning))" },
  { name: "Parazitalogik", value: 8, color: "hsl(var(--destructive))" },
];


const PaymentAdmin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [paidSearchTerm, setPaidSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingClients = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['clients', 'kutilmoqda'],
    queryFn: () => listClients({ payment_status: 'kutilmoqda', ordering: '-registered_at' }),
    refetchInterval: 5000,
  });

  const { data: paidClients = [], isLoading: paidLoading } = useQuery({
    queryKey: ['clients', 'tolangan'],
    queryFn: () => listClients({ payment_status: 'tolangan', ordering: '-payment_date' }),
    refetchInterval: 5000,
  });

  const loading = pendingLoading || paidLoading;

  const refetchBoth = () => {
    queryClient.invalidateQueries({ queryKey: ['clients', 'kutilmoqda'] });
    queryClient.invalidateQueries({ queryKey: ['clients', 'tolangan'] });
  };

  const handlePayment = async (clientId: string, serviceType: string) => {
    try {
      const client = await apiMarkPaid(clientId);
      refetchBoth();
      toast({
        title: "To'lov qabul qilindi",
        description: `${(client.payment_amount ?? getServicePrice(serviceType)).toLocaleString()} so'm to'lov muvaffaqiyatli qayd etildi`,
      });
    } catch (error) {
      toast({
        title: "Xatolik",
        description: error instanceof ApiError ? error.message : "To'lovni qayd etishda xatolik yuz berdi",
        variant: "destructive",
      });
    }
  };

  const handleRejectPayment = async (clientId: string) => {
    try {
      await apiRejectPayment(clientId);
      refetchBoth();
      toast({
        title: "To'lov rad etildi",
        description: "Mijoz to'lovi rad etildi",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Xatolik",
        description: error instanceof ApiError ? error.message : "To'lovni qayd etishda xatolik yuz berdi",
        variant: "destructive",
      });
    }
  };

  const filteredPendingClients = pendingClients.filter(client =>
    `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.service_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPaidClients = paidClients.filter(client =>
    `${client.first_name} ${client.last_name}`.toLowerCase().includes(paidSearchTerm.toLowerCase()) ||
    client.service_type.toLowerCase().includes(paidSearchTerm.toLowerCase())
  );

  const worldNews = [
    { 
      title: "JSMK: Yangi grip shtammi", 
      description: "H5N1 qush gripi odamlarga yuqish holatlari kuzatilmoqda. Kamboja va Vyetnamda ehtiyotkorlik choralari kuchaytirildi.",
      icon: AlertTriangle,
      color: "destructive",
      image: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=200&h=120&fit=crop"
    },
    { 
      title: "Evropa: Qizilcha epidemiyasi", 
      description: "Germaniya va Avstriyada qizilcha holatlari 40% ga oshdi. Emlash kampaniyalari boshlandi.",
      icon: Activity,
      color: "warning",
      image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=200&h=120&fit=crop"
    },
    { 
      title: "Afrika: Vabo profilaktikasi", 
      description: "Kongo DR da vabo tarqalishining oldini olish uchun toza suv ta'minoti loyihalari amalga oshirilmoqda.",
      icon: Globe,
      color: "info",
      image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=200&h=120&fit=crop"
    },
    { 
      title: "Osiyo: Dengue isitmasi", 
      description: "Janubiy-Sharqiy Osiyoda dengue isitmasi mavsum avjiga chiqdi. 50,000 dan ortiq holat qayd etildi.",
      icon: Newspaper,
      color: "primary",
      image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=200&h=120&fit=crop"
    },
  ];

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "tolangan":
        return <Badge className="bg-success/10 text-success hover:bg-success/20 border-0"><CheckCircle2 className="w-3 h-3 mr-1" /> To'langan</Badge>;
      case "kutilmoqda":
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/20 border-0"><Clock className="w-3 h-3 mr-1" /> Kutilmoqda</Badge>;
      case "rad_etilgan":
        return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0"><XCircle className="w-3 h-3 mr-1" /> Rad etilgan</Badge>;
      default:
        return null;
    }
  };

  return (
    <AdminLayout title="To'lovlarni boshqarish" subtitle="Moliyaviy umumiy ko'rinish va tranzaksiyalar">
      <div className="space-y-6">
        {/* World Health News Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {worldNews.map((news, index) => (
            <Card key={news.title} className="animate-fade-in overflow-hidden" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="relative h-24 overflow-hidden">
                <img 
                  src={news.image} 
                  alt={news.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                <div className={`absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center ${
                  news.color === 'primary' ? 'bg-primary/90' :
                  news.color === 'destructive' ? 'bg-destructive/90' :
                  news.color === 'warning' ? 'bg-warning/90' : 'bg-info/90'
                }`}>
                  <news.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground text-sm mb-1">{news.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{news.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs for Pending and Paid */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Kutilayotgan ({pendingClients.length})
            </TabsTrigger>
            <TabsTrigger value="paid" className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Ro'yxatdan o'tganlar ({paidClients.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Payments Tab */}
          <TabsContent value="pending">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="font-display">Kutilayotgan to'lovlar</CardTitle>
                  <CardDescription>Qabul bo'limidan kelgan mijozlar</CardDescription>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Mijozlarni qidirish..." 
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Yuklanmoqda...</div>
                ) : filteredPendingClients.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Kutilayotgan to'lovlar yo'q
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPendingClients.map((client, index) => (
                      <div 
                        key={client.id}
                        className="p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-primary" />
                              <span className="font-semibold text-foreground">
                                {client.first_name} {client.last_name}
                              </span>
                              {getPaymentStatusBadge(client.payment_status)}
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Stethoscope className="w-3 h-3" />
                                {client.service_type}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {client.address}
                              </span>
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3" />
                                {client.workplace}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-lg font-bold text-foreground">
                                {getServicePrice(client.service_type).toLocaleString()} so'm
                              </p>
                              <p className="text-xs text-muted-foreground">To'lov summasi</p>
                            </div>
                            <Button 
                              onClick={() => handleRejectPayment(client.id)}
                              variant="outline"
                              className="border-destructive text-destructive hover:bg-destructive/10"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Rad etish
                            </Button>
                            <Button 
                              onClick={() => handlePayment(client.id, client.service_type)}
                              className="bg-success hover:bg-success/90"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Tasdiqlash
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paid Clients Tab */}
          <TabsContent value="paid">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="font-display">Ro'yxatdan o'tganlar</CardTitle>
                  <CardDescription>To'lov qilingan mijozlar</CardDescription>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Mijozlarni qidirish..." 
                      className="pl-9"
                      value={paidSearchTerm}
                      onChange={(e) => setPaidSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Yuklanmoqda...</div>
                ) : filteredPaidClients.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Ro'yxatdan o'tgan mijozlar yo'q
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPaidClients.map((client, index) => (
                      <div 
                        key={client.id}
                        className="p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-primary" />
                              <span className="font-semibold text-foreground">
                                {client.first_name} {client.last_name}
                              </span>
                              {getPaymentStatusBadge(client.payment_status)}
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Stethoscope className="w-3 h-3" />
                                {client.service_type}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {client.address}
                              </span>
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3" />
                                {client.workplace}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {client.payment_date ? new Date(client.payment_date).toLocaleDateString('uz-UZ') : '-'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-success">
                              {(client.payment_amount || 0).toLocaleString()} so'm
                            </p>
                            <p className="text-xs text-muted-foreground">To'langan</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-display">Daromad tendentsiyasi</CardTitle>
                <CardDescription>Oxirgi 6 oy davomida oylik daromad</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" /> Eksport
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value.toLocaleString()} so'm`, 'Daromad']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Payment Types */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Xizmat turlari</CardTitle>
              <CardDescription>Kategoriya bo'yicha taqsimot</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={paymentTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {paymentTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {paymentTypeData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PaymentAdmin;