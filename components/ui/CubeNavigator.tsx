import React from "react";

export type DashboardFace = "mesh" | "earth" | "ue5" | "unity" | "fivem" | "alphadelta";

interface CubeNavigatorProps {
  currentFace: DashboardFace;
  dashboards: Record<DashboardFace, React.ReactNode>;
  faceOrder: DashboardFace[];
}

export default function CubeNavigator({
  currentFace,
  dashboards,
  faceOrder,
}: CubeNavigatorProps) {
  const currentIndex = faceOrder.indexOf(currentFace);

  // Using a hexagonal carousel approach for standard HD screens
  // 6 faces = 60 degrees apart over Y axis.
  const anglePerFace = 60;

  const getFaceTransform = (faceIndex: number) => {
    const angle = faceIndex * anglePerFace;
    // TranslateZ radius calculation based on CSS variables or fixed width.
    // For 6 faces, R = width / (2 * Math.tan(Math.PI / 6)). 
    // If our face width is around 1200px, R is ~1040px.
    return `rotateY(${angle}deg) translateZ(1050px)`;
  };

  const getContainerTransform = () => {
    // We rotate the container in the *opposite* direction to bring the current face to front.
    const rotation = -currentIndex * anglePerFace;
    // We also scale down slightly and translate Z backward to keep the active face inside the viewport.
    return `translateZ(-1050px) rotateY(${rotation}deg)`;
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'oklch(12.9% 0.042 264.695)',
        perspective: '2500px'
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '1200px',
          height: '90%',
          transformStyle: 'preserve-3d',
          transform: getContainerTransform(),
          transition: 'transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          boxShadow: '0 0 100px rgba(0,0,0,0.8)'
        }}
      >
        {faceOrder.map((face, index) => (
          <div
            key={face}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              transformStyle: "preserve-3d",
              transform: getFaceTransform(index),
              opacity: face === currentFace ? 1 : 0.05,
              transition: "opacity 0.6s ease-in-out",
              pointerEvents: face === currentFace ? "auto" : "none",
              borderRadius: '16px',
              overflow: 'hidden',
              border: face === 'alphadelta' 
                ? '3px solid oklch(68.3% 0.164 313.42)' 
                : '3px solid oklch(78.9% 0.154 211.53 / 0.3)',
              boxShadow: '0 0 50px rgba(0,0,0,0.8)',
              background: 'oklch(12.9% 0.042 264.695)',
              filter: face === currentFace ? 'none' : 'blur(2px)'
            }}
          >
            {dashboards[face]}
          </div>
        ))}
      </div>
    </div>
  );
}
