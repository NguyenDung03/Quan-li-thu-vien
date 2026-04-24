import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation, Trans } from "react-i18next";
import {
  Book,
  Bookmark,
  Star,
  TrendingUp,
  Flag,
  User,
  ChevronRight,
  PenLine,
  Mail,
  Phone,
  MapPinned,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { useReaderByUserId, useUpdateReader } from "@/hooks/useReader";
import { AUTH_KEYS } from "@/constants/auth";
import { readerDateLocale } from "@/lib/reader-locale";
import { profileMockBooks } from "@/features/profile/mock-books";
import type {
  ProfileEditFormData,
  ProfilePageUser,
} from "@/features/profile/types";

const premiumEasing = [0.32, 0.72, 0, 1] as const;

const containerVariants = {
  initial: {},
  animate: {
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  initial: { y: 24, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.7,
      ease: premiumEasing,
    },
  },
};

export function ProfilePage() {
  const { t } = useTranslation("pages");
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [user, setUser] = useState<ProfilePageUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { readerByUserId: reader } = useReaderByUserId(authUser?.id || "");
  const { updateReaderAsync, updateReaderLoading } = useUpdateReader();

  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState<ProfileEditFormData>({
    fullName: "",
    dob: "",
    gender: "male",
    address: "",
    phone: "",
  });

  
  useEffect(() => {
    if (!authLoading) {
      if (authUser) {
        
        setUser({
          id: authUser.id,
          username: authUser.username,
          email: authUser.email,
          role: authUser.role,
          accountStatus: "active",
          lastLogin: authUser.lastLogin,
          createdAt: authUser.createdAt ?? "",
          updatedAt: authUser.updatedAt ?? "",
        });
      } else {
        
        setUser({
          id: "uuid-1",
          username: "alex_johnson",
          email: "alex.johnson@school.edu",
          role: "reader",
          accountStatus: "active",
          lastLogin: "2026-03-20T10:30:00Z",
          createdAt: "2025-09-01T00:00:00Z",
          updatedAt: "2026-03-15T14:22:00Z",
        });
      }
      setIsLoading(false);
    }
  }, [authUser, authLoading]);

  
  useEffect(() => {
    if (reader) {
      
      setFormData({
        fullName: reader.fullName || "",
        dob: reader.dob ? reader.dob.split("T")[0] : "",
        gender: reader.gender || "male",
        address: reader.address || "",
        phone: reader.phone || "",
      });
    }
  }, [reader]);

  const handleOpenEdit = () => {
    
    const readerData = reader || (() => {
      const stored = localStorage.getItem(AUTH_KEYS.READER);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
      return null;
    })();

    
    if (readerData) {
      setFormData({
        fullName: readerData.fullName || "",
        dob: readerData.dob ? readerData.dob.split("T")[0] : "",
        gender: readerData.gender || "male",
        address: readerData.address || "",
        phone: readerData.phone || "",
      });
    }
    setIsEditOpen(true);
  };

  const handleFormChange = (field: keyof ProfileEditFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    
    const readerId = reader?.id || (() => {
      const stored = localStorage.getItem(AUTH_KEYS.READER);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return parsed.id;
        } catch {
          return null;
        }
      }
      return null;
    })();

    console.log(
      "[Profile] handleSaveEdit called, readerId:",
      readerId,
      "formData:",
      formData,
    );

    if (!readerId) {
      console.error("[Profile] readerId is missing!");
      toast.error(t("profile.toastReaderMissing"), {
        style: {
          background: "#ef4444",
          color: "#fff",
          border: "none",
        },
      });
      return;
    }

    try {
      console.log("[Profile] Calling updateReaderAsync with id:", readerId);
      const result = await updateReaderAsync({
        id: readerId,
        data: {
          fullName: formData.fullName,
          dob: formData.dob,
          gender: formData.gender as "male" | "female" | "other",
          address: formData.address,
          phone: formData.phone,
        },
      });
      console.log("[Profile] Update result:", result);

      toast.success(t("profile.toastOk"), {
        style: {
          background: "#18AD5B",
          color: "#fff",
          border: "none",
        },
      });
      setIsEditOpen(false);
    } catch (error) {
      console.error("[Profile] Update error:", error);
      toast.error(t("profile.toastFail"), {
        style: {
          background: "#ef4444",
          color: "#fff",
          border: "none",
        },
      });
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return t("profile.statusActive");
      case "inactive":
        return t("profile.statusInactive");
      case "suspended":
        return t("profile.statusSuspended");
      default:
        return status;
    }
  };

  
  const stats = {
    booksRead: 12,
    booksReadGrowth: 20,
    readingGoal: 20,
    annualProgress: 60,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-[#18AD5B]/20"></div>
          <p className="text-slate-500">{t("profile.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="max-w-[1200px] mx-auto space-y-12"
      >
        
        <motion.section
          variants={itemVariants}
          className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          <div className="flex flex-col sm:flex-row items-center gap-8">
            
            <div className="relative">
              <div className="w-32 h-32 rounded-[2rem] p-1 bg-gradient-to-br from-[#18AD5B]/20 to-[#46C37B]/20">
                <Avatar className="h-full w-full border-4 border-white shadow-lg">
                  <AvatarImage src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwqccXYbKOT424rSeZ9DaLSUKzBfCRxcQu-vMFc3oiI1m9Ft9n6mciefU20yiSkUhrKjapF-lp_KmYXTbr1MaQuo4ZcummwN8s8YO0U-8J_85pWVPfynhsRWCiRdcADW-yljvVJmbWPBo4J6LrxTeOTZzL4dRzKOKx_vWeplf6cnrXtPglLHcQI0FLkXUHOwmNWNQLMRS-YkLZrA3mIuQMmvgpU7vrHbZNHWahQDGgVa0Xv-wimOJzyJEVpGZgSRP5B0Uutf4SSWYs" />
                  <AvatarFallback className="text-2xl bg-[#18AD5B]/20 text-[#18AD5B] font-bold">
                    {user?.username?.slice(0, 2).toUpperCase() || "US"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-3 border-white"></div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  {reader?.fullName || user?.username || t("profile.userFallback")}
                </h1>
                <span className="px-4 py-1.5 bg-[#18AD5B]/10 text-[#18AD5B] text-xs font-bold rounded-full w-fit">
                  {user?.accountStatus
                    ? getStatusLabel(user.accountStatus)
                    : t("profile.studying")}
                </span>
              </div>

              
              <div className="flex flex-wrap justify-center sm:justify-start gap-y-2 gap-x-4 text-slate-500 text-sm">
                {reader?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 opacity-60" strokeWidth={2} />
                    <span className="font-medium">{reader.phone}</span>
                  </div>
                )}
                {user?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 opacity-60" strokeWidth={2} />
                    <span className="font-medium">{user.email}</span>
                  </div>
                )}
                {reader?.address && (
                  <div className="flex items-center gap-2">
                    <MapPinned className="w-4 h-4 opacity-60" strokeWidth={2} />
                    <span className="font-medium">{reader.address}</span>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleOpenEdit}
              variant="outline"
              className="px-8 py-3 rounded-2xl font-bold border-slate-100 hover:border-[#18AD5B] hover:text-[#18AD5B] hover:bg-[#18AD5B]/5 transition-all duration-300"
            >
              <PenLine className="w-4 h-4 mr-2" strokeWidth={2.5} />
              {t("profile.editProfile")}
            </Button>
          </div>
        </motion.section>

        
        <motion.section variants={itemVariants}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-white rounded-[2rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#18AD5B]/10 rounded-2xl flex items-center justify-center shrink-0">
                  <CalendarDays
                    className="w-5 h-5 text-[#18AD5B]"
                    strokeWidth={2}
                  />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">
                    {t("profile.dob")}
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {reader?.dob
                      ? new Date(reader.dob).toLocaleDateString(
                          readerDateLocale(),
                        )
                      : "—"}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-white rounded-[2rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#18AD5B]/10 rounded-2xl flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-[#18AD5B]" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">
                    {t("profile.gender")}
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {reader?.gender === "male"
                      ? t("profile.male")
                      : reader?.gender === "female"
                        ? t("profile.female")
                        : t("profile.other")}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-white rounded-[2rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#18AD5B]/10 rounded-2xl flex items-center justify-center shrink-0">
                  <ShieldCheck
                    className="w-5 h-5 text-[#18AD5B]"
                    strokeWidth={2}
                  />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">
                    {t("profile.cardNumber")}
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {reader?.cardNumber || "—"}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </motion.section>

        
        <motion.section
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-500 text-sm font-medium">
                {t("profile.booksRead")}
              </p>
              <div className="w-10 h-10 bg-[#18AD5B]/10 rounded-2xl flex items-center justify-center">
                <Book className="w-5 h-5 text-[#18AD5B]" strokeWidth={2} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-slate-900">
                {stats.booksRead}
              </p>
              <p className="text-[#18AD5B] text-sm font-bold flex items-center">
                <TrendingUp size={14} className="mr-1" strokeWidth={2.5} />
                {stats.booksReadGrowth}%
              </p>
            </div>
            <p className="text-xs text-slate-400 mt-2">{t("profile.vsPrev")}</p>
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-500 text-sm font-medium">
                {t("profile.readingGoal")}
              </p>
              <div className="w-10 h-10 bg-[#18AD5B]/10 rounded-2xl flex items-center justify-center">
                <Flag className="w-5 h-5 text-[#18AD5B]" strokeWidth={2} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-slate-900">
                {stats.readingGoal}
              </p>
              <p className="text-slate-400 text-sm font-medium">
                {t("profile.booksUnit")}
              </p>
            </div>
            <p className="text-xs text-slate-400 mt-2">{t("profile.goalYear")}</p>
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex justify-between items-center mb-3">
              <p className="text-slate-900 text-sm font-bold">
                {t("profile.annualProgress")}
              </p>
              <p className="text-[#18AD5B] text-sm font-black">
                {stats.annualProgress}%
              </p>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#18AD5B] to-[#46C37B] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${stats.annualProgress}%` }}
                transition={{ duration: 1, ease: premiumEasing, delay: 0.3 }}
              />
            </div>
            <p className="text-xs text-slate-500 leading-tight mt-3">
              <Trans
                ns="pages"
                i18nKey="profile.progressEncourage"
                components={{ strong: <strong className="text-slate-900" /> }}
              />
            </p>
          </div>
        </motion.section>

        
        <motion.section variants={itemVariants} className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#18AD5B]">
                {t("profile.forYou")}
              </span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                {t("profile.suggestions")}
              </h3>
            </div>
            <a
              className="text-[#18AD5B] text-sm font-bold hover:underline flex items-center gap-1"
              href="#"
            >
              {t("profile.viewAll")}{" "}
              <ChevronRight size={16} strokeWidth={2.5} />
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {profileMockBooks.map((book) => (
              <motion.div
                key={book.id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden group cursor-pointer border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem]">
                  <div className="h-44 bg-slate-100 relative overflow-hidden">
                    <div
                      className="absolute inset-0 bg-center bg-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110"
                      style={{ backgroundImage: `url(${book.image})` }}
                    />
                    <span className="absolute top-3 left-3 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-[#18AD5B] rounded-full uppercase tracking-wider">
                      {book.category}
                    </span>
                  </div>
                  <CardContent className="p-5">
                    <h4 className="font-bold text-slate-900 mb-1 line-clamp-1">
                      {book.title}
                    </h4>
                    <p className="text-xs text-slate-500 mb-4">{book.level}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={
                              i < Math.floor(book.rating)
                                ? "currentColor"
                                : "none"
                            }
                            className={
                              i < Math.floor(book.rating)
                                ? ""
                                : "text-slate-300"
                            }
                            strokeWidth={2.5}
                          />
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-[#18AD5B] hover:bg-[#18AD5B]/5 rounded-full"
                      >
                        <Bookmark size={16} strokeWidth={2.5} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        
        <motion.section
          variants={itemVariants}
          className="bg-gradient-to-br from-slate-50 to-white rounded-[2rem] p-10 border border-slate-100"
        >
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#18AD5B]">
                {t("profile.futurePrep")}
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-2 mb-4">
                {t("profile.elevate")}
              </h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                {t("profile.elevateBody")}
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <TrendingUp
                    className="text-[#18AD5B]"
                    size={18}
                    strokeWidth={2}
                  />
                  <span className="text-sm font-medium">
                    {t("profile.scorePred")}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <Book className="text-[#18AD5B]" size={18} strokeWidth={2} />
                  <span className="text-sm font-medium">
                    {t("profile.deepGuide")}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <User className="text-[#18AD5B]" size={18} strokeWidth={2} />
                  <span className="text-sm font-medium">
                    {t("profile.advisor")}
                  </span>
                </div>
              </div>
            </div>
            <div className="w-full md:w-72">
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white p-6 rounded-[2rem] shadow-xl shadow-black/5 border border-slate-100 transition-all"
              >
                <p className="text-[10px] font-bold text-[#18AD5B] uppercase tracking-[0.15em] mb-2">
                  {t("profile.nextMilestone")}
                </p>
                <h4 className="text-lg font-black mb-4 text-slate-900">
                  {t("profile.satTitle")}
                </h4>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">
                    {t("profile.examDate")}
                  </span>
                  <span className="text-xs font-bold text-[#18AD5B]">
                    {t("profile.prep")}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full mb-4 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#18AD5B] to-[#46C37B] rounded-full w-3/4"></div>
                </div>
                <Button className="w-full bg-[#18AD5B] text-white text-sm font-bold rounded-2xl hover:bg-[#46C37B] active:scale-[0.98] transition-all">
                  {t("profile.continueStudy")}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </motion.div>

      
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md rounded-[1.5rem] p-6 shadow-2xl border-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              console.log("[Profile] Form submitted!");
              handleSaveEdit();
            }}
          >
            <DialogHeader className="mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#18AD5B]/10 rounded-2xl flex items-center justify-center">
                  <PenLine className="w-5 h-5 text-[#18AD5B]" strokeWidth={2} />
                </div>
                <DialogTitle className="text-lg font-bold text-slate-900">
                  {t("profile.dialogTitle")}
                </DialogTitle>
              </div>
              <p className="text-sm text-slate-500 mt-1 px-1">
                {t("profile.dialogSubtitle")}
              </p>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-2">
              
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="fullName"
                  className="text-sm font-semibold text-slate-700"
                >
                  {t("profile.fullName")}
                </Label>
                <Input
                  id="fullName"
                  placeholder={t("profile.fullNamePh")}
                  value={formData.fullName}
                  onChange={(e) => handleFormChange("fullName", e.target.value)}
                  className="rounded-xl h-10 border-[#18AD5B]/30 focus:border-[#18AD5B] focus:ring-[#18AD5B]/20"
                />
              </div>

              
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="dob"
                  className="text-sm font-semibold text-slate-700"
                >
                  {t("profile.dob")}
                </Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleFormChange("dob", e.target.value)}
                  className="rounded-xl h-10 border-[#18AD5B]/30 focus:border-[#18AD5B] focus:ring-[#18AD5B]/20"
                />
              </div>

              
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-semibold text-slate-700">
                  {t("profile.gender")}
                </Label>
                <div className="flex gap-3">
                  {[
                    { value: "male", label: t("profile.male") },
                    { value: "female", label: t("profile.female") },
                    { value: "other", label: t("profile.other") },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={option.value}
                        checked={formData.gender === option.value}
                        onChange={() =>
                          handleFormChange("gender", option.value)
                        }
                        className="accent-[#18AD5B] w-4 h-4"
                      />
                      <span className="text-sm text-slate-700">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="phone"
                  className="text-sm font-semibold text-slate-700"
                >
                  {t("profile.phone")}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t("profile.phonePh")}
                  value={formData.phone}
                  onChange={(e) => handleFormChange("phone", e.target.value)}
                  className="rounded-xl h-10 border-[#18AD5B]/30 focus:border-[#18AD5B] focus:ring-[#18AD5B]/20"
                />
              </div>

              
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="address"
                  className="text-sm font-semibold text-slate-700"
                >
                  {t("profile.address")}
                </Label>
                <Input
                  id="address"
                  placeholder={t("profile.addressPh")}
                  value={formData.address}
                  onChange={(e) => handleFormChange("address", e.target.value)}
                  className="rounded-xl h-10 border-[#18AD5B]/30 focus:border-[#18AD5B] focus:ring-[#18AD5B]/20"
                />
              </div>
            </div>

            <DialogFooter className="mt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="flex-1 rounded-xl h-10 font-semibold border-slate-100 hover:border-slate-100"
              >
                {t("profile.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={updateReaderLoading}
                className="flex-1 rounded-xl h-10 font-semibold bg-[#18AD5B] hover:bg-[#46C37B] text-white disabled:opacity-60"
              >
                {updateReaderLoading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    {t("profile.saving")}
                  </span>
                ) : (
                  t("profile.save")
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ProfilePage;
