import type { Language } from "@prisma/client";

// Тексты сообщений бота на выбранном пользователем языке. До выбора языка
// (самый первый /start) всегда используется RU — язык ещё не известен.
export const BOT_STRINGS: Record<
  Language,
  {
    welcome: string;
    askLanguage: string;
    nameConfirmQuestion: (firstName: string) => string;
    nameConfirmYes: string;
    nameConfirmEdit: string;
    editNamePrompt: string;
    niceToMeetYou: (name: string) => string;
    askRegion: string;
    alreadyRegistered: (firstName: string, region: string) => string;
    registrationDone: (firstName: string, region: string) => string;
    openApp: string;
  }
> = {
  RU: {
    welcome: `Привет! Я — бот BioMap 🌱

Помогаю абитуриентам готовиться по биологии: собираю темы школьной программы в единую систему, объясняю их простыми микроуроками и слежу за твоим прогрессом — с 5 по 11 класс.

Сначала давай зарегистрируемся — это займёт полминуты.`,
    askLanguage: "На каком языке тебе удобнее заниматься?",
    nameConfirmQuestion: (firstName) => `Тебя зовут *${firstName}* — всё верно?`,
    nameConfirmYes: "✅ Да, всё верно",
    nameConfirmEdit: "✏️ Изменить",
    editNamePrompt: "Хорошо, напиши, как к тебе обращаться:",
    niceToMeetYou: (name) => `Приятно познакомиться, ${name}!`,
    askRegion: "Из какой ты области?",
    alreadyRegistered: (firstName, region) =>
      `Ты уже зарегистрирован(а) 🙌\n👤 Имя: ${firstName}\n📍 Область: ${region}`,
    registrationDone: (firstName, region) =>
      `Регистрация завершена ✅\n\n👤 Имя: ${firstName}\n📍 Область: ${region}\n\nМожно начинать готовиться! Кнопка входа теперь всегда под рукой внизу 👇`,
    openApp: "🚀 Открыть BioMap",
  },
  UZ: {
    welcome: `Salom! Men — BioMap boti 🌱

Abituriyentlarga biologiyadan tayyorgarlik ko'rishda yordam beraman: maktab dasturi mavzularini yagona tizimga jamlayman, ularni sodda mikrodarslar bilan tushuntiraman va progressingni kuzataman — 5-sinfdan 11-sinfgacha.

Avval ro'yxatdan o'tamiz — bu yarim daqiqa vaqt oladi.`,
    askLanguage: "Qaysi tilda shug'ullanish sen uchun qulay?",
    nameConfirmQuestion: (firstName) => `Seni *${firstName}* deb chaqiramizmi — to'g'rimi?`,
    nameConfirmYes: "✅ Ha, to'g'ri",
    nameConfirmEdit: "✏️ O'zgartirish",
    editNamePrompt: "Yaxshi, senga qanday murojaat qilishni yoz:",
    niceToMeetYou: (name) => `Tanishganimdan xursandman, ${name}!`,
    askRegion: "Qaysi viloyatdansan?",
    alreadyRegistered: (firstName, region) =>
      `Siz allaqachon ro'yxatdan o'tgansiz 🙌\n👤 Ism: ${firstName}\n📍 Viloyat: ${region}`,
    registrationDone: (firstName, region) =>
      `Ro'yxatdan o'tish yakunlandi ✅\n\n👤 Ism: ${firstName}\n📍 Viloyat: ${region}\n\nTayyorgarlikni boshlash mumkin! Kirish tugmasi endi doim pastda qo'l ostida 👇`,
    openApp: "🚀 BioMap-ni ochish",
  },
};
