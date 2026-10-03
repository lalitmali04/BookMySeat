import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface SpidermanSceneProps {
  className?: string;
}

export const SpidermanScene: React.FC<SpidermanSceneProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
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
    camera.position.set(0, 0, 7.5);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 4. Cinematic Multi-Point Lighting (Dramatic Spider-Man Crimson + Key Light)
    const ambientLight = new THREE.AmbientLight(0x22304a, 2.5);
    scene.add(ambientLight);

    // Key Light (Crisp Bluish-White)
    const keyLight = new THREE.DirectionalLight(0xffffff, 4.5);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    // Intense Crimson Rim Light (Catching suit contours from behind)
    const rimLightCrimson = new THREE.DirectionalLight(0xff1744, 12.0);
    rimLightCrimson.position.set(-6, 3, -4);
    scene.add(rimLightCrimson);

    // Secondary Cyan Rim Light
    const rimLightCyan = new THREE.DirectionalLight(0x00e5ff, 5.0);
    rimLightCyan.position.set(6, -2, -3);
    scene.add(rimLightCyan);

    // Front Chest Glow
    const chestGlow = new THREE.PointLight(0xff1744, 5.0, 10);
    chestGlow.position.set(0.5, 0.5, 2.5);
    scene.add(chestGlow);

    // 5. Main Hero Pivot Group
    const characterPivot = new THREE.Group();
    characterPivot.position.set(1.2, -0.2, 0); // Prominent right/center position
    scene.add(characterPivot);

    // Attempt to load /models/spiderman.glb
    const loader = new GLTFLoader();

    loader.load(
      '/models/spiderman.glb',
      (gltf) => {
        while (characterPivot.children.length > 0) {
          characterPivot.remove(characterPivot.children[0]);
        }
        const model = gltf.scene;
        model.scale.set(2.0, 2.0, 2.0);
        model.position.set(0, -1.8, 0);

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (mesh.material && (mesh.material as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.roughness = Math.max(mat.roughness, 0.25);
              mat.metalness = Math.min(mat.metalness, 0.85);
            }
          }
        });

        characterPivot.add(model);
        setModelLoaded(true);
      },
      undefined,
      () => {
        // High-Definition Procedural 3D Spider-Man Hero Mesh
        buildProceduralSpiderHero(characterPivot);
      }
    );

    function buildProceduralSpiderHero(parentGroup: THREE.Group) {
      const heroGroup = new THREE.Group();

      // Materials
      const redSuitMat = new THREE.MeshStandardMaterial({
        color: 0xdd0030,
        roughness: 0.25,
        metalness: 0.8,
      });

      const blueSuitMat = new THREE.MeshStandardMaterial({
        color: 0x07152c,
        roughness: 0.2,
        metalness: 0.9,
      });

      const webWireMat = new THREE.MeshBasicMaterial({
        color: 0x1a0508,
        wireframe: true,
      });

      const eyeGlowMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
      });

      const eyeBorderMat = new THREE.MeshBasicMaterial({
        color: 0x0a0a0a,
      });

      // 1. Mask / Head
      const headGeo = new THREE.SphereGeometry(0.9, 32, 32);
      headGeo.scale(0.92, 1.25, 1.0);
      const headMesh = new THREE.Mesh(headGeo, redSuitMat);
      headMesh.position.set(0, 1.25, 0);
      heroGroup.add(headMesh);

      // Web wireframe overlay on mask
      const headWire = new THREE.Mesh(headGeo.clone(), webWireMat);
      headWire.scale.set(1.006, 1.006, 1.006);
      headMesh.add(headWire);

      // Lenses / Eyes
      const createSpiderEye = (isRight: boolean) => {
        const eyeGroup = new THREE.Group();
        
        const borderGeo = new THREE.ConeGeometry(0.38, 0.85, 3);
        const borderMesh = new THREE.Mesh(borderGeo, eyeBorderMat);
        borderMesh.rotation.set(Math.PI / 2, isRight ? -0.35 : 0.35, isRight ? -0.3 : 0.3);
        borderMesh.scale.set(1, 0.15, 0.85);
        eyeGroup.add(borderMesh);

        const lensGeo = new THREE.ConeGeometry(0.3, 0.75, 3);
        const lensMesh = new THREE.Mesh(lensGeo, eyeGlowMat);
        lensMesh.rotation.set(Math.PI / 2, isRight ? -0.35 : 0.35, isRight ? -0.3 : 0.3);
        lensMesh.scale.set(1, 0.16, 0.85);
        lensMesh.position.z = 0.02;
        eyeGroup.add(lensMesh);

        eyeGroup.position.set(isRight ? 0.34 : -0.34, 1.3, 0.82);
        return eyeGroup;
      };

      heroGroup.add(createSpiderEye(false));
      heroGroup.add(createSpiderEye(true));

      // 2. Muscular Upper Torso
      const torsoGeo = new THREE.CylinderGeometry(1.0, 0.7, 2.0, 8);
      const torsoMesh = new THREE.Mesh(torsoGeo, redSuitMat);
      torsoMesh.position.set(0, -0.3, 0);
      heroGroup.add(torsoMesh);

      const torsoWire = new THREE.Mesh(torsoGeo.clone(), webWireMat);
      torsoWire.scale.set(1.008, 1.008, 1.008);
      torsoMesh.add(torsoWire);

      // Blue Flank Panels
      const flankL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.6, 0.75), blueSuitMat);
      flankL.position.set(0.8, -0.3, 0);
      heroGroup.add(flankL);

      const flankR = flankL.clone();
      flankR.position.x = -0.8;
      heroGroup.add(flankR);

      // Spider Chest Emblem
      const emblem = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), eyeBorderMat);
      emblem.position.set(0, 0.25, 0.9);
      emblem.scale.set(1, 1.8, 0.3);
      heroGroup.add(emblem);

      // Spider Legs on Chest
      for (let i = 0; i < 4; i++) {
        const legAngle = 0.4 + i * 0.4;
        const legGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.5);
        
        const legL = new THREE.Mesh(legGeo, eyeBorderMat);
        legL.position.set(0.2 + i * 0.04, 0.28 - (i % 2) * 0.16, 0.88);
        legL.rotation.z = -legAngle;
        heroGroup.add(legL);

        const legR = legL.clone();
        legR.position.x = -legL.position.x;
        legR.rotation.z = legAngle;
        heroGroup.add(legR);
      }

      // 3. Shoulders & Arms
      const shoulderL = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), blueSuitMat);
      shoulderL.position.set(1.2, 0.35, 0);
      heroGroup.add(shoulderL);

      const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.3, 1.2, 8), redSuitMat);
      armL.position.set(1.4, -0.3, 0);
      armL.rotation.z = -0.25;
      heroGroup.add(armL);

      const shoulderR = shoulderL.clone();
      shoulderR.position.x = -1.2;
      heroGroup.add(shoulderR);

      const armR = armL.clone();
      armR.position.x = -1.4;
      armR.rotation.z = 0.25;
      heroGroup.add(armR);

      // 4. Glowing Neon Cyber Web Rings
      const ringGeo1 = new THREE.TorusGeometry(2.6, 0.025, 16, 80);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xff1744,
        transparent: true,
        opacity: 0.75,
        wireframe: true
      });
      const webRing1 = new THREE.Mesh(ringGeo1, ringMat);
      webRing1.rotation.x = Math.PI / 3;
      heroGroup.add(webRing1);

      const webRing2 = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.02, 16, 80), ringMat);
      webRing2.rotation.y = Math.PI / 4;
      webRing2.rotation.x = -Math.PI / 6;
      heroGroup.add(webRing2);

      heroGroup.scale.set(1.25, 1.25, 1.25);
      parentGroup.add(heroGroup);
    }

    // 6. Floating Crimson Ember Particles
    const particleCount = 100;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 18;
      positions[i + 1] = (Math.random() - 0.5) * 18;
      positions[i + 2] = (Math.random() - 0.5) * 10;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xff2d55,
      size: 0.1,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 7. Scroll-Linked Rotation & Mouse Parallax
    let scrollProgress = 0;
    let targetRotY = 0;
    let currentRotY = 0;
    let targetPosY = -0.2;
    let currentPosY = -0.2;
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const onScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      scrollProgress = Math.min(Math.max(scrollY / maxScroll, 0), 1);

      // Smooth 360 rotation as user scrolls down
      targetRotY = scrollProgress * Math.PI * 3.2;
      targetPosY = -0.2 + scrollProgress * 1.5;
    };

    const onMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 0.5;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 0.3;
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
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);

      if (!isVisible) return;

      // Fluid Lerp Damping
      currentRotY += (targetRotY - currentRotY) * 0.06;
      currentPosY += (targetPosY - currentPosY) * 0.06;
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      if (!reducedMotion) {
        characterPivot.rotation.y = currentRotY + mouseX * 0.75;
        characterPivot.rotation.x = mouseY * 0.45 + Math.sin(time * 0.0012) * 0.05;
        characterPivot.position.y = currentPosY + Math.sin(time * 0.0016) * 0.08;
      }

      particles.rotation.y = time * 0.00015;
      particles.rotation.x = time * 0.00008;

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
      <div className="absolute inset-0 bg-gradient-to-t from-[#05070d] via-transparent to-[#05070d]/50 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(225,29,72,0.15),transparent_60%)] pointer-events-none" />
    </div>
  );
};
