import React, { createContext, useContext, useState, type ReactNode } from "react";

export type Language = "en" | "ro" | "ru";

type Translations = Record<string, Record<Language, string>>;

const translations: Translations = {
  // Navbar
  "nav.home": { en: "Home", ro: "Acasă", ru: "Главная" },
  "nav.providers": { en: "Providers", ro: "Furnizori", ru: "Поставщики" },
  "nav.bookings": { en: "Bookings", ro: "Rezervări", ru: "Бронирования" },
  "nav.provider": { en: "Provider", ro: "Furnizor", ru: "Поставщик" },
  "nav.admin": { en: "Admin", ro: "Admin", ru: "Админ" },
  "nav.signIn": { en: "Sign In", ro: "Autentificare", ru: "Войти" },
  "nav.signOut": { en: "Sign Out", ro: "Deconectare", ru: "Выйти" },
  "nav.resetDemo": { en: "Reset Demo", ro: "Resetare Demo", ru: "Сброс демо" },
  "nav.reset": { en: "Reset", ro: "Resetare", ru: "Сброс" },
  "nav.notifications": { en: "Notifications", ro: "Notificări", ru: "Уведомления" },
  "nav.myBookings": { en: "My Bookings", ro: "Rezervările Mele", ru: "Мои бронирования" },
  "nav.providerSettings": { en: "Provider Settings", ro: "Setări Furnizor", ru: "Настройки поставщика" },
  "nav.adminPanel": { en: "Admin Panel", ro: "Panou Admin", ru: "Панель админа" },
  "nav.providerPanel": { en: "Provider Panel", ro: "Panou Furnizor", ru: "Панель поставщика" },
  "nav.settings": { en: "Settings", ro: "Setări", ru: "Настройки" },
  "nav.search": { en: "Search providers or services...", ro: "Caută furnizori sau servicii...", ru: "Поиск поставщиков или услуг..." },
  "nav.searchShort": { en: "Search...", ro: "Caută...", ru: "Поиск..." },

  // Index / Home
  "home.hero.title1": { en: "Find the perfect service,", ro: "Găsește serviciul perfect,", ru: "Найдите идеальный сервис," },
  "home.hero.title2": { en: "instantly", ro: "instant", ru: "мгновенно" },
  "home.hero.subtitle": { en: "Book trusted local professionals for cleaning, fitness, photography, and more.", ro: "Rezervă profesioniști locali de încredere pentru curățenie, fitness, fotografie și multe altele.", ru: "Забронируйте проверенных местных специалистов по уборке, фитнесу, фотографии и другим услугам." },
  "home.browseServices": { en: "Browse Services", ro: "Răsfoiește Servicii", ru: "Просмотр услуг" },
  "home.becomeProvider": { en: "Become a Provider", ro: "Devino Furnizor", ru: "Стать поставщиком" },
  "home.verified": { en: "Verified Providers", ro: "Furnizori Verificați", ru: "Проверенные поставщики" },
  "home.instant": { en: "Instant Booking", ro: "Rezervare Instantă", ru: "Мгновенное бронирование" },
  "home.topRated": { en: "Top Rated", ro: "Cel Mai Bine Cotat", ru: "Лучшие рейтинги" },
  "home.sponsored": { en: "Sponsored Providers", ro: "Furnizori Sponsorizați", ru: "Спонсируемые поставщики" },
  "home.featured": { en: "Featured Providers", ro: "Furnizori Recomandați", ru: "Рекомендуемые поставщики" },
  "home.categories": { en: "Browse Categories", ro: "Răsfoiește Categorii", ru: "Просмотр категорий" },
  "home.allProviders": { en: "All Providers", ro: "Toți Furnizorii", ru: "Все поставщики" },
  "home.viewAll": { en: "View all", ro: "Vezi toate", ru: "Показать все" },

  // Categories / Providers page
  "providers.title": { en: "Providers", ro: "Furnizori", ru: "Поставщики" },
  "providers.categories": { en: "Categories", ro: "Categorii", ru: "Категории" },
  "providers.search": { en: "Search providers...", ro: "Caută furnizori...", ru: "Поиск поставщиков..." },
  "providers.relevance": { en: "Relevance", ro: "Relevanță", ru: "Релевантность" },
  "providers.nameAZ": { en: "Name A–Z", ro: "Nume A–Z", ru: "Имя А–Я" },
  "providers.priceLow": { en: "Price: Low to High", ro: "Preț: Mic la Mare", ru: "Цена: по возрастанию" },
  "providers.priceHigh": { en: "Price: High to Low", ro: "Preț: Mare la Mic", ru: "Цена: по убыванию" },
  "providers.bestReviewed": { en: "Best Reviewed", ro: "Cele Mai Bune Recenzii", ru: "Лучшие отзывы" },
  "providers.newest": { en: "Newest", ro: "Cele Mai Noi", ru: "Новые" },
  "providers.noProviders": { en: "No providers found.", ro: "Niciun furnizor găsit.", ru: "Поставщики не найдены." },
  "providers.inCategory": { en: "in", ro: "în", ru: "в" },

  // Dashboard
  "dashboard.title": { en: "My Bookings", ro: "Rezervările Mele", ru: "Мои бронирования" },
  "dashboard.bookNew": { en: "Book New", ro: "Rezervare Nouă", ru: "Новое бронирование" },
  "dashboard.upcoming": { en: "Upcoming", ro: "Viitoare", ru: "Предстоящие" },
  "dashboard.past": { en: "Past", ro: "Trecute", ru: "Прошедшие" },
  "dashboard.noUpcoming": { en: "No upcoming bookings.", ro: "Nicio rezervare viitoare.", ru: "Нет предстоящих бронирований." },
  "dashboard.browseServices": { en: "Browse services →", ro: "Răsfoiește servicii →", ru: "Просмотр услуг →" },
  "dashboard.noPast": { en: "No past bookings.", ro: "Nicio rezervare trecută.", ru: "Нет прошлых бронирований." },
  "dashboard.viewProvider": { en: "View Provider", ro: "Vezi Furnizor", ru: "Посмотреть поставщика" },
  "dashboard.leaveReview": { en: "Leave Review", ro: "Lasă Recenzie", ru: "Оставить отзыв" },
  "dashboard.confirmed": { en: "Confirmed", ro: "Confirmată", ru: "Подтверждено" },

  // Booking
  "book.title": { en: "Book", ro: "Rezervă", ru: "Забронировать" },
  "book.backTo": { en: "Back to", ro: "Înapoi la", ru: "Назад к" },
  "book.selectDate": { en: "Select a Date", ro: "Selectează o Dată", ru: "Выберите дату" },
  "book.selectTime": { en: "Select a Time", ro: "Selectează Ora", ru: "Выберите время" },
  "book.pickDate": { en: "Pick a date to see available times", ro: "Alege o dată pentru a vedea orele disponibile", ru: "Выберите дату для просмотра доступного времени" },
  "book.noSlots": { en: "No available slots on this day.", ro: "Niciun slot disponibil în această zi.", ru: "Нет свободных слотов в этот день." },
  "book.tryAnother": { en: "Try another date.", ro: "Încearcă altă dată.", ru: "Попробуйте другую дату." },
  "book.reviewConfirm": { en: "Review & Confirm Booking", ro: "Revizuire și Confirmare Rezervare", ru: "Проверка и подтверждение бронирования" },
  "book.confirmTitle": { en: "Confirm Your Booking", ro: "Confirmă Rezervarea", ru: "Подтвердите бронирование" },
  "book.confirmDesc": { en: "Please review the details below before confirming.", ro: "Te rugăm să revizuiești detaliile de mai jos înainte de a confirma.", ru: "Пожалуйста, проверьте детали перед подтверждением." },
  "book.service": { en: "Service", ro: "Serviciu", ru: "Услуга" },
  "book.provider": { en: "Provider", ro: "Furnizor", ru: "Поставщик" },
  "book.date": { en: "Date", ro: "Data", ru: "Дата" },
  "book.time": { en: "Time", ro: "Ora", ru: "Время" },
  "book.duration": { en: "Duration", ro: "Durată", ru: "Длительность" },
  "book.total": { en: "Total", ro: "Total", ru: "Итого" },
  "book.cancel": { en: "Cancel", ro: "Anulează", ru: "Отмена" },
  "book.confirm": { en: "Confirm Booking", ro: "Confirmă Rezervarea", ru: "Подтвердить бронирование" },
  "book.success": { en: "Booking Confirmed!", ro: "Rezervare Confirmată!", ru: "Бронирование подтверждено!" },
  "book.viewBookings": { en: "View My Bookings", ro: "Vezi Rezervările", ru: "Мои бронирования" },
  "book.viewProvider": { en: "View Provider", ro: "Vezi Furnizor", ru: "Посмотреть поставщика" },
  "book.selected": { en: "Selected", ro: "Selectat", ru: "Выбрано" },

  // Settings
  "settings.title": { en: "Settings", ro: "Setări", ru: "Настройки" },
  "settings.profile": { en: "Profile", ro: "Profil", ru: "Профиль" },
  "settings.name": { en: "Display Name", ro: "Nume Afișat", ru: "Отображаемое имя" },
  "settings.email": { en: "Email", ro: "Email", ru: "Электронная почта" },
   "settings.save": { en: "Save Changes", ro: "Salvează Modificările", ru: "Сохранить изменения" },
   "settings.saved": { en: "Settings saved!", ro: "Setări salvate!", ru: "Настройки сохранены!" },
   "settings.language": { en: "Language", ro: "Limbă", ru: "Язык" },
   "settings.password": { en: "Password", ro: "Parolă", ru: "Пароль" },
   "settings.phone": { en: "Phone Number", ro: "Număr de Telefon", ru: "Номер телефона" },
   "settings.passwordNote": { en: "Password and phone changes require a backend. Not available in demo mode.", ro: "Schimbarea parolei și telefonului necesită un backend. Indisponibil în modul demo.", ru: "Смена пароля и телефона требует бэкенда. Недоступно в демо-режиме." },
   "settings.becomeProvider": { en: "Become a Provider", ro: "Devino Furnizor", ru: "Стать поставщиком" },

  // Reviews
  "review.title": { en: "Leave a Review", ro: "Lasă o Recenzie", ru: "Оставить отзыв" },
  "review.rating": { en: "Rating", ro: "Evaluare", ru: "Рейтинг" },
  "review.comment": { en: "Comment", ro: "Comentariu", ru: "Комментарий" },
  "review.placeholder": { en: "Share your experience with this provider...", ro: "Împărtășește experiența ta cu acest furnizor...", ru: "Поделитесь своим опытом с этим поставщиком..." },
  "review.submit": { en: "Submit Review", ro: "Trimite Recenzia", ru: "Отправить отзыв" },

  // Common
  "common.min": { en: "min", ro: "min", ru: "мин" },
};

interface I18nContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem("app_language");
    return (saved as Language) || "en";
  });

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem("app_language", l);
  };

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang] || entry.en || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

export const LANGUAGE_OPTIONS: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "" },
  { code: "ro", label: "Română", flag: "" },
  { code: "ru", label: "Русский", flag: "" },
];
