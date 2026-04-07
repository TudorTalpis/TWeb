import { describe, it, expect } from "vitest";
import { appReducer } from "@/store/AppContext";
import type { AppState, AppUser, Category, Service, Booking, ProviderProfile } from "@/types";

function createInitialState(): AppState {
  return {
    session: { userId: null, role: "GUEST" },
    users: [],
    providerProfiles: [],
    categories: [],
    services: [],
    availability: [],
    timeoff: [],
    bookings: [],
    applications: [],
    notifications: [],
    reviews: [],
  };
}

describe("appReducer", () => {
  describe("User actions", () => {
    it("should handle ADD_USER", () => {
      const state = createInitialState();
      const newUser: AppUser = {
        id: "user-1",
        name: "Test User",
        email: "test@example.com",
        phone: "+40123456789",
        password: "TestPass1",
        role: "USER",
      };

      const newState = appReducer(state, { type: "ADD_USER", payload: newUser });

      expect(newState.users).toHaveLength(1);
      expect(newState.users[0]).toEqual(newUser);
    });

    it("should handle LOGIN and LOGOUT", () => {
      const state: AppState = {
        ...createInitialState(),
        users: [
          {
            id: "user-1",
            name: "Test User",
            email: "test@example.com",
            phone: "+40123456789",
            password: "TestPass1",
            role: "USER",
          },
        ],
      };

      const loggedInState = appReducer(state, { type: "LOGIN", payload: { userId: "user-1" } });
      expect(loggedInState.session.userId).toBe("user-1");
      expect(loggedInState.session.role).toBe("USER");

      const loggedOutState = appReducer(loggedInState, { type: "LOGOUT" });
      expect(loggedOutState.session.userId).toBeNull();
      expect(loggedOutState.session.role).toBe("GUEST");
    });
  });

  describe("Category actions", () => {
    it("should handle ADD_CATEGORY", () => {
      const state = createInitialState();
      const category: Category = {
        id: "cat-1",
        name: "Beauty",
        icon: "sparkles",
        description: "Beauty services",
        color: "bg-pink-500",
      };

      const newState = appReducer(state, { type: "ADD_CATEGORY", payload: category });

      expect(newState.categories).toHaveLength(1);
      expect(newState.categories[0]).toEqual(category);
    });

    it("should prevent duplicate categories by ID", () => {
      const category: Category = {
        id: "cat-1",
        name: "Beauty",
        icon: "sparkles",
        description: "Beauty services",
        color: "bg-pink-500",
      };

      const state: AppState = {
        ...createInitialState(),
        categories: [category],
      };

      const newState = appReducer(state, { type: "ADD_CATEGORY", payload: category });

      expect(newState.categories).toHaveLength(1);
      expect(newState).toBe(state);
    });

    it("should handle UPDATE_CATEGORY", () => {
      const category: Category = {
        id: "cat-1",
        name: "Beauty",
        icon: "sparkles",
        description: "Beauty services",
        color: "bg-pink-500",
      };

      const state: AppState = {
        ...createInitialState(),
        categories: [category],
      };

      const newState = appReducer(state, {
        type: "UPDATE_CATEGORY",
        payload: { id: "cat-1", name: "Updated Beauty" },
      });

      expect(newState.categories[0].name).toBe("Updated Beauty");
      expect(newState.categories).toHaveLength(1);
    });

    it("should handle DELETE_CATEGORY", () => {
      const state: AppState = {
        ...createInitialState(),
        categories: [
          {
            id: "cat-1",
            name: "Beauty",
            icon: "sparkles",
            description: "Beauty services",
            color: "bg-pink-500",
          },
        ],
      };

      const newState = appReducer(state, { type: "DELETE_CATEGORY", payload: "cat-1" });

      expect(newState.categories).toHaveLength(0);
    });
  });

  describe("Service actions", () => {
    it("should handle ADD_SERVICE", () => {
      const state = createInitialState();
      const service: Service = {
        id: "svc-1",
        providerId: "provider-1",
        title: "Haircut",
        description: "Professional haircut",
        price: 50,
        duration: 60,
        bufferMinutes: null,
        categoryId: "cat-1",
      };

      const newState = appReducer(state, { type: "ADD_SERVICE", payload: service });

      expect(newState.services).toHaveLength(1);
      expect(newState.services[0]).toEqual(service);
    });

    it("should handle UPDATE_SERVICE", () => {
      const service: Service = {
        id: "svc-1",
        providerId: "provider-1",
        title: "Haircut",
        description: "Professional haircut",
        price: 50,
        duration: 60,
        bufferMinutes: null,
        categoryId: "cat-1",
      };

      const state: AppState = {
        ...createInitialState(),
        services: [service],
      };

      const newState = appReducer(state, {
        type: "UPDATE_SERVICE",
        payload: { id: "svc-1", price: 75 },
      });

      expect(newState.services[0].price).toBe(75);
    });

    it("should handle DELETE_SERVICE", () => {
      const state: AppState = {
        ...createInitialState(),
        services: [
          {
            id: "svc-1",
            providerId: "provider-1",
            title: "Haircut",
            description: "Professional haircut",
            price: 50,
            duration: 60,
            bufferMinutes: null,
            categoryId: "cat-1",
          },
        ],
      };

      const newState = appReducer(state, { type: "DELETE_SERVICE", payload: "svc-1" });

      expect(newState.services).toHaveLength(0);
    });
  });

  describe("Booking actions", () => {
    it("should handle ADD_BOOKING when provider is not blocked", () => {
      const booking: Booking = {
        id: "booking-1",
        userId: "user-1",
        providerId: "provider-1",
        serviceId: "svc-1",
        date: "2024-01-15",
        startTime: "10:00",
        endTime: "11:00",
        status: "PENDING",
        createdAt: "2024-01-14T10:00:00.000Z",
        userName: "Test User",
      };

      const state: AppState = {
        ...createInitialState(),
        providerProfiles: [
          {
            id: "provider-1",
            userId: "user-provider",
            name: "Test Provider",
            slug: "test-provider",
            description: "Test",
            categoryIds: [],
            pendingCategoryNames: [],
            avatar: "",
            coverPhoto: "",
            galleryPhotos: [],
            phone: "",
            location: "",
            defaultServiceBufferMinutes: 0,
            autoConfirm: false,
            rating: 0,
            reviewCount: 0,
            featured: false,
            sponsored: false,
            blocked: false,
          },
        ],
      };

      const newState = appReducer(state, { type: "ADD_BOOKING", payload: booking });

      expect(newState.bookings).toHaveLength(1);
      expect(newState.bookings[0]).toEqual(booking);
    });

    it("should reject ADD_BOOKING when provider is blocked", () => {
      const booking: Booking = {
        id: "booking-1",
        userId: "user-1",
        providerId: "provider-1",
        serviceId: "svc-1",
        date: "2024-01-15",
        startTime: "10:00",
        endTime: "11:00",
        status: "PENDING",
        createdAt: "2024-01-14T10:00:00.000Z",
        userName: "Test User",
      };

      const state: AppState = {
        ...createInitialState(),
        providerProfiles: [
          {
            id: "provider-1",
            userId: "user-provider",
            name: "Test Provider",
            slug: "test-provider",
            description: "Test",
            categoryIds: [],
            pendingCategoryNames: [],
            avatar: "",
            coverPhoto: "",
            galleryPhotos: [],
            phone: "",
            location: "",
            defaultServiceBufferMinutes: 0,
            autoConfirm: false,
            rating: 0,
            reviewCount: 0,
            featured: false,
            sponsored: false,
            blocked: true,
          },
        ],
      };

      const newState = appReducer(state, { type: "ADD_BOOKING", payload: booking });

      expect(newState.bookings).toHaveLength(0);
      expect(newState).toBe(state);
    });

    it("should handle UPDATE_BOOKING", () => {
      const booking: Booking = {
        id: "booking-1",
        userId: "user-1",
        providerId: "provider-1",
        serviceId: "svc-1",
        date: "2024-01-15",
        startTime: "10:00",
        endTime: "11:00",
        status: "PENDING",
        createdAt: "2024-01-14T10:00:00.000Z",
        userName: "Test User",
      };

      const state: AppState = {
        ...createInitialState(),
        bookings: [booking],
      };

      const newState = appReducer(state, {
        type: "UPDATE_BOOKING",
        payload: { id: "booking-1", status: "CONFIRMED" },
      });

      expect(newState.bookings[0].status).toBe("CONFIRMED");
    });

    it("should handle DELETE_BOOKING", () => {
      const state: AppState = {
        ...createInitialState(),
        bookings: [
          {
            id: "booking-1",
            userId: "user-1",
            providerId: "provider-1",
            serviceId: "svc-1",
            date: "2024-01-15",
            startTime: "10:00",
            endTime: "11:00",
            status: "PENDING",
            createdAt: "2024-01-14T10:00:00.000Z",
            userName: "Test User",
          },
        ],
      };

      const newState = appReducer(state, { type: "DELETE_BOOKING", payload: "booking-1" });

      expect(newState.bookings).toHaveLength(0);
    });
  });

  describe("Notification actions", () => {
    it("should handle ADD_NOTIFICATION", () => {
      const state = createInitialState();
      const notification = {
        id: "notif-1",
        userId: "user-1",
        type: "booking_success" as const,
        title: "Booking Confirmed",
        message: "Your booking is confirmed",
        read: false,
        createdAt: "2024-01-14T10:00:00.000Z",
      };

      const newState = appReducer(state, { type: "ADD_NOTIFICATION", payload: notification });

      expect(newState.notifications).toHaveLength(1);
      expect(newState.notifications[0]).toEqual(notification);
    });

    it("should handle MARK_NOTIFICATION_READ", () => {
      const state: AppState = {
        ...createInitialState(),
        notifications: [
          {
            id: "notif-1",
            userId: "user-1",
            type: "booking_success",
            title: "Booking Confirmed",
            message: "Your booking is confirmed",
            read: false,
            createdAt: "2024-01-14T10:00:00.000Z",
          },
        ],
      };

      const newState = appReducer(state, { type: "MARK_NOTIFICATION_READ", payload: "notif-1" });

      expect(newState.notifications[0].read).toBe(true);
    });

    it("should handle MARK_ALL_NOTIFICATIONS_READ", () => {
      const state: AppState = {
        ...createInitialState(),
        notifications: [
          {
            id: "notif-1",
            userId: "user-1",
            type: "booking_success",
            title: "Booking 1",
            message: "Message 1",
            read: false,
            createdAt: "2024-01-14T10:00:00.000Z",
          },
          {
            id: "notif-2",
            userId: "user-1",
            type: "new_booking",
            title: "Booking 2",
            message: "Message 2",
            read: false,
            createdAt: "2024-01-14T11:00:00.000Z",
          },
        ],
      };

      const newState = appReducer(state, { type: "MARK_ALL_NOTIFICATIONS_READ" });

      expect(newState.notifications.every((n) => n.read)).toBe(true);
    });
  });

  describe("Provider profile actions", () => {
    it("should handle TOGGLE_BLOCKED", () => {
      const provider: ProviderProfile = {
        id: "provider-1",
        userId: "user-1",
        name: "Test Provider",
        slug: "test-provider",
        description: "Test",
        categoryIds: [],
        pendingCategoryNames: [],
        avatar: "",
        coverPhoto: "",
        galleryPhotos: [],
        phone: "",
        location: "",
        defaultServiceBufferMinutes: 0,
        autoConfirm: false,
        rating: 0,
        reviewCount: 0,
        featured: false,
        sponsored: false,
        blocked: false,
      };

      const state: AppState = {
        ...createInitialState(),
        providerProfiles: [provider],
      };

      const newState = appReducer(state, { type: "TOGGLE_BLOCKED", payload: "provider-1" });

      expect(newState.providerProfiles[0].blocked).toBe(true);
    });

    it("should handle TOGGLE_FEATURED", () => {
      const provider: ProviderProfile = {
        id: "provider-1",
        userId: "user-1",
        name: "Test Provider",
        slug: "test-provider",
        description: "Test",
        categoryIds: [],
        pendingCategoryNames: [],
        avatar: "",
        coverPhoto: "",
        galleryPhotos: [],
        phone: "",
        location: "",
        defaultServiceBufferMinutes: 0,
        autoConfirm: false,
        rating: 0,
        reviewCount: 0,
        featured: false,
        sponsored: false,
        blocked: false,
      };

      const state: AppState = {
        ...createInitialState(),
        providerProfiles: [provider],
      };

      const newState = appReducer(state, { type: "TOGGLE_FEATURED", payload: "provider-1" });

      expect(newState.providerProfiles[0].featured).toBe(true);
    });
  });
});
