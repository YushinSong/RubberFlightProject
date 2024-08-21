import * as THREE from "three";
import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Box, Environment, useGLTF } from '@react-three/drei';
import { EffectComposer } from '@react-three/postprocessing';
import style from '../CSS/Main.module.css'

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function Airplane({ onLoaded, isSearhMode }) {
  const { scene } = useGLTF('/models/a319_plane/scene.gltf');
  const ref = useRef();
  let time = 0;
  let isLoaded = false;
  const { mouse } = useThree();
  const previousMouse = useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    isLoaded = true;
    onLoaded();
  }, [onLoaded]);

  useFrame(() => {
    if (ref.current) {
      ref.current.traverse((child) => {
        if (child.isMesh && child.material) {
          const material = child.material;
          if (material instanceof THREE.MeshStandardMaterial) {
            material.emissive.set('#aaaaaa'); 
            material.emissiveIntensity = 0.1; 
          }
        }
      });
    }
  });

  useFrame((state, delta) => {
    const sideMovement = Math.cos(time * 0.8) * 0.5;

    time += delta;

    const mouseX = THREE.MathUtils.lerp(previousMouse.current.x, mouse.x, delta * 5);
    const mouseY = THREE.MathUtils.lerp(previousMouse.current.y, mouse.y, delta * 5);
    
    previousMouse.current = { x: mouseX, y: mouseY };

    const rotationX = (mouseY * Math.PI) / 4;
    const rotationY = (mouseX * Math.PI) / 4; 

    ref.current.rotation.x = Math.sin(time * 0.3) * 0.1 + rotationX * 0.1;
    ref.current.rotation.y = (Math.PI / -2) + Math.cos(time * 0.2) * 0.05 + rotationY * 0.1;
    isSearhMode && (ref.current.rotation.z = Math.cos(time * 0.3) * 0.2);
    isSearhMode || (ref.current.rotation.z = Math.cos(time * 0.3) * 0.2 + 0.4);

    if (ref.current.position.x <= 0)
      ref.current.position.x = sideMovement;
  });

  return <primitive ref={ref} object={scene} scale={0.5} rotation={[0, 4.7, 0.5]} position={[0, 0, 0]} />;
}

function CameraAnimation({ isLoaded, isSearhMode }) {
  const { camera } = useThree();
  useFrame((state, delta) => {
    if(!isSearhMode){
      const targetPosition = isLoaded ? [-150, -20, -250] : [-1500, -20, -2500];
      camera.position.lerp(new THREE.Vector3(...targetPosition), delta * 4);
      // camera.lookAt(10, 10, 0);
    }else{
      const targetPosition = [200, 120, -230];
      camera.position.lerp(new THREE.Vector3(...targetPosition), delta * 2);
      camera.lookAt(10, 20, 30);
    }
  });
  return null;
}

function ThreeScene({setIsAirplaneLoaded, isSearhMode}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const loadingRef = useRef(null);
  const cloudContainerRef = useRef(null);
  const airplainContainerRef = useRef(null);

  const handleModelLoaded = () => {
    setIsLoaded(true);
    setIsAirplaneLoaded(true);
    loadingRef.current.classList.add(style.loadingEnd);
    // airplainContainerRef.current.style.left = '0vh';
    // airplainContainerRef.current.style.animation = 'moveAirplain 3s ease-out';
  };

  useEffect(() => {
    console.log(isSearhMode);
    isSearhMode && cloudContainerRef.current.classList.add(style.clouddown);
  }, [isSearhMode]);

  return (
    <>
      <div style={{ position: 'absolute', width: '100vw', height: '100vh', background: 'linear-gradient(to bottom, #B0C9E6, #D5E1EB, #EFF3F6)' }}/>
      
      <div id={style.cloudContainer} ref={cloudContainerRef}>
        <div className={style.backcloud} id={style.backcloud1} />
        <div className={style.backcloud} id={style.backcloud2} />
        <div className={style.backcloud} id={style.backcloud3} />

        <div className={style.frontcloud} id={style.frontcloud1} />
        <div className={style.frontcloud} id={style.frontcloud2} />
        <div className={style.frontcloud} id={style.frontcloud3} />
      </div>

      <div className={style.loadingmessage} ref={loadingRef}></div>
      
      <div id={style.airplainContainer} ref={airplainContainerRef}>
        <Canvas 
          dpr={[1, 2]} 
          gl={{ antialias: true }}
          camera={{ position: [-1500, -20, -2500], fov: 45, near: 0.1, far: 1000 }} 
          style={{ 
            position: 'absoute',
            width: '100%', 
            height: '100%', 
            background: '#B0C9E600', 
            zIndex: '1',
          }}
        >
          <ambientLight intensity={1.1} color="#c2e6ff"/>
          {/* <pointLight position={[0, 0, 0]} intensity={0.5}/> */}

          <EffectComposer/>

          <Airplane onLoaded={handleModelLoaded} isSearhMode={isSearhMode}/>
          <Environment preset="city" blur={0.8} />
          <CameraAnimation isLoaded={isLoaded} isSearhMode={isSearhMode} setIsAirplaneLoaded={setIsAirplaneLoaded}/>
        </Canvas>
      </div>

    </>
  );
}

export default ThreeScene;

