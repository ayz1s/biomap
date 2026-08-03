// Справочник сквозных понятий — фиксированный список слагов, которые реально
// повторяются минимум в двух классах (5-11), судя по названиям тем и
// categorySlug в curriculum-gradeN.ts (308 тем). См. docs/cross-grade-links-feature.md.
// Полные тексты уроков на этом шаге не читались — точные вхождения и цитаты
// подтверждаются позже при генерации/ретрофите уроков (три автопроверки).
import type { CategorySlug } from "./categories";

export interface ConceptDef {
  id: string; // слаг, первичный ключ модели Concept
  title: string;
  categorySlug: CategorySlug | null;
}

export const CONCEPTS: ConceptDef[] = [
  // Общая биология
  { id: "biology-science", title: "Биология как наука", categorySlug: "general-biology" },
  { id: "life-signs", title: "Признаки живых организмов", categorySlug: "general-biology" },
  { id: "life-organization-levels", title: "Уровни организации живой материи", categorySlug: "general-biology" },
  { id: "nutrition", title: "Питание организмов", categorySlug: "general-biology" },
  { id: "respiration", title: "Дыхание", categorySlug: "general-biology" },
  { id: "excretion", title: "Выделение", categorySlug: "general-biology" },
  { id: "movement-organisms", title: "Движение живых организмов", categorySlug: "general-biology" },
  { id: "reproduction", title: "Размножение организмов", categorySlug: "general-biology" },
  { id: "ontogenesis", title: "Индивидуальное развитие организма", categorySlug: "general-biology" },
  { id: "fertilization", title: "Оплодотворение", categorySlug: "general-biology" },
  { id: "self-regulation", title: "Саморегуляция организма", categorySlug: "general-biology" },
  { id: "metabolism", title: "Обмен веществ", categorySlug: "general-biology" },
  { id: "human-and-nature", title: "Человек и природа", categorySlug: "general-biology" },

  // Цитология
  { id: "cell", title: "Клетка", categorySlug: "cytology" },
  { id: "cell-theory", title: "Клеточная теория", categorySlug: "cytology" },
  { id: "prokaryote-eukaryote", title: "Прокариоты и эукариоты", categorySlug: "cytology" },
  { id: "cell-membrane", title: "Клеточная мембрана", categorySlug: "cytology" },
  { id: "nucleus", title: "Ядро клетки", categorySlug: "cytology" },
  { id: "cytoplasm-organelles", title: "Цитоплазма и органоиды клетки", categorySlug: "cytology" },
  { id: "mitochondria-plastids", title: "Митохондрии и пластиды", categorySlug: "cytology" },
  { id: "tissues", title: "Ткани", categorySlug: "cytology" },
  { id: "cell-chemical-composition", title: "Химический состав клетки", categorySlug: "cytology" },
  { id: "proteins", title: "Белки", categorySlug: "cytology" },
  { id: "carbohydrates", title: "Углеводы", categorySlug: "cytology" },
  { id: "lipids", title: "Липиды", categorySlug: "cytology" },
  { id: "nucleic-acids", title: "Нуклеиновые кислоты", categorySlug: "cytology" },
  { id: "protein-biosynthesis", title: "Биосинтез белка", categorySlug: "cytology" },
  { id: "energy-metabolism", title: "Энергетический обмен", categorySlug: "cytology" },
  { id: "cell-cycle-division", title: "Клеточный цикл и деление клетки", categorySlug: "cytology" },
  { id: "meiosis", title: "Мейоз", categorySlug: "cytology" },
  { id: "gametogenesis", title: "Гаметогенез", categorySlug: "cytology" },
  { id: "photosynthesis", title: "Фотосинтез", categorySlug: "cytology" },

  // Микробиология
  { id: "bacteria", title: "Царство бактерий", categorySlug: "microbiology" },
  { id: "fungi", title: "Царство грибов", categorySlug: "microbiology" },
  { id: "protists", title: "Простейшие (протоктисты)", categorySlug: "microbiology" },

  // Ботаника
  { id: "plant-kingdom", title: "Царство растений", categorySlug: "botany" },
  { id: "algae", title: "Водоросли", categorySlug: "botany" },
  { id: "mosses", title: "Моховидные растения", categorySlug: "botany" },
  { id: "ferns", title: "Папоротниковидные растения", categorySlug: "botany" },
  { id: "spore-plants", title: "Споровые растения", categorySlug: "botany" },
  { id: "seed-plants", title: "Семенные растения", categorySlug: "botany" },
  { id: "gymnosperms", title: "Голосеменные растения", categorySlug: "botany" },
  { id: "angiosperms", title: "Покрытосеменные растения", categorySlug: "botany" },
  { id: "root", title: "Корень", categorySlug: "botany" },
  { id: "shoot", title: "Побег", categorySlug: "botany" },
  { id: "leaf", title: "Лист", categorySlug: "botany" },
  { id: "flower", title: "Цветок", categorySlug: "botany" },
  { id: "flower-formula", title: "Формула цветка", categorySlug: "botany" },
  { id: "fruit", title: "Плод", categorySlug: "botany" },
  { id: "seed", title: "Семя", categorySlug: "botany" },
  { id: "pollination", title: "Опыление", categorySlug: "botany" },
  { id: "transport-plant-substances", title: "Транспорт веществ в растениях", categorySlug: "botany" },
  { id: "plant-evolution", title: "Развитие растительного мира на Земле", categorySlug: "botany" },

  // Зоология
  { id: "invertebrates", title: "Беспозвоночные животные", categorySlug: "zoology" },
  { id: "vertebrates", title: "Позвоночные животные", categorySlug: "zoology" },
  { id: "animal-kingdom", title: "Царство животных", categorySlug: "zoology" },

  // Анатомия и физиология человека
  { id: "organs-systems", title: "Органы и системы органов", categorySlug: "human-anatomy" },
  { id: "musculoskeletal-system", title: "Опорно-двигательная система", categorySlug: "human-anatomy" },
  { id: "circulatory-system", title: "Кровеносная система", categorySlug: "human-anatomy" },
  { id: "digestive-system", title: "Пищеварительная система", categorySlug: "human-anatomy" },
  { id: "nervous-system", title: "Нервная система", categorySlug: "human-anatomy" },
  { id: "endocrine-system", title: "Железы внутренней секреции", categorySlug: "human-anatomy" },

  // Генетика
  { id: "heredity-variability", title: "Наследственность и изменчивость", categorySlug: "genetics" },
  { id: "mendel-laws", title: "Законы Менделя", categorySlug: "genetics" },
  { id: "sex-linked-genetics", title: "Генетика пола", categorySlug: "genetics" },
  { id: "mutations", title: "Мутационная изменчивость", categorySlug: "genetics" },

  // Эволюция
  { id: "evolution-theory", title: "Эволюция", categorySlug: "evolution" },
  { id: "natural-selection", title: "Естественный отбор", categorySlug: "evolution" },
  { id: "speciation", title: "Видообразование", categorySlug: "evolution" },
  { id: "adaptation", title: "Приспособленность организмов", categorySlug: "evolution" },
  { id: "phylogeny", title: "Филогенез органического мира", categorySlug: "evolution" },
  { id: "geological-eras", title: "Геологические эры", categorySlug: "evolution" },

  // Биотехнология
  { id: "genetic-engineering", title: "Генная инженерия и биотехнология", categorySlug: "biotech" },
  { id: "selective-breeding", title: "Селекция растений и животных", categorySlug: "biotech" },

  // Экология
  { id: "ecological-factors", title: "Экологические факторы", categorySlug: "ecology" },
  { id: "habitat-environment", title: "Среда обитания организмов", categorySlug: "ecology" },
  { id: "nature-protection", title: "Охрана природы", categorySlug: "ecology" },
  { id: "ecosystem", title: "Экосистема", categorySlug: "ecology" },
  { id: "biosphere", title: "Биосфера", categorySlug: "ecology" },
  { id: "population", title: "Популяция и вид", categorySlug: "ecology" },
  { id: "food-chain-pyramid", title: "Трофическая структура и экологическая пирамида", categorySlug: "ecology" },
];
