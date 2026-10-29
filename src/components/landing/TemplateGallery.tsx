import { useEffect, useRef } from "react";
import type { Mesh, MeshPhysicalMaterial } from "three";
import { SHOWCASE } from "./templates";
import { ART_H, ART_W, loadShowcaseFonts, paintTemplate } from "./templateArt";

/**
 * 3D gallery of landing-page cards, after a24.raviklaassens.com's disc gallery:
 * cards sit on an arc inside a group tilted -30°/-30°, the active one is full size and
 * slightly raised, the rest shrink; motion is damped, cards lean with speed and tilt
 * toward the pointer. `targetRef` holds the (fractional) index the parent wants shown.
 */
const CFG = {
  hGap: 2.3,
  depthGap: 1,
  arcStep: 0.35,
  activeY: 0.06,
  inactiveScale: 0.8,
  galleryRotX: -30,
  galleryRotY: -30,
  galleryScale: 1.08,
  cameraDistance: 4.4,
  cameraFOV: 40,
  follow: 7,
  flowLean: 0.055,
  flowLeanMax: 0.3,
  hoverTilt: 0.21,
  renderRadius: 5,
};

const CARD_W = 2.08;
const CARD_H = (CARD_W * ART_H) / ART_W;

export function TemplateGallery({
  targetRef,
  onActiveChange,
  onCardClick,
}: {
  targetRef: React.MutableRefObject<number>;
  onActiveChange: (index: number) => void;
  onCardClick: (index: number) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onActiveChange, onCardClick });
  callbacks.current = { onActiveChange, onCardClick };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const { RoomEnvironment } =
        await import("three/examples/jsm/environments/RoomEnvironment.js");
      if (disposed) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      // Cap the resolution; it drops further below if frames come in slow (weak GPUs).
      let pixelRatio = Math.min(window.devicePixelRatio, 1.5);
      renderer.setPixelRatio(pixelRatio);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.95;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      Object.assign(renderer.domElement.style, {
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
        display: "block",
      });
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.fog = new THREE.Fog(0x0a0a0a, 6, 13);

      const camera = new THREE.PerspectiveCamera(CFG.cameraFOV, 1, 0.1, 100);
      camera.position.set(0, 0, CFG.cameraDistance);
      camera.lookAt(0, 0, 0);

      const gallery = new THREE.Group();
      gallery.rotation.x = THREE.MathUtils.degToRad(CFG.galleryRotX);
      gallery.rotation.y = THREE.MathUtils.degToRad(CFG.galleryRotY);
      gallery.scale.setScalar(CFG.galleryScale);
      scene.add(gallery);

      scene.add(new THREE.AmbientLight(0xffffff, 0.35));
      const key = new THREE.DirectionalLight(0xfff9e8, 1.4);
      key.position.set(3.5, 4, 5);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x499ff5, 1.1);
      rim.position.set(-5, -2, -3);
      scene.add(rim);

      // Rounded slab: front face carries the mockup, sides are a bright glossy edge.
      const shape = new THREE.Shape();
      const r = 0.07;
      const w = CARD_W / 2;
      const h = CARD_H / 2;
      shape.moveTo(-w + r, -h);
      shape.lineTo(w - r, -h);
      shape.quadraticCurveTo(w, -h, w, -h + r);
      shape.lineTo(w, h - r);
      shape.quadraticCurveTo(w, h, w - r, h);
      shape.lineTo(-w + r, h);
      shape.quadraticCurveTo(-w, h, -w, h - r);
      shape.lineTo(-w, -h + r);
      shape.quadraticCurveTo(-w, -h, -w + r, -h);
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 0.03,
        bevelEnabled: true,
        bevelSize: 0.012,
        bevelThickness: 0.012,
        bevelSegments: 3,
        curveSegments: 8,
      });
      geometry.translate(0, 0, -0.015);
      const edge = new THREE.MeshPhysicalMaterial({
        color: 0xf4f4f2,
        metalness: 0.55,
        roughness: 0.12,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
      });

      type Card = { mesh: Mesh; mat: MeshPhysicalMaterial; hover: number; intro: number };
      const cards: Card[] = SHOWCASE.map((_, i) => {
        const mat = new THREE.MeshPhysicalMaterial({
          color: 0x222222,
          roughness: 0.34,
          metalness: 0.05,
          clearcoat: 0.85,
          clearcoatRoughness: 0.18,
          transparent: true,
          opacity: reduced ? 1 : 0,
        });
        const mesh = new THREE.Mesh(geometry, [mat, edge]);
        mesh.userData.index = i;
        gallery.add(mesh);
        return { mesh, mat, hover: 0, intro: reduced ? 1 : 0 };
      });

      // Paint textures (fonts first so canvas text renders in the right families).
      loadShowcaseFonts(SHOWCASE).then(() =>
        SHOWCASE.forEach(async (t, i) => {
          const canvas = await paintTemplate(t);
          if (disposed) return;
          const tex = new THREE.CanvasTexture(canvas);
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
          // ExtrudeGeometry UVs are shape coordinates: map [-w,w]x[-h,h] onto [0,1].
          tex.repeat.set(1 / CARD_W, 1 / CARD_H);
          tex.offset.set(0.5, 0.5);
          cards[i].mat.map = tex;
          cards[i].mat.color.set(0xffffff);
          cards[i].mat.needsUpdate = true;
          dirty = true;
        }),
      );

      // ---- input: pointer hover/click ----
      const pointer = new THREE.Vector2(10, 10);
      const raycaster = new THREE.Raycaster();
      let hovered = -1;
      // Set whenever something changes; the loop skips rendering while the scene is still.
      let dirty = true;
      const onMove = (e: PointerEvent) => {
        dirty = true;
        const rect = host.getBoundingClientRect();
        pointer.set(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1,
        );
      };
      const onLeave = () => {
        pointer.set(10, 10);
        dirty = true;
      };
      const onClick = () => {
        if (hovered >= 0) callbacks.current.onCardClick(hovered);
      };
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerleave", onLeave);
      host.addEventListener("click", onClick);

      const resize = () => {
        const { clientWidth: cw, clientHeight: ch } = host;
        renderer.setSize(cw, ch, false);
        camera.aspect = cw / Math.max(1, ch);
        // Narrow screens: step back so the active card still fits.
        camera.position.z = CFG.cameraDistance * Math.max(1, 1.25 / camera.aspect);
        camera.updateProjectionMatrix();
        dirty = true;
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);

      // ---- loop ----
      let current = targetRef.current;
      let velocity = 0;
      let lastActive = -1;
      let visible = true;
      const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
      io.observe(host);
      const clock = new THREE.Clock();
      let start = performance.now();
      let raf = 0;
      let slowFrames = 0;
      // Compile shaders up front so the first animated frame doesn't stall.
      renderer.compile(scene, camera);
      start = performance.now();

      const tick = () => {
        raf = requestAnimationFrame(tick);
        const dt = Math.min(clock.getDelta(), 0.1);
        if (!visible || document.hidden) return;
        const target = Math.max(0, Math.min(SHOWCASE.length - 1, targetRef.current));
        const elapsedIntro = (performance.now() - start) / 1000;
        const introRunning = !reduced && elapsedIntro < 0.15 + SHOWCASE.length * 0.08 + 1.2;
        const hoverSettling = cards.some((c) => c.hover > 0.001 && c.hover < 0.999);
        const moving = Math.abs(target - current) > 0.0005 || Math.abs(velocity) > 0.001;
        if (!dirty && !introRunning && !moving && !hoverSettling) return;
        dirty = false;
        const frameStart = performance.now();
        const prev = current;
        current = reduced ? target : THREE.MathUtils.damp(current, target, CFG.follow, dt);
        velocity = THREE.MathUtils.lerp(velocity, (current - prev) / Math.max(dt, 1e-3), 0.2);

        const active = Math.round(current);
        if (active !== lastActive) {
          lastActive = active;
          callbacks.current.onActiveChange(active);
        }

        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(
          cards.map((c) => c.mesh),
          false,
        )[0];
        const nextHover = hit ? (hit.object.userData.index as number) : -1;
        if (nextHover !== hovered) dirty = true;
        hovered = nextHover;
        host.style.cursor = hovered >= 0 ? "pointer" : "";

        const elapsed = (performance.now() - start) / 1000;
        const lean = THREE.MathUtils.clamp(
          -velocity * CFG.flowLean,
          -CFG.flowLeanMax,
          CFG.flowLeanMax,
        );

        cards.forEach((card, i) => {
          const m = i - current;
          const abs = Math.abs(m);
          card.mesh.visible = abs < CFG.renderRadius;
          if (!card.mesh.visible) return;

          // Intro: cards rise into place one after another.
          if (!reduced) {
            const t = THREE.MathUtils.clamp((elapsed - 0.15 - i * 0.08) / 1.15, 0, 1);
            card.intro = 1 - Math.pow(1 - t, 3);
          }
          card.mat.opacity = card.intro;

          const angle = m * CFG.arcStep;
          const isActive = i === active;
          const x = Math.sin(angle) * CFG.hGap * 2.4;
          const z = -Math.cos(angle) * CFG.depthGap * 2.4 + CFG.depthGap * 2.4;
          const lift = isActive ? CFG.activeY : 0;
          card.mesh.position.set(x, lift - (1 - card.intro) * 3, z - (1 - card.intro) * 0.7);

          card.hover = THREE.MathUtils.damp(card.hover, hovered === i ? 1 : 0, 10, dt);
          card.mesh.rotation.set(
            -pointer.y * CFG.hoverTilt * card.hover,
            -angle + pointer.x * CFG.hoverTilt * card.hover,
            lean * (1 - Math.min(abs, 1) * 0.4) + (1 - card.intro) * 0.6,
          );
          const s = 1 - (1 - CFG.inactiveScale) * Math.min(1, abs) + card.hover * 0.03;
          card.mesh.scale.setScalar(s);
        });

        renderer.render(scene, camera);

        // Adaptive resolution: sustained slow frames lower the pixel ratio.
        if (performance.now() - frameStart > 34) {
          if (++slowFrames > 6 && pixelRatio > 0.6) {
            pixelRatio = Math.max(0.6, pixelRatio - 0.25);
            renderer.setPixelRatio(pixelRatio);
            resize();
            slowFrames = 0;
          }
        } else slowFrames = Math.max(0, slowFrames - 1);
      };
      tick();

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("pointerleave", onLeave);
        host.removeEventListener("click", onClick);
        cards.forEach((c) => {
          c.mat.map?.dispose();
          c.mat.dispose();
        });
        edge.dispose();
        geometry.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [targetRef]);

  return <div ref={hostRef} className="absolute inset-0" aria-hidden />;
}
