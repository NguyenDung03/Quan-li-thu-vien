import { useTranslation } from "react-i18next";
import { Book, ArrowLeft, Info } from "lucide-react";
import { Link } from "react-router-dom";

export function RegisterInfoPage() {
  const { t } = useTranslation("pages");

  return (
    <div className="min-h-screen flex items-center justify-center px-8 py-[162px] bg-background">
      <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] max-w-[1024px] w-full overflow-hidden">
        <div className="flex">
          <div className="bg-[#ccfdd9] flex-1 p-12 flex flex-col justify-between min-h-[600px] relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
              <div className="bg-[#00b760] blur-[32px] w-full h-full rounded-[9999px]" />
            </div>

            <div className="relative">
              <div className="flex items-center gap-3 mb-[80px]">
                <div className="bg-[#00b760] w-12 h-12 rounded-xl flex items-center justify-center shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]">
                  <Book className="w-6 h-6 text-white" />
                </div>
                <span className="font-black text-[#001f03] text-2xl tracking-[-0.6px]">
                  EduLib
                </span>
              </div>

              <div className="mb-[194px]">
                <h1 className="font-black text-[#001f03] text-[36px] leading-[45px] mb-0">
                  {t("authShared.headline1")}
                </h1>
                <h1 className="font-black text-[#001f03] text-[36px] leading-[45px]">
                  {t("authShared.headline2")}
                </h1>
              </div>

              <div className="max-w-[320px] opacity-90">
                <p className="font-medium text-[#002e05] text-lg leading-7 mb-0">
                  {t("authShared.desc1")}
                </p>
                <p className="font-medium text-[#002e05] text-lg leading-7 mb-0">
                  {t("authShared.desc2")}
                </p>
                <p className="font-medium text-[#002e05] text-lg leading-7">
                  {t("authShared.desc3")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-16 flex flex-col justify-center">
            <div className="pb-8 flex justify-center">
              <div className="w-16 h-16 bg-[#e6f4fe] rounded-full flex items-center justify-center">
                <Info className="w-8 h-8 text-[#00b760]" />
              </div>
            </div>
            <h2 className="font-black text-[#001321] text-[30px] leading-9 mb-2 text-center">
              {t("authRegister.title")}
            </h2>
            <p className="font-medium text-[#3e5667] text-base leading-6 mb-8 text-center">
              {t("authRegister.subtitle")}
            </p>
            <Link
              to="/login"
              className="w-full h-[52px] bg-[#00b760] hover:bg-[#00a654] text-white font-bold rounded-xl shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t("authRegister.backLogin")}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
