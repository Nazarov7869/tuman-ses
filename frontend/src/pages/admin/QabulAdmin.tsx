import { useState, useEffect } from "react";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Stethoscope, DollarSign, CreditCard, CalendarIcon } from "lucide-react";
import { UserPlus, Users, MapPin, Briefcase, Search, Edit, Eye, CheckCircle2, Clock, Loader2, FileCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { listClients, createClient, updateClient, completeClient } from "@/lib/clientsApi";
import { ApiError } from "@/lib/api";
import { clientSchema, SERVICE_TYPES, SERVICE_CATEGORIES, getServicePrice } from "@/lib/validations";
import { logError } from "@/lib/logger";
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  birth_year: string;
  address: string;
  workplace: string;
  service_type: string;
  registered_at: string;
  status: "yangi" | "ko'rildi" | "tugatildi";
  payment_status: string;
  payment_amount: number | null;
  payment_date: string | null;
}

const QabulAdmin = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    birthYear: string;
    address: string;
    workplace: string;
    serviceType: string;
  }>({
    firstName: "",
    lastName: "",
    birthYear: "",
    address: "",
    workplace: "",
    serviceType: SERVICE_TYPES[0]
  });
  const [editFormData, setEditFormData] = useState<{
    firstName: string;
    lastName: string;
    birthYear: string;
    address: string;
    workplace: string;
    serviceType: string;
  }>({
    firstName: "",
    lastName: "",
    birthYear: "",
    address: "",
    workplace: "",
    serviceType: SERVICE_TYPES[0]
  });
  const [suggestions, setSuggestions] = useState<Client[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [registrantsSearchTerm, setRegistrantsSearchTerm] = useState("");
  const [birthDateError, setBirthDateError] = useState(false);

  // Validate date format (dd.MM.yyyy)
  const isValidDate = (dateString: string): boolean => {
    if (!dateString) return true; // Empty is allowed (not required)
    const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    const match = dateString.match(regex);
    if (!match) return false;
    
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > new Date().getFullYear()) return false;
    
    // Check valid day for month
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day > daysInMonth) return false;
    
    // Check if date is not in future
    const inputDate = new Date(year, month - 1, day);
    if (inputDate > new Date()) return false;
    
    return true;
  };

  // Fetch clients from database
  const fetchClients = async () => {
    try {
      const data = await listClients({ ordering: '-registered_at' });
      setClients(data as Client[]);
    } catch (error) {
      logError('Error fetching clients:', error);
      toast({
        title: "Xatolik",
        description: "Mijozlarni yuklashda xatolik yuz berdi",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();

    // Django backend has no realtime push (see backend/README.md) — poll instead.
    const interval = setInterval(fetchClients, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Search for existing clients only when typing lastName
    if (name === 'lastName') {
      const searchValue = value.toLowerCase().trim();
      if (searchValue.length >= 2) {
        const matches = clients.filter(client => {
          const fullName = `${client.last_name} ${client.first_name}`.toLowerCase();
          const lastName = client.last_name.toLowerCase();
          const firstName = client.first_name.toLowerCase();
          return lastName.includes(searchValue) || firstName.includes(searchValue) || fullName.includes(searchValue);
        }).slice(0, 5); // Max 5 suggestions
        setSuggestions(matches);
        setShowSuggestions(matches.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }
  };

  const handleSelectSuggestion = (client: Client) => {
    setFormData({
      firstName: client.first_name,
      lastName: client.last_name,
      birthYear: client.birth_year,
      address: client.address,
      workplace: client.workplace,
      serviceType: formData.serviceType // Keep current service type
    });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationResult = clientSchema.safeParse(formData);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast({
        title: "Xatolik",
        description: firstError.message,
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const validatedData = validationResult.data;
      await createClient({
        first_name: validatedData.firstName.trim(),
        last_name: validatedData.lastName.trim(),
        birth_year: validatedData.birthYear,
        address: validatedData.address.trim(),
        workplace: validatedData.workplace.trim(),
        service_type: validatedData.serviceType,
      });
      await fetchClients();
      setFormData({
        firstName: "",
        lastName: "",
        birthYear: "",
        address: "",
        workplace: "",
        serviceType: SERVICE_TYPES[0]
      });
      toast({
        title: "Muvaffaqiyatli",
        description: "Mijoz ro'yxatga olindi"
      });
    } catch (error) {
      logError('Error adding client:', error);
      toast({
        title: "Xatolik",
        description: error instanceof ApiError ? error.message : "Mijozni qo'shishda xatolik yuz berdi",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (client: Client) => {
    setEditingClient(client);
    setEditFormData({
      firstName: client.first_name,
      lastName: client.last_name,
      birthYear: client.birth_year,
      address: client.address,
      workplace: client.workplace,
      serviceType: client.service_type
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateClient = async () => {
    if (!editingClient) return;
    const validationResult = clientSchema.safeParse(editFormData);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast({
        title: "Xatolik",
        description: firstError.message,
        variant: "destructive"
      });
      return;
    }
    setIsUpdating(true);
    try {
      const validatedData = validationResult.data;
      await updateClient(editingClient.id, {
        first_name: validatedData.firstName.trim(),
        last_name: validatedData.lastName.trim(),
        birth_year: validatedData.birthYear,
        address: validatedData.address.trim(),
        workplace: validatedData.workplace.trim(),
        service_type: validatedData.serviceType
      });
      await fetchClients();
      setIsEditDialogOpen(false);
      setEditingClient(null);
      toast({
        title: "Muvaffaqiyatli",
        description: "Mijoz ma'lumotlari yangilandi"
      });
    } catch (error) {
      logError('Error updating client:', error);
      toast({
        title: "Xatolik",
        description: error instanceof ApiError ? error.message : "Mijozni yangilashda xatolik yuz berdi",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleComplete = async (clientId: string) => {
    try {
      await completeClient(clientId);
      await fetchClients();
      toast({
        title: "Muvaffaqiyatli",
        description: "Mijoz holati yangilandi",
      });
    } catch (error) {
      logError('Error completing client:', error);
      toast({
        title: "Xatolik",
        description: error instanceof ApiError ? error.message : "Holatni yangilashda xatolik yuz berdi",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: Client["status"]) => {
    switch (status) {
      case "yangi":
        return <Badge className="bg-info/10 text-info hover:bg-info/20 border-0"><Clock className="w-3 h-3 mr-1" /> Yangi</Badge>;
      case "ko'rildi":
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/20 border-0"><Eye className="w-3 h-3 mr-1" /> Ko'rildi</Badge>;
      case "tugatildi":
        return <Badge className="bg-success/10 text-success hover:bg-success/20 border-0"><CheckCircle2 className="w-3 h-3 mr-1" /> Tugatildi</Badge>;
    }
  };

  const getPaymentBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "tolangan":
        return <Badge className="bg-success/10 text-success hover:bg-success/20 border-0"><CreditCard className="w-3 h-3 mr-1" /> To'langan</Badge>;
      case "kutilmoqda":
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/20 border-0"><DollarSign className="w-3 h-3 mr-1" /> To'lov kutilmoqda</Badge>;
      case "rad_etilgan":
        return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0"><CreditCard className="w-3 h-3 mr-1" /> To'lov rad etildi</Badge>;
      default:
        return null;
    }
  };

  const filteredClients = clients.filter(client => {
    const search = searchTerm.toLowerCase();
    return (
      client.first_name.toLowerCase().includes(search) ||
      client.last_name.toLowerCase().includes(search) ||
      `${client.first_name} ${client.last_name}`.toLowerCase().includes(search) ||
      client.address.toLowerCase().includes(search) ||
      client.workplace.toLowerCase().includes(search) ||
      client.service_type.toLowerCase().includes(search)
    );
  });

  // Registered (paid) clients
  const registeredClients = clients.filter(c => c.payment_status === 'tolangan');
  const filteredRegistrants = registeredClients.filter(client => {
    const search = registrantsSearchTerm.toLowerCase();
    return (
      client.first_name.toLowerCase().includes(search) ||
      client.last_name.toLowerCase().includes(search) ||
      `${client.first_name} ${client.last_name}`.toLowerCase().includes(search) ||
      client.service_type.toLowerCase().includes(search) ||
      client.address.toLowerCase().includes(search)
    );
  });

  const stats = [
    { label: "Jami mijozlar", value: clients.length, icon: Users, color: "primary" },
    { label: "Yangi", value: clients.filter(c => c.status === "yangi").length, icon: Clock, color: "info" },
    { label: "To'langan", value: registeredClients.length, icon: CheckCircle2, color: "success" },
    { label: "Kutilmoqda", value: clients.filter(c => c.payment_status === "kutilmoqda").length, icon: DollarSign, color: "warning" }
  ];

  return (
    <AdminLayout title="Qabul" subtitle="Mijozlarni ro'yxatga olish va boshqarish">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={stat.label} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    stat.color === 'primary' ? 'bg-primary/10' : 
                    stat.color === 'info' ? 'bg-info/10' : 
                    stat.color === 'warning' ? 'bg-warning/10' : 'bg-success/10'
                  }`}>
                    <stat.icon className={`w-5 h-5 ${
                      stat.color === 'primary' ? 'text-primary' : 
                      stat.color === 'info' ? 'text-info' : 
                      stat.color === 'warning' ? 'text-warning' : 'text-success'
                    }`} />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="register" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="register" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Yangi mijoz
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Barcha mijozlar
            </TabsTrigger>
            <TabsTrigger value="registered" className="flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              Ro'yxatga olinganlar ({registeredClients.length})
            </TabsTrigger>
          </TabsList>

          {/* Register Tab */}
          <TabsContent value="register">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Registration Form */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-primary" />
                    Yangi mijoz
                  </CardTitle>
                  <CardDescription>Mijoz ma'lumotlarini kiriting</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2 relative">
                      <Label htmlFor="lastName">Familiya</Label>
                      <Input 
                        id="lastName" 
                        name="lastName" 
                        placeholder="Familiyasini kiriting" 
                        value={formData.lastName} 
                        onChange={handleInputChange}
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        autoComplete="off"
                      />
                      {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                          <div className="p-2 text-xs text-muted-foreground bg-muted/50 sticky top-0">
                            Mavjud mijozlar:
                          </div>
                          {suggestions.map((client) => (
                            <button
                              key={client.id}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handleSelectSuggestion(client)}
                              className="w-full px-3 py-2 text-left hover:bg-muted/50 transition-colors border-t border-border/50 flex items-center justify-between"
                            >
                              <div>
                                <span className="font-medium text-foreground">
                                  {client.last_name} {client.first_name}
                                </span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  ({client.birth_year})
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {client.address}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Ism</Label>
                      <Input 
                        id="firstName" 
                        name="firstName" 
                        placeholder="Ismini kiriting" 
                        value={formData.firstName} 
                        onChange={handleInputChange}
                        onFocus={() => setShowSuggestions(false)}
                        autoComplete="off"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthYear" className={birthDateError ? "text-destructive" : ""}>
                        Tug'ilgan sanasi
                      </Label>
                      <Input 
                        id="birthYear" 
                        name="birthYear" 
                        placeholder="Masalan: 15.03.1990" 
                        value={formData.birthYear} 
                        onChange={(e) => {
                          handleInputChange(e);
                          setBirthDateError(!isValidDate(e.target.value));
                        }}
                        onBlur={() => setBirthDateError(!isValidDate(formData.birthYear))}
                        className={birthDateError ? "border-destructive focus-visible:ring-destructive" : ""}
                      />
                      {birthDateError && (
                        <p className="text-sm text-destructive">
                          Noto'g'ri sana formati. Masalan: 15.03.1990
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Yashash manzili</Label>
                      <Input id="address" name="address" placeholder="Manzilni kiriting" value={formData.address} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workplace">Ish joyi</Label>
                      <Input id="workplace" name="workplace" placeholder="Ish joyini kiriting" value={formData.workplace} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serviceType">Xizmat turi</Label>
                      <Select value={formData.serviceType} onValueChange={value => setFormData(prev => ({ ...prev, serviceType: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Xizmat turini tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(SERVICE_CATEGORIES).map(([category, services]) => (
                            <div key={category}>
                              <div className="px-2 py-1.5 text-sm font-semibold bg-muted/50 text-accent">
                                {category}
                              </div>
                              {services.map(service => (
                                <SelectItem key={service.name} value={service.name}>
                                  <div className="flex justify-between items-center gap-2 w-full">
                                    <span className="truncate">{service.name}</span>
                                    <span className="text-xs text-muted-foreground shrink-0">
                                      {service.price.toLocaleString()} so'm
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saqlanmoqda...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Ro'yxatga olish
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Recent Clients */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="font-display">So'nggi qo'shilganlar</CardTitle>
                  <CardDescription>Oxirgi 5 ta mijoz</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {clients.slice(0, 5).map((client, index) => (
                        <div key={client.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-sm font-semibold text-primary">
                              {client.first_name[0]}{client.last_name[0]}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {client.first_name} {client.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{client.service_type}</p>
                          </div>
                          {getPaymentBadge(client.payment_status)}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* All Clients Tab */}
          <TabsContent value="all">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-display">Barcha mijozlar</CardTitle>
                  <CardDescription>Tizimda ro'yxatga olingan barcha mijozlar</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Qidirish..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {filteredClients.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Hozircha mijozlar yo'q</p>
                      </div>
                    ) : (
                      filteredClients.map((client, index) => (
                        <div key={client.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-lg font-semibold text-primary">
                              {client.first_name[0]}{client.last_name[0]}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className="font-medium text-foreground">
                                {client.first_name} {client.last_name}
                              </p>
                              {getStatusBadge(client.status)}
                              {getPaymentBadge(client.payment_status)}
                            </div>
                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="w-3 h-3" />
                                {client.birth_year}
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
                                <Stethoscope className="w-3 h-3" />
                                {client.service_type}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Ro'yxatga olingan: {new Date(client.registered_at).toLocaleString("uz-UZ")}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {client.payment_status === 'kutilmoqda' && (
                              <Button variant="ghost" size="icon" onClick={() => handleEditClick(client)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Registered (Paid) Clients Tab */}
          <TabsContent value="registered">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="font-display">Ro'yxatga olingan mijozlar</CardTitle>
                  <CardDescription>To'lov qilingan va tasdiqlangan mijozlar</CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Qidirish..." 
                    className="pl-9"
                    value={registrantsSearchTerm}
                    onChange={e => setRegistrantsSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : filteredRegistrants.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Ro'yxatga olingan mijozlar yo'q</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {filteredRegistrants.map((client, index) => (
                      <div 
                        key={client.id}
                        className="p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                                <span className="text-sm font-semibold text-success">
                                  {client.first_name[0]}{client.last_name[0]}
                                </span>
                              </div>
                              <span className="font-semibold text-foreground">
                                {client.first_name} {client.last_name}
                              </span>
                              {getStatusBadge(client.status)}
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
                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                To'langan: {(client.payment_amount || 0).toLocaleString()} so'm
                              </span>
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="w-3 h-3" />
                                {client.payment_date ? new Date(client.payment_date).toLocaleDateString('uz-UZ') : '-'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {client.status !== 'tugatildi' && (
                              <Button 
                                onClick={() => handleComplete(client.id)}
                                variant="outline"
                                className="border-success text-success hover:bg-success/10"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Tugatish
                              </Button>
                            )}
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
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md w-[calc(100%-2rem)] max-h-[85vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle className="font-display">Mijozni tahrirlash</DialogTitle>
            <DialogDescription>Mijoz ma'lumotlarini o'zgartiring</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 min-w-0">
            <div className="space-y-2">
              <Label htmlFor="edit-firstName">Ism</Label>
              <Input id="edit-firstName" name="firstName" value={editFormData.firstName} onChange={handleEditInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lastName">Familiya</Label>
              <Input id="edit-lastName" name="lastName" value={editFormData.lastName} onChange={handleEditInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-birthYear">Tug'ilgan yili</Label>
              <Input id="edit-birthYear" name="birthYear" value={editFormData.birthYear} onChange={handleEditInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Yashash manzili</Label>
              <Input id="edit-address" name="address" value={editFormData.address} onChange={handleEditInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-workplace">Ish joyi</Label>
              <Input id="edit-workplace" name="workplace" value={editFormData.workplace} onChange={handleEditInputChange} />
            </div>
            <div className="space-y-2 min-w-0">
              <Label htmlFor="edit-serviceType">Xizmat turi</Label>
              <Select value={editFormData.serviceType} onValueChange={value => setEditFormData(prev => ({ ...prev, serviceType: value }))}>
                <SelectTrigger className="w-full max-w-full [&>span]:truncate [&>span]:block [&>span]:min-w-0">
                  <SelectValue placeholder="Xizmat turini tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SERVICE_CATEGORIES).map(([category, services]) => (
                    <div key={category}>
                      <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50">
                        {category}
                      </div>
                      {services.map(service => (
                        <SelectItem key={service.name} value={service.name}>
                          <div className="flex justify-between items-center gap-2 w-full">
                            <span className="truncate">{service.name}</span>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {service.price.toLocaleString()} so'm
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Bekor qilish</Button>
            <Button onClick={handleUpdateClient} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default QabulAdmin;
