import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Star, StarHalf } from "lucide-react";
import { premiumEasing } from "@/lib/animation";

export function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex text-amber-500">
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className="w-4 h-4 fill-current"
          strokeWidth={2.5}
        />
      ))}
      {hasHalfStar && (
        <StarHalf className="w-4 h-4 fill-current" strokeWidth={2.5} />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star
          key={`empty-${i}`}
          className="w-4 h-4 text-amber-500/30"
          strokeWidth={2.5}
        />
      ))}
    </div>
  );
}

export function DifficultyIndicator({ level }: { level: number }) {
  return (
    <div className="flex gap-1 mt-1">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className={`w-6 h-1.5 rounded-full transition-colors ${
            i < level ? "bg-primary" : "bg-primary/20"
          }`}
        />
      ))}
    </div>
  );
}

export function RelatedBookCard({
  book,
  index,
  onClick,
  authorPrefix,
}: {
  book: { id: string; title: string; author: string; cover: string };
  index: number;
  onClick: () => void;
  authorPrefix: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: premiumEasing }}
      className="group flex h-full cursor-pointer"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex h-full w-full flex-col bg-card rounded-3xl border border-border p-2 shadow-sm transition-shadow duration-300 hover:shadow-md">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-card">
          <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden rounded-2xl">
            <img
              alt={book.title}
              src={book.cover}
              className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="absolute bottom-3 right-3"
            >
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                <BookOpen className="w-5 h-5" strokeWidth={2} />
              </div>
            </motion.div>
          </div>
          <div className="mt-auto flex min-h-[5.25rem] flex-col justify-start p-3 min-w-0">
            <h4 className="line-clamp-2 min-h-[2.75rem] font-bold text-foreground text-sm leading-snug transition-colors group-hover:text-primary">
              {book.title}
            </h4>
            <p className="mt-1 line-clamp-2 min-h-[2.25rem] text-xs text-muted-foreground">
              <span className="text-muted-foreground/80">{authorPrefix}</span>
              {book.author}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
