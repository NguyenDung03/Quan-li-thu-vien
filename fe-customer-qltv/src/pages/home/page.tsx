import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";
import { BookShowcaseSection } from "@/components/books/book-showcase-section";
import { Button } from "@/components/ui/button";
import { useBook } from "@/hooks/useBook";
import { useBookAuthor, useAuthor } from "@/hooks/useBookAuthor";


const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};


const FALLBACK_COVER =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAeq6dBaGyyAZEB157iMUU4SwoZxrD3fMBJNfvjodGV4kcCsdV6UXhlXmChEe2lYB0muy7onB1Vl7quKMqotR_KpdlU1PXiqnUew5yyjXzpXVblH_Qrj0lyM0q4mXB6bU7nvww7XF9b5vWj6McHyy_6m3DB-BneUJWFKpqA2pWJMYDUZx5USgINJjyNPebCkir0MS-d9VoDphpdUFUyTO1dNiuqg-DSDtwDbxzPu_QQm6BODHsggnXofONRBp6xo_p6ZcR350YeIl8N";


const premiumEasing = [0.32, 0.72, 0, 1] as const;

function getBookCategoryLabel(
  book: {
    mainCategory?: { name?: string | null } | null;
    mainCategoryName?: string | null;
  },
  uncategorized: string,
): string {
  return (
    book.mainCategory?.name?.trim() ||
    book.mainCategoryName?.trim() ||
    uncategorized
  );
}

const staggerDelay = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const fadeInUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.7, ease: premiumEasing },
};

export function HomePage() {
  const { t } = useTranslation("pages");
  const navigate = useNavigate();

  
  const { books: physicalBooksResponse } = useBook({
    limit: 20,
    availablePhysical: "true",
  });

  
  const { books: ebookBooksResponse } = useBook({
    limit: 20,
    bookType: "ebook",
  });

  
  const { bookAuthors: bookAuthorsResponse } = useBookAuthor({ limit: 200 });
  const { authors: authorsResponse } = useAuthor({ limit: 100 });

  
  const physicalBooks = useMemo(() => {
    const booksData = physicalBooksResponse?.data ?? [];
    const shuffled = shuffleArray(booksData).slice(0, 4);

    
    const authorMap = new Map<string, string>();
    authorsResponse?.data?.forEach((author) => {
      if (author.id) {
        authorMap.set(author.id, author.authorName);
      }
    });

    
    const bookAuthorIdsMap = new Map<string, string[]>();
    bookAuthorsResponse?.data?.forEach((ba) => {
      if (ba.bookId && ba.authorId) {
        const existing = bookAuthorIdsMap.get(ba.bookId) || [];
        existing.push(ba.authorId);
        bookAuthorIdsMap.set(ba.bookId, existing);
      }
    });

    
    const getBookAuthors = (bookId: string): string => {
      const authorIds = bookAuthorIdsMap.get(bookId) || [];
      const authorNames = authorIds.map(
        (id) => authorMap.get(id) || t("home.unknownAuthor"),
      );
      return authorNames.join(", ") || t("home.unknownAuthor");
    };

    return shuffled.map((book) => ({
      id: book.id || "",
      title: book.title,
      author: getBookAuthors(book.id || ""),
      category: getBookCategoryLabel(book, t("home.uncategorized")),
      cover: book.coverImage || FALLBACK_COVER,
      status: "available" as const,
    }));
  }, [
    physicalBooksResponse?.data,
    bookAuthorsResponse?.data,
    authorsResponse?.data,
    t,
  ]);

  
  const ebookBooks = useMemo(() => {
    const booksData = ebookBooksResponse?.data ?? [];
    const shuffled = shuffleArray(booksData).slice(0, 4);

    
    const authorMap = new Map<string, string>();
    authorsResponse?.data?.forEach((author) => {
      if (author.id) {
        authorMap.set(author.id, author.authorName);
      }
    });

    
    const bookAuthorIdsMap = new Map<string, string[]>();
    bookAuthorsResponse?.data?.forEach((ba) => {
      if (ba.bookId && ba.authorId) {
        const existing = bookAuthorIdsMap.get(ba.bookId) || [];
        existing.push(ba.authorId);
        bookAuthorIdsMap.set(ba.bookId, existing);
      }
    });

    
    const getBookAuthors = (bookId: string): string => {
      const authorIds = bookAuthorIdsMap.get(bookId) || [];
      const authorNames = authorIds.map(
        (id) => authorMap.get(id) || t("home.unknownAuthor"),
      );
      return authorNames.join(", ") || t("home.unknownAuthor");
    };

    return shuffled.map((book) => ({
      id: book.id || "",
      title: book.title,
      author: getBookAuthors(book.id || ""),
      category: getBookCategoryLabel(book, t("home.uncategorized")),
      cover: book.coverImage || FALLBACK_COVER,
      status: "available" as const,
    }));
  }, [
    ebookBooksResponse?.data,
    bookAuthorsResponse?.data,
    authorsResponse?.data,
    t,
  ]);

  
  const books = [...physicalBooks, ...ebookBooks];

  
  const handleBookClick = (bookId: string) => {
    navigate(`/book/${bookId}`);
  };

  return (
    <motion.div
      variants={staggerDelay}
      initial="initial"
      animate="animate"
      className="space-y-16"
    >
      
      <motion.div
        variants={fadeInUp}
        className="relative min-h-[320px] rounded-[2.5rem] overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#18AD5B] to-[#46C37B]">
          <img
            alt={t("home.heroBgAlt")}
            className="w-full h-full object-cover opacity-20 mix-blend-overlay transition-transform duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyfMQHZFKXPK54j7VFDRyt9BzZHiFSEF1Nt3y78h-mYt5oHx9P6_FxifI7XHTIc9b-PH_OJQen2Sjpvz3tGxHZPUFvuAcmYhjCELtJjs09LAhw3TZ2oJe7MiGrLxuPKhqoz7yfGjkxut6qRM5g0kjToFE5iGJbYbhfYjoBQmuQpscFqB2NH_jHRMNNoZRNw9gM_gYly3QL__6xLtqM1XEPH_FPlzLacpXPFoBm2isDaqhrBvGE4aBItKqXtmEm40xrIEbtNFn4wao1"
          />
        </div>

        
        <div className="absolute inset-4 rounded-[2rem] border border-white/10 overflow-hidden">
          
          <div className="relative h-full flex flex-col justify-center px-12 text-white">
            <div className="max-w-2xl">
              
              <span className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-6">
                {t("home.heroEyebrow")}
              </span>

              <h2 className="text-5xl lg:text-6xl font-black mb-6 leading-[1.1] tracking-tight">
                {t("home.heroTitle")}
              </h2>

              <p className="text-white/80 text-base mb-8 max-w-lg leading-relaxed">
                {t("home.heroDesc")}
              </p>

              
              <Button className="group/btn bg-white text-[#18AD5B] px-8 py-3.5 rounded-full font-bold text-sm shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-black/15 transition-all duration-500 active:scale-[0.98]">
                <span>{t("home.heroCta")}</span>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#18AD5B]/10 ml-2 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5 transition-transform duration-300">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </span>
              </Button>
            </div>
          </div>
        </div>

        
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </motion.div>

      <BookShowcaseSection
        subtitle={t("home.showcaseSubtitle")}
        title={t("home.showcaseTitle")}
        description={t("home.showcaseDesc")}
        books={books}
        maxItems={books.length}
        gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-stretch"
        className="mt-0"
        renderBook={(book, index) => (
          <motion.div
            key={book.id}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.6,
              delay: index * 0.1,
              ease: premiumEasing,
            }}
            whileHover={{ y: -8 }}
            onClick={() => handleBookClick(book.id)}
            className="group cursor-pointer"
          >
            <div className="bg-card rounded-3xl p-2 border border-border shadow-sm transition-all duration-500 hover:shadow-md">
              <div className="bg-card rounded-2xl overflow-hidden">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3">
                  <img
                    alt={t("home.coverAlt", { title: book.title })}
                    className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,0,1)] group-hover:scale-110"
                    src={book.cover}
                  />
                  <div
                    className={`absolute top-3 right-3 text-[10px] font-bold px-3 py-1 rounded-xl uppercase tracking-[0.1em] ${
                      book.status === "available"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {book.status === "available"
                      ? t("home.statusAvailable")
                      : t("home.statusReserved")}
                  </div>
                </div>

                <div className="p-3">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-[0.12em] mb-1 line-clamp-1">
                    {book.category}
                  </p>
                  <h4 className="font-bold text-foreground leading-tight line-clamp-2 mb-1 text-sm">
                    {book.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    <span className="text-muted-foreground/80">
                      {t("home.authorPrefix")}
                    </span>
                    {book.author}
                  </p>

                  <div className="flex gap-2">
                    <Button className="flex-1 text-xs font-semibold py-2 rounded-2xl transition-all duration-300 active:scale-[0.98]">
                      {t("home.readNow")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="px-3 bg-muted/40 text-muted-foreground rounded-2xl hover:bg-muted hover:text-primary transition-all duration-300"
                    >
                      <Bookmark size={14} strokeWidth={2.5} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      />
    </motion.div>
  );
}
