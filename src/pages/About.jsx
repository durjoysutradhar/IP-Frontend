import { ArrowLeft, ArrowRight, BookOpen, Building2, Database, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const navItems = [
  { label: 'Home', href: '/landing#home' },
  { label: 'Services', href: '/landing#services' },
  { label: 'Resources', href: '/landing#resources' },
  { label: 'Notices', href: '/landing#notices' },
  { label: 'About', href: '/about' },
  { label: 'Login', href: '/login' }
];

const highlights = [
  {
    title: 'Unified Library Access',
    detail: 'EduLibrary connects catalogue browsing, digital resources, notices, and user services in one platform.',
    icon: BookOpen
  },
  {
    title: 'Academic Resource Support',
    detail: 'The system supports discovery of journals, research papers, thesis materials, and curated lecture content.',
    icon: Database
  },
  {
    title: 'Campus Community Ready',
    detail: 'Built for CUET students, teachers, and library teams to improve access and borrowing workflows.',
    icon: Users
  }
];

const About = () => {
  return (
    <div className="min-h-screen bg-[linear-gradient(165deg,#f8fafc_0%,#ecfeff_36%,#fffbeb_100%)] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/landing#home" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            <Building2 className="h-4 w-4 text-teal-700" />
            CUET Library OS
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${item.label === 'About' ? 'border border-slate-900 bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_28px_60px_-40px_rgba(2,6,23,0.4)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">About This Platform</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">About EduLibrary</h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            EduLibrary is the digital gateway of CUET Central Library. It is designed to help visitors explore library services,
            discover academic materials, and view important updates before entering authenticated student, teacher, or admin portals.
          </p>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            The platform supports modern library operations through searchable catalogues, digital repository discovery, and live
            activity visibility, making information access faster for the university community.
          </p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-3 text-lg font-semibold text-slate-900">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.detail}</p>
              </article>
            );
          })}
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white sm:p-7">
          <h2 className="text-2xl font-semibold">Explore the Landing Experience</h2>
          <p className="mt-2 text-sm text-slate-200">
            Navigate through services, resources, and notices from the landing page, then continue to the login portal when ready.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/landing#home" className="inline-flex items-center rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Landing
            </Link>
            <Link to="/login" className="inline-flex items-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
              Continue to Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
