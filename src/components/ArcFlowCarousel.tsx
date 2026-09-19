import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import type { Server } from "../types";
import { slugify } from "../lib/urlUtils";
import directoryHero from "../assets/hero/directoryhero.jpg";

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (callback) => {
      if (typeof window === "undefined") return () => {};
      const mediaQueryList = window.matchMedia("(prefers-reduced-motion: reduce)");
      mediaQueryList.addEventListener("change", callback);
      return () => mediaQueryList.removeEventListener("change", callback);
    },
    () => (typeof window === "undefined" ? false : window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false),
    () => false
  );
}

export interface SmoothSliderItem {
  src: string;
  alt?: string;
  label?: string;
  title?: string;
  description?: string;
}

export interface ArcFlowCarouselProps {
  servers?: Server[];
  items?: SmoothSliderItem[];
  radiusRatio?: number;
  cardRatio?: number;
  minCardWidth?: number;
  maxCardWidth?: number;
  cardAspect?: number;
  overlap?: number;
  arcOffset?: number;
  smoothing?: number;
  dragSensitivity?: number;
  momentum?: number;
  snap?: boolean;
  wheelControl?: "horizontal" | "both" | "off";
  autoRotateSpeed?: number;
  pauseOnHover?: boolean;
  surfaceColor?: string;
  className?: string;
}

const DRAG_SMOOTHING = 14;
const VELOCITY_WINDOW = 90;
const MAX_FLICK = 9;
const STAGGER_LAG_STRENGTH = 0.85;
const MIN_FOLLOW_FRACTION = 0.6;

const neoShadow = "6px 6px 14px rgba(0,0,0,0.55), -6px -6px 14px rgba(255,255,255,0.03)";

export const fallbackServers: Server[] = [
  {
    id: "fb-1",
    name: "CrabSMP MCBE",
    slug: "crabsmp-mcbe",
    votes: 55,
    average_rating: 5.0,
    rating_count: 8,
    weighted_rating: 4.9,
    banner_url: "https://bwruljrnltvoojvzgiqm.supabase.co/storage/v1/object/public/server-assets/adc5484e-7706-445a-a9d3-53d907b5e0e1/m5rpen3lod9-1781406124058.webp",
    icon_url: null,
    category: "smp",
    type: "server",
    status: "approved",
    description: null,
    featured: true,
    tags: [],
    gallery: [],
    last_edited_at: "",
    created_at: "",
    updated_at: "",
    owner_id: null,
    ip_or_code: null,
    port: null,
    bedrock_ip: null,
    bedrock_port: null,
    website_url: null,
    discord_url: null,
    social_links: null,
    submitter_role: null,
    verify_discord: null,
  },
  {
    id: "fb-2",
    name: "Variety SMP",
    slug: "variety-smp",
    votes: 32,
    average_rating: 4.8,
    rating_count: 5,
    weighted_rating: 4.7,
    banner_url: "https://bwruljrnltvoojvzgiqm.supabase.co/storage/v1/object/public/server-assets/d33a0bf9-ee00-4bb8-b4e9-b5fa72124c07/cbpwn3gap2w-1785422223511.webp",
    icon_url: null,
    category: "smp",
    type: "server",
    status: "approved",
    description: null,
    featured: true,
    tags: [],
    gallery: [],
    last_edited_at: "",
    created_at: "",
    updated_at: "",
    owner_id: null,
    ip_or_code: null,
    port: null,
    bedrock_ip: null,
    bedrock_port: null,
    website_url: null,
    discord_url: null,
    social_links: null,
    submitter_role: null,
    verify_discord: null,
  },
  {
    id: "fb-3",
    name: "Grow A Ore",
    slug: "grow-a-ore",
    votes: 9,
    average_rating: 4.5,
    rating_count: 3,
    weighted_rating: 4.4,
    banner_url: "https://bwruljrnltvoojvzgiqm.supabase.co/storage/v1/object/public/server-assets/51b16756-fd2c-4a82-bf7d-117004be1242/51qpbxltx2h-1782230764286.webp",
    icon_url: null,
    category: "other",
    type: "server",
    status: "approved",
    description: null,
    featured: false,
    tags: [],
    gallery: [],
    last_edited_at: "",
    created_at: "",
    updated_at: "",
    owner_id: null,
    ip_or_code: null,
    port: null,
    bedrock_ip: null,
    bedrock_port: null,
    website_url: null,
    discord_url: null,
    social_links: null,
    submitter_role: null,
    verify_discord: null,
  },
  {
    id: "fb-4",
    name: "Fracture MC",
    slug: "fracture-mc",
    votes: 7,
    average_rating: 4.0,
    rating_count: 2,
    weighted_rating: 4.0,
    banner_url: null,
    icon_url: null,
    category: "skygen",
    type: "server",
    status: "approved",
    description: null,
    featured: false,
    tags: [],
    gallery: [],
    last_edited_at: "",
    created_at: "",
    updated_at: "",
    owner_id: null,
    ip_or_code: null,
    port: null,
    bedrock_ip: null,
    bedrock_port: null,
    website_url: null,
    discord_url: null,
    social_links: null,
    submitter_role: null,
    verify_discord: null,
  },
  {
    id: "fb-5",
    name: "Crystal Gens",
    slug: "crystal-gens",
    votes: 3,
    average_rating: 4.2,
    rating_count: 1,
    weighted_rating: 4.1,
    banner_url: "https://bwruljrnltvoojvzgiqm.supabase.co/storage/v1/object/public/server-assets/a922fb56-092f-49a5-ba75-90ceae3555dd/xnt7h7egkpi-1781553238700.webp",
    icon_url: null,
    category: "skygen",
    type: "server",
    status: "approved",
    description: null,
    featured: false,
    tags: [],
    gallery: [],
    last_edited_at: "",
    created_at: "",
    updated_at: "",
    owner_id: null,
    ip_or_code: null,
    port: null,
    bedrock_ip: null,
    bedrock_port: null,
    website_url: null,
    discord_url: null,
    social_links: null,
    submitter_role: null,
    verify_discord: null,
  },
  {
    id: "fb-6",
    name: "Realm World",
    slug: "realm-world",
    votes: 3,
    average_rating: 4.6,
    rating_count: 4,
    weighted_rating: 4.5,
    banner_url: "https://bwruljrnltvoojvzgiqm.supabase.co/storage/v1/object/public/server-assets/ad2be47b-b12e-4fc5-ab5a-e8af75c76d36/go1h5wagq7l-1783066670669.webp",
    icon_url: null,
    category: "smp",
    type: "realm",
    status: "approved",
    description: null,
    featured: false,
    tags: [],
    gallery: [],
    last_edited_at: "",
    created_at: "",
    updated_at: "",
    owner_id: null,
    ip_or_code: null,
    port: null,
    bedrock_ip: null,
    bedrock_port: null,
    website_url: null,
    discord_url: null,
    social_links: null,
    submitter_role: null,
    verify_discord: null,
  },
];

export function ArcFlowCarousel({
  servers,
  items,
  radiusRatio = 1.25,
  cardRatio = 0.18,
  minCardWidth = 180,
  maxCardWidth = 260,
  cardAspect = 0.65,
  overlap = -0.06,
  arcOffset = 0.42,
  smoothing = 5.5,
  dragSensitivity = 1.2,
  momentum = 1,
  snap = false,
  wheelControl = "horizontal",
  autoRotateSpeed = 0.035,
  pauseOnHover = true,
  surfaceColor = "transparent",
  className = "",
}: ArcFlowCarouselProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const discRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);

  const reduceMotion = usePrefersReducedMotion();

  const activeServers = servers && servers.length > 0 ? servers : fallbackServers;
  const isServerMode = Boolean(servers || !items);
  const total = isServerMode ? activeServers.length : (items?.length ?? 0);

  const [slotCount, setSlotCount] = useState(() => Math.max(total, 12));

  const layoutRef = useRef({
    radius: 900,
    cardWidth: 230,
    cardHeight: 280,
    step: 0.14,
    centerX: 0,
    centerY: 0,
    maxAngle: 1,
  });

  const currentRef = useRef(0);
  const targetRef = useRef(0);
  const slotOffsetsRef = useRef<number[]>([]);
  const draggingRef = useRef(false);
  const isPointerDownRef = useRef(false);
  const hasMovedRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);
  const lastXRef = useRef(0);
  const samplesRef = useRef<{ t: number; value: number }[]>([]);
  const revealRef = useRef(reduceMotion ? 1 : 0);
  const revealStartRef = useRef(0);
  const wheelSettleRef = useRef(0);
  const hoveredRef = useRef(false);

  const measure = useCallback(() => {
    const stage = stageRef.current;
    if (!stage || !total) return;

    const width = stage.offsetWidth;
    const height = stage.offsetHeight;

    const cardWidth = gsap.utils.clamp(minCardWidth, maxCardWidth, width * cardRatio);
    const cardHeight = cardWidth / cardAspect;
    const radius = Math.max(width * radiusRatio, cardWidth * 3.8);

    const step = (cardWidth * (1 - gsap.utils.clamp(-0.5, 0.85, overlap))) / radius;

    const centerX = width / 2;
    const centerY = height * arcOffset + radius;

    const discRadius = radius - cardHeight * 0.6;

    const reach = Math.min(1, (width / 2 + cardWidth * 1.2) / radius);
    const maxAngle = Math.asin(reach) + 0.12;

    layoutRef.current = { radius, cardWidth, cardHeight, step, centerX, centerY, maxAngle };

    const disc = discRef.current;
    if (disc) {
      disc.style.width = `${discRadius * 2}px`;
      disc.style.height = `${discRadius * 2}px`;
      disc.style.left = `${centerX}px`;
      disc.style.top = `${centerY - discRadius}px`;
    }

    const needed = Math.ceil((maxAngle * 2) / step) + 2;
    setSlotCount((prev) => {
      const next = Math.max(total, Math.ceil(needed / total) * total);
      return next === prev ? prev : next;
    });
  }, [arcOffset, cardAspect, cardRatio, maxCardWidth, minCardWidth, overlap, radiusRatio, total]);

  useLayoutEffect(() => {
    measure();

    const stage = stageRef.current;
    if (!stage || typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [measure]);

  useEffect(() => {
    if (!total) return;

    const draw = (dt: number) => {
      const { radius, cardWidth, cardHeight, step, centerX, centerY, maxAngle } = layoutRef.current;
      const span = slotCount * step;
      const half = span / 2;
      const reveal = revealRef.current;
      const rate = draggingRef.current ? DRAG_SMOOTHING : reduceMotion ? DRAG_SMOOTHING : smoothing;
      const useUnifiedOffset = reduceMotion;

      const slotOffsets = slotOffsetsRef.current;
      if (slotOffsets.length !== slotCount) {
        slotOffsets.length = slotCount;
        slotOffsets.fill(currentRef.current);
      }

      for (let i = 0; i < slotCount; i += 1) {
        const card = cardRefs.current[i];
        if (!card) continue;

        if (useUnifiedOffset) {
          slotOffsets[i] = currentRef.current;
        } else {
          let rankAngle = (i * step - slotOffsets[i]) % span;
          if (rankAngle < -half) rankAngle += span;
          else if (rankAngle >= half) rankAngle -= span;
          const distanceFactor = gsap.utils.clamp(0, 1, Math.abs(rankAngle) / maxAngle);

          const followRate = Math.max(
            rate * (1 - distanceFactor * STAGGER_LAG_STRENGTH),
            rate * MIN_FOLLOW_FRACTION
          );
          const followLerp = 1 - Math.exp(-followRate * dt);
          slotOffsets[i] += (currentRef.current - slotOffsets[i]) * followLerp;
        }

        let baseAngle = (i * step - slotOffsets[i]) % span;
        if (baseAngle < -half) baseAngle += span;
        else if (baseAngle >= half) baseAngle -= span;

        if (Math.abs(baseAngle) > maxAngle) {
          if (card.style.visibility !== "hidden") card.style.visibility = "hidden";
          continue;
        }
        if (card.style.visibility === "hidden") card.style.visibility = "visible";

        const x = centerX + radius * Math.sin(baseAngle) - cardWidth / 2;
        const y = centerY - radius * Math.cos(baseAngle) - cardHeight / 2;

        card.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${baseAngle}rad)`;
        card.style.width = `${cardWidth}px`;
        card.style.height = `${cardHeight}px`;
        card.style.zIndex = `${Math.round((baseAngle + half) * 1000)}`;

        const inner = innerRefs.current[i];
        if (inner && reveal < 1) {
          const delay = Math.min(1, Math.abs(baseAngle) / maxAngle) * 0.45;
          const p = gsap.utils.clamp(0, 1, (reveal - delay) / (1 - delay || 1));
          const eased = 1 - Math.pow(1 - p, 3);
          inner.style.opacity = `${eased}`;
          inner.style.transform = `translate3d(0, ${(1 - eased) * cardHeight * 0.35}px, 0)`;
        } else if (inner && inner.style.opacity !== "1") {
          inner.style.opacity = "1";
          inner.style.transform = "translate3d(0, 0, 0)";
        }
      }
    };

    const tick = (_time: number, deltaTime: number) => {
      const dt = Math.min(deltaTime, 50) / 1000;
      const rate = draggingRef.current ? DRAG_SMOOTHING : reduceMotion ? DRAG_SMOOTHING : smoothing;
      const lerp = 1 - Math.exp(-rate * dt);

      const delta = targetRef.current - currentRef.current;
      currentRef.current += delta * lerp;

      if (Math.abs(delta) < 0.00002) currentRef.current = targetRef.current;

      if (revealRef.current < 1) {
        const now = performance.now();
        if (!revealStartRef.current) revealStartRef.current = now;
        revealRef.current = Math.min(1, (now - revealStartRef.current) / 1100);
      }

      if (
        autoRotateSpeed &&
        !reduceMotion &&
        !draggingRef.current &&
        !(pauseOnHover && hoveredRef.current)
      ) {
        targetRef.current += autoRotateSpeed * dt;
      }

      draw(dt);
    };

    draw(1);
    gsap.ticker.add(tick);

    return () => gsap.ticker.remove(tick);
  }, [autoRotateSpeed, pauseOnHover, reduceMotion, slotCount, smoothing, total]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !total) return;

    const pushSample = () => {
      const now = performance.now();
      const samples = samplesRef.current;
      samples.push({ t: now, value: targetRef.current });
      while (samples.length > 2 && now - samples[0].t > VELOCITY_WINDOW) samples.shift();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      isPointerDownRef.current = true;
      hasMovedRef.current = false;
      startXRef.current = e.clientX;
      startYRef.current = e.clientY;
      pointerIdRef.current = e.pointerId;
      lastXRef.current = e.clientX;
      samplesRef.current = [{ t: performance.now(), value: targetRef.current }];
      targetRef.current = currentRef.current;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isPointerDownRef.current || e.pointerId !== pointerIdRef.current) return;
      const dist = Math.hypot(e.clientX - startXRef.current, e.clientY - startYRef.current);
      if (!draggingRef.current && dist > 5) {
        draggingRef.current = true;
        hasMovedRef.current = true;
        stage.setPointerCapture(e.pointerId);
        stage.style.cursor = "grabbing";
      }
      if (!draggingRef.current) return;
      const dx = e.clientX - lastXRef.current;
      lastXRef.current = e.clientX;
      targetRef.current -= (dx * dragSensitivity) / layoutRef.current.radius;
      pushSample();
    };

    const endDrag = (e: PointerEvent) => {
      if (!isPointerDownRef.current || e.pointerId !== pointerIdRef.current) return;
      isPointerDownRef.current = false;
      const wasDragging = draggingRef.current;
      draggingRef.current = false;
      pointerIdRef.current = null;
      stage.style.cursor = "grab";
      if (stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId);

      if (wasDragging) {
        pushSample();
        const { step } = layoutRef.current;
        let projected = targetRef.current;

        if (!reduceMotion) {
          const samples = samplesRef.current;
          const first = samples[0];
          const last = samples[samples.length - 1];
          const dt = last && first ? (last.t - first.t) / 1000 : 0;

          if (dt > 0.008) {
            const velocity = (last.value - first.value) / dt;
            const throw_ = gsap.utils.clamp(-MAX_FLICK, MAX_FLICK, velocity / smoothing) * momentum;
            projected = targetRef.current + throw_;
          }
        }

        targetRef.current = snap ? gsap.utils.snap(step, projected) : projected;
      }
      samplesRef.current = [];
    };

    const onWheel = (e: WheelEvent) => {
      if (wheelControl === "off") return;
      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (wheelControl === "horizontal" && !horizontal) return;

      const delta = horizontal ? e.deltaX : e.deltaY;
      e.preventDefault();
      targetRef.current += (delta * dragSensitivity) / layoutRef.current.radius;

      if (snap) {
        window.clearTimeout(wheelSettleRef.current);
        wheelSettleRef.current = window.setTimeout(() => {
          targetRef.current = gsap.utils.snap(layoutRef.current.step, targetRef.current);
        }, 140);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const { step } = layoutRef.current;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        targetRef.current += step;
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        targetRef.current -= step;
      }
    };

    const onPointerEnter = () => {
      hoveredRef.current = true;
    };
    const onPointerLeave = () => {
      hoveredRef.current = false;
    };

    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);
    stage.addEventListener("pointerenter", onPointerEnter);
    stage.addEventListener("pointerleave", onPointerLeave);
    stage.addEventListener("wheel", onWheel, { passive: false });
    stage.addEventListener("keydown", onKeyDown);

    return () => {
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerup", endDrag);
      stage.removeEventListener("pointercancel", endDrag);
      stage.removeEventListener("pointerenter", onPointerEnter);
      stage.removeEventListener("pointerleave", onPointerLeave);
      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(wheelSettleRef.current);
    };
  }, [dragSensitivity, momentum, reduceMotion, smoothing, snap, total, wheelControl]);

  if (!total) return null;

  return (
    <section
      className={`relative w-full h-[460px] sm:h-[500px] lg:h-[540px] overflow-visible select-none ${className}`}
      style={{ backgroundColor: surfaceColor }}
    >
      <div
        ref={stageRef}
        tabIndex={0}
        role="region"
        aria-label="Minecraft servers carousel"
        className="absolute inset-0 cursor-grab outline-none"
        style={{ touchAction: "pan-y" }}
      >
        {/* Disc surface */}
        <div
          ref={discRef}
          aria-hidden
          className="pointer-events-none absolute -translate-x-1/2 rounded-full"
          style={{
            backgroundColor: surfaceColor === "transparent" ? "transparent" : surfaceColor,
            border: surfaceColor === "transparent" ? "1px solid rgba(255,255,255,0.06)" : undefined,
            boxShadow: "none",
          }}
        />

        {Array.from({ length: slotCount }, (_, i) => {
          if (isServerMode) {
            const server = activeServers[i % total];
            const isPremium = server.profiles?.role === "explorer+";

            return (
              <div
                key={`slot-${i}`}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="group absolute top-0 left-0 will-change-transform select-none hover:!z-[9999]"
                style={{ visibility: "hidden" }}
              >
                <div
                  ref={(el) => {
                    innerRefs.current[i] = el;
                  }}
                  className="relative h-full w-full"
                  style={{
                    opacity: reduceMotion ? 1 : 0,
                  }}
                >
                  <Link
                    to={`/server/${server.slug || slugify(server.name)}`}
                    onClick={(e) => {
                      if (hasMovedRef.current) {
                        e.preventDefault();
                      }
                    }}
                    className="block h-full w-full group/card relative select-none transition-all duration-300 ease-out hover:-translate-y-2.5 hover:scale-[1.03] hover:z-30"
                    draggable={false}
                  >
                    {isPremium && (
                      <div className="absolute inset-0 z-0 rounded-xl overflow-hidden pointer-events-none p-[1.5px] transition-opacity duration-300 group-hover/card:opacity-100">
                        <div className="absolute inset-[-200%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_150deg,#FACC15_180deg,transparent_210deg,transparent_360deg)] opacity-40 animate-spin-slow" />
                      </div>
                    )}

                    <div
                      className={`relative flex flex-col h-full w-full overflow-hidden cursor-pointer z-10 rounded-xl transition-all duration-300 ${
                        isPremium 
                          ? "border border-yellow-400/20 group-hover/card:border-yellow-400/50" 
                          : "border border-white/10 group-hover/card:border-white/25"
                      }`}
                      style={{
                        background: "#121212",
                        boxShadow: neoShadow,
                        margin: isPremium ? "1.5px" : undefined,
                      }}
                    >
                      {/* Full Server Cover Background */}
                      <img
                        src={server.banner_url || directoryHero}
                        alt={`${server.name} cover`}
                        draggable={false}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                      />

                      {/* Dark Gradient Overlay for optimal legibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/10 pointer-events-none" />

                      {/* Bottom content: Server icon on the left, Server name below icon aligned left */}
                      <div className="absolute inset-x-0 bottom-0 p-4 pb-4 sm:p-5 sm:pb-5 flex flex-col items-start text-left z-20 pointer-events-none">
                        {/* Server Icon — neomorphic raised */}
                        <div
                          className={`w-12 h-12 sm:w-14 sm:h-14 mb-2.5 rounded-xl overflow-hidden flex-shrink-0 z-20 transition-all duration-300 ${
                            isPremium ? "ring-2 ring-yellow-400/60" : "ring-1 ring-white/10"
                          }`}
                          style={{
                            background: "#1e1e1e",
                            boxShadow: "4px 4px 10px rgba(0,0,0,0.6), -4px -4px 10px rgba(255,255,255,0.03)",
                          }}
                        >
                          {server.icon_url ? (
                            <img
                              src={server.icon_url}
                              alt={server.name}
                              draggable={false}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400 font-pixel text-xs bg-zinc-900">
                              {server.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Server Name below the icon — Minecraft font, clean white with no green hover */}
                        <h3 className="font-pixel text-xs sm:text-sm text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] line-clamp-1 w-full pr-2 leading-snug">
                          {server.name}
                        </h3>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            );
          }

          // Fallback image items mode
          const item = items![i % total];
          return (
            <div
              key={`item-${i}`}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="group absolute top-0 left-0 will-change-transform"
              style={{ visibility: "hidden" }}
            >
              <div
                ref={(el) => {
                  innerRefs.current[i] = el;
                }}
                className="relative h-full w-full overflow-hidden rounded-[10px] bg-black/5"
                style={{
                  opacity: reduceMotion ? 1 : 0,
                  boxShadow: "0 18px 40px -12px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.15)",
                }}
              >
                <img
                  src={item.src}
                  alt={item.alt ?? `Slide ${(i % total) + 1}`}
                  draggable={false}
                  className="pointer-events-none block h-full w-full object-cover select-none"
                />
                {item.title ? (
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 p-4 text-white"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)",
                    }}
                  >
                    <p className="text-xs font-headline font-bold tracking-wider uppercase text-white/95">{item.title}</p>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ArcFlowCarousel;
