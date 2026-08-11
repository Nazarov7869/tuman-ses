import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Microscope,
  Droplets,
  Shield,
  Wallet,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { listClients } from "@/lib/clientsApi";
import { SERVICE_TYPES } from "@/lib/validations";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--info))",
  "hsl(var(--destructive))",
  "hsl(var(--secondary))"
];

const MONTHS = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
];

const MainAdmin = () => {
  // Fetch all paid clients for statistics
  const { data: paidClients = [] } = useQuery({
    queryKey: ['paid-clients-stats'],
    queryFn: () => listClients({ payment_status: 'tolangan', ordering: 'payment_date' }),
    refetchInterval: 5000,
  });

  // Selected date for viewing historical data
  const now = new Date();
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // Generate available years (from 2020 to current year)
  const availableYears = [];
  for (let year = 2020; year <= now.getFullYear(); year++) {
    availableYears.push(year);
  }

  // Days in the selected month
  const daysInSelectedMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const availableDays = Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1);

  // Clamp selectedDay if month changed to shorter month
  const effectiveDay = Math.min(selectedDay, daysInSelectedMonth);

  // Calculate statistics
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Daily payments (selected day)
  const dailyPayments = paidClients.filter(client => {
    if (!client.payment_date) return false;
    const paymentDate = new Date(client.payment_date);
    return paymentDate.getDate() === effectiveDay 
      && paymentDate.getMonth() === selectedMonth 
      && paymentDate.getFullYear() === selectedYear;
  });


  const dailyTotal = dailyPayments.reduce((sum, client) => sum + (client.payment_amount || 0), 0);

  // Monthly payments (selected month)
  const monthlyPayments = paidClients.filter(client => {
    if (!client.payment_date) return false;
    const paymentDate = new Date(client.payment_date);
    return paymentDate.getMonth() === selectedMonth && paymentDate.getFullYear() === selectedYear;
  });

  const monthlyTotal = monthlyPayments.reduce((sum, client) => sum + (client.payment_amount || 0), 0);

  // Yearly payments (selected year)
  const yearlyPayments = paidClients.filter(client => {
    if (!client.payment_date) return false;
    const paymentDate = new Date(client.payment_date);
    return paymentDate.getFullYear() === selectedYear;
  });

  const yearlyTotal = yearlyPayments.reduce((sum, client) => sum + (client.payment_amount || 0), 0);

  // Total all time
  const totalAllTime = paidClients.reduce((sum, client) => sum + (client.payment_amount || 0), 0);

  // Payments by service type
  const paymentsByService = SERVICE_TYPES.map(service => {
    const serviceClients = paidClients.filter(client => client.service_type === service);
    const total = serviceClients.reduce((sum, client) => sum + (client.payment_amount || 0), 0);
    const count = serviceClients.length;
    return { name: service, total, count };
  });

  // Daily payments by service type with client count
  const dailyByService = SERVICE_TYPES.map(service => {
    const serviceClients = dailyPayments.filter(client => client.service_type === service);
    const total = serviceClients.reduce((sum, client) => sum + (client.payment_amount || 0), 0);
    const count = serviceClients.length;
    return { name: service, total, count };
  });

  // Monthly payments by service type
  const monthlyByService = SERVICE_TYPES.map(service => {
    const serviceClients = monthlyPayments.filter(client => client.service_type === service);
    const total = serviceClients.reduce((sum, client) => sum + (client.payment_amount || 0), 0);
    const count = serviceClients.length;
    return { name: service, total, count };
  });

  // Yearly payments by service type
  const yearlyByService = SERVICE_TYPES.map(service => {
    const serviceClients = yearlyPayments.filter(client => client.service_type === service);
    const total = serviceClients.reduce((sum, client) => sum + (client.payment_amount || 0), 0);
    const count = serviceClients.length;
    return { name: service, total, count };
  });

  // Pie chart data for service distribution
  const pieData = paymentsByService
    .filter(item => item.total > 0)
    .map((item, index) => ({
      ...item,
      color: COLORS[index % COLORS.length]
    }));

  // Navigation functions
  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const isCurrentMonth = selectedMonth === currentMonth && selectedYear === currentYear;
  const isToday = isCurrentMonth && effectiveDay === currentDay;


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
  };

  const stats = [
    { 
      label: "Kunlik to'lov", 
      value: formatCurrency(dailyTotal), 
      subtext: `${dailyPayments.length} ta mijoz`,
      icon: Clock,
      color: "destructive"
    },
    { 
      label: "Oylik to'lov", 
      value: formatCurrency(monthlyTotal), 
      subtext: `${monthlyPayments.length} ta mijoz`,
      icon: Calendar,
      color: "primary"
    },
    { 
      label: "Yillik to'lov", 
      value: formatCurrency(yearlyTotal), 
      subtext: `${yearlyPayments.length} ta mijoz`,
      icon: CalendarDays,
      color: "success"
    },
    { 
      label: "Jami to'lov", 
      value: formatCurrency(totalAllTime), 
      subtext: `${paidClients.length} ta mijoz`,
      icon: Wallet,
      color: "info"
    },
  ];

  return (
    <AdminLayout title="Bosh panel" subtitle="Tizim statistikasi va boshqaruvi">
      <div className="space-y-6">
        {/* Month/Year Selector */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Hisobot davri:</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {/* Day selector */}
                <Select
                  value={effectiveDay.toString()}
                  onValueChange={(value) => setSelectedDay(parseInt(value))}
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDays.map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Month selector */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Select 
                    value={selectedMonth.toString()} 
                    onValueChange={(value) => setSelectedMonth(parseInt(value))}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((month, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={goToNextMonth}
                    disabled={isCurrentMonth}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Year selector */}
                <Select 
                  value={selectedYear.toString()} 
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Reset to today */}
                {!isToday && (
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => {
                      setSelectedDay(currentDay);
                      setSelectedMonth(currentMonth);
                      setSelectedYear(currentYear);
                    }}
                  >
                    Bugun
                  </Button>
                )}
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={stat.label} className="relative overflow-hidden animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    stat.color === 'primary' ? 'bg-primary/10' :
                    stat.color === 'info' ? 'bg-info/10' :
                    stat.color === 'destructive' ? 'bg-destructive/10' : 'bg-success/10'
                  }`}>
                    <stat.icon className={`w-6 h-6 ${
                      stat.color === 'primary' ? 'text-primary' :
                      stat.color === 'info' ? 'text-info' :
                      stat.color === 'destructive' ? 'text-destructive' : 'text-success'
                    }`} />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                  <p className="text-xs text-muted-foreground">{stat.subtext}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Service Type Payments */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Daily by Service */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Kunlik xizmat turlari bo'yicha</CardTitle>
              <CardDescription>{effectiveDay} {MONTHS[selectedMonth]} {selectedYear} - to'lovlar va mijozlar soni</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dailyByService.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium truncate max-w-[140px]">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-foreground block">{formatCurrency(item.total)}</span>
                      <span className="text-xs text-muted-foreground">{item.count} kishi</span>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <span className="text-sm font-bold">Jami kunlik</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-destructive">{formatCurrency(dailyTotal)}</span>
                    <span className="text-xs text-muted-foreground block">{dailyPayments.length} kishi</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly by Service */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Oylik xizmat turlari bo'yicha</CardTitle>
              <CardDescription>{MONTHS[selectedMonth]} {selectedYear} - to'lovlar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyByService.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium truncate max-w-[140px]">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-foreground block">{formatCurrency(item.total)}</span>
                      <span className="text-xs text-muted-foreground">{item.count} kishi</span>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <span className="text-sm font-bold">Jami oylik</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-primary">{formatCurrency(monthlyTotal)}</span>
                    <span className="text-xs text-muted-foreground block">{monthlyPayments.length} kishi</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Yearly by Service */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Yillik xizmat turlari bo'yicha</CardTitle>
              <CardDescription>{selectedYear}-yil to'lovlari</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {yearlyByService.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium truncate max-w-[140px]">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-foreground block">{formatCurrency(item.total)}</span>
                      <span className="text-xs text-muted-foreground">{item.count} kishi</span>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
                  <span className="text-sm font-bold">Jami yillik</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-success">{formatCurrency(yearlyTotal)}</span>
                    <span className="text-xs text-muted-foreground block">{yearlyPayments.length} kishi</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Time Service Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Umumiy xizmat statistikasi</CardTitle>
            <CardDescription>Barcha vaqt davomidagi to'lovlar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paymentsByService.map((item, index) => (
                <div 
                  key={item.name} 
                  className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-muted-foreground truncate">{item.name}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(item.total)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.count} ta mijoz</p>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-success/10 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Jami umumiy to'lov</p>
                  <p className="text-3xl font-display font-bold text-foreground">{formatCurrency(totalAllTime)}</p>
                </div>
                <Wallet className="w-12 h-12 text-primary/50" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart for Service Distribution */}
        {pieData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display">To'lovlar taqsimoti</CardTitle>
              <CardDescription>Xizmat turlari bo'yicha foizli ko'rinish</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="total"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {pieData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default MainAdmin;
