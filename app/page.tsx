"use client";

import Image from "next/image";
import { motion, MotionConfig, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { categories, email, partners, portfolioLink, projects, services, talent } from "./content";

const media = (name: string) => `/media/${name}.webp`;
const nav = [["About", "about"], ["Our Work", "work"], ["Services", "services"], ["Talent", "talent"], ["Contact", "contact"]];
const reveal = { "data-reveal": true, initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.16 }, transition: { duration: 0.5 } };

function Photo({ name, alt = "", priority = false, sizes = "(max-width: 760px) 100vw, 50vw" }: { name: string; alt?: string; priority?: boolean; sizes?: string }) {
  return <Image src={media(name)} alt={alt} fill sizes={sizes} preload={priority} />;
}

function Heading({ label, children }: { label: string; children: ReactNode }) {
  return <motion.div {...reveal}><p className="eyebrow">{label}</p><h2>{children}</h2></motion.div>;
}

function Arrow({ down = false }: { down?: boolean }) {
  return <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d={down ? "M3 3l10 10M6 13h7V6" : "M3 13 13 3M6 3h7v7"} stroke="currentColor" strokeWidth="1.5" /></svg>;
}

function PortfolioButton({ className = "" }: { className?: string }) {
  return <a className={`button ${className}`} href={portfolioLink}>Request Our Portfolio <Arrow /></a>;
}

function Header() {
  const [open, setOpen] = useState(false);
  return <header className="header" onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}>
    <a href="#top" aria-label="TEAM Communications home" className="brand"><Image src={media("team")} width={98} height={40} alt="" /></a>
    <button className="menu-toggle" aria-controls="site-nav" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"} <span aria-hidden="true">{open ? "×" : "☰"}</span></button>
    <nav id="site-nav" aria-label="Main navigation" className={open ? "is-open" : ""}>
      {nav.map(([label, hash]) => <a key={hash} href={`#${hash}`} onClick={() => setOpen(false)}>{label}</a>)}
      <PortfolioButton className="nav-portfolio" />
    </nav>
  </header>;
}

function Hero() {
  const { scrollY } = useScroll();
  const parallax = useTransform(scrollY, [0, 800], [0, 160]);
  const reduced = useReducedMotion();
  return <section className="hero" aria-labelledby="hero-title">
    <motion.div className="hero-photo photo" style={{ y: reduced ? 0 : parallax }}><Photo name="hero" priority sizes="100vw" /></motion.div>
    <div className="hero-content shell">
      <motion.div data-reveal initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <p className="eyebrow"><span className="signal" /> Independent creative agency · UAE</p>
        <h1 id="hero-title">MOMENTS<br />PEOPLE <em>KEEP.</em></h1>
        <p className="tagline">Every angle tells a story.</p>
        <div className="actions"><a className="button gold" href="#work">Explore Our Work <Arrow down /></a><PortfolioButton /></div>
      </motion.div>
      <a className="scroll-link" href="#about"><span aria-hidden="true">↓</span> Scroll to explore</a>
    </div>
  </section>;
}

function Work() {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<(typeof projects)[number] | null>(null);
  const [slide, setSlide] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const touch = useRef<number | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const visible = projects.filter((project) => filter === "All" || project.category === filter);
  const move = (step: number) => {
    if (selected) setSlide((current) => (current + step + selected.images.length) % selected.images.length);
  };
  useEffect(() => {
    if (selected && !dialog.current?.open) dialog.current?.showModal();
  }, [selected]);
  return <section className="work section" id="work"><div className="shell">
    <div className="section-heading"><Heading label="Selected work">Rooms We<br /><em>Light Up.</em></Heading><p>From a coffee gathering in Abu Dhabi to concerts across North America.</p></div>
    <div className="filters" aria-label="Filter projects">{categories.map((category) => <button type="button" key={category} aria-pressed={filter === category} onClick={() => { setFilter(category); setExpanded(null); }}>{category}</button>)}</div>
    <div className="project-grid">
      {visible.map((project) => <motion.article {...reveal} key={project.name} className="project">
        <button className="photo project-photo" aria-label={`Open images for ${project.name}`} onClick={(event) => { trigger.current = event.currentTarget; setSlide(0); setSelected(project); }}><Photo name={project.images[0]} /><Arrow /></button>
        <div className="project-info"><div><p className="eyebrow">{project.category}</p><h3>{project.name}</h3><p>{project.date}</p></div>
        <button type="button" className="round" aria-label={`Details for ${project.name}`} aria-expanded={expanded === project.name} onClick={() => setExpanded(expanded === project.name ? null : project.name)}>{expanded === project.name ? "−" : "+"}</button></div>
        {expanded === project.name && <p className="project-detail">{project.detail}</p>}
      </motion.article>)}
    </div>
    {!visible.length && <p className="empty" role="status">No published case studies in this category yet.</p>}
    <dialog ref={dialog} className="lightbox" aria-label={selected?.name ?? "Project images"} onClose={() => { setSelected(null); trigger.current?.focus(); }} onKeyDown={(event) => {
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    }}>
      {selected && <div className="lightbox-inner">
        <div className="lightbox-header"><h3>{selected.name}</h3><button autoFocus className="round" aria-label="Close gallery" onClick={() => dialog.current?.close()}>×</button></div>
        <div className="photo lightbox-photo" onTouchStart={(event) => { touch.current = event.touches[0].clientX; }} onTouchEnd={(event) => {
          if (touch.current === null) return;
          const delta = event.changedTouches[0].clientX - touch.current;
          if (Math.abs(delta) > 45) move(delta > 0 ? -1 : 1);
          touch.current = null;
        }}><Photo name={selected.images[slide]} alt={`${selected.name} portfolio image ${slide + 1}`} sizes="90vw" /></div>
        <div className="lightbox-controls">
          {selected.images.length > 1 && <button className="round" aria-label="Previous image" onClick={() => move(-1)}>←</button>}
          <span aria-live="polite">{slide + 1} / {selected.images.length}</span>
          {selected.images.length > 1 && <button className="round" aria-label="Next image" onClick={() => move(1)}>→</button>}
        </div>
      </div>}
    </dialog>
  </div></section>;
}

function Services() {
  const [active, setActive] = useState<number | null>(0);
  const [preview, setPreview] = useState<number | null>(null);
  const image = services[preview ?? active ?? 0];
  return <section className="services section" id="services"><div className="shell">
    <Heading label="Our services">How We <em>Get There.</em></Heading>
    <div className="services-layout">
      <div className="service-list">{services.map((service, index) => <div className="service" key={service.name} onMouseEnter={() => setPreview(index)} onMouseLeave={() => setPreview(null)}>
        <h3><button aria-expanded={active === index} aria-controls={`service-${index}`} onClick={() => setActive(active === index ? null : index)}><span>{String(index + 1).padStart(2, "0")}</span>{service.name}<span aria-hidden="true">{active === index ? "−" : "+"}</span></button></h3>
        <p id={`service-${index}`} hidden={active !== index}>{service.detail}</p>
      </div>)}</div>
      <div className="photo service-photo"><Photo name={image.image} /><span>{image.name}</span></div>
    </div>
  </div></section>;
}

function Partners() {
  const [paused, setPaused] = useState(false);
  return <section className="partners section"><div className="shell section-heading"><Heading label="Clients & partners">In Good <em>Company.</em></Heading><button className="button" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? "Resume logos" : "Pause logos"}</button></div>
    <ul className="sr-only" aria-label="Clients and partners">{partners.map(([key, name]) => <li key={key}>{name}</li>)}</ul>
    <div className={`marquee ${paused ? "paused" : ""}`} aria-hidden="true"><div className="marquee-track">{[0, 1].map((copy) => <div className="logo-set" key={copy}>{partners.map(([key]) => <div className={`partner partner-${key}`} key={key}><Image src={media(key)} width={140} height={80} alt="" /></div>)}</div>)}</div></div>
  </section>;
}

function Talent() {
  const [active, setActive] = useState(0);
  return <section className="talent section" id="talent"><div className="shell split">
    <motion.div {...reveal} className="photo talent-photo"><Photo name="talent" alt="Artists photographed in San Francisco" /></motion.div>
    <div><Heading label="Talent & artist booking">The People<br />We <em>Bring.</em></Heading>
      <p className="intro-copy">Find the right performer, creator or collaborator for your next project.</p>
      <div className="filters talent-filters" aria-label="Talent categories">{talent.map(([name], index) => <button key={name} aria-pressed={active === index} onClick={() => setActive(index)}>{name}</button>)}</div>
      <p className="talent-description" aria-live="polite">{talent[active][1]}</p>
      <a className="button gold" href="#contact" onClick={() => window.dispatchEvent(new Event("talent-enquiry"))}>Enquire About Talent <Arrow /></a>
    </div>
  </div></section>;
}

function Contact() {
  const [service, setService] = useState("");
  const [status, setStatus] = useState<{ type: "idle" | "sending" | "success" | "error"; message: string }>({ type: "idle", message: "" });
  useEffect(() => {
    const selectTalent = () => setService(services[2].name);
    window.addEventListener("talent-enquiry", selectTalent);
    return () => window.removeEventListener("talent-enquiry", selectTalent);
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus({ type: "sending", message: "Sending your enquiry…" });
    try {
      const response = await fetch("/api/enquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
      const result = await response.json();
      if (!response.ok) {
        setStatus({ type: "error", message: result.message });
        return;
      }
      form.reset();
      setService("");
      setStatus({ type: "success", message: "Your enquiry was sent. Thank you for getting in touch." });
    } catch {
      setStatus({ type: "error", message: "Your enquiry could not be sent. Please try again or contact us by email." });
    }
  }
  return <section className="contact section" id="contact"><div className="shell split">
    <div><Heading label="Contact">Tell Us<br /><em>The Idea.</em></Heading>
      <address><a href={`mailto:${email}`}>{email}</a><a href="tel:+971526170343">+971 52 617 0343</a><span>SHAMS, Sharjah Media City<br />Sharjah, UAE</span><a href="https://www.elevenangles.com">www.elevenangles.com ↗</a></address>
    </div>
    <form onSubmit={submit} className="contact-form">
      <div className="form-grid">
        <label>Full name<input name="name" autoComplete="name" required minLength={2} maxLength={100} /></label>
        <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
        <label>Mobile number<input name="phone" type="tel" autoComplete="tel" required maxLength={24} pattern="[+0-9 .\(\)\-]{7,24}" /></label>
        <label>Service of interest<select name="service" required value={service} onChange={(event) => setService(event.target.value)}><option value="">Select a service</option>{services.map(({ name }) => <option key={name}>{name}</option>)}<option>Other enquiry</option></select></label>
      </div>
      <label>Message<textarea name="message" rows={4} required minLength={10} maxLength={3000} /></label>
      <div className="honeypot" aria-hidden="true"><label>Leave empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <button className="button gold" type="submit" disabled={status.type === "sending"}>Send Enquiry <Arrow /></button>
      <p className="form-status" role="status">{status.message}</p>
    </form>
  </div></section>;
}

export default function Home() {
  return <MotionConfig reducedMotion="user">
    <div id="top"><a href="#main" className="skip">Skip to content</a><Header />
    <main id="main">
      <Hero />
      <section className="about section" id="about"><div className="shell split">
        <div><Heading label="About TEAM">Creativity<br />Without <em>Boundaries.</em></Heading><motion.div {...reveal} className="intro-copy"><p>TEAM Communications is a strategic multimedia and creative agency founded in 2024 by Filipino creatives who call the UAE home.</p><p>We bring a Filipino perspective and an international outlook to campaigns, concerts, branded content and experiences shaped by the cultures they speak to.</p><a className="text-link" href="#services">Get to know our services ↗</a></motion.div></div>
        <motion.div {...reveal} className="photo about-photo"><Photo name="about" alt="Production camera on set" /></motion.div>
      </div></section>
      <Work /><Services /><Partners /><Talent />
      <section className="impact section"><div className="shell split"><div><Heading label="Community">Angles of <em>Impact.</em></Heading><p className="intro-copy">Our community initiative supports creative empowerment through mentorship, cultural collaboration, community engagement and grassroots initiatives. We aim to make room for underrepresented voices in the creative industry.</p></div><div className="photo impact-photo"><Photo name="impact" /></div></div></section>
      <Contact />
    </main>
    <footer className="footer"><div className="shell footer-inner"><div className="footer-brands"><Image src={media("team")} width={100} height={42} alt="TEAM Communications" /><Image src={media("eleven")} width={100} height={60} alt="The Eleven Angles Multimedia" /></div><a href={`mailto:${email}`}>{email}</a><a href="https://www.facebook.com/p/The-Eleven-Angles-Multimedia-61563722456214/">Facebook ↗</a><a href="#top">Back to top ↑</a><small>© {new Date().getFullYear()} TEAM Communications</small></div></footer>
    <a className="whatsapp" href="https://wa.me/971526170343" aria-label="Contact TEAM on WhatsApp"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-11.6 7.1L4 20l1.3-4.1A8 8 0 1 1 20 11.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M9 8c-1 0-1.2 1.3-.7 2.4.8 1.8 2.4 3.3 4.1 4.1 1.5.7 2.8.5 3.2-.5.2-.5-.7-1-1.8-1.4-.3-.1-.7.6-1 .6-.7 0-2.4-1.6-2.6-2.3-.1-.4.6-.6.5-1C10.3 8.7 9.5 8 9 8Z" fill="currentColor"/></svg></a>
    </div>
  </MotionConfig>;
}
