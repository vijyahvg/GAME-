import React, { useState } from 'react';
import { Canvas, useThree, extend } from '@react-three/fiber';
import { OrbitControls, TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import React, { useState, useEffect } from 'react';
// Add this import at the top of your file
import { Html } from '@react-three/drei';

// PyramidManager for handling pyramid logic
class PyramidManager {
  constructor(layerCount) {
    this.layers = this.initLayers(layerCount);
    this.occupied = new Set();
    this.step = Math.sqrt(2);
  }

  initLayers(count) {
    return Array.from({ length: count }, (_, layer) => ({
      size: count - layer,
      positions: this.calculateLayerPositions(layer, count - layer),
      valid: new Set()
    }));
  }

  calculateLayerPositions(layer, size) {
    const positions = [];
    for(let x = 0; x < size; x++) {
      for(let y = 0; y < size; y++) {
        positions.push({
          x: (x - (size-1)/2) * 1.0,
          y: (y - (size-1)/2) * 1.0,
          z: layer * this.step
        });
      }
    }
    return positions;
  }

  isValidPosition(position, piece) {
    const posKey = `${position.x},${position.y},${position.z}`;
    if(this.occupied.has(posKey)) return false;

    const piecePositions = piece.spheres.map(([x, y, z]) => ({
      x: position.x + x,
      y: position.y + y,
      z: position.z + z
    }));

    return piecePositions.every(pos => {
      const layerIndex = Math.round(pos.z / this.step);
      if(layerIndex >= this.layers.length) return false;
      
      const layer = this.layers[layerIndex];
      return layer.positions.some(validPos => 
        Math.abs(validPos.x - pos.x) < 0.1 &&
        Math.abs(validPos.y - pos.y) < 0.1 &&
        Math.abs(validPos.z - pos.z) < 0.1
      );
    });
  }

  occupyPosition(position, piece) {
    piece.spheres.forEach(([x, y, z]) => {
      const pos = {
        x: position.x + x,
        y: position.y + y,
        z: position.z + z
      };
      this.occupied.add(`${pos.x},${pos.y},${pos.z}`);
    });
  }

  clearPosition(position, piece) {
    piece.spheres.forEach(([x, y, z]) => {
      const pos = {
        x: position.x + x,
        y: position.y + y,
        z: position.z + z
      };
      this.occupied.delete(`${pos.x},${pos.y},${pos.z}`);
    });
  }

  findNearestValidPosition(position, piece) {
    let nearestPos = null;
    let minDistance = Infinity;

    this.layers.forEach(layer => {
      layer.positions.forEach(validPos => {
        if (this.isValidPosition(validPos, piece)) {
          const distance = Math.sqrt(
            Math.pow(position.x - validPos.x, 2) +
            Math.pow(position.y - validPos.y, 2) +
            Math.pow(position.z - validPos.z, 2)
          );
          if (distance < minDistance) {
            minDistance = distance;
            nearestPos = validPos;
          }
        }
      });
    });

    return nearestPos;
  }
}


extend({ TransformControls });
const POLYSPHERE_PIECES = [
  {
    id: 'A',
    spheres: [
      [0, 0, 0], [0.8, 0, 0], [1.6, 0, 0],
      [0, 0.8, 0], [0.8, 0.8, 0]
    ],
    color: '#FF0000'
  },
  // B - Pink S shape
  {
    id: 'B',
    spheres: [
      [0.8, 0, 0], [1.6, 0, 0],
      [0, 0.8, 0], [0.8, 0.8, 0], [1.6, 0.8, 0]
    ],
    color: '#FF69B4'
  },
  // C - Light Pink L shape
  {
    id: 'C',
    spheres: [
      [0, 0, 0], [0.8, 0, 0],
      [0, 0.8, 0], [0, 1.6, 0]
    ],
    color: '#FFB6C1'
  },
  // D - Blue corner shape
  {
    id: 'D',
    spheres: [
      [0, 0, 0], [0.8, 0, 0],
      [0.4, 0.8, 0]
    ],
    color: '#0000FF'
  },
  // E - Yellow straight piece
  {
    id: 'E',
    spheres: [
      [0, 0, 0], [0.8, 0, 0], [1.6, 0, 0], [2.4, 0, 0]
    ],
    color: '#FFFF00'
  },
  // F - Purple square
  {
    id: 'F',
    spheres: [
      [0, 0, 0], [0.8, 0, 0],
      [0, 0.8, 0], [0.8, 0.8, 0]
    ],
    color: '#800080'
  },
  // G - Dark Purple Z shape
  {
    id: 'G',
    spheres: [
      [0, 0, 0], [0.8, 0, 0],
      [0.8, 0.8, 0], [1.6, 0.8, 0]
    ],
    color: '#4B0082'
  },
  // H - Green L shape
  {
    id: 'H',
    spheres: [
      [0, 0, 0],
      [0, 0.8, 0], [0.8, 0.8, 0]
    ],
    color: '#00FF00'
  },
  // I - Orange L shape
  {
    id: 'I',
    spheres: [
      [0, 0, 0], [0.8, 0, 0], [1.6, 0, 0],
      [1.6, 0.8, 0], [1.6, 1.6, 0]
    ],
    color: '#FFA500'
  },
  // J - Green straight piece
  {
    id: 'J',
    spheres: [
      [0, 0, 0], [0.8, 0, 0], [1.6, 0, 0], [2.4, 0, 0]
    ],
    color: '#008000'
  },
  // K - Orange corner piece
  {
    id: 'K',
    spheres: [
      [0, 0, 0], [0.8, 0, 0], [0.4, 0.8, 0]
    ],
    color: '#FFA500'
  },
  // L - Light Blue S shape
  {
    id: 'L',
    spheres: [
      [0.8, 0, 0], [1.6, 0, 0],
      [0, 0.8, 0], [0.8, 0.8, 0]
    ],
    color: '#87CEEB'
  }
];
// Update the Sphere component to add better shading for gold appearance
function Sphere({ position, color, opacity = 1 }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.4, 32, 32]} />
      <meshStandardMaterial 
        color={color}
        metalness={0.8}     // Increased metalness for more metallic look
        roughness={0.1}     // Decreased roughness for shinier appearance
        transparent={false}  // Disabled transparency
        opacity={opacity}
        emissive={color === "#FFD700" ? "#FFD700" : undefined}  // Add slight glow to gold spheres
        emissiveIntensity={color === "#FFD700" ? 0.2 : 0}      // Control glow intensity
      />
    </mesh>
  );
}

// Updated PlaceablePolyspherePiece with validation
function PlaceablePolyspherePiece({ piece, position, onPositionChange, selected, isPlacing, pyramidManager }) {
  const [isDragging, setIsDragging] = useState(false);
  const groupRef = React.useRef();

  const handleDragStart = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    if (position) {
      pyramidManager.clearPosition(position, piece);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (groupRef.current) {
      const newPos = groupRef.current.position;
      const validPos = pyramidManager.findNearestValidPosition(newPos, piece);
      if (validPos) {
        pyramidManager.occupyPosition(validPos, piece);
        onPositionChange(validPos);
      } else {
        onPositionChange(position);
        pyramidManager.occupyPosition(position, piece);
      }
    }
  };

  const handleDrag = (e) => {
    if (isDragging && groupRef.current) {
      const newPos = groupRef.current.position;
      onPositionChange(newPos);
    }
  };

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerDown={handleDragStart}
      onPointerUp={handleDragEnd}
      onPointerMove={handleDrag}
    >
      {piece.spheres.map((pos, idx) => (
        <Sphere 
          key={idx} 
          position={pos} 
          color={selected ? '#ffff00' : piece.color}
        />
      ))}
    </group>
  );
}


function PolyspherePiece({ piece, selected }) {
  return (
    <group>
      {piece.spheres.map((pos, idx) => (
        <Sphere 
          key={idx} 
          position={pos} 
          color={selected ? '#ffff00' : piece.color}
        />
      ))}
    </group>
  );
}
/// Create NavigationUI component that positions outside the Canvas
function NavigationUI({ onMove }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 40px)',
      gap: '5px',
      background: 'white',
      padding: '10px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ gridColumn: '2' }}>
        <button
          style={{
            width: '100%',
            height: '40px',
            background: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '18px'
          }}
          onClick={() => onMove('up')}
        >
          ↑
        </button>
      </div>
      <div style={{ gridColumn: '1' }}>
        <button
          style={{
            width: '100%',
            height: '40px',
            background: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '18px'
          }}
          onClick={() => onMove('left')}
        >
          ←
        </button>
      </div>
      <div style={{ gridColumn: '3' }}>
        <button
          style={{
            width: '100%',
            height: '40px',
            background: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '18px'
          }}
          onClick={() => onMove('right')}
        >
          →
        </button>
      </div>
      <div style={{ gridColumn: '2' }}>
        <button
          style={{
            width: '100%',
            height: '40px',
            background: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '18px'
          }}
          onClick={() => onMove('down')}
        >
          ↓
        </button>
      </div>
    </div>
  );
}


// Updated PyramidScene with PyramidManager
function PyramidScene({ placedPieces, activePiece, onUpdatePiecePosition }) {
  const [pyramidManager] = useState(() => new PyramidManager(5));
  const positions = [
    // Base layer (5x5)
    ...Array.from({ length: 25 }, (_, i) => [
      (i % 5 - 2) * 1.0,
      Math.floor(i / 5 - 2) * 1.0,
      0
    ]),
    // Layer 4 (4x4)
    ...Array.from({ length: 16 }, (_, i) => [
      (i % 4 - 1.5) * 1.0,
      Math.floor(i / 4 - 1.5) * 1.0,
      0.8
    ]),
    // Layer 3 (3x3)
    ...Array.from({ length: 9 }, (_, i) => [
      (i % 3 - 1) * 1.0,
      Math.floor(i / 3 - 1) * 1.0,
      1.6
    ]),
    // Layer 2 (2x2)
    ...Array.from({ length: 4 }, (_, i) => [
      (i % 2 - 0.5) * 1.0,
      Math.floor(i / 2 - 0.5) * 1.0,
      2.4
    ]),
    // Top sphere
    [0, 0, 3.2]
  ];

  const moveShape = (direction) => {
    if (!activePiece) return;

    const currentPos = placedPieces[activePiece].position;
    const piece = placedPieces[activePiece].piece;
    let newPos = {...currentPos};
    const step = 0.9;

    pyramidManager.clearPosition(currentPos, piece);

    switch(direction) {
      case 'up': newPos.y += step; break;
      case 'down': newPos.y -= step; break;
      case 'left': newPos.x -= step; break;
      case 'right': newPos.x += step; break;
      default: break;
    }

    const validPos = pyramidManager.findNearestValidPosition(newPos, piece);
    if (validPos) {
      pyramidManager.occupyPosition(validPos, piece);
      onUpdatePiecePosition(activePiece, validPos);
    } else {
      pyramidManager.occupyPosition(currentPos, piece);
      onUpdatePiecePosition(activePiece, currentPos);
    }
  };

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />
      
      <group>
        {positions.map((pos, i) => (
          <Sphere 
            key={i} 
            position={pos} 
            color="#FFD700" 
            opacity={1} 
          />
        ))}
        
        {Object.entries(placedPieces).map(([id, pieceData]) => (
          <PlaceablePolyspherePiece
            key={id}
            piece={pieceData.piece}
            position={pieceData.position}
            onPositionChange={(newPos) => onUpdatePiecePosition(id, newPos)}
            isPlacing={activePiece === id}
            pyramidManager={pyramidManager}
          />
        ))}
      </group>
    </>
  );
}

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [currentPieceIndex, setCurrentPieceIndex] = useState(0);
  const [placedPieces, setPlacedPieces] = useState({});
  const [activePiece, setActivePiece] = useState(null);
  // Add this temporarily in your App component
useEffect(() => {
  console.log('placedPieces:', placedPieces);
}, [placedPieces]);
{activePiece && (
  <NavigationUI 
    onMove={(direction) => {
      if (activePiece && placedPieces[activePiece]) {
        const pos = placedPieces[activePiece].position;
        const step = 0.9;
        
        updatePiecePosition(activePiece, {
          x: pos.x + (direction === 'left' ? -step : direction === 'right' ? step : 0),
          y: pos.y + (direction === 'up' ? step : direction === 'down' ? -step : 0),
          z: pos.z || 0
        });
      }
    }}
  />
)}
  
  // Update handlePieceSelect
  const handlePieceSelect = () => {
    const id = Date.now().toString();
    setPlacedPieces(prev => ({
      ...prev,
      [id]: {
        piece: POLYSPHERE_PIECES[currentPieceIndex],
        position: { x: 0, y: 2, z: 0 }
      }
    }));
    setActivePiece(id);
    setSelectedPiece(currentPieceIndex);
  };
  
  c// Update updatePiecePosition
const updatePiecePosition = (id, newPosition) => {
  setPlacedPieces(prev => ({
    ...prev,
    [id]: {
      ...prev[id],
      position: {
        x: newPosition.x,
        y: newPosition.y,
        z: newPosition.z
      }
    }
  }));
};
  
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#ffffff', display: 'flex' }}>
      {/* Top Controls */}
      <div style={{ 
        position: 'fixed', 
        top: 20, 
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        zIndex: 100 
      }}>
        <button 
          style={{ 
            padding: '0.5rem 2rem',
            background: '#2196f3',
            color: 'white',
            fontSize: '1rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'  // Added shadow for better contrast
          }}
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? 'PAUSE' : 'PLAY'}
        </button>
        <button 
          style={{ 
            padding: '0.5rem 2rem',
            background: '#f44336',
            color: 'white',
            fontSize: '1rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'  // Added shadow for better contrast
          }}
          onClick={() => {
            setPlacedPieces({});
            setActivePiece(null);
          }}
        >
          RESET
        </button>
      </div>


      {/* Pieces Container */}
      <div style={{ width: '50%',
         height: '100%', 
         position: 'relative',
         background: '#f5f5f5',  // Light gray background for contrast
        borderRight: '1px solid #e0e0e0'  // Subtle separator
      }}>
        <Canvas camera={{ position: [0, 0, 6] }}
        style={{ background: '#ffffff' }} 
        >
          <color attach="background" args={['#ffffff']} />  // Set Three.js scene background
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <group onClick={handlePieceSelect}>
            <PolyspherePiece 
              piece={POLYSPHERE_PIECES[currentPieceIndex]}
              selected={selectedPiece === currentPieceIndex}
            />
          </group>
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
          />
        </Canvas>
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '1rem'
        }}>
          <button style={{
            padding: '0.5rem 2rem',
            background: '#4a4a4a',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }} onClick={() => {
            setCurrentPieceIndex((prev) => prev > 0 ? prev - 1 : POLYSPHERE_PIECES.length - 1);
            setActivePiece(null);
          }}>
            Previous
          </button>
          <button style={{
            padding: '0.5rem 2rem',
            background: '#4a4a4a',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }} onClick={() => {
            setCurrentPieceIndex((prev) => (prev + 1) % POLYSPHERE_PIECES.length);
            setActivePiece(null);
          }}>
            Next
          </button>
        </div>
      </div>


      {/* Pyramid Container */}
      <div style={{ width: '50%', height: '100%',background: '#f5f5f5' }}>
        <Canvas camera={{ position: [0, 2, 8] }}
        style={{ background: '#ffffff' }}
        >
          <color attach="background" args={['#ffffff']} />  // Set Three.js scene background
          <PyramidScene 
            placedPieces={placedPieces}
            activePiece={activePiece}
            onUpdatePiecePosition={updatePiecePosition}
          />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={isPlaying}
            autoRotateSpeed={5}
          />
        </Canvas>
        {/* Navigation Controls outside Canvas */}
        {activePiece && (
          <NavigationUI 
            onMove={(direction) => {
              if (activePiece) {
                const currentPos = placedPieces[activePiece].position;
                let newPos = [...currentPos];
                const step = 0.9;

                switch(direction) {
                  case 'up':
                    newPos[1] += step;
                    break;
                  case 'down':
                    newPos[1] -= step;
                    break;
                  case 'left':
                    newPos[0] -= step;
                    break;
                  case 'right':
                    newPos[0] += step;
                    break;
                  default:
                    break;
                }

                updatePiecePosition(activePiece, {
                  x: newPos[0],
                  y: newPos[1],
                  z: newPos[2]
                });
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
export default App;