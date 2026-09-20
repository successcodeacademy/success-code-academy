import type { Metadata } from "next";
import "../live-editor.css";
import "../admin/admin.css";
import "../public.css";
import "./home/home.css";
import "./about/about.css";
import "./courses/courses.css";
import "./courses/course-detail.css";
import "./results/results.css";
import "./contact/contact.css";
import "./admissions/admissions.css";
import "./faq/faq.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthPromptModal from "@/components/layout/AuthPromptModal";
import WhatsAppWidget from "@/components/layout/WhatsAppWidget";
import CookieConsent from "@/components/layout/CookieConsent";
import { ToastProvider } from "@/components/admin/Toast";
import { EditModeProvider } from "@/components/admin/EditModeContext";
import LeadsDrawer from "@/components/admin/LeadsDrawer";
import { LiveContentProvider } from "@/components/admin/LiveContentContext";
import { LiveEditorToolbar } from "@/components/admin/LiveEditorToolbar";


export const metadata: Metadata = {
  title: "Best NEET Coaching in Maharashtra | Success Code Academy",
  description:
    "Maharashtra's premier medical entrance coaching institute in Baramati. Specializing exclusively in NEET and AIIMS preparation with elite foundation and repeater batches.",
  keywords: [
    "best NEET coaching in Maharashtra",
    "top NEET institute in India",
    "premier medical entrance coaching",
    "best AIIMS preparation classes",
    "top medical coaching institutes in Maharashtra",
    "Aakash institute alternative Maharashtra",
    "IIB alternative Baramati",
    "Allen offline alternative",
    "NEET repeater batch experts",
    "Success Code Academy Baramati"
  ].join(", "),
  openGraph: {
    title: "Best NEET Coaching in Maharashtra | Success Code Academy",
    description:
      "Compete at the highest level. Join Maharashtra's premier institute dedicated exclusively to NEET and medical entrance preparation.",
    url: "https://www.successcodeacademy.in",
    siteName: "Success Code Academy",
    type: "website",
    locale: "en_IN",
  },
  alternates: {
    canonical: "https://www.successcodeacademy.in",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ToastProvider>
      <EditModeProvider>
        <LiveContentProvider>
          <div className="public-shell">
          <Header />
          <main className="site-main">{children}</main>
          <Footer />
          <WhatsAppWidget />
          <CookieConsent />
          <LeadsDrawer />
          <LiveEditorToolbar />
          <AuthPromptModal />
          </div>
        </LiveContentProvider>
      </EditModeProvider>
    </ToastProvider>
  );
}
