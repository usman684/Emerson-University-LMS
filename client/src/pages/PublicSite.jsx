import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowRight, BookOpen, Building2, CalendarDays, CheckCircle2, ChevronDown, Clock3,
  GraduationCap, Landmark, Library, Mail, MapPin, Menu, Phone, Search, ShieldCheck,
  Sparkles, Users, X
} from "lucide-react";
import { useGetPublicAnnouncementsQuery, useGetPublicSectionsQuery } from "./../features/cms/cmsApiSlice";

const programs = [
  ["BS Computer Science", "4 Years", "Faculty of Computing & Emerging Technologies"],
  ["BS Information Technology", "4 Years", "Faculty of Computing & Emerging Technologies"],
  ["BS Artificial Intelligence", "4 Years", "Faculty of Computing & Emerging Technologies"],
  ["BS English", "4 Years", "Faculty of Arts, Humanities & Social Sciences"],
  ["BS Accounting & Finance", "4 Years", "Faculty of Management Sciences"],
  ["BS Biotechnology", "4 Years", "Faculty of Sciences"],
  ["M.Phil / MS", "2 Years", "Postgraduate Programs"],
  ["Ph.D. Programs", "Varies", "Research & advanced study"],
];

const feeRows = [
  ["BS Morning — Computing", "34,000", "2,500", "7,000", "43,525"],
  ["BS Morning — English", "25,000", "2,500", "6,000", "33,525"],
  ["BS Morning — Management", "30,000", "2,500", "6,500", "39,025"],
  ["BS Evening — Computing", "41,000", "2,500", "7,000", "50,525"],
  ["MBA / MPA", "43,000", "4,000", "6,500", "53,525"],
  ["MS / M.Phil", "47,500", "4,000", "6,000", "57,525"],
  ["Ph.D.", "64,000", "6,000", "20,000", "90,525"],
];

const defaultFaqs = [
  ["What is Emerson University LMS?", "A single digital campus for courses, attendance, assignments, grades, fees, library, hostel, transport, forums and university communication."],
  ["How do I apply for admission?", "Use the Admissions page for program information and then continue to the university's official admission process."],
  ["Can I pay my fee online?", "Yes. The LMS demo supports JazzCash, Easypaisa, UPaisa, major banks, cards and by-hand cash payment recording."],
  ["Who can access the LMS?", "Students, teachers, registrars and administrators receive role-based access to their relevant modules."],
  ["Can students view their fee history?", "Yes. Students can view issued challans, status, amount, due date and recorded payment method."],
  ["How can I contact the university?", "Visit the Contact page for the official Emerson University Multan phone, email and address."],
];

const nav = [
  ["Home", "/"], ["About", "/about"], ["Programs", "/programs"], ["Admissions", "/admissions"],
  ["Fee Structure", "/fee-structure"], ["Contact", "/contact"], ["FAQs", "/faqs"],
];

const OFFICIAL_EUM = "https://eum.edu.pk/";
const LOCAL_LOGO = "/assets/eum-logo.jpg";
const LOCAL_CAMPUS = "/assets/eum-campus.jpg";

function EumLogo({ className = "h-11 w-11" }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span className={`${className} flex shrink-0 items-center justify-center rounded-xl bg-[#0b2b62] text-sm font-black text-white shadow-lg`}>EU</span>
  ) : (
    <span className={`${className} flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-slate-200`}>
      <img src={LOCAL_LOGO} alt="Emerson University Multan logo" className="h-full w-full object-contain p-1" onError={() => setFailed(true)} />
    </span>
  );
}

function usePublicContent() {
  const { data } = useGetPublicSectionsQuery();
  const { data: announcementData } = useGetPublicAnnouncementsQuery();
  const sections = data?.data?.sections || [];
  const byKey = Object.fromEntries(sections.map((s) => [s.key, s]));
  return { byKey, announcementData };
}

function Shell({ children }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="bg-[#071a3a] px-4 py-2 text-center text-xs font-medium text-slate-200">
        Emerson University Multan • Since 1920 • A symbol of excellence, innovation and integrity
      </div>
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4">
          <Link to="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
            <EumLogo className="h-12 w-12" />
            <span className="min-w-0"><span className="block truncate text-sm font-extrabold uppercase tracking-wide text-[#0b2b62]">Emerson University</span><span className="block text-xs font-medium text-slate-500">Multan • Digital Campus</span></span>
          </Link>
          <nav className="hidden items-center gap-1 xl:flex">
            {nav.map(([label, href]) => <Link key={href} to={href} className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${location.pathname === href ? "bg-[#edf3fb] text-[#0b2b62]" : "text-slate-600 hover:bg-slate-100 hover:text-[#0b2b62]"}`}>{label}</Link>)}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-bold text-[#0b2b62] hover:bg-slate-100">Login</Link>
            <Link to="/register" className="rounded-lg bg-[#0b2b62] px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-[#123d82]">Register</Link>
          </div>
          <button className="rounded-lg p-2 xl:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
        </div>
        {open && <div className="border-t border-slate-200 bg-white px-5 py-4 xl:hidden"><div className="mx-auto flex max-w-7xl flex-col gap-1">{nav.map(([label, href]) => <Link onClick={() => setOpen(false)} key={href} to={href} className="rounded-lg px-3 py-3 font-semibold hover:bg-slate-100">{label}</Link>)}<div className="mt-2 flex gap-2 border-t pt-3"><Link onClick={() => setOpen(false)} to="/login" className="flex-1 rounded-lg border px-4 py-2 text-center font-semibold">Login</Link><Link onClick={() => setOpen(false)} to="/register" className="flex-1 rounded-lg bg-[#0b2b62] px-4 py-2 text-center font-semibold text-white">Register</Link></div></div></div>}
      </header>
      {children}
      <footer className="bg-[#071a3a] text-slate-200">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-4">
          <div className="md:col-span-2"><div className="flex items-center gap-3"><EumLogo className="h-11 w-11" /><div><p className="font-extrabold">Emerson University Multan</p><p className="text-xs text-slate-400">Since 1920</p></div></div><p className="mt-5 max-w-xl text-sm leading-7 text-slate-400">A modern digital campus experience inspired by the university's heritage, academic breadth and commitment to excellence in Southern Punjab.</p></div>
          <div><p className="font-bold text-white">Explore</p><div className="mt-4 grid gap-2 text-sm text-slate-400">{nav.slice(0, 5).map(([label, href]) => <Link key={href} to={href} className="hover:text-white">{label}</Link>)}</div></div>
          <div><p className="font-bold text-white">Contact</p><div className="mt-4 space-y-3 text-sm text-slate-400"><p className="flex gap-2"><Phone size={16} /> +92 61 9210037</p><p className="flex gap-2"><Mail size={16} /> info@eum.edu.pk</p><p className="flex gap-2"><MapPin size={16} /> Emerson University Road, Multan 60000</p></div></div><div className="mt-5"><a href={OFFICIAL_EUM} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-white hover:bg-white/10">Official EUM Website <ArrowRight size={14} /></a></div>
        </div>
        <div className="border-t border-white/10"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-slate-500 md:flex-row md:items-center md:justify-between"><span>© {new Date().getFullYear()} Emerson University Multan. All rights reserved.</span><span>Digital Campus • LMS</span></div></div>
      </footer>
    </div>
  );
}

function SectionHeading({ eyebrow, title, text, light = false }) { return <div className="mx-auto max-w-3xl text-center"><p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#b07b16]">{eyebrow}</p><h2 className={`mt-3 text-3xl font-black tracking-tight md:text-4xl ${light ? "text-white" : "text-[#0b2b62]"}`}>{title}</h2>{text && <p className={`mt-4 text-base leading-7 ${light ? "text-slate-300" : "text-slate-600"}`}>{text}</p>}</div>; }

function HomePage() {
  const { byKey, announcementData } = usePublicContent();
  const announcements = announcementData?.data?.announcements || [];
  const [faqOpen, setFaqOpen] = useState(0);
  const [heroImage, setHeroImage] = useState(byKey.hero?.imageUrl || LOCAL_CAMPUS);
  useEffect(() => { setHeroImage(byKey.hero?.imageUrl || LOCAL_CAMPUS); }, [byKey.hero?.imageUrl]);
  const faqs = defaultFaqs.map((fallback, i) => [byKey[`faq_${i + 1}`]?.heading || fallback[0], byKey[`faq_${i + 1}`]?.body || fallback[1]]);
  const hero = byKey.hero;
  const about = byKey.about;

  return <Shell>
    <main>
      <section className="relative isolate overflow-hidden bg-[#061a3a] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_12%,rgba(56,129,230,.34),transparent_32%),radial-gradient(circle_at_12%_88%,rgba(194,138,34,.18),transparent_28%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:py-20 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:py-24">
          <div className="min-w-0">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-extrabold tracking-[.12em] text-slate-100 backdrop-blur">
              <Sparkles size={14} className="shrink-0 text-amber-300" /> EMERSON UNIVERSITY • MULTAN
            </div>
            <h1 className="mt-6 max-w-3xl break-words text-4xl font-black leading-[1.03] tracking-tight sm:text-5xl md:text-6xl lg:text-[4.25rem]">
              {hero?.heading || "Learn. Lead. Innovate."}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
              {hero?.body || "A premium digital campus for learning, academic management and university life — bringing students, faculty and administration together."}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/admissions" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#c28a22] px-5 py-3.5 font-extrabold text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#d39b30]">
                Explore Admissions <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-5 py-3.5 font-extrabold backdrop-blur transition hover:bg-white/10">
                Open Digital Campus
              </Link>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3 border-t border-white/10 pt-6 sm:gap-6">
              <div><p className="text-2xl font-black sm:text-3xl">1920</p><p className="mt-1 text-[11px] text-slate-400 sm:text-xs">Heritage</p></div>
              <div><p className="text-2xl font-black sm:text-3xl">153+</p><p className="mt-1 text-[11px] text-slate-400 sm:text-xs">Degrees & certificates</p></div>
              <div><p className="text-2xl font-black sm:text-3xl">8,300+</p><p className="mt-1 text-[11px] text-slate-400 sm:text-xs">Students enrolled</p></div>
            </div>
          </div>

          <div className="relative min-w-0">
            <div className="overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-2 shadow-2xl shadow-black/30 backdrop-blur sm:p-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-[#0b2b62]">
                <img
                  src={heroImage}
                  alt="Emerson University Multan campus"
                  className="h-full w-full object-cover transition duration-700 hover:scale-[1.02]"
                  onError={() => setHeroImage(LOCAL_CAMPUS)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#061a3a]/90 via-[#061a3a]/10 to-transparent" />
                <div className="absolute left-4 right-4 top-4 flex items-center justify-between sm:left-6 sm:right-6 sm:top-6">
                  <span className="rounded-lg bg-white/15 px-3 py-2 text-[10px] font-extrabold tracking-wide backdrop-blur">DIGITAL CAMPUS</span>
                  <span className="rounded-full bg-black/20 p-2 backdrop-blur"><GraduationCap size={20} /></span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
                  <p className="text-xs font-semibold text-blue-100">One platform</p>
                  <p className="mt-1 text-2xl font-black sm:text-3xl">Study, manage & connect</p>
                  <p className="mt-2 text-xs leading-5 text-slate-200 sm:text-sm">Courses • Fees • Library • Hostel • Transport • Forums</p>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                ["Excellence", "Academic quality"],
                ["Integrity", "Trust & service"],
                ["Innovation", "Future-ready learning"],
              ].map(([title, desc]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/10 p-3 text-white backdrop-blur sm:p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-blue-100">{title}</p>
                  <p className="mt-1 text-[10px] leading-4 text-slate-300 sm:text-xs">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHeading eyebrow="Why Emerson Digital Campus" title="Everything your university day needs" text="A polished, role-based experience for students, faculty, registrars and administration." />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[[GraduationCap,"Academic life","Courses, attendance, assignments and grades"],[Landmark,"Financial services","Fee challans, payment records and receipts"],[Library,"Student services","Library, hostel and transport"],[Users,"Community","Forums, announcements, events and calendar"]].map(([Icon,t,d]) => (
              <div key={t} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf3fb] text-[#0b2b62]"><Icon size={22} /></div>
                <h3 className="mt-5 font-extrabold text-[#0b2b62]">{t}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionHeading eyebrow="Our heritage" title={about?.heading || "A century of academic tradition"} text={about?.body || "Emerson University Multan traces its institutional history to 1920 and today serves Southern Punjab through programs spanning computing, sciences, management, arts and social sciences."} />
              <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
                <Link to="/about" className="inline-flex items-center gap-2 rounded-xl bg-[#0b2b62] px-5 py-3 font-bold text-white">Read About EUM <ArrowRight size={17} /></Link>
                <Link to="/programs" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-[#0b2b62]">Explore Programs</Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl bg-[#0b2b62] p-6 text-white sm:p-7"><Clock3 /><p className="mt-10 text-3xl font-black">100+</p><p className="mt-1 text-sm text-blue-200">Years of heritage</p></div>
              <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:mt-10 sm:p-7"><BookOpen className="text-[#b07b16]" /><p className="mt-10 text-3xl font-black text-[#0b2b62]">ADP → PhD</p><p className="mt-1 text-sm text-slate-500">Academic pathways</p></div>
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-7"><ShieldCheck className="text-[#b07b16]" /><p className="mt-10 text-3xl font-black text-[#0b2b62]">57+</p><p className="mt-1 text-sm text-slate-500">BS disciplines</p></div>
              <div className="mt-6 rounded-3xl bg-[#c28a22] p-6 text-white sm:mt-10 sm:p-7"><Users /><p className="mt-10 text-3xl font-black">7,000+</p><p className="mt-1 text-sm text-white/80">Students served</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHeading eyebrow="Featured programs" title="Explore academic pathways" text="Representative pathways across computing, sciences, management and humanities." />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {programs.map(([name,duration,faculty]) => (
              <div key={name} className="rounded-2xl border border-slate-200 p-5 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
                <div className="flex items-center justify-between"><span className="rounded-full bg-[#edf3fb] px-3 py-1 text-[11px] font-bold text-[#0b2b62]">{duration}</span><GraduationCap size={18} className="text-slate-400" /></div>
                <h3 className="mt-5 font-extrabold text-[#0b2b62]">{name}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{faculty}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center"><Link to="/programs" className="font-bold text-[#0b2b62] hover:underline">View all program information →</Link></div>
        </div>
      </section>

      {announcements.length > 0 && <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-5"><SectionHeading eyebrow="University news" title="Latest announcements" />
          <div className="mt-10 grid gap-5 md:grid-cols-3">{announcements.slice(0,3).map((a) => <article key={a._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="h-1 bg-[#c28a22]" /><div className="p-6"><p className="text-xs font-bold text-[#b07b16]">{new Date(a.publishedAt).toLocaleDateString()}</p><h3 className="mt-3 text-lg font-black text-[#0b2b62]">{a.title}</h3><p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">{a.content}</p></div></article>)}</div>
        </div>
      </section>}

      <section className="bg-[#071a3a] py-16 text-white sm:py-20">
        <div className="mx-auto max-w-4xl px-5"><SectionHeading eyebrow="Questions" title="Frequently asked questions" text="Quick answers for students and prospective applicants." light />
          <div className="mt-10 space-y-3">{faqs.map(([q,a],i) => <div key={q} className="rounded-2xl border border-white/10 bg-white/5"><button onClick={() => setFaqOpen(faqOpen===i?-1:i)} className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-sm font-bold sm:text-base">{q}<ChevronDown size={19} className={`shrink-0 transition ${faqOpen===i ? "rotate-180" : ""}`} /></button>{faqOpen===i && <div className="px-5 pb-5 text-sm leading-7 text-slate-300">{a}</div>}</div>)}</div>
          <div className="mt-8 text-center"><Link to="/faqs" className="text-sm font-bold text-blue-200 hover:text-white">View all FAQs →</Link></div>
        </div>
      </section>
    </main>
  </Shell>;
}

function AboutPage(){const {byKey}=usePublicContent(); return <Shell><main><div className="bg-[#071a3a] px-5 py-16 text-white"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-amber-300">About Emerson University</p><h1 className="mt-3 text-4xl font-black md:text-5xl">A century of learning, growth and service.</h1></div></div><section className="mx-auto max-w-5xl px-5 py-16"><h2 className="text-3xl font-black text-[#0b2b62]">{byKey.about?.heading || "About EUM"}</h2><p className="mt-6 whitespace-pre-line text-lg leading-8 text-slate-600">{byKey.about?.body || "Emerson University Multan was established as Govt. College Multan in 1920 and was reconstituted as Emerson University in 2021. It serves the educational needs of Southern Punjab with programs across arts, humanities, social sciences, natural sciences, management and computing."}</p><div className="mt-10 grid gap-5 md:grid-cols-3">{[["1920","Institutional roots"],["2021","University status"],["Southern Punjab","Regional impact"]].map(([n,l])=><div key={l} className="rounded-2xl border bg-white p-6 shadow-sm"><p className="text-3xl font-black text-[#0b2b62]">{n}</p><p className="mt-2 text-sm text-slate-500">{l}</p></div>)}</div></section></main></Shell>}
function ProgramsPage(){return <Shell><main><div className="bg-[#071a3a] px-5 py-16 text-white"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-amber-300">Academic Programs</p><h1 className="mt-3 text-4xl font-black">Programs built for tomorrow.</h1><p className="mt-4 max-w-2xl text-slate-300">Explore representative programs from the university's computing, sciences, management and humanities pathways.</p></div></div><section className="mx-auto max-w-7xl px-5 py-16"><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">{programs.map(([n,d,f])=><article key={n} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><span className="text-xs font-bold text-[#b07b16]">{d}</span><h2 className="mt-3 text-xl font-black text-[#0b2b62]">{n}</h2><p className="mt-3 text-sm leading-6 text-slate-500">{f}</p></article>)}</div></section></main></Shell>}
function AdmissionsPage(){return <Shell><main><div className="bg-[#071a3a] px-5 py-16 text-white"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-amber-300">Admissions</p><h1 className="mt-3 text-4xl font-black">Start your next chapter.</h1><p className="mt-4 max-w-2xl text-slate-300">For current admission announcements, eligibility criteria, merit information and fee structure, use the university's official admissions resources.</p></div></div><section className="mx-auto max-w-7xl px-5 py-16"><div className="grid gap-5 md:grid-cols-3">{[[CalendarDays,"Admissions Open","Check the latest admission announcement and deadlines."],[CheckCircle2,"Eligibility","Review program-specific and general eligibility criteria."],[Search,"Merit & Selection","Understand merit calculation and selection requirements."]].map(([I,t,d])=><div key={t} className="rounded-2xl border bg-white p-7 shadow-sm"><I className="text-[#0b2b62]"/><h2 className="mt-5 text-xl font-black text-[#0b2b62]">{t}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{d}</p></div>)}</div><div className="mt-8 rounded-2xl bg-[#edf3fb] p-7"><p className="font-bold text-[#0b2b62]">Need the official admission portal?</p><p className="mt-2 text-sm text-slate-600">The LMS provides the university information layer; actual admission submission can be connected to the official admissions portal when deployed.</p></div></section></main></Shell>}
function FeeStructurePage(){return <Shell><main><div className="bg-[#071a3a] px-5 py-16 text-white"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-amber-300">Fee Structure</p><h1 className="mt-3 text-4xl font-black">2026–2027 indicative fee guide.</h1><p className="mt-4 max-w-2xl text-slate-300">Displayed figures are based on the current public fee structure reference and should be confirmed with the university before payment.</p></div></div><section className="mx-auto max-w-7xl overflow-x-auto px-5 py-16"><table className="w-full min-w-[760px] overflow-hidden rounded-2xl bg-white text-left shadow-sm"><thead className="bg-[#0b2b62] text-sm text-white"><tr><th className="p-4">Program group</th><th className="p-4">Tuition</th><th className="p-4">Exam</th><th className="p-4">Other</th><th className="p-4">Total</th></tr></thead><tbody>{feeRows.map((r)=><tr key={r[0]} className="border-b border-slate-100 text-sm"><td className="p-4 font-bold text-[#0b2b62]">{r[0]}</td>{r.slice(1).map((v,i)=><td key={i} className="p-4 text-slate-600">Rs. {v}</td>)}</tr>)}</tbody></table><p className="mt-5 text-xs text-slate-500">Admission, registration and verification fees may be charged separately as specified by the university.</p></section></main></Shell>}
function ContactPage(){const {byKey}=usePublicContent(); return <Shell><main><div className="bg-[#071a3a] px-5 py-16 text-white"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-amber-300">Contact</p><h1 className="mt-3 text-4xl font-black">We are here to help.</h1></div></div><section className="mx-auto grid max-w-7xl gap-6 px-5 py-16 md:grid-cols-3"><div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-slate-200"><Phone className="text-[#0b2b62]"/><h2 className="mt-5 font-black text-[#0b2b62]">Phone</h2><p className="mt-2 text-sm text-slate-600">{byKey.contact?.body?.match(/\+?92[^\n]*/)?.[0] || "+92 61 9210037"}</p></div><div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-slate-200"><Mail className="text-[#0b2b62]"/><h2 className="mt-5 font-black text-[#0b2b62]">Email</h2><p className="mt-2 text-sm text-slate-600">info@eum.edu.pk</p></div><div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-slate-200"><MapPin className="text-[#0b2b62]"/><h2 className="mt-5 font-black text-[#0b2b62]">Address</h2><p className="mt-2 text-sm leading-6 text-slate-600">Emerson University Road, Multan, Punjab 60000</p></div></section></main></Shell>}
function FaqPage(){const {byKey}=usePublicContent(); const [open,setOpen]=useState(0); const faqs=defaultFaqs.map((f,i)=>[byKey[`faq_${i+1}`]?.heading||f[0],byKey[`faq_${i+1}`]?.body||f[1]]); return <Shell><main><div className="bg-[#071a3a] px-5 py-16 text-white"><div className="mx-auto max-w-4xl text-center"><p className="text-xs font-bold uppercase tracking-[.2em] text-amber-300">FAQs</p><h1 className="mt-3 text-4xl font-black">Frequently asked questions.</h1></div></div><section className="mx-auto max-w-4xl px-5 py-16">{faqs.map(([q,a],i)=><div key={q} className="mb-3 rounded-2xl border bg-white"><button onClick={()=>setOpen(open===i?-1:i)} className="flex w-full items-center justify-between p-5 text-left font-bold text-[#0b2b62]">{q}<ChevronDown className={open===i?"rotate-180":""}/></button>{open===i&&<p className="px-5 pb-5 text-sm leading-7 text-slate-600">{a}</p>}</div>)}</section></main></Shell>}

export { HomePage, AboutPage, ProgramsPage, AdmissionsPage, FeeStructurePage, ContactPage, FaqPage };
