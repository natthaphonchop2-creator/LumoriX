import {
  ArrowRight,
  BarChart3,
  BatteryCharging,
  Building2,
  Car,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileText,
  Gauge,
  Home,
  Mail,
  MapPin,
  Menu,
  MonitorSmartphone,
  PenLine,
  Phone,
  PlugZap,
  Search,
  ShieldCheck,
  Smartphone,
  Sun,
  Trash2,
  Users,
  X,
  Zap,
} from "lucide-react";
import { gsap } from "gsap";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  articleRouteSlugs,
  brand,
  businessRoutes,
  faqs,
  navItems,
  plans,
  processSteps,
  products,
  provinceNames,
  provinces,
  seedArticles,
  stats,
} from "./data/siteData.js";

const RouterContext = createContext(null);
const LEADS_KEY = "lumorix_leads";
const POSTS_KEY = "lumorix_posts";

function normalizePath(path) {
  if (!path) return "/";
  const clean = path.split("?")[0].replace(/\/+$/, "");
  return clean || "/";
}

function readStore(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStore(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter must be used inside RouterContext");
  return ctx;
}

function Link({ to, className, children, onClick, ...props }) {
  const { navigate } = useRouter();
  return (
    <a
      href={to}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
        navigate(to);
      }}
      {...props}
    >
      {children}
    </a>
  );
}

function Logo({ inverse = false }) {
  const src = inverse ? "/assets/lumorix-logo-white.png" : "/assets/lumorix-logo-primary.png";
  return (
    <Link to="/" className={`logo ${inverse ? "logo-inverse" : ""}`} aria-label="LumoriX home">
      <img src={src} alt="LumoriX Next-Generation Energy Market" />
    </Link>
  );
}

function App() {
  const [path, setPath] = useState(normalizePath(window.location.pathname));

  const navigate = (nextPath) => {
    const normalized = normalizePath(nextPath);
    if (normalized !== path) {
      window.history.pushState({}, "", normalized);
      setPath(normalized);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const onPop = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const router = useMemo(() => ({ path, navigate }), [path]);
  useCardAccentLines(path);

  return (
    <RouterContext.Provider value={router}>
      <div className="app-shell">
        <Header />
        <main>{renderRoute(path)}</main>
        <Footer />
        <MobileLeadBar />
      </div>
    </RouterContext.Provider>
  );
}

function useCardAccentLines(path) {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const selector = [
      ".plan-card",
      ".detail-card",
      ".process-card",
      ".article-card",
      ".compare-grid article",
      ".product-row",
      ".province-card",
      ".sitemap-row",
      ".icon-line",
      ".admin-panel",
      ".lead-row",
      ".post-row",
      ".faq-preview-grid details",
      ".faq-section details",
    ].join(", ");
    const cards = Array.from(document.querySelectorAll(selector));
    const cleanups = cards.map((card) => {
      const existingLines = Array.from(card.querySelectorAll(":scope > .gsap-accent-line"));
      existingLines.slice(1).forEach((extraLine) => extraLine.remove());
      let line = existingLines[0];
      if (line && line.tagName !== "DIV") {
        line.remove();
        line = null;
      }
      if (!line) {
        line = document.createElement("div");
        line.className = "gsap-accent-line";
        line.setAttribute("aria-hidden", "true");
        card.appendChild(line);
      }

      gsap.set(line, { xPercent: -120, autoAlpha: 0 });
      gsap.set(card, { transformOrigin: "center center" });

      const enter = () => {
        card.__lumorixAccent?.kill();
        gsap.killTweensOf([card, line]);
        gsap.to(card, {
          y: -3,
          boxShadow: "0 22px 60px rgba(10, 10, 10, 0.14)",
          duration: 0.22,
          ease: "power2.out",
          overwrite: "auto",
        });

        if (reduceMotion) {
          gsap.to(line, { xPercent: 0, autoAlpha: 1, duration: 0.18, ease: "power2.out" });
          return;
        }

        card.__lumorixAccent = gsap
          .timeline({ repeat: -1, yoyo: true, defaults: { ease: "sine.inOut" } })
          .set(line, { autoAlpha: 1 })
          .fromTo(line, { xPercent: -120 }, { xPercent: 120, duration: 1.15 });
      };

      const leave = () => {
        card.__lumorixAccent?.kill();
        card.__lumorixAccent = null;
        gsap.to(card, {
          y: 0,
          duration: 0.22,
          ease: "power2.out",
          clearProps: "transform,boxShadow",
          overwrite: "auto",
        });
        gsap.to(line, {
          xPercent: -120,
          autoAlpha: 0,
          duration: 0.2,
          ease: "power2.out",
          overwrite: "auto",
        });
      };

      card.addEventListener("mouseenter", enter);
      card.addEventListener("mouseleave", leave);
      card.addEventListener("focusin", enter);
      card.addEventListener("focusout", leave);

      return () => {
        card.removeEventListener("mouseenter", enter);
        card.removeEventListener("mouseleave", leave);
        card.removeEventListener("focusin", enter);
        card.removeEventListener("focusout", leave);
        card.__lumorixAccent?.kill();
        gsap.killTweensOf([card, line]);
      };
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [path]);
}

function renderRoute(path) {
  if (path === "/") return <HomePage />;
  if (path === "/products") return <ProductsPage />;
  if (path.startsWith("/products/")) return <ProductDetailPage slug={path.split("/").pop()} />;
  if (path === "/plans-pricing" || path === "/solar-subscription" || path === "/lumorix-flex") {
    return <PlansPage focus={path} />;
  }
  if (path === "/calculator") return <CalculatorPage />;
  if (path === "/learn" || path === "/go-solar-center/solar-articles" || path === "/learn/news") {
    return <LearnPage />;
  }
  if (path.startsWith("/learn/articles/") || path.startsWith("/go-solar-center/solar-articles/")) {
    return <ArticlePage slug={path.split("/").pop()} />;
  }
  if (path === "/go-solar-center/solar-faq" || path.startsWith("/go-solar-center/solar-faq/")) return <FaqPage />;
  if (path === "/solar-by-state") return <ProvinceIndexPage />;
  if (path.startsWith("/solar-by-state/")) return <ProvincePage slug={path.split("/").pop()} />;
  if (["/free-solar-quote", "/get-solar-quote", "/free-solar-quote/brightbox", "/free-solar-quote/heat"].includes(path)) {
    return <QuotePage source={path} />;
  }
  if (path === "/contact-us") return <ContactPage />;
  if (path === "/company") return <CompanyPage />;
  if (path === "/admin") return <AdminPage />;
  if (path === "/site-map") return <SiteMapPage />;

  const template = businessRoutes.find(([route]) => route === path);
  if (template) return <BusinessTemplate route={template} />;

  return <GeneratedTemplate path={path} />;
}

function Header() {
  const { path } = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [path]);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Logo inverse />
        <nav className={`main-nav ${open ? "is-open" : ""}`} aria-label="Primary navigation">
          {navItems.map((item) => (
            <div className="nav-group" key={item.href}>
              <Link className={path === item.href ? "active" : ""} to={item.href}>
                {item.label}
              </Link>
              <div className="mega-menu">
                {item.children.map(([label, href]) => (
                  <Link key={href} to={href}>
                    <ChevronRight size={15} />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="header-actions">
          <a className="phone-link" href={`tel:${brand.phone}`}>
            <Phone size={16} />
            {brand.phone}
          </a>
          <Link className="ghost-button small" to="/admin">
            เข้าระบบ
          </Link>
          <Link className="primary-button small" to="/free-solar-quote">
            ขอใบเสนอราคา
          </Link>
          <button className="menu-button" type="button" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function HomePage() {
  return (
    <>
      <section className="hero-section">
        <div className="hero-media" />
        <div className="hero-shade" />
        <div className="hero-content">
          <div className="hero-copy">
            <h1>ENERGY FOR THE NEXT ERA</h1>
            <strong className="hero-rank">The #1 home solar & storage company in Thailand</strong>
            <p>
              พลังงานอัจฉริยะสำหรับบ้าน ธุรกิจ และโครงการอสังหา เชื่อมโซลาร์ แบตเตอรี่ EV Charging และตลาดพลังงานไว้ในระบบเดียว
            </p>
            <div className="button-row">
              <Link className="primary-button" to="/free-solar-quote">
                ขอใบเสนอราคา <ArrowRight size={18} />
              </Link>
              <Link className="ghost-button" to="/plans-pricing">
                ดูแพ็กเกจ
              </Link>
            </div>
            <div className="hero-proof">
              <MiniProof icon={<ShieldCheck />} title="ดูแลครบวงจร" text="ตั้งแต่สำรวจจนถึง monitoring" />
              <MiniProof icon={<Gauge />} title="ประหยัดแบบเห็นผล" text="วิเคราะห์ค่าไฟและโหลดจริง" />
              <MiniProof icon={<MonitorSmartphone />} title="ควบคุมผ่านแอป" text="ข้อมูลพลังงานแบบ real-time" />
            </div>
          </div>
          <LeadForm className="hero-form" source="Home hero" compact />
        </div>
      </section>

      <PlansStrip />
      <ProductEcosystem />
      <AppPreview />
      <ProcessSection />
      <MarketSection />
      <ContentPreview />
      <FaqPreview />
      <BottomCta />
    </>
  );
}

function MiniProof({ icon, title, text }) {
  return (
    <div className="mini-proof">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <small>{text}</small>
      </div>
    </div>
  );
}

function LeadForm({ source = "Website", className = "", compact = false }) {
  const [values, setValues] = useState({
    name: "",
    phone: "",
    email: "",
    province: "",
    propertyType: "บ้านพักอาศัย",
    monthlyBill: "",
    interest: "Solar + Battery",
    notes: "",
  });
  const [status, setStatus] = useState("");

  const update = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    if (!values.name.trim() || !values.phone.trim()) {
      setStatus("กรุณากรอกชื่อและเบอร์โทรศัพท์");
      return;
    }
    const lead = {
      id: crypto.randomUUID(),
      ...values,
      source,
      createdAt: new Date().toISOString(),
      status: "new",
    };
    const leads = readStore(LEADS_KEY, []);
    writeStore(LEADS_KEY, [lead, ...leads]);
    setStatus("บันทึก lead แล้ว ทีม LumoriX จะติดต่อกลับ");
    setValues({
      name: "",
      phone: "",
      email: "",
      province: "",
      propertyType: "บ้านพักอาศัย",
      monthlyBill: "",
      interest: "Solar + Battery",
      notes: "",
    });
  };

  return (
    <form className={`lead-form ${className}`} onSubmit={submit}>
      <h2>{compact ? "เริ่มต้นอนาคตพลังงานของคุณ" : "ขอคำปรึกษาและใบเสนอราคา"}</h2>
      <p>กรอกข้อมูลเพื่อรับข้อเสนอที่เหมาะกับบ้านหรือธุรกิจของคุณ</p>
      <div className="form-grid">
        <label>
          ชื่อ-นามสกุล
          <input name="name" value={values.name} onChange={update} placeholder="ชื่อของคุณ" />
        </label>
        <label>
          เบอร์โทรศัพท์
          <input name="phone" value={values.phone} onChange={update} placeholder="08x-xxx-xxxx" inputMode="tel" />
        </label>
        <label>
          อีเมล
          <input name="email" value={values.email} onChange={update} placeholder="you@email.com" inputMode="email" />
        </label>
        <label>
          จังหวัด
          <input name="province" value={values.province} onChange={update} placeholder="เช่น กรุงเทพฯ" />
        </label>
        <label>
          ประเภทสถานที่
          <select name="propertyType" value={values.propertyType} onChange={update}>
            <option>บ้านพักอาศัย</option>
            <option>ธุรกิจ / SME</option>
            <option>โรงงาน / คลังสินค้า</option>
            <option>โครงการอสังหา</option>
          </select>
        </label>
        <label>
          ค่าไฟต่อเดือน
          <input name="monthlyBill" value={values.monthlyBill} onChange={update} placeholder="เช่น 4,500" inputMode="numeric" />
        </label>
      </div>
      {!compact && (
        <>
          <label>
            สนใจโซลูชัน
            <select name="interest" value={values.interest} onChange={update}>
              <option>Solar + Battery</option>
              <option>Solar Subscription</option>
              <option>EV Charging</option>
              <option>Business Energy</option>
              <option>Home Builder Program</option>
            </select>
          </label>
          <label>
            รายละเอียดเพิ่มเติม
            <textarea name="notes" value={values.notes} onChange={update} rows="4" placeholder="บอกเป้าหมายหรือปัญหาค่าไฟของคุณ" />
          </label>
        </>
      )}
      <button className="primary-button full" type="submit">
        ขอใบเสนอราคา
      </button>
      {status && <div className="form-status">{status}</div>}
      <small className="form-note">เดโมนี้บันทึกข้อมูลในเครื่องของคุณผ่าน localStorage และพร้อมต่อ CRM/API ภายหลัง</small>
    </form>
  );
}

function PlansStrip() {
  return (
    <section className="section light-section">
      <div className="section-heading split">
        <div>
          <h2>แพ็กเกจสมัครใช้งาน</h2>
          <p>เลือกโมเดลที่ตรงกับค่าไฟ พฤติกรรมใช้งาน และแผนเพิ่มแบตเตอรี่หรือ EV ในอนาคต</p>
        </div>
        <Link className="text-link" to="/plans-pricing">
          เปรียบเทียบทั้งหมด <ArrowRight size={17} />
        </Link>
      </div>
      <div className="plan-grid">
        {plans.map((plan) => (
          <article className={`plan-card ${plan.badge ? "featured" : ""}`} key={plan.name}>
            {plan.badge && <span className="plan-badge">{plan.badge}</span>}
            <h3>{plan.name}</h3>
            <p>{plan.audience}</p>
            <div className="plan-price">
              {plan.price === "Custom" ? "ราคาพิเศษ" : `${plan.price} บาท/เดือน`}
            </div>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>
                  <CheckCircle2 size={17} />
                  {feature}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProductEcosystem() {
  return (
    <section className="section ecosystem-section">
      <div className="section-heading center">
        <h2>ระบบนิเวศพลังงานครบวงจร</h2>
        <p>โซลาร์ แบตเตอรี่ EV Charging Smart Home และ monitoring ทำงานร่วมกันในแพลตฟอร์มเดียว</p>
      </div>
      <div className="ecosystem-layout">
        <img src="/assets/product-ecosystem.png" alt="LumoriX product ecosystem" />
        <div className="product-list">
          {products.map((product) => (
            <Link className="product-row" key={product.slug} to={product.slug === "battery" ? "/add-a-battery" : `/products/${product.slug}`}>
              <ProductIcon type={product.icon} />
              <div>
                <strong>{product.title}</strong>
                <span>{product.subtitle}</span>
              </div>
              <ArrowRight size={18} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductIcon({ type }) {
  const icons = {
    solar: Sun,
    battery: BatteryCharging,
    ev: PlugZap,
    home: Home,
    monitoring: BarChart3,
  };
  const Icon = icons[type] || Zap;
  return <Icon size={24} />;
}

function AppPreview() {
  return (
    <section className="app-preview">
      <div className="app-copy">
        <h2>ค่าไฟกำลังขยับขึ้น บ้านที่ผลิตไฟเองได้จึงได้เปรียบ</h2>
        <p>
          แสดงตัวเลขให้ลูกค้าเห็นทันทีว่าบิลค่าไฟวันนี้และแรงกดดันในอนาคตทำให้โซลาร์พร้อมแบตเตอรี่เป็นการตัดสินใจที่จำเป็น
        </p>
        <div className="button-row">
          <Link className="primary-button" to="/free-solar-quote">
            วิเคราะห์บิลค่าไฟ <ArrowRight size={18} />
          </Link>
          <Link className="ghost-button" to="/plans-pricing">
            ดูแผนประหยัด
          </Link>
        </div>
      </div>
      <div className="ad-insight-panel" aria-label="Electricity price pressure insight">
        <div className="ad-panel-heading">
          <span>Electricity Price Signal</span>
          <strong>พ.ค.-ส.ค. 2569</strong>
        </div>
        <div className="slot-ad-grid">
          <SlotStat value={3.95} decimals={2} suffix=" บาท/หน่วย" label="ค่าไฟเฉลี่ยปัจจุบัน" note="ไม่รวม VAT" />
          <SlotStat value={2} decimals={0} suffix="%" label="ขยับจากงวดก่อน" note="จากฐาน 3.88 บาท/หน่วย" />
          <SlotStat value={4.59} decimals={2} suffix=" บาท/หน่วย" label="กรณีต้นทุนสูง" note="scenario จากช่วงรับฟังความคิดเห็น" />
        </div>
        <TariffForecastChart />
        <div className="ad-panel-note">
          อ้างอิงข้อมูล กกพ. ค่าไฟเฉลี่ยปัจจุบัน 3.95 บาท/หน่วย และช่วง scenario 3.95-4.59 บาท/หน่วย ข้อมูล forecast เป็นภาพจำลองเพื่อช่วยประเมินความเสี่ยงค่าไฟ
        </div>
      </div>
    </section>
  );
}

function SlotStat({ value, decimals = 0, suffix = "", label, note }) {
  return (
    <div className="slot-stat-card">
      <strong>
        <SlotNumber value={value} decimals={decimals} />
        {suffix}
      </strong>
      <span>{label}</span>
      <small>{note}</small>
    </div>
  );
}

function SlotNumber({ value, decimals = 0 }) {
  const ref = useRef(null);

  useEffect(() => {
    const target = ref.current;
    if (!target) return undefined;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const proxy = { value: 0 };
    const format = (input) =>
      Number(input).toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

    if (reduceMotion) {
      target.textContent = format(value);
      return undefined;
    }

    const tween = gsap.to(proxy, {
      value,
      duration: 1.55,
      ease: "power4.out",
      snap: { value: decimals ? 0.01 : 1 },
      onUpdate: () => {
        target.textContent = format(proxy.value);
      },
    });

    return () => tween.kill();
  }, [value, decimals]);

  return <span className="slot-number" ref={ref}>0</span>;
}

function TariffForecastChart() {
  const chartRef = useRef(null);
  const points = [
    { label: "งวดก่อน", value: 3.88, detail: "ม.ค.-เม.ย." },
    { label: "ปัจจุบัน", value: 3.95, detail: "พ.ค.-ส.ค." },
    { label: "คาดการณ์", value: 4.12, detail: "Q4 low" },
    { label: "แรงกดดัน", value: 4.35, detail: "Q1 mid" },
    { label: "ต้นทุนสูง", value: 4.59, detail: "stress" },
  ];
  const max = 4.7;
  const min = 3.7;
  const width = 640;
  const height = 300;
  const left = 48;
  const right = 604;
  const top = 42;
  const bottom = 222;
  const coords = points.map((point, index) => {
    const x = left + (index / (points.length - 1)) * (right - left);
    const y = bottom - ((point.value - min) / (max - min)) * (bottom - top);
    return { ...point, x, y };
  });
  const linePath = coords.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${coords.at(-1).x.toFixed(1)} ${bottom} L ${coords[0].x.toFixed(1)} ${bottom} Z`;

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return undefined;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const line = chart.querySelector(".tariff-line-path");
    const area = chart.querySelector(".tariff-area-path");
    const dots = chart.querySelectorAll(".tariff-dot-group");
    const length = line.getTotalLength();

    gsap.set(line, { strokeDasharray: length, strokeDashoffset: reduceMotion ? 0 : length });
    gsap.set(area, { autoAlpha: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 12 });
    gsap.set(dots, { autoAlpha: reduceMotion ? 1 : 0, scale: reduceMotion ? 1 : 0.65, transformOrigin: "center center" });

    if (reduceMotion) return undefined;

    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    timeline
      .to(line, { strokeDashoffset: 0, duration: 1.35 })
      .to(area, { autoAlpha: 1, y: 0, duration: 0.55 }, "-=0.85")
      .to(dots, { autoAlpha: 1, scale: 1, duration: 0.42, stagger: 0.08 }, "-=0.35");

    return () => timeline.kill();
  }, []);

  return (
    <div className="tariff-chart" aria-label="กราฟค่าไฟปัจจุบันและคาดการณ์">
      <div className="tariff-chart-head">
        <h3>กราฟค่าไฟปัจจุบันและแนวโน้มขาขึ้น</h3>
        <span>บาท/หน่วย</span>
      </div>
      <div className="tariff-line-wrap" ref={chartRef}>
        <svg className="tariff-line-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="ค่าไฟต่อหน่วยจากปัจจุบันและกรณีคาดการณ์">
          <defs>
            <linearGradient id="tariffLineGradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="38%" stopColor="#ff4b4b" />
              <stop offset="100%" stopColor="#d60000" />
            </linearGradient>
            <linearGradient id="tariffAreaGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#d60000" stopOpacity="0.38" />
              <stop offset="62%" stopColor="#d60000" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#d60000" stopOpacity="0" />
            </linearGradient>
            <filter id="tariffGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {[3.8, 4.0, 4.2, 4.4, 4.6].map((tick) => {
            const y = bottom - ((tick - min) / (max - min)) * (bottom - top);
            return (
              <g className="tariff-grid-line" key={tick}>
                <line x1={left} x2={right} y1={y} y2={y} />
                <text x={left - 12} y={y + 4}>{tick.toFixed(1)}</text>
              </g>
            );
          })}
          <line className="tariff-current-line" x1={coords[1].x} x2={coords[1].x} y1={top - 4} y2={bottom + 8} />
          <path className="tariff-area-path" d={areaPath} />
          <path className="tariff-line-path" d={linePath} pathLength="1" />
          {coords.map((point, index) => (
            <g className={`tariff-dot-group ${index === 1 ? "current" : ""} ${index > 1 ? "forecast" : ""}`} transform={`translate(${point.x} ${point.y})`} key={point.label}>
              <circle className="tariff-dot-halo" r="14" />
              <circle className="tariff-dot" r="5.5" />
              <text className="tariff-dot-value" y="-22">{point.value.toFixed(2)}</text>
            </g>
          ))}
        </svg>
        <div className="tariff-line-labels">
          {points.map((point, index) => (
            <div className={index > 1 ? "forecast" : ""} key={point.label}>
              <span>{point.label}</span>
              <small>{point.detail}</small>
            </div>
          ))}
        </div>
      </div>
      <div className="tariff-arrow">
        <span>ต้นทุนพลังงานและ Ft ยังเป็นความเสี่ยงต่อบิลค่าไฟ</span>
        <ArrowRight size={18} />
      </div>
    </div>
  );
}

function Metric({ value, label }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function ProcessSection() {
  return (
    <section className="section process-section">
      <div className="section-heading split">
        <div>
          <h2>ก้าวสู่พลังงานสะอาดใน 4 ขั้นตอน</h2>
          <p>ลดความซับซ้อนของการติดตั้งด้วยทีมสำรวจ วิศวกร ซอฟต์แวร์ และบริการหลังการขายในระบบเดียว</p>
        </div>
        <Link className="ghost-button dark" to="/contact-us">
          นัดหมายทีมงาน
        </Link>
      </div>
      <div className="process-grid">
        {processSteps.map(([num, title, text]) => (
          <article className="process-card" key={num}>
            <span className="process-step-number">{num}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <div className="stats-row">
        {stats.map(([value, label]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function MarketSection() {
  return (
    <section className="market-section">
      <img src="/assets/market-grid.png" alt="Connected energy market grid" />
      <div className="market-copy">
        <h2>จากแผงบนหลังคา สู่ตลาดพลังงานอัจฉริยะ</h2>
        <p>
          โมเดลธุรกิจของ LumoriX รวม hardware, subscription, monitoring, service และ energy marketplace เพื่อให้บ้านและธุรกิจมีพลังงานที่ยืดหยุ่นขึ้น
        </p>
        <div className="market-points">
          <span>Solar Subscription</span>
          <span>Battery Fleet</span>
          <span>EV Load Control</span>
          <span>Grid Services Ready</span>
        </div>
      </div>
    </section>
  );
}

function ContentPreview() {
  const posts = getAllPosts().slice(0, 4);
  return (
    <section className="section light-section">
      <div className="section-heading split">
        <div>
          <h2>บทความและข่าวสารพลังงาน</h2>
          <p>คอนเทนต์ที่โพสต์จากระบบแอดมินจะแสดงรวมกับบทความ seed บนหน้าเรียนรู้ทันที</p>
        </div>
        <Link className="text-link" to="/learn">
          ดูทั้งหมด <ArrowRight size={17} />
        </Link>
      </div>
      <ArticleGrid posts={posts} />
    </section>
  );
}

function FaqPreview() {
  return (
    <section className="section faq-preview-section">
      <div className="section-heading split">
        <div>
          <h2>FAQs</h2>
          <p>คำถามสำคัญก่อนเริ่มใช้โซลาร์ แบตเตอรี่ และบริการ subscription กับ LumoriX</p>
        </div>
        <Link className="text-link" to="/go-solar-center/solar-faq">
          ดู FAQ ทั้งหมด <ArrowRight size={17} />
        </Link>
      </div>
      <div className="faq-preview-grid">
        {faqs.slice(0, 6).map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function BottomCta() {
  return (
    <section className="bottom-cta">
      <div>
        <h2>พร้อมเปลี่ยนค่าไฟให้เป็นพลังงานของคุณ?</h2>
        <p>ส่งข้อมูลค่าไฟและประเภทสถานที่ ทีม LumoriX จะช่วยออกแบบแพ็กเกจที่เหมาะกับคุณ</p>
      </div>
      <Link className="primary-button" to="/free-solar-quote">
        เริ่มประเมินระบบ <ArrowRight size={18} />
      </Link>
    </section>
  );
}

function PlansPage() {
  return (
    <PageFrame
      title="แพ็กเกจ & ราคา"
      subtitle="โมเดลคล้าย solar-as-a-service: เริ่มต้นง่าย ดูแลครบ และขยายไปสู่แบตเตอรี่ EV และระบบจัดการพลังงาน"
      image="/assets/hero-smart-home.png"
    >
      <PlansStrip />
      <section className="section compare-section">
        <div className="section-heading center">
          <h2>เลือกโมเดลการเป็นเจ้าของ</h2>
          <p>รองรับทั้ง subscription, ซื้อขาด, เพิ่มแบตเตอรี่ภายหลัง และแผนธุรกิจแบบ SLA</p>
        </div>
        <div className="compare-grid">
          {[
            ["Subscription", "จ่ายรายเดือน ดูแลระบบครบ เหมาะกับเริ่มต้นโดยลดเงินก้อนแรก"],
            ["Purchase", "ซื้อระบบเต็มรูปแบบ เหมาะกับบ้านที่ต้องการถือครองสินทรัพย์"],
            ["Battery Add-on", "เพิ่มแบตเตอรี่และปรับ energy mode ตามพฤติกรรมใช้ไฟ"],
            ["Business SLA", "สัญญาดูแลพร้อมรายงานประหยัดค่าไฟและ ESG"],
          ].map(([title, text]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <CalculatorPanel />
    </PageFrame>
  );
}

function ProductsPage() {
  return (
    <PageFrame
      title="ผลิตภัณฑ์"
      subtitle="ฮาร์ดแวร์และซอฟต์แวร์ที่ทำให้บ้านหรือธุรกิจกลายเป็น energy node ที่วัดผลและดูแลได้"
      image="/assets/product-ecosystem.png"
      light
    >
      <ProductEcosystem />
      <section className="section">
        <div className="product-detail-grid">
          {products.map((product) => (
            <article className="detail-card" key={product.slug}>
              <ProductIcon type={product.icon} />
              <h3>{product.title}</h3>
              <p>{product.subtitle}</p>
              <ul>
                {product.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <Link className="text-link" to={product.slug === "battery" ? "/add-a-battery" : `/products/${product.slug}`}>
                รายละเอียด <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </PageFrame>
  );
}

function ProductDetailPage({ slug }) {
  const product = products.find((item) => item.slug === slug) || products.find((item) => item.slug === "battery");
  return (
    <PageFrame title={product.title} subtitle={product.subtitle} image="/assets/product-ecosystem.png" light>
      <section className="section two-column">
        <div>
          <h2>{product.title} ที่เชื่อมกับแพลตฟอร์ม LumoriX</h2>
          <p>
            ทุกผลิตภัณฑ์ถูกออกแบบให้เชื่อมกับ monitoring, service workflow และระบบเก็บข้อมูลลูกค้า เพื่อให้ทีมขายและทีมวิศวกรรมทำงานต่อกันได้จริง
          </p>
          <ul className="check-list">
            {product.points.map((point) => (
              <li key={point}>
                <CheckCircle2 size={18} />
                {point}
              </li>
            ))}
          </ul>
          <div className="button-row">
            <Link className="primary-button" to="/free-solar-quote">
              ขอคำแนะนำ
            </Link>
            <Link className="ghost-button dark" to="/products">
              กลับไปผลิตภัณฑ์
            </Link>
          </div>
        </div>
        <LeadForm source={`Product ${product.title}`} />
      </section>
    </PageFrame>
  );
}

function CalculatorPage() {
  return (
    <PageFrame title="Solar Calculator" subtitle="ประเมินเบื้องต้นจากค่าไฟรายเดือนและรูปแบบการใช้งาน" image="/assets/hero-smart-home.png">
      <CalculatorPanel />
      <section className="section two-column">
        <div>
          <h2>ผลลัพธ์เป็นจุดเริ่มต้น ไม่ใช่ใบเสนอราคาสุดท้าย</h2>
          <p>ทีม LumoriX จะตรวจโหลดจริง พื้นที่ติดตั้ง ทิศหลังคา และเงื่อนไขไฟฟ้าก่อนยืนยันแพ็กเกจ</p>
        </div>
        <LeadForm source="Calculator" />
      </section>
    </PageFrame>
  );
}

function CalculatorPanel() {
  const [bill, setBill] = useState(4500);
  const [profile, setProfile] = useState("home");
  const kw = Math.max(3, Math.min(30, Math.round((bill / (profile === "business" ? 750 : 950)) * 10) / 10));
  const saving = Math.round(bill * (profile === "business" ? 0.42 : 0.35));
  const subscription = Math.max(1590, Math.round(kw * 620));

  return (
    <section className="section calculator-section">
      <div className="calculator-panel">
        <div>
          <h2>คำนวณขนาดระบบเบื้องต้น</h2>
          <p>ปรับค่าไฟรายเดือนเพื่อดูแพ็กเกจที่ใกล้เคียง</p>
          <label>
            ค่าไฟต่อเดือน: <strong>{bill.toLocaleString()} บาท</strong>
            <input type="range" min="1500" max="50000" step="500" value={bill} onChange={(event) => setBill(Number(event.target.value))} />
          </label>
          <div className="segment-control">
            <button className={profile === "home" ? "selected" : ""} onClick={() => setProfile("home")} type="button">
              บ้าน
            </button>
            <button className={profile === "business" ? "selected" : ""} onClick={() => setProfile("business")} type="button">
              ธุรกิจ
            </button>
          </div>
        </div>
        <div className="calculator-result">
          <Metric value={`${kw} kWp`} label="ขนาดระบบแนะนำ" />
          <Metric value={`${saving.toLocaleString()} บาท`} label="โอกาสประหยัดต่อเดือน" />
          <Metric value={`${subscription.toLocaleString()} บาท`} label="subscription เริ่มต้นโดยประมาณ" />
          <Link className="primary-button full" to="/free-solar-quote">
            ส่งข้อมูลให้ทีมประเมิน
          </Link>
        </div>
      </div>
    </section>
  );
}

function LearnPage() {
  const [query, setQuery] = useState("");
  const posts = getAllPosts().filter((post) => `${post.title} ${post.category}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <PageFrame title="ศูนย์เรียนรู้" subtitle="บทความ ข่าวสาร FAQ และคอนเทนต์ที่ทีม LumoriX โพสต์ได้เองจากระบบแอดมิน" image="/assets/market-grid.png">
      <section className="section light-section">
        <div className="toolbar">
          <label className="search-box">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาบทความหรือหมวดหมู่" />
          </label>
          <Link className="ghost-button dark" to="/admin">
            <PenLine size={17} />
            โพสต์คอนเทนต์
          </Link>
        </div>
        <ArticleGrid posts={posts} />
      </section>
    </PageFrame>
  );
}

function ArticleGrid({ posts }) {
  return (
    <div className="article-grid">
      {posts.map((post) => (
        <article className="article-card" key={post.id || post.slug}>
          <span>{post.category}</span>
          <h3>{post.title}</h3>
          <p>{post.excerpt}</p>
          <time>{formatDate(post.date)}</time>
          <Link className="text-link" to={`/go-solar-center/solar-articles/${post.slug}`}>
            อ่านต่อ <ArrowRight size={16} />
          </Link>
        </article>
      ))}
    </div>
  );
}

function ArticlePage({ slug }) {
  const post =
    getAllPosts().find((item) => item.slug === slug) ||
    generateArticleFromSlug(slug);
  return (
    <PageFrame title={post.title} subtitle={post.excerpt} image="/assets/market-grid.png">
      <section className="section article-layout">
        <article className="article-body">
          <span className="article-category">{post.category}</span>
          <time>{formatDate(post.date)}</time>
          <p>{post.body}</p>
          <p>
            หากต้องการประเมินกับบ้านหรือธุรกิจจริง ให้ส่งข้อมูลค่าไฟและสถานที่ติดตั้ง ทีม LumoriX จะช่วยออกแบบระบบที่เหมาะสม
          </p>
        </article>
        <LeadForm source={`Article ${slug}`} compact />
      </section>
    </PageFrame>
  );
}

function FaqPage() {
  return (
    <PageFrame title="Solar FAQ" subtitle="คำถามที่พบบ่อยเกี่ยวกับโซลาร์ แบตเตอรี่ EV Charging และบริการ subscription" image="/assets/hero-smart-home.png">
      <section className="section faq-section">
        {faqs.map(([question, answer]) => (
          <details key={question} open>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </section>
    </PageFrame>
  );
}

function ProvinceIndexPage() {
  return (
    <PageFrame title="Solar by Province" subtitle="หน้า landing สำหรับพื้นที่ให้บริการหลัก คล้าย state pages แต่ปรับเป็นจังหวัดในไทย" image="/assets/hero-smart-home.png">
      <section className="section province-grid">
        {provinces.map((slug) => (
          <Link className="province-card" to={`/solar-by-state/${slug}`} key={slug}>
            <MapPin size={20} />
            <span>{provinceNames[slug]}</span>
            <ArrowRight size={16} />
          </Link>
        ))}
      </section>
    </PageFrame>
  );
}

function ProvincePage({ slug }) {
  const name = provinceNames[slug] || titleFromSlug(slug);
  return (
    <PageFrame title={`โซลาร์และแบตเตอรี่ใน${name}`} subtitle={`แพ็กเกจ LumoriX สำหรับบ้าน ธุรกิจ และโครงการในพื้นที่${name}`} image="/assets/hero-smart-home.png">
      <section className="section two-column">
        <div>
          <h2>บริการพื้นที่{name}</h2>
          <p>ทีม LumoriX ประเมินค่าไฟ พื้นที่หลังคา และรูปแบบโหลดของพื้นที่ เพื่อออกแบบแพ็กเกจ subscription หรือซื้อขาดที่เหมาะสม</p>
          <ul className="check-list">
            <li>
              <CheckCircle2 size={18} />
              ประเมินค่าไฟและขนาดระบบ
            </li>
            <li>
              <CheckCircle2 size={18} />
              สำรวจหน้างานและเสนอแบบติดตั้ง
            </li>
            <li>
              <CheckCircle2 size={18} />
              ดูแลหลังติดตั้งผ่าน monitoring
            </li>
          </ul>
        </div>
        <LeadForm source={`Province ${name}`} />
      </section>
    </PageFrame>
  );
}

function QuotePage({ source }) {
  return (
    <PageFrame title="รับข้อเสนอ LumoriX" subtitle="เริ่มจากข้อมูลพื้นฐาน ทีมขายและวิศวกรจะใช้เป็น lead สำหรับประเมินระบบ" image="/assets/hero-smart-home.png">
      <section className="section two-column">
        <div>
          <h2>สิ่งที่ทีม LumoriX จะประเมิน</h2>
          <div className="icon-list">
            <IconLine icon={<ClipboardCheck />} title="ค่าไฟและโหลด" text="ดูพฤติกรรมใช้ไฟเพื่อเลือกขนาดระบบ" />
            <IconLine icon={<Home />} title="พื้นที่ติดตั้ง" text="พื้นที่หลังคา ทิศทางแดด และข้อจำกัดหน้างาน" />
            <IconLine icon={<BatteryCharging />} title="แผนอนาคต" text="แบตเตอรี่ EV charging และ smart home" />
          </div>
        </div>
        <LeadForm source={source} />
      </section>
    </PageFrame>
  );
}

function ContactPage() {
  return (
    <PageFrame title="ติดต่อ LumoriX" subtitle="คุยกับทีมพลังงานอัจฉริยะสำหรับบ้าน ธุรกิจ และโครงการอสังหาริมทรัพย์" image="/assets/market-grid.png">
      <section className="section contact-section">
        <div className="contact-grid">
          <IconLine icon={<Phone />} title="โทร" text={brand.phone} />
          <IconLine icon={<Mail />} title="อีเมล" text={brand.email} />
          <IconLine icon={<MapPin />} title="LINE" text={brand.line} />
        </div>
        <LeadForm source="Contact page" />
      </section>
    </PageFrame>
  );
}

function CompanyPage() {
  return (
    <PageFrame
      title="Built for the Future"
      subtitle="LumoriX คือแพลตฟอร์มซื้อขายพลังงานยุคใหม่ที่เชื่อมเทคโนโลยีเข้ากับพลังงานสะอาด เพื่อสร้างอนาคตที่ยั่งยืน"
      image="/assets/market-grid.png"
    >
      <section className="section two-column">
        <div>
          <h2>Smart. Reliable. Forward-Thinking. Sustainable.</h2>
          <p>
            เรานำโมเดลธุรกิจแบบ solar subscription, hardware bundle, monitoring, service และ marketplace มาปรับให้เหมาะกับตลาดไทยและภูมิภาค
          </p>
        </div>
        <div className="brand-voice">
          {["Innovation", "Intelligence", "Connectivity", "Sustainability", "Efficiency"].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>
      <ProcessSection />
    </PageFrame>
  );
}

function BusinessTemplate({ route }) {
  const [, title, description] = route;
  return (
    <PageFrame title={title} subtitle={description} image="/assets/hero-smart-home.png">
      <section className="section two-column">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
          <p>
            หน้าในกลุ่มนี้ถูกออกแบบให้เทียบเคียง information architecture ของ Sunrun แต่ปรับข้อความและข้อเสนอเป็นของ LumoriX สำหรับตลาดไทย
          </p>
          <div className="button-row">
            <Link className="primary-button" to="/free-solar-quote">
              ขอใบเสนอราคา
            </Link>
            <Link className="ghost-button dark" to="/learn">
              อ่านข้อมูลเพิ่ม
            </Link>
          </div>
        </div>
        <LeadForm source={title} />
      </section>
      <ProductEcosystem />
    </PageFrame>
  );
}

function GeneratedTemplate({ path }) {
  const slug = path.split("/").filter(Boolean).pop() || "lumorix";
  const title = titleFromSlug(slug);
  return (
    <PageFrame title={title} subtitle={`LumoriX equivalent page for ${path}`} image="/assets/market-grid.png">
      <section className="section two-column">
        <div>
          <h2>{title}</h2>
          <p>
            Route นี้รองรับเป็นหน้า template สำหรับ content หรือ campaign เฉพาะทาง เช่น promotion, grid program, product partner, policy และ landing page
            ที่มีรูปแบบธุรกิจใกล้เคียง Sunrun
          </p>
          <ul className="check-list">
            <li>
              <CheckCircle2 size={18} />
              พร้อมทำ SEO landing page
            </li>
            <li>
              <CheckCircle2 size={18} />
              เก็บ lead จากฟอร์มเดียวกับระบบหลัก
            </li>
            <li>
              <CheckCircle2 size={18} />
              เชื่อมต่อระบบโพสต์คอนเทนต์และบทความ
            </li>
          </ul>
        </div>
        <LeadForm source={`Generated ${path}`} />
      </section>
    </PageFrame>
  );
}

function AdminPage() {
  const [leads, setLeads] = useState(() => readStore(LEADS_KEY, []));
  const [posts, setPosts] = useState(() => readStore(POSTS_KEY, []));
  const [postForm, setPostForm] = useState({
    title: "",
    category: "News",
    excerpt: "",
    body: "",
  });

  const savePost = (event) => {
    event.preventDefault();
    if (!postForm.title.trim() || !postForm.excerpt.trim()) return;
    const post = {
      id: crypto.randomUUID(),
      slug: slugify(postForm.title),
      ...postForm,
      date: new Date().toISOString().slice(0, 10),
      source: "admin",
    };
    const nextPosts = [post, ...posts];
    setPosts(nextPosts);
    writeStore(POSTS_KEY, nextPosts);
    setPostForm({ title: "", category: "News", excerpt: "", body: "" });
  };

  const deleteLead = (id) => {
    const next = leads.filter((lead) => lead.id !== id);
    setLeads(next);
    writeStore(LEADS_KEY, next);
  };

  const deletePost = (id) => {
    const next = posts.filter((post) => post.id !== id);
    setPosts(next);
    writeStore(POSTS_KEY, next);
  };

  const exportLeads = () => {
    const header = ["createdAt", "name", "phone", "email", "province", "propertyType", "monthlyBill", "interest", "source"];
    const rows = leads.map((lead) => header.map((field) => `"${String(lead[field] || "").replaceAll('"', '""')}"`).join(","));
    const blob = new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "lumorix-leads.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageFrame title="Lead & Content Studio" subtitle="ระบบเก็บ lead และโพสต์คอนเทนต์แบบ local-first สำหรับทีม LumoriX" image="/assets/market-grid.png">
      <section className="section admin-section">
        <div className="admin-stats">
          <Metric value={leads.length.toString()} label="Leads" />
          <Metric value={posts.length.toString()} label="Posts" />
          <Metric value={getAllPosts().length.toString()} label="Published content" />
        </div>
        <div className="admin-grid">
          <div className="admin-panel">
            <div className="panel-heading">
              <h2>Lead Inbox</h2>
              <button className="ghost-button dark" onClick={exportLeads} type="button" disabled={!leads.length}>
                <Download size={17} />
                CSV
              </button>
            </div>
            <div className="lead-table">
              {leads.length === 0 ? (
                <p className="empty-state">ยังไม่มี lead ลองส่งฟอร์มจากหน้าแรกหรือหน้า quote</p>
              ) : (
                leads.map((lead) => (
                  <div className="lead-row" key={lead.id}>
                    <div>
                      <strong>{lead.name}</strong>
                      <span>{lead.phone} · {lead.province || "ไม่ระบุจังหวัด"}</span>
                      <small>{lead.source} · {formatDate(lead.createdAt)}</small>
                    </div>
                    <button type="button" onClick={() => deleteLead(lead.id)} aria-label={`Delete ${lead.name}`}>
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="admin-panel">
            <h2>โพสต์คอนเทนต์</h2>
            <form className="content-form" onSubmit={savePost}>
              <label>
                หัวข้อ
                <input value={postForm.title} onChange={(event) => setPostForm((current) => ({ ...current, title: event.target.value }))} />
              </label>
              <label>
                หมวดหมู่
                <select value={postForm.category} onChange={(event) => setPostForm((current) => ({ ...current, category: event.target.value }))}>
                  <option>News</option>
                  <option>Solar</option>
                  <option>Battery</option>
                  <option>EV Charging</option>
                  <option>Business</option>
                </select>
              </label>
              <label>
                เกริ่นนำ
                <input value={postForm.excerpt} onChange={(event) => setPostForm((current) => ({ ...current, excerpt: event.target.value }))} />
              </label>
              <label>
                เนื้อหา
                <textarea rows="5" value={postForm.body} onChange={(event) => setPostForm((current) => ({ ...current, body: event.target.value }))} />
              </label>
              <button className="primary-button full" type="submit">
                เผยแพร่บทความ
              </button>
            </form>
            <div className="post-list">
              {posts.map((post) => (
                <div className="post-row" key={post.id}>
                  <FileText size={17} />
                  <div>
                    <strong>{post.title}</strong>
                    <small>{post.category} · {formatDate(post.date)}</small>
                  </div>
                  <button type="button" onClick={() => deletePost(post.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageFrame>
  );
}

function SiteMapPage() {
  const articleRoutes = articleRouteSlugs.map((slug) => [`/go-solar-center/solar-articles/${slug}`, titleFromSlug(slug)]);
  const provinceRoutes = provinces.map((slug) => [`/solar-by-state/${slug}`, provinceNames[slug]]);
  const coreRoutes = [["/", "Home"], ...businessRoutes.map(([path, title]) => [path, title]), ...articleRoutes, ...provinceRoutes];

  return (
    <PageFrame title="Page Library" subtitle="โครง route ที่ครอบคลุมหน้าแบบ Sunrun และปรับเป็นโมเดล LumoriX" image="/assets/market-grid.png">
      <section className="section sitemap-section">
        {coreRoutes.map(([route, title]) => (
          <Link className="sitemap-row" to={route} key={route}>
            <span>{title}</span>
            <code>{route}</code>
          </Link>
        ))}
      </section>
    </PageFrame>
  );
}

function PageFrame({ title, subtitle, image, children, light = false }) {
  return (
    <>
      <section className={`page-hero ${light ? "page-hero-light" : ""}`}>
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
          <div className="button-row">
            <Link className="primary-button" to="/free-solar-quote">
              ขอใบเสนอราคา
            </Link>
            <Link className="ghost-button" to="/contact-us">
              ติดต่อเรา
            </Link>
          </div>
        </div>
        <img src={image} alt="" />
      </section>
      {children}
    </>
  );
}

function IconLine({ icon, title, text }) {
  return (
    <div className="icon-line">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  );
}

function getAllPosts() {
  const stored = readStore(POSTS_KEY, []);
  return [...stored, ...seedArticles].sort((a, b) => new Date(b.date) - new Date(a.date));
}

function generateArticleFromSlug(slug) {
  return {
    id: `generated-${slug}`,
    slug,
    category: "Solar Guide",
    title: titleFromSlug(slug),
    excerpt: "บทความ template สำหรับหัวข้อพลังงานที่อยู่ใน route library ของ LumoriX",
    date: "2026-05-01",
    body: `หัวข้อ ${titleFromSlug(slug)} ถูกเตรียมเป็นหน้า content template เพื่อรองรับ SEO, campaign และคลังความรู้แบบเดียวกับศูนย์เรียนรู้ของ Sunrun แต่ปรับเป็นภาษาของ LumoriX`,
  };
}

function titleFromSlug(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <Logo inverse />
          <p>พลังงานอัจฉริยะ เพื่ออนาคตที่ดีกว่าสำหรับบ้านและธุรกิจของคุณ</p>
          <div className="social-row">
            <span>f</span>
            <span>▶</span>
            <span>in</span>
            <span>LINE</span>
          </div>
        </div>
        {navItems.map((item) => (
          <div key={item.href}>
            <h3>{item.label}</h3>
            {item.children.map(([label, href]) => (
              <Link key={href} to={href}>
                {label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <span>© 2026 LumoriX Co., Ltd.</span>
        <Link to="/site-map">Page Library</Link>
        <Link to="/admin">Lead & Content Studio</Link>
      </div>
    </footer>
  );
}

function MobileLeadBar() {
  return (
    <div className="mobile-lead-bar">
      <Link className="primary-button full" to="/free-solar-quote">
        ขอใบเสนอราคา
      </Link>
    </div>
  );
}

export default App;
