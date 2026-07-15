"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Script from "next/script";
import "./vendas.css";
import { CountUp } from "./components/CountUp";
import { CustomCursor } from "./components/CustomCursor";
import { MagneticButton } from "./components/MagneticButton";
import { ScrollProgressBar } from "./components/ScrollProgressBar";
import { SplitHeadline } from "./components/SplitHeadline";
import { gsap } from "./lib/gsap";

// R3F/Canvas needs the browser (WebGL context, ResizeObserver on mount) —
// never rendered on the server, and code-split so mobile/low-end devices
// that HeroScene itself opts out of never even download the bundle.
const HeroScene = dynamic(() => import("./components/HeroScene").then((m) => m.HeroScene), { ssr: false });

const PARTNER_FIRMS = [
  { initials: "AC", name: "Almeida & Cardoso" },
  { initials: "RM", name: "Ribeiro Martins" },
  { initials: "BS", name: "Bittencourt Advocacia" },
  { initials: "VP", name: "Vasconcelos & Prado" },
  { initials: "TX", name: "Teixeira Empresarial" },
];

const FAQ_ACCORDION = [
  {
    q: "Preciso migrar meus documentos atuais?",
    a: "Não é obrigatório. Você pode começar cadastrando só os clientes e documentos novos, e ir enviando seus modelos antigos em .docx no seu ritmo — a biblioteca cresce aos poucos.",
  },
  {
    q: "Funciona no celular e no tablet?",
    a: "Sim. O AdvFlow acompanha você no computador, notebook, tablet ou celular, com o mesmo menu flutuante e as mesmas funções em qualquer tela.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim, sem multa e sem burocracia. No plano mensal o cancelamento vale para a próxima cobrança; no plano anual, você ainda conta com os 7 dias de garantia incondicional.",
  },
  {
    q: "Tem suporte para me ajudar a começar?",
    a: "Sim. Você tem suporte contínuo para configurar sua identidade, importar seus primeiros modelos e tirar dúvidas no dia a dia — em qualquer plano.",
  },
  {
    q: "Meus dados ficam seguros?",
    a: "Sim. Você pode exportar um backup completo a qualquer momento e importá-lo de volta se precisar trocar de computador ou restaurar suas informações.",
  },
];

const TILT_MAX_DEG = 7;

export default function VendasPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const frameGlowRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const stepsSectionRef = useRef<HTMLElement>(null);
  const stepsTrackFillRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [countdown, setCountdown] = useState({ h: "00", m: "00", s: "00" });
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [heroSceneReady, setHeroSceneReady] = useState(false);

  // cursor-tracked spotlight glow + 3D tilt shared by every .spotlight
  // element — .tilt cards additionally read --rx/--ry for the rotation.
  const handleSpotlight = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
    el.style.setProperty("--ry", `${(px - 0.5) * TILT_MAX_DEG * 2}deg`);
    el.style.setProperty("--rx", `${-(py - 0.5) * TILT_MAX_DEG * 2}deg`);
  }, []);

  // sticky nav shadow/blur + hero parallax glow on scroll
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      const glow = frameGlowRef.current;
      if (glow) {
        const y = Math.min(window.scrollY, 400);
        glow.style.transform = `translateY(${y * 0.18}px)`;
        glow.style.opacity = String(Math.max(0.25, 1 - y / 500));
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // scroll-reveal via IntersectionObserver — also drives the .rule
  // divider-line draw-in (same "in" class, see .rule.in in vendas.css).
  useEffect(() => {
    const revealEls = rootRef.current?.querySelectorAll<HTMLElement>(".reveal, .rule");
    if (!revealEls || revealEls.length === 0) return;
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry, idx) => {
            if (entry.isIntersecting) {
              (entry.target as HTMLElement).style.setProperty("--i", String(idx % 6));
              entry.target.classList.add("in");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
      );
      revealEls.forEach((el) => io.observe(el));
      return () => io.disconnect();
    }
    revealEls.forEach((el) => el.classList.add("in"));
  }, []);

  // Curtain-wipe reveal for a few high-drama "scene change" moments
  // (.curtain elements): clip-path uncovers top-down instead of a plain
  // fade. Kept off layout-affecting properties (clip-path never changes
  // box size/position) so — unlike the pinned-steps attempt — this can't
  // perturb scroll height or trigger measurement races.
  useEffect(() => {
    const els = rootRef.current?.querySelectorAll<HTMLElement>(".curtain");
    if (!els || els.length === 0) return;
    const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMq.matches) return;
    const ctx = gsap.context(() => {
      els.forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: "inset(0 0 100% 0)" },
          {
            clipPath: "inset(0 0 0% 0)",
            duration: 1.1,
            ease: "power4.inOut",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          }
        );
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  // "Como funciona": pin the section while its 6 steps reveal in sequence
  // and the connecting rail fills — desktop + motion-allowed only. Below
  // 1024px the steps are just visible immediately (no JS-dependent reveal),
  // matching how every other .reveal element already degrades.
  //
  // Note: this intentionally scrubs WITHOUT `pin: true`. Pinning this
  // section inflated total document height and produced a broken scroll
  // position in testing (the pin spacer's height is computed from the
  // dynamically-loaded 3D hero's box, which resizes after ScrollTrigger's
  // first measurement) — scrubbing the reveal as the section passes through
  // the viewport gets the same "unfolds as you scroll" storytelling without
  // that fragility.
  useEffect(() => {
    const section = stepsSectionRef.current;
    const fill = stepsTrackFillRef.current;
    if (!section || !fill) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!mq.matches || reducedMq.matches) return;

    const steps = section.querySelectorAll<HTMLElement>(".step");
    const ctx = gsap.context(() => {
      gsap.set(steps, { opacity: 0, y: 26 });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          end: "bottom 60%",
          scrub: 0.6,
        },
      });
      tl.to(fill, { scaleX: 1, ease: "none" }, 0);
      tl.to(steps, { opacity: 1, y: 0, stagger: 0.15, ease: "none" }, 0);
    }, section);

    return () => ctx.revert();
  }, []);

  // urgency countdown — deadline persisted so it doesn't reset on reload
  useEffect(() => {
    const CD_KEY = "advflow_offer_deadline";
    let deadline = Number(localStorage.getItem(CD_KEY));
    if (!deadline || deadline < Date.now()) {
      deadline = Date.now() + 47 * 60 * 60 * 1000; // 47h window
      localStorage.setItem(CD_KEY, String(deadline));
    }
    const pad = (num: number) => String(num).padStart(2, "0");
    const tick = () => {
      const diff = Math.max(0, deadline - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown({ h: pad(h), m: pad(m), s: pad(s) });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // smooth anchor-link scrolling for this page only, restored on unmount
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    html.style.scrollBehavior = reduced ? "auto" : "smooth";
    return () => {
      html.style.scrollBehavior = prev;
    };
  }, []);

  return (
    <div className="vendas-page" ref={rootRef}>
      <CustomCursor />
      <ScrollProgressBar />
      <Script src="/vendas/image-slot.js" strategy="afterInteractive" />

      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <g id="i-folder"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/></g>
          <g id="i-file"><path d="M14 3v4a2 2 0 0 0 2 2h4"/><path d="M6 21a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8l6 6v10a2 2 0 0 1-2 2H6Z"/></g>
          <g id="i-users"><circle cx="9" cy="8" r="3.2"/><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6"/><path d="M16.5 5.2a3.2 3.2 0 0 1 0 6.2"/><path d="M21.5 20c0-3-2-5.3-5-6"/></g>
          <g id="i-library"><path d="M4 21V6l5-3 5 3v15"/><path d="M14 21V9l5-2v14"/><path d="M2 21h20"/></g>
          <g id="i-wand"><path d="M6 21 21 6"/><path d="M15 6h.01"/><path d="M18 3h.01"/><path d="M21 9h.01"/><path d="M3 12h.01"/><path d="M6 6h.01"/><path d="M9 3h.01"/></g>
          <g id="i-history"><path d="M3 3v6h6"/><path d="M3.5 13a8.5 8.5 0 1 0 2.6-7.4L3 9"/><path d="M12 8v5l3.5 2"/></g>
          <g id="i-settings"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></g>
          <g id="i-shield"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z"/><path d="m9 12 2 2 4-4"/></g>
          <g id="i-zap"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></g>
          <g id="i-search"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></g>
          <g id="i-check"><path d="M20 6 9 17l-5-5"/></g>
          <g id="i-x"><path d="M18 6 6 18"/><path d="M6 6 12 12"/></g>
          <g id="i-clock"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></g>
          <g id="i-trend"><path d="M3 17 9 11l4 4 8-8"/><path d="M15 7h6v6"/></g>
          <g id="i-layout"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></g>
          <g id="i-quote"><path d="M7 7C4.5 8.5 3 11 3 14c0 3 2 5 4.5 5S12 17 12 14c0-2.2-1.4-4-3.5-4.3.4-1.6 1.7-2.9 3.5-3.5L11 4C9 4.7 7.6 5.6 7 7Z"/><path d="M17 7c-2.5 1.5-4 4-4 7 0 3 2 5 4.5 5s4.5-2 4.5-5c0-2.2-1.4-4-3.5-4.3.4-1.6 1.7-2.9 3.5-3.5L21 4c-2 .7-3.4 1.6-4 3Z"/></g>
          <g id="i-chevron"><path d="m6 9 6 6 6-6"/></g>
          <g id="i-play"><path d="M6 4v16l14-8-14-8Z"/></g>
        </defs>
      </svg>

      <div className="wrap">
        <nav className={`nav${scrolled ? " scrolled" : ""}`}>
          <div className="nav-links">
            <a href="#recursos">Recursos</a>
            <a href="#como-funciona">Como funciona</a>
            <a href="#planos">Planos</a>
            <a href="#depoimentos">Depoimentos</a>
            <a href="#faq">FAQ</a>
          </div>
        </nav>

        {/* HERO */}
        <section className="hero" data-screen-label="Hero" ref={heroSectionRef}>
          <span className="badge"><svg className="icon"><use href="#i-zap"/></svg> Desenvolvido para a rotina do advogado moderno</span>
          <SplitHeadline as="h1" className="display">O problema do seu escritório não é criar documentos, é <span className="glow">gerenciar</span> tudo que já foi criado.</SplitHeadline>
          <p className="sub">O AdvFlow transforma arquivos espalhados, modelos perdidos e informações desconectadas em uma operação jurídica organizada, rápida e profissional. Centralize clientes, documentos, contratos e modelos em um único lugar.</p>
          <div className="row">
            <MagneticButton href="/login" className="btn btn-primary spotlight" onPointerMove={handleSpotlight}>Quero Organizar Meu Escritório</MagneticButton>
            <Link href="/login" className="btn btn-ghost spotlight" onPointerMove={handleSpotlight}><svg className="icon"><use href="#i-layout"/></svg> Ver o painel</Link>
          </div>
          <div className="frame-wrap reveal">
            <div className="frame-glow" ref={frameGlowRef}></div>
            <div className="frame">
              <div className="frame-bar">
                <span className="dot"></span><span className="dot"></span><span className="dot"></span>
                <span className="url">app.advflow.com.br/dashboard</span>
              </div>
              <image-slot id="shot-hero" shape="rect" fit="contain" placeholder="Print do painel principal do AdvFlow" src="https://i.imgur.com/dCR4sEl.jpeg"></image-slot>
            </div>
            <figure className="prop prop-gavel"><image-slot id="prop-gavel" shape="rect" placeholder="Elemento isolado (ex: martelo/balança em PNG recortado)"></image-slot></figure>
            <HeroScene
              className={`hero-scene-layer${heroSceneReady ? " is-ready" : ""}`}
              scrollTriggerRef={heroSectionRef}
              onReady={() => setHeroSceneReady(true)}
            />
          </div>
        </section>

        <hr className="rule" />

        {/* STATS */}
        <section className="stats">
          <div className="stats-grid">
            <div className="stat reveal spotlight" onPointerMove={handleSpotlight}><CountUp className="num" value={9412} /><p className="lbl">Documentos organizados</p></div>
            <div className="stat reveal spotlight" onPointerMove={handleSpotlight}><CountUp className="num" value={100} suffix="%" /><p className="lbl">Dados centralizados</p></div>
            <div className="stat reveal spotlight" onPointerMove={handleSpotlight}><CountUp className="num" value={0} /><p className="lbl">Pastas para procurar</p></div>
            <div className="stat reveal spotlight" onPointerMove={handleSpotlight}><CountUp className="num" value={1} /><p className="lbl">Lugar só para tudo</p></div>
          </div>
        </section>

        {/* LOGOS / PROVA SOCIAL */}
        <section className="logos" data-screen-label="Escritórios parceiros">
          <p className="lbl">Usado por escritórios em todo o Brasil</p>
          <div className="logos-row">
            <div className="logos-track">
              {[...PARTNER_FIRMS, ...PARTNER_FIRMS].map((firm, i) => (
                <div className="logo-slot" key={`${firm.initials}-${i}`}>
                  <span className="logo-mark">{firm.initials}</span>
                  <span className="logo-name">{firm.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VÍDEO DEMO */}
        <section className="video-demo" data-screen-label="Vídeo demo">
          <div className="head">
            <span className="kicker" style={{ display: "flex", justifyContent: "center" }}>Veja antes de organizar o seu</span>
            <h2>O AdvFlow em ação, em 2 minutos</h2>
          </div>
          <div className="video-frame-wrap reveal spotlight" onPointerMove={handleSpotlight}>
            <div className="video-glow" aria-hidden="true"></div>
            <div className="frame">
              <div className="frame-bar"><span className="dot"></span><span className="dot"></span><span className="dot"></span><span className="url">demonstração</span></div>
              {videoPlaying ? (
                <div className="video-poster is-playing">
                  <video
                    src="https://i.imgur.com/xP664sg.mp4"
                    poster="https://i.imgur.com/HgUL8yE.jpeg"
                    controls
                    autoPlay
                    playsInline
                    className="video-player"
                  />
                </div>
              ) : (
                <div
                  className="video-poster"
                  id="video-poster"
                  role="button"
                  tabIndex={0}
                  aria-label="Reproduzir vídeo de demonstração"
                  onClick={() => setVideoPlaying(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setVideoPlaying(true);
                    }
                  }}
                >
                  <image-slot id="shot-video-poster" shape="rect" fit="contain" placeholder="Capa do vídeo de demonstração do AdvFlow" src="https://i.imgur.com/HgUL8yE.jpeg"></image-slot>
                  <div className="play"><span className="btn-play"><svg className="icon"><use href="#i-play"/></svg></span></div>
                </div>
              )}
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* O PROBLEMA */}
        <section className="narrative curtain" data-screen-label="O problema">
          <span className="kicker">O problema não começa quando você cria um documento</span>
          <SplitHeadline>Ele começa quando você precisa encontrá-lo meses depois.</SplitHeadline>
          <p>Todo advogado já passou por isso. O cliente liga: &quot;Doutor, consegue me enviar aquele contrato que assinamos no ano passado?&quot; Você responde: &quot;Claro, só um instante.&quot; Mas esse instante vira minutos.</p>
          <div className="file-stack">
            <div className="file-row"><svg className="icon"><use href="#i-file"/></svg> Contrato.docx</div>
            <div className="file-row"><svg className="icon"><use href="#i-file"/></svg> Contrato Final.docx</div>
            <div className="file-row"><svg className="icon"><use href="#i-file"/></svg> Contrato Final Novo.docx</div>
            <div className="file-row"><svg className="icon"><use href="#i-file"/></svg> Contrato Final Atualizado.docx</div>
            <div className="file-row active"><svg className="icon"><use href="#i-search"/></svg> Contrato Final Definitivo Agora Vai.docx</div>
          </div>
          <p>Enquanto isso, o cliente espera. E cada segundo faz parecer que seu escritório está menos organizado do que deveria.</p>
          <p className="emph">Essa situação acontece todos os dias. E o pior: ela parece normal.</p>
        </section>

        {/* ICON FEATURE GRID: custo / word / advflow */}
        <section className="feature-grid">
          <div className="grid3">
            <div className="card reveal spotlight tilt" onPointerMove={handleSpotlight}>
              <div className="icn"><svg className="icon"><use href="#i-clock"/></svg></div>
              <h3>O custo invisível</h3>
              <p>Minutos procurando contratos, procurações e modelos. Multiplicados todos os dias, toda semana, durante anos. Você não perde horas porque trabalha muito — perde porque ainda depende de pastas.</p>
            </div>
            <div className="card reveal spotlight tilt" onPointerMove={handleSpotlight}>
              <div className="icn"><svg className="icon"><use href="#i-file"/></svg></div>
              <h3>O problema nunca foi o Word</h3>
              <p>O Word cria documentos, e faz isso muito bem. Mas termina o trabalho exatamente quando o seu começa. Quem organiza, relaciona e centraliza tudo depois? Na maioria dos escritórios: ninguém.</p>
            </div>
            <div className="card reveal spotlight tilt" onPointerMove={handleSpotlight}>
              <div className="icn"><svg className="icon"><use href="#i-shield"/></svg></div>
              <h3>É por isso que existimos</h3>
              <p>O AdvFlow não nasceu para substituir o Word. Nasceu para substituir o caos — administrando um escritório jurídico inteiro, não apenas os documentos que ele produz.</p>
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* DASHBOARD */}
        <section className="module" data-screen-label="Dashboard" id="recursos">
          <div className="module-copy reveal">
            <div className="icn"><svg className="icon"><use href="#i-layout"/></svg></div>
            <span className="kicker">Imagine como seria trabalhar assim</span>
            <SplitHeadline>Abra o sistema e saiba exatamente o que está acontecendo.</SplitHeadline>
            <p>Você chega ao escritório, abre o AdvFlow e em poucos segundos já sabe como está sua operação — sem procurar, sem lembrar, sem depender da memória.</p>
            <ul>
              <li><svg className="icon"><use href="#i-check"/></svg> Clientes, documentos e modelos, todos à vista</li>
              <li><svg className="icon"><use href="#i-check"/></svg> Histórico inteligente do que mudou recentemente</li>
              <li><svg className="icon"><use href="#i-check"/></svg> Saudação e visão geral personalizadas</li>
            </ul>
          </div>
          <div className="module-shot reveal spotlight" onPointerMove={handleSpotlight}>
            <div className="glow"></div>
            <div className="frame">
              <div className="frame-bar"><span className="dot"></span><span className="dot"></span><span className="dot"></span><span className="url">dashboard</span></div>
              <video
                className="dashboard-video"
                src="https://i.imgur.com/rpAFuPs.mp4"
                autoPlay
                loop
                muted
                playsInline
                disablePictureInPicture
                controlsList="nodownload noplaybackrate nofullscreen"
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          </div>
        </section>

        {/* CLIENTES */}
        <section className="module reverse" data-screen-label="Clientes">
          <div className="module-copy reveal">
            <div className="icn"><svg className="icon"><use href="#i-users"/></svg></div>
            <span className="kicker">Todo cliente tem sua própria central</span>
            <h2>Meses ou anos depois, você encontra absolutamente tudo.</h2>
            <p>Dados completos, arquivos anexados, todos os contratos e procurações, todo o histórico. Nada espalhado, nada perdido, nada esquecido.</p>
            <p>Cada cliente deixa de ser apenas um nome — passa a ter seu próprio ambiente dentro do escritório.</p>
          </div>
          <div className="module-shot reveal spotlight" onPointerMove={handleSpotlight}>
            <div className="glow"></div>
            <div className="frame">
              <div className="frame-bar"><span className="dot"></span><span className="dot"></span><span className="dot"></span><span className="url">clientes</span></div>
              <video
                className="dashboard-video"
                src="https://i.imgur.com/ey3UduH.mp4"
                autoPlay
                loop
                muted
                playsInline
                disablePictureInPicture
                controlsList="nodownload noplaybackrate nofullscreen"
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          </div>
        </section>

        {/* BIBLIOTECA */}
        <section className="module" data-screen-label="Biblioteca">
          <div className="module-copy reveal">
            <div className="icn"><svg className="icon"><use href="#i-library"/></svg></div>
            <span className="kicker">Sua experiência também merece ser organizada</span>
            <h2>Transforme qualquer documento do Word em um modelo reutilizável.</h2>
            <p>Cada cláusula que você aperfeiçoou é patrimônio intelectual. No AdvFlow, ele vira uma biblioteca jurídica organizada por categorias, sempre disponível e sempre atualizada.</p>
            <ul>
              <li><svg className="icon"><use href="#i-check"/></svg> Envie um .docx e o AdvFlow identifica os campos variáveis</li>
              <li><svg className="icon"><use href="#i-check"/></svg> Crie uma única vez, utilize para sempre</li>
            </ul>
          </div>
          <div className="module-shot reveal spotlight" onPointerMove={handleSpotlight}>
            <div className="glow"></div>
            <div className="frame">
              <div className="frame-bar"><span className="dot"></span><span className="dot"></span><span className="dot"></span><span className="url">biblioteca</span></div>
              <video
                className="dashboard-video"
                src="https://i.imgur.com/QanvQmg.mp4"
                autoPlay
                loop
                muted
                playsInline
                disablePictureInPicture
                controlsList="nodownload noplaybackrate nofullscreen"
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          </div>
        </section>

        {/* GERADOR */}
        <section className="module reverse" data-screen-label="Gerador">
          <div className="module-copy reveal">
            <div className="icn"><svg className="icon"><use href="#i-wand"/></svg></div>
            <span className="kicker">Pare de recomeçar o mesmo trabalho todos os dias</span>
            <h2>O sistema já sabe muita coisa. Você preenche só o que é novo.</h2>
            <p>Ao escolher um cliente, o AdvFlow preenche automaticamente tudo que já conhece. Você acompanha o documento sendo montado em tempo real, exatamente como ele ficará.</p>
            <ul>
              <li><svg className="icon"><use href="#i-check"/></svg> Pré-visualização em tempo real</li>
              <li><svg className="icon"><use href="#i-check"/></svg> Exporte em PDF, Word ou compartilhe direto</li>
            </ul>
          </div>
          <div className="module-shot reveal spotlight" onPointerMove={handleSpotlight}>
            <div className="glow"></div>
            <div className="frame">
              <div className="frame-bar"><span className="dot"></span><span className="dot"></span><span className="dot"></span><span className="url">gerador</span></div>
              <video
                className="dashboard-video"
                src="https://i.imgur.com/8Cohagu.mp4"
                autoPlay
                loop
                muted
                playsInline
                disablePictureInPicture
                controlsList="nodownload noplaybackrate nofullscreen"
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          </div>
        </section>

        <hr className="rule" />

        <section className="quote-strip">
          <div className="qi"><svg className="icon" style={{ width: "32px", height: "32px" }}><use href="#i-quote"/></svg></div>
          <p>Não é apenas sobre economizar tempo. É sobre a imagem que você transmite.</p>
        </section>

        <section className="feature-grid">
          <div className="grid3">
            <div className="card reveal spotlight tilt" onPointerMove={handleSpotlight}>
              <div className="icn"><svg className="icon"><use href="#i-history"/></svg></div>
              <h3>Memória completa</h3>
              <p>Tudo possui histórico. Você sempre sabe quando o documento foi criado, qual modelo foi usado e qual é a versão correta — mesmo anos depois.</p>
            </div>
            <div className="card reveal spotlight tilt" onPointerMove={handleSpotlight}>
              <div className="icn"><svg className="icon"><use href="#i-trend"/></svg></div>
              <h3>Cresce com você</h3>
              <p>De vinte a mil clientes, sua biblioteca, seu histórico e sua organização crescem junto — e tudo continua exatamente onde deveria estar.</p>
            </div>
            <div className="card reveal spotlight tilt" onPointerMove={handleSpotlight}>
              <div className="icn"><svg className="icon"><use href="#i-shield"/></svg></div>
              <h3>Autoridade percebida</h3>
              <p>O cliente percebe quando você encontra qualquer documento em segundos. Isso transmite confiança e profissionalismo que nenhuma campanha compra.</p>
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* MID OFFER */}
        <section className="offer" data-screen-label="CTA meio de página">
          <div className="offer-panel curtain spotlight" onPointerMove={handleSpotlight}>
            <SplitHeadline>Organize hoje o que vai definir o crescimento do seu escritório amanhã.</SplitHeadline>
            <p className="lede">Pare de procurar documentos. Comece a encontrar tempo.</p>
            <ul className="checklist">
              <li><svg className="icon"><use href="#i-check"/></svg> Clientes centralizados</li>
              <li><svg className="icon"><use href="#i-check"/></svg> Biblioteca inteligente de modelos</li>
              <li><svg className="icon"><use href="#i-check"/></svg> Documentos organizados</li>
              <li><svg className="icon"><use href="#i-check"/></svg> Geração automatizada</li>
              <li><svg className="icon"><use href="#i-check"/></svg> Histórico completo</li>
              <li><svg className="icon"><use href="#i-check"/></svg> Muito mais produtividade</li>
            </ul>
            <div className="row" style={{ display: "flex", justifyContent: "center" }}>
              <MagneticButton href="/login" className="btn btn-primary spotlight" onPointerMove={handleSpotlight}>Quero Começar a Usar o AdvFlow</MagneticButton>
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* COMPARE */}
        <section className="compare" data-screen-label="Comparativo">
          <div className="head"><h2>Um escritório organizado não é um luxo. É vantagem competitiva.</h2></div>
          <div className="compare-grid">
            <div className="compare-col reveal spotlight" onPointerMove={handleSpotlight}>
              <h3><svg className="icon"><use href="#i-x"/></svg> Sem organização</h3>
              <div className="row"><svg className="icon"><use href="#i-x"/></svg> Perde minutos procurando documentos</div>
              <div className="row"><svg className="icon"><use href="#i-x"/></svg> Procura a última versão do contrato</div>
              <div className="row"><svg className="icon"><use href="#i-x"/></svg> Depende da memória</div>
              <div className="row"><svg className="icon"><use href="#i-x"/></svg> Acredita que isso é normal na profissão</div>
            </div>
            <div className="compare-col win reveal spotlight" onPointerMove={handleSpotlight}>
              <h3><svg className="icon"><use href="#i-check"/></svg> Com o AdvFlow</h3>
              <div className="row"><svg className="icon"><use href="#i-check"/></svg> Já está atendendo o próximo cliente</div>
              <div className="row"><svg className="icon"><use href="#i-check"/></svg> Já enviou o documento para assinatura</div>
              <div className="row"><svg className="icon"><use href="#i-check"/></svg> Depende de um sistema</div>
              <div className="row"><svg className="icon"><use href="#i-check"/></svg> Sabe que não precisa mais ser assim</div>
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* MÓDULOS EXTRA */}
        <section className="feature-grid">
          <div className="head"><h2>Desenvolvido para a rotina real do advogado</h2></div>
          <div className="grid3">
            <div className="card reveal spotlight tilt" onPointerMove={handleSpotlight}>
              <div className="icn"><svg className="icon"><use href="#i-settings"/></svg></div>
              <h3>Identidade configurada uma vez</h3>
              <p>Nome, OAB, endereço, assinatura e logo aparecem automaticamente em todos os documentos — um padrão profissional em toda comunicação.</p>
            </div>
            <div className="card reveal spotlight tilt" onPointerMove={handleSpotlight}>
              <div className="icn"><svg className="icon"><use href="#i-zap"/></svg></div>
              <h3>Sempre ao alcance</h3>
              <p>Um menu flutuante acompanha você em qualquer tela — computador, tablet ou celular — sem precisar reaprender onde cada coisa está.</p>
            </div>
            <div className="card reveal spotlight tilt" onPointerMove={handleSpotlight}>
              <div className="icn"><svg className="icon"><use href="#i-trend"/></svg></div>
              <h3>Quanto mais usa, mais valioso</h3>
              <p>O primeiro documento economiza minutos. O décimo economiza horas. Depois de meses, seu escritório inteiro existe dentro do AdvFlow.</p>
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* COMO FUNCIONA — pinned + scrubbed via GSAP ScrollTrigger, see the
            dedicated useEffect above (desktop + motion-allowed only). */}
        <section className="steps-section section-relative" data-screen-label="Como funciona" id="como-funciona" ref={stepsSectionRef}>
          <div className="watermark"><svg viewBox="0 0 24 24"><use href="#i-shield"/></svg></div>
          <span className="kicker" style={{ display: "flex", justifyContent: "center" }}>Do primeiro clique ao documento pronto</span>
          <div className="head"><SplitHeadline>Como funciona o AdvFlow</SplitHeadline></div>
          <div className="steps-grid">
            <div className="steps-track-fill" ref={stepsTrackFillRef} aria-hidden="true"></div>
            <div className="step"><span className="badge-num">01</span><div className="ring"><svg className="icon"><use href="#i-users"/></svg></div><h3>Cadastre o cliente</h3><p>Dados completos, uma única vez. O sistema lembra por você.</p></div>
            <div className="step"><span className="badge-num">02</span><div className="ring"><svg className="icon"><use href="#i-file"/></svg></div><h3>Envie seus modelos</h3><p>Suba contratos em .docx e o AdvFlow identifica os campos variáveis.</p></div>
            <div className="step"><span className="badge-num">03</span><div className="ring"><svg className="icon"><use href="#i-library"/></svg></div><h3>Monte sua biblioteca</h3><p>Organizada por categoria, sempre pronta para reutilizar.</p></div>
            <div className="step"><span className="badge-num">04</span><div className="ring"><svg className="icon"><use href="#i-wand"/></svg></div><h3>Gere o documento</h3><p>Campos preenchidos automaticamente com os dados do cliente.</p></div>
            <div className="step"><span className="badge-num">05</span><div className="ring"><svg className="icon"><use href="#i-layout"/></svg></div><h3>Revise em tempo real</h3><p>Pré-visualização fiel, edite qualquer trecho antes de exportar.</p></div>
            <div className="step"><span className="badge-num">06</span><div className="ring"><svg className="icon"><use href="#i-history"/></svg></div><h3>Fica tudo registrado</h3><p>Histórico e backup automáticos — nada se perde de novo.</p></div>
          </div>
          <div className="row" style={{ display: "flex", justifyContent: "center", marginTop: "44px" }}>
            <MagneticButton href="/login" className="btn btn-primary spotlight" onPointerMove={handleSpotlight}>Quero Ver o AdvFlow Funcionando</MagneticButton>
          </div>
        </section>

        <hr className="rule" />

        {/* URGÊNCIA */}
        <section className="urgency">
          <div className="urgency-panel curtain spotlight" onPointerMove={handleSpotlight}>
            <span className="kicker"><svg className="icon"><use href="#i-clock"/></svg> Condição especial por tempo limitado</span>
            <h2>O preço de lançamento do AdvFlow termina em breve</h2>
            <div className="countdown">
              <div className="unit"><div className="num">{countdown.h}</div><div className="lbl">Horas</div></div>
              <div className="unit"><div className="num">{countdown.m}</div><div className="lbl">Min</div></div>
              <div className="unit"><div className="num">{countdown.s}</div><div className="lbl">Seg</div></div>
            </div>
            <div className="spots-bar">
              <div className="track"><div className="fill" style={{ width: "78%" }}></div></div>
              <p className="lbl"><strong>39 de 50</strong> vagas com condição especial já preenchidas</p>
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* PLANOS */}
        <section className="plans" id="planos">
          <div className="head">
            <span className="kicker" style={{ display: "flex", justifyContent: "center" }}>Escolha como começar</span>
            <h2>Um plano para cada tamanho de escritório</h2>
          </div>
          <p className="plans-note">O AdvFlow é sempre completo: clientes, biblioteca, gerador e histórico ilimitados em qualquer plano. A única diferença é quanto você economiza.</p>
          <div className="plans-grid">
            <div className="plan-card reveal spotlight tilt" onPointerMove={handleSpotlight}>
              <span className="kicker">Flexível</span>
              <h3>Mensal</h3>
              <div className="price"><span className="cur">R$</span><span className="val">69,90</span><span className="per">/mês</span></div>
              <p className="price-note">Cobrado todo mês, cancele quando quiser</p>
              <ul>
                <li><svg className="icon"><use href="#i-check"/></svg> Todo o poder do AdvFlow, sem limitações</li>
                <li><svg className="icon"><use href="#i-check"/></svg> Clientes, biblioteca e histórico ilimitados</li>
                <li><svg className="icon"><use href="#i-check"/></svg> Geração automática de documentos</li>
                <li><svg className="icon"><use href="#i-check"/></svg> Suporte contínuo</li>
              </ul>
              <Link href="/login" className="btn btn-ghost spotlight" onPointerMove={handleSpotlight}>Assinar Plano Mensal</Link>
            </div>
            <div className="plan-card feat reveal spotlight tilt" onPointerMove={handleSpotlight}>
              <span className="save-badge">Economize R$ 348,80 por ano</span>
              <span className="kicker">O mais vantajoso</span>
              <h3>Anual</h3>
              <div className="price"><span className="cur">R$</span><span className="val">490</span><span className="per">/ano</span></div>
              <p className="price-note"><s>R$ 838,80</s> pagando mês a mês — equivale a <strong>R$ 40,83/mês</strong></p>
              <ul>
                <li><svg className="icon"><use href="#i-check"/></svg> Todo o poder do AdvFlow, sem limitações</li>
                <li><svg className="icon"><use href="#i-check"/></svg> Clientes, biblioteca e histórico ilimitados</li>
                <li><svg className="icon"><use href="#i-check"/></svg> Geração automática de documentos</li>
                <li><svg className="icon"><use href="#i-check"/></svg> 41% de desconto garantido por 12 meses</li>
              </ul>
              <MagneticButton href="/login" className="btn btn-primary spotlight" onPointerMove={handleSpotlight}>Garantir o Plano Anual</MagneticButton>
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* GARANTIA */}
        <section className="guarantee">
          <div className="guarantee-panel reveal spotlight" onPointerMove={handleSpotlight}>
            <div className="seal"><svg className="icon"><use href="#i-shield"/></svg></div>
            <div>
              <h2>7 dias de garantia incondicional</h2>
              <p>Assine, organize seu escritório e experimente o AdvFlow na prática. Se não sentir a diferença em 7 dias, devolvemos 100% do seu investimento — sem perguntas, sem burocracia.</p>
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* DEPOIMENTOS */}
        <section className="testimonials" id="depoimentos">
          <div className="head">
            <span className="kicker" style={{ display: "flex", justifyContent: "center" }}>Quem já organizou o escritório</span>
            <h2>O que dizem os advogados que usam o AdvFlow</h2>
          </div>
          <div className="testi-grid">
            <div className="testi-card reveal spotlight tilt" onPointerMove={handleSpotlight}>
              <div className="qi"><svg><use href="#i-quote"/></svg></div>
              <p className="quote">Antes eu perdia meia hora do dia procurando contratos antigos. Hoje encontro tudo em segundos e atendo muito mais clientes.</p>
              <div className="testi-who">
                <div className="avatar"><image-slot id="avatar-1" shape="rect" placeholder="Foto"></image-slot></div>
                <div><p className="name">Fernanda Alcântara</p><p className="role">Advogada cível, escritório próprio</p></div>
              </div>
            </div>
            <div className="testi-card reveal spotlight tilt" onPointerMove={handleSpotlight}>
              <div className="qi"><svg><use href="#i-quote"/></svg></div>
              <p className="quote">Transformei anos de modelos espalhados em uma biblioteca única. Meu escritório finalmente parece do tamanho que sempre foi.</p>
              <div className="testi-who">
                <div className="avatar"><image-slot id="avatar-2" shape="rect" placeholder="Foto"></image-slot></div>
                <div><p className="name">Ricardo Nogueira</p><p className="role">Sócio, Nogueira Advocacia</p></div>
              </div>
            </div>
            <div className="testi-card reveal spotlight tilt" onPointerMove={handleSpotlight}>
              <div className="qi"><svg><use href="#i-quote"/></svg></div>
              <p className="quote">O cliente percebe a diferença. Consigo enviar qualquer documento na hora da reunião, sem pedir para aguardar.</p>
              <div className="testi-who">
                <div className="avatar"><image-slot id="avatar-3" shape="rect" placeholder="Foto"></image-slot></div>
                <div><p className="name">Camila Duarte</p><p className="role">Advogada trabalhista</p></div>
              </div>
            </div>
          </div>
        </section>

        <hr className="rule" />

        {/* FAQ */}
        <section className="faq" data-screen-label="Objeções">
          <div className="head"><h2>Quebra de objeções</h2></div>
          <div className="faq-item reveal">
            <div className="icn"><svg className="icon"><use href="#i-file"/></svg></div>
            <div><h3>E se eu já uso o Word?</h3><p>Continue usando. O Word segue excelente para escrever documentos. O AdvFlow organiza tudo que acontece antes e depois dele — funções completamente diferentes.</p></div>
          </div>
          <div className="faq-item reveal">
            <div className="icn"><svg className="icon"><use href="#i-users"/></svg></div>
            <div><h3>E se meu escritório for pequeno?</h3><p>Melhor ainda. Organizar um escritório pequeno leva muito menos tempo do que reorganizar um que já nasceu desorganizado.</p></div>
          </div>
          <div className="faq-item reveal">
            <div className="icn"><svg className="icon"><use href="#i-shield"/></svg></div>
            <div><h3>E se eu tiver medo de perder meus dados?</h3><p>Você pode exportar um backup completo sempre que desejar e importar novamente quando precisar. Seu patrimônio continua protegido.</p></div>
          </div>
        </section>

        <hr className="rule" />

        {/* FAQ ACORDEÃO */}
        <section className="faq" id="faq">
          <div className="head"><h2>Perguntas frequentes</h2></div>
          <div className="accordion">
            {FAQ_ACCORDION.map((item, i) => (
              <div className={`acc-item reveal${openFaq === i ? " open" : ""}`} key={item.q}>
                <button
                  type="button"
                  className="acc-trigger"
                  aria-expanded={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <h3>{item.q}</h3>
                  <span className="chev"><svg className="icon"><use href="#i-chevron"/></svg></span>
                </button>
                <div className="acc-body"><div><p>{item.a}</p></div></div>
              </div>
            ))}
          </div>
        </section>

        <hr className="rule" />

        <section className="quote-strip">
          <p>O advogado moderno não precisa trabalhar mais. Precisa trabalhar melhor.</p>
        </section>

        {/* FINAL CTA */}
        <section className="offer" data-screen-label="CTA final">
          <div className="offer-panel curtain spotlight" onPointerMove={handleSpotlight}>
            <span className="kicker" style={{ justifyContent: "center", width: "100%" }}>Chegou a hora de ter controle sobre o seu escritório</span>
            <SplitHeadline>Organize hoje o escritório que você quer ter amanhã.</SplitHeadline>
            <ul className="checklist">
              <li><svg className="icon"><use href="#i-check"/></svg> Centralize seus clientes</li>
              <li><svg className="icon"><use href="#i-check"/></svg> Organize todos os seus documentos</li>
              <li><svg className="icon"><use href="#i-check"/></svg> Construa sua biblioteca jurídica</li>
              <li><svg className="icon"><use href="#i-check"/></svg> Ganhe horas de produtividade</li>
              <li><svg className="icon"><use href="#i-check"/></svg> Transmita mais autoridade</li>
            </ul>
            <div className="row" style={{ display: "flex", justifyContent: "center" }}>
              <MagneticButton href="/login" className="btn btn-primary spotlight" onPointerMove={handleSpotlight}>Quero Organizar Meu Escritório Agora</MagneticButton>
            </div>
          </div>
        </section>

        <footer>
          <span>© 2026 AdvFlow. Todos os direitos reservados.</span>
          <span>Feito para a rotina real do advogado moderno.</span>
        </footer>
      </div>
    </div>
  );
}
