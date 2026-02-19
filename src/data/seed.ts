import type {
  AppState,
  AppUser,
  Category,
  ProviderProfile,
  Service,
  Availability,
  Booking,
  AppNotification,
  Review,
} from "@/types";

const DEMO_USERS: AppUser[] = [
  { id: "user1", name: "Alex Johnson", email: "alex@demo.com", password: "Prezentare1", role: "USER", avatar: "" },
  { id: "prov1", name: "Maria Garcia", email: "maria@demo.com", password: "Prezentare1", role: "PROVIDER", avatar: "" },
  { id: "prov2", name: "James Wilson", email: "james@demo.com", password: "Prezentare", role: "PROVIDER", avatar: "" },
  { id: "prov3", name: "Sarah Lee", email: "sarah@demo.com", password: "Prezentare1", role: "PROVIDER", avatar: "" },
  { id: "admin1", name: "Admin User", email: "admin@demo.com", password: "Prezentare1", role: "ADMIN", avatar: "" },
];

const DEMO_CATEGORIES: Category[] = [
  { id: "cat1", name: "Home Cleaning", icon: "Sparkles", description: "Professional cleaning services", color: "primary" },
  { id: "cat2", name: "Personal Training", icon: "Dumbbell", description: "Fitness & wellness coaching", color: "accent" },
  { id: "cat3", name: "Photography", icon: "Camera", description: "Professional photo sessions", color: "info" },
  { id: "cat4", name: "Tutoring", icon: "BookOpen", description: "Academic tutoring & mentoring", color: "success" },
  { id: "cat5", name: "Pet Care", icon: "Heart", description: "Pet sitting & grooming", color: "warning" },
  { id: "cat6", name: "Handyman", icon: "Wrench", description: "Home repairs & maintenance", color: "destructive" },
];

const DEMO_PROVIDERS: ProviderProfile[] = [
  {
    id: "pp1", userId: "prov1", name: "Maria's Cleaning Co.", slug: "MariaCleaning",
    description: "Top-rated cleaning service with 5+ years of experience. Eco-friendly products and meticulous attention to detail.",
    categoryId: "cat1", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    coverPhoto: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=400&fit=crop",
    galleryPhotos: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1527515637462-cee1652e65b1?w=400&h=300&fit=crop",
    ],
    phone: "555-0101", location: "Downtown",
    rating: 4.9, reviewCount: 127, featured: true, sponsored: false, blocked: false,
  },
  {
    id: "pp2", userId: "prov2", name: "FitLife with James", slug: "FitLifeJames",
    description: "Certified personal trainer specializing in strength training and weight loss. Customized programs for all levels.",
    categoryId: "cat2", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    coverPhoto: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=400&fit=crop",
    galleryPhotos: [
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop",
    ],
    phone: "555-0102", location: "Midtown",
    rating: 4.7, reviewCount: 89, featured: false, sponsored: true, blocked: false,
  },
  {
    id: "pp3", userId: "prov3", name: "Sarah's Photography", slug: "SarahPhoto",
    description: "Award-winning photographer for weddings, portraits, and events. Natural light specialist.",
    categoryId: "cat3", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    coverPhoto: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=400&fit=crop",
    galleryPhotos: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1554080353-a576cf803bda?w=400&h=300&fit=crop",
    ],
    phone: "555-0103", location: "Uptown",
    rating: 4.8, reviewCount: 64, featured: false, sponsored: false, blocked: false,
  },
];

const DEMO_SERVICES: Service[] = [
  { id: "svc1", providerId: "pp1", title: "Standard Cleaning", description: "Full home cleaning — kitchen, bathrooms, living areas", price: 80, duration: 120, categoryId: "cat1" },
  { id: "svc2", providerId: "pp1", title: "Deep Cleaning", description: "Intensive cleaning including appliances and hard-to-reach areas", price: 150, duration: 240, categoryId: "cat1" },
  { id: "svc3", providerId: "pp2", title: "Personal Training Session", description: "1-on-1 training with custom exercises", price: 60, duration: 60, categoryId: "cat2" },
  { id: "svc4", providerId: "pp2", title: "Nutrition Consultation", description: "Custom meal plan and dietary guidance", price: 45, duration: 45, categoryId: "cat2" },
  { id: "svc5", providerId: "pp3", title: "Portrait Session", description: "Professional portrait photography — 20 edited photos", price: 120, duration: 90, categoryId: "cat3" },
  { id: "svc6", providerId: "pp3", title: "Event Photography", description: "Full event coverage — unlimited photos", price: 350, duration: 240, categoryId: "cat3" },
];

const DEMO_AVAILABILITY: Availability[] = [
  ...[1, 2, 3, 4, 5].map((d) => ({
    id: `av-pp1-${d}`, providerId: "pp1", weekday: d,
    startTime: "08:00", endTime: "17:00", slotMinutes: 120, bufferMinutes: 30,
  })),
  ...[1, 2, 3, 4, 5, 6].map((d) => ({
    id: `av-pp2-${d}`, providerId: "pp2", weekday: d,
    startTime: "06:00", endTime: "20:00", slotMinutes: 60, bufferMinutes: 15,
  })),
  ...[0, 2, 3, 4, 5, 6].map((d) => ({
    id: `av-pp3-${d}`, providerId: "pp3", weekday: d,
    startTime: "09:00", endTime: "18:00", slotMinutes: 90, bufferMinutes: 30,
  })),
];

function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split("T")[0];
}

const DEMO_BOOKINGS: Booking[] = [
  {
    id: "bk1", userId: "user1", providerId: "pp1", serviceId: "svc1",
    date: futureDate(3), startTime: "08:00", endTime: "10:00",
    status: "CONFIRMED", createdAt: new Date().toISOString(), userName: "Alex Johnson", userPhone: "0712 345 678",
  },
  {
    id: "bk2", userId: "user1", providerId: "pp2", serviceId: "svc3",
    date: futureDate(-2), startTime: "10:00", endTime: "11:00",
    status: "COMPLETED", createdAt: new Date().toISOString(), userName: "Alex Johnson", userPhone: "0712 345 678",
  },
];

const DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1", userId: "user1", type: "booking_success", title: "Booking Confirmed",
    message: "Your cleaning session with Maria's Cleaning Co. is confirmed for " + futureDate(3),
    read: false, createdAt: new Date().toISOString(),
  },
  {
    id: "n2", userId: "prov1", type: "new_booking", title: "New Booking",
    message: "Alex Johnson booked Standard Cleaning on " + futureDate(3),
    read: false, createdAt: new Date().toISOString(),
  },
  {
    id: "n3", userId: "admin1", type: "application_submitted", title: "New Provider Application",
    message: "A new provider application has been submitted.",
    read: true, createdAt: new Date().toISOString(),
  },
];

const DEMO_REVIEWS: Review[] = [
  {
    id: "rev1", bookingId: "bk2", providerId: "pp1", userId: "user1",
    rating: 5, comment: "Excellent service! Very thorough and professional. Highly recommend!",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), userName: "Alex Johnson",
  },
];

export function createSeedData(): AppState {
  return {
    session: { userId: null, role: "GUEST" },
    users: DEMO_USERS,
    providerProfiles: DEMO_PROVIDERS,
    categories: DEMO_CATEGORIES,
    services: DEMO_SERVICES,
    availability: DEMO_AVAILABILITY,
    timeoff: [],
    bookings: DEMO_BOOKINGS,
    applications: [],
    notifications: DEMO_NOTIFICATIONS,
    reviews: DEMO_REVIEWS,
  };
}
