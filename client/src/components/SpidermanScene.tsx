import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface SpidermanSceneProps {
  className?: string;
}

export const SpidermanScene: React.FC<SpidermanSceneProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);
    return () => motionQuery.removeEventListener('change', handleMotionChange);
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Atmosphere Setup
    const scene = new THREE.Scene();

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 7.2);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 4. Cinematic Multi-Point Studio Lighting
    const ambientLight = new THREE.AmbientLight(0x1a2638, 3.0);
    scene.add(ambientLight);

    // Key Light (Crisp White/Cyan highlight)
    const keyLight = new THREE.DirectionalLight(0xffffff, 5.0);
    keyLight.position.set(6, 7, 6);
    scene.add(keyLight);

    // Intense Crimson Rim Light (Catching suit contours from behind)
    const rimLightCrimson = new THREE.DirectionalLight(0xff1e56, 14.0);
    rimLightCrimson.position.set(-6, 3, -3);
    scene.add(rimLightCrimson);

    // Secondary Cyber Cyan Rim Light
    const rimLightCyan = new THREE.DirectionalLight(0x00f0ff, 6.0);
    rimLightCyan.position.set(7, -3, -2);
    scene.add(rimLightCyan);

    // Front Chest Glow
    const chestGlow = new THREE.PointLight(0xff1744, 4.0, 12);
    chestGlow.position.set(0, 0.2, 3);
    scene.add(chestGlow);

    // 5. Main Hero Pivot Group
    // Positioned prominently on the upper-right side to gracefully bridge HeroBanner and content
    const characterPivot = new THREE.Group();
    const isMobile = window.innerWidth < 768;
    characterPivot.position.set(isMobile ? 0 : 2.4, isMobile ? -0.5 : 0.2, 0);
    scene.add(characterPivot);

    // Build Detailed 3D Spider-Man Hero Mesh
    const heroGroup = new THREE.Group();

    // High-spec Materials
    const redSuitMat = new THREE.MeshStandardMaterial({
      color: 0xe60039,
      roughness: 0.28,
      metalness: 0.75,
    });

    const blueSuitMat = new THREE.MeshStandardMaterial({
      color: 0x0a1c38,
      roughness: 0.2,
      metalness: 0.85,
    });

    const webWireMat = new THREE.MeshBasicMaterial({
      color: 0x110205,
      wireframe: true,
    });

    const eyeGlowMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });

    const eyeBorderMat = new THREE.MeshBasicMaterial({
      color: 0x050505,
    });

    // 1. Mask / Head
    const headGeo = new THREE.SphereGeometry(0.85, 32, 32);
    headGeo.scale(0.9, 1.25, 1.0);
    const headMesh = new THREE.Mesh(headGeo, redSuitMat);
    headMesh.position.set(0, 1.25, 0);
    heroGroup.add(headMesh);

    // Web pattern overlay on mask
    const headWire = new THREE.Mesh(headGeo.clone(), webWireMat);
    headWire.scale.set(1.008, 1.008, 1.008);
    headMesh.add(headWire);

    // Eyes / Glowing Lenses
    const createSpiderEye = (isRight: boolean) => {
      const eyeGroup = new THREE.Group();
      
      const borderGeo = new THREE.ConeGeometry(0.36, 0.82, 3);
      const borderMesh = new THREE.Mesh(borderGeo, eyeBorderMat);
      borderMesh.rotation.set(Math.PI / 2, isRight ? -0.38 : 0.38, isRight ? -0.3 : 0.3);
      borderMesh.scale.set(1, 0.16, 0.85);
      eyeGroup.add(borderMesh);

      const lensGeo = new THREE.ConeGeometry(0.28, 0.72, 3);
      const lensMesh = new THREE.Mesh(lensGeo, eyeGlowMat);
      lensMesh.rotation.set(Math.PI / 2, isRight ? -0.38 : 0.38, isRight ? -0.3 : 0.3);
      lensMesh.scale.set(1, 0.17, 0.85);
      lensMesh.position.z = 0.02;
      eyeGroup.add(lensMesh);

      eyeGroup.position.set(isRight ? 0.32 : -0.32, 1.32, 0.78);
      return eyeGroup;
    };

    heroGroup.add(createSpiderEye(false));
    heroGroup.add(createSpiderEye(true));

    // 2. Muscular Upper Torso
    const torsoGeo = new THREE.CylinderGeometry(0.95, 0.65, 1.9, 10);
    const torsoMesh = new THREE.Mesh(torsoGeo, redSuitMat);
    torsoMesh.position.set(0, -0.25, 0);
    heroGroup.add(torsoMesh);

    const torsoWire = new THREE.Mesh(torsoGeo.clone(), webWireMat);
    torsoWire.scale.set(1.008, 1.008, 1.008);
    torsoMesh.add(torsoWire);

    // Blue Flank Panels
    const flankL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.5, 0.7), blueSuitMat);
    flankL.position.set(0.75, -0.25, 0);
    heroGroup.add(flankL);

    const flankR = flankL.clone();
    flankR.position.x = -0.75;
    heroGroup.add(flankR);

    // Spider Chest Emblem
    const emblem = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), eyeBorderMat);
    emblem.position.set(0, 0.3, 0.86);
    emblem.scale.set(1, 1.8, 0.3);
    heroGroup.add(emblem);

    // Spider Emblem Legs
    for (let i = 0; i < 4; i++) {
      const legAngle = 0.4 + i * 0.38;
      const legGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.48);
      
      const legL = new THREE.Mesh(legGeo, eyeBorderMat);
      legL.position.set(0.2 + i * 0.04, 0.32 - (i % 2) * 0.15, 0.85);
      legL.rotation.z = -legAngle;
      heroGroup.add(legL);

      const legR = legL.clone();
      legR.position.x = -legL.position.x;
      legR.rotation.z = legAngle;
      heroGroup.add(legR);
    }

    // 3. Shoulders & Arms
    const shoulderL = new THREE.Mesh(new THREE.SphereGeometry(0.52, 16, 16), blueSuitMat);
    shoulderL.position.set(1.15, 0.35, 0);
    heroGroup.add(shoulderL);

    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.28, 1.2, 8), redSuitMat);
    armL.position.set(1.35, -0.3, 0);
    armL.rotation.z = -0.25;
    heroGroup.add(armL);

    const shoulderR = shoulderL.clone();
    shoulderR.position.x = -1.15;
    heroGroup.add(shoulderR);

    const armR = armL.clone();
    armR.position.x = -1.35;
    armR.rotation.z = 0.25;
    heroGroup.add(armR);

    // 4. Glowing Neon Cyber Web Rings
    const ringGeo1 = new THREE.TorusGeometry(2.5, 0.02, 16, 80);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff1e56,
      transparent: true,
      opacity: 0.8,
      wireframe: true
    });
    const webRing1 = new THREE.Mesh(ringGeo1, ringMat);
    webRing1.rotation.x = Math.PI / 3;
    heroGroup.add(webRing1);

    const webRing2 = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.016, 16, 80), ringMat);
    webRing2.rotation.y = Math.PI / 4;
    webRing2.rotation.x = -Math.PI / 6;
    heroGroup.add(webRing2);

    heroGroup.scale.set(1.4, 1.4, 1.4);
    characterPivot.add(heroGroup);

    // 6. Floating Crimson Ember Particles
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = (Math.random() - 0.5) * 20;
      positions[i + 2] = (Math.random() - 0.5) * 12;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xff1744,
      size: 0.12,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 7. Scroll-Linked Rotation & Mouse Parallax
    let scrollProgress = 0;
    let targetRotY = 0;
    let currentRotY = 0;
    let targetPosY = isMobile ? -0.5 : 0.2;
    let currentPosY = targetPosY;
    let targetPosX = isMobile ? 0 : 2.4;
    let currentPosX = targetPosX;
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const onScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      scrollProgress = Math.min(Math.max(scrollY / maxScroll, 0), 1);

      // Smooth multi-revolution 3D rotation as user scrolls
      targetRotY = scrollProgress * Math.PI * 3.5;
      
      // Weave character between left/right on scrolling
      if (!isMobile) {
        targetPosX = 2.4 - Math.sin(scrollProgress * Math.PI) * 4.8;
        targetPosY = 0.2 - scrollProgress * 1.0;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 0.6;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 0.4;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // 8. Tab Visibility & Render Loop
    let isVisible = true;
    let animId: number;

    const onVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const onResize = () => {
      if (!renderer || !camera) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      
      const mobileNow = width < 768;
      targetPosX = mobileNow ? 0 : 2.4;
      targetPosY = mobileNow ? -0.5 : 0.2;
    };
    window.addEventListener('resize', onResize);

    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);

      if (!isVisible) return;

      // Fluid Lerp Damping
      currentRotY += (targetRotY - currentRotY) * 0.05;
      currentPosY += (targetPosY - currentPosY) * 0.05;
      currentPosX += (targetPosX - currentPosX) * 0.05;
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      if (!reducedMotion) {
        characterPivot.rotation.y = currentRotY + mouseX * 0.8;
        characterPivot.rotation.x = mouseY * 0.45 + Math.sin(time * 0.0012) * 0.06;
        characterPivot.position.y = currentPosY + Math.sin(time * 0.0016) * 0.1;
        characterPivot.position.x = currentPosX;
        
        webRing1.rotation.z = time * 0.0006;
        webRing2.rotation.z = -time * 0.0004;
      }

      particles.rotation.y = time * 0.0002;
      particles.rotation.x = time * 0.0001;

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      cancelAnimationFrame(animId);

      renderer.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [reducedMotion]);

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
    >
      {/* 3D WebGL Canvas Mounting Point */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Cinematic Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#05070d] via-transparent to-[#05070d]/40 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_35%,rgba(225,29,72,0.22),transparent_65%)] pointer-events-none" />
    </div>
  );
};

