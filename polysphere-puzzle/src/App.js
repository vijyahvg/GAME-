import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// Helper functions for coordinates manipulation
const rotateCoordinates = (coords, direction) => {
  return coords.map(([x, y, z]) => {
    if (direction === 'clockwise') {
      return [z, y, -x];
    }
    return [-z, y, x]; // counterclockwise
  });
};

const flipCoordinates = (coords, direction) => {
  return coords.map(([x, y, z]) => {
    if (direction === 'horizontal') {
      return [-x, y, z];
    }
    return [x, y, -z]; // vertical
  });
};

const normalizeCoordinates = (coords) => {
  const minX = Math.min(...coords.map(([x]) => x));
  const minY = Math.min(...coords.map(([_, y]) => y));
  const minZ = Math.min(...coords.map(([__, ___, z]) => z));
  
  return coords.map(([x, y, z]) => [
    x - minX,
    y - minY,
    z - minZ
  ]);
};


const POLYSPHERE_PIECES = [
  // A - Red Z shape
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
      [0, 0, 0], [0.8, 0, 0], [1.6, 0, 0], [2.4, 0, 0], [3.2, 0, 0]
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
    color: 'purple'
  },
  // H - Green L shape
  {
    id: 'H',
    spheres: [
      [0, 0, 0],
      [0, 0.8, 0], [0.8, 0.8, 0]
    ],
    color: 'lightgreen'
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
    color: 'green'
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

// Update the Sphere component with consistent size
function Sphere({ position, color }) {
    return (
      <mesh position={position}>
        <sphereGeometry args={[0.4, 32, 32]} /> {/* Keep consistent sphere size */}
        <meshStandardMaterial 
          color={color}
          metalness={0.8}
          roughness={0.1}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
    );
  }

  function PieceViewer({ piece, isUsed }) {
    // Add opacity for used pieces
    const materialProps = isUsed ? {
      opacity: 0.3,
      transparent: true,
    } : {};
  
    return (
      <group>
        {piece.spheres.map((pos, idx) => (
          <mesh key={idx} position={pos}>
            <sphereGeometry args={[0.4, 32, 32]} />
            <meshStandardMaterial 
              color={piece.color}
              metalness={0.8}
              roughness={0.1}
              emissive={piece.color}
              emissiveIntensity={0.2}
              {...materialProps}
            />
          </mesh>
        ))}
      </group>
    );
  }

// Add this new component after your existing components
function TopControls({ isPlaying, onPlay, onReset, onPause }) {
    return (
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '10px',
        zIndex: 1000
      }}>
        <button style={{
          padding: '8px 24px',
          background: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }} onClick={onPlay}>
          PLAY
        </button>
        <button style={{
          padding: '8px 24px',
          background: '#F44336',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }} onClick={onReset}>
          RESET
        </button>
        <button style={{
          padding: '8px 24px',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }} onClick={onPause}>
          PAUSE
        </button>
      </div>
    );
  }
  

// Update your NavigationControls component
function NavigationControls({ onMove, visible }) {
    if (!visible) return null;
  
    const buttonStyle = {
      padding: '8px 16px',
      background: 'white',
      color: 'black',
      border: '1px solid #ccc',
      borderRadius: '4px',
      cursor: 'pointer',
      width: '120px',
      fontSize: '14px'
    };
  
    return (
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <button style={buttonStyle} onClick={() => onMove('forward')}>
          FORWARD
        </button>
        <button style={buttonStyle} onClick={() => onMove('back')}>
          BACK
        </button>
        <button style={buttonStyle} onClick={() => onMove('left')}>
          LEFT
        </button>
        <button style={buttonStyle} onClick={() => onMove('right')}>
          RIGHT
        </button>
        <button style={buttonStyle} onClick={() => onMove('up')}>
          UP
        </button>
        <button style={buttonStyle} onClick={() => onMove('down')}>
          DOWN
        </button>
      </div>
    );
  }
  function RotationControls({ onRotate, onFlip, visible }) {
    if (!visible) return null;
  
    const buttonStyle = {
      padding: '8px 16px',
      background: 'white',
      color: 'black',
      border: '1px solid #ccc',
      borderRadius: '4px',
      cursor: 'pointer',
      width: '120px',
      fontSize: '14px',
      margin: '5px'
    };
  
    return (
      <div style={{
        position: 'absolute',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 1000
      }}>
        <button style={buttonStyle} onClick={() => onRotate('clockwise')}>
          Rotate CW
        </button>
        <button style={buttonStyle} onClick={() => onRotate('counterclockwise')}>
          Rotate CCW
        </button>
        <button style={buttonStyle} onClick={() => onFlip('horizontal')}>
          Flip H
        </button>
        <button style={buttonStyle} onClick={() => onFlip('vertical')}>
          Flip V
        </button>
      </div>
    );
  }
  

// Update App component to handle piece placement
function App() {
    const [currentPiece, setCurrentPiece] = useState(0);
    const [placedPieces, setPlacedPieces] = useState({});
    const [selectedPiece, setSelectedPiece] = useState(null);
    const [activePiece, setActivePiece] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [autoRotate, setAutoRotate] = useState(false);
    const [usedPieces, setUsedPieces] = useState(new Set()); // Track used pieces
    const [rotations, setRotations] = useState({}); // Track rotation state for each piece

    // Update the pyramid positions calculation
    const pyramidPositions = React.useMemo(() => {
    const createLayer = (size, yOffset) => {
      const spheres = [];
      const offset = (5 - size) / 2; // Center smaller layers
      
      for(let x = 0; x < size; x++) {
        for(let z = 0; z < size; z++) {
          spheres.push([
            (x + offset) * 0.8,  // Add offset to center each layer
            yOffset * 0.8,       // Height
            (z + offset) * 0.8   // Add offset to center each layer
          ]);
        }
      }
      return spheres;
    };
  
    return [
      ...createLayer(5, 0),
      ...createLayer(4, 1),
      ...createLayer(3, 2),
      ...createLayer(2, 3),
      ...createLayer(1, 4)
    ];
  }, []);


   // Update piece movement to handle vertical stacking properly
const handleMove = (direction) => {
    if (!activePiece || !placedPieces[activePiece]) return;
  
    setPlacedPieces(prev => {
      const piece = prev[activePiece];
      const newPosition = { ...piece.position };
      const moveStep = 0.8;
  
      switch (direction) {
        case 'forward':
        case 'back':
          const zStep = direction === 'forward' ? moveStep : -moveStep;
          newPosition.z = Math.round((newPosition.z + zStep) / moveStep) * moveStep;
          break;
        case 'left':
        case 'right':
          const xStep = direction === 'right' ? moveStep : -moveStep;
          newPosition.x = Math.round((newPosition.x + xStep) / moveStep) * moveStep;
          break;
        case 'up':
        case 'down':
          const yStep = direction === 'up' ? moveStep : -moveStep;
          newPosition.y = Math.round((newPosition.y + yStep) / moveStep) * moveStep;
          break;
      }
  
      // Validate position is within pyramid bounds
      const layer = Math.round(newPosition.y / moveStep);
      const layerSize = 5 - layer; // Size decreases as we go up
      const maxOffset = (5 - layerSize) / 2 * moveStep;
      
      // Adjust position to stay within layer bounds
      if (layer >= 0 && layer < 5) {
        newPosition.x = Math.max(maxOffset, Math.min((4 - maxOffset) * moveStep, newPosition.x));
        newPosition.z = Math.max(maxOffset, Math.min((4 - maxOffset) * moveStep, newPosition.z));
      }
  
      return {
        ...prev,
        [activePiece]: {
          ...piece,
          position: newPosition
        }
      };
    });
  };  
  
    const handlePlay = () => {
        setIsPlaying(true);
        setAutoRotate(true);
      };
    
      const handlePause = () => {
        setIsPlaying(false);
        setAutoRotate(false);
      };
    
      const handleReset = () => {
        setPlacedPieces({});
        setActivePiece(null);
        setIsPlaying(false);
        setAutoRotate(false);
        setUsedPieces(new Set());
        setRotations({});
      };
      const handleRotate = (direction) => {
        if (!activePiece || !placedPieces[activePiece]) return;
      
        setPlacedPieces(prev => {
          const piece = prev[activePiece];
          const rotatedCoords = rotateCoordinates(piece.piece.spheres, direction);
          const normalizedCoords = normalizeCoordinates(rotatedCoords);
      
          return {
            ...prev,
            [activePiece]: {
              ...piece,
              piece: {
                ...piece.piece,
                spheres: normalizedCoords
              }
            }
          };
        });
      };
      
      const handleFlip = (direction) => {
        if (!activePiece || !placedPieces[activePiece]) return;
      
        setPlacedPieces(prev => {
          const piece = prev[activePiece];
          const flippedCoords = flipCoordinates(piece.piece.spheres, direction);
          const normalizedCoords = normalizeCoordinates(flippedCoords);
      
          return {
            ...prev,
            [activePiece]: {
              ...piece,
              piece: {
                ...piece.piece,
                spheres: normalizedCoords
              }
            }
          };
        });
      };

      // Update handlePieceSelect to place pieces at a better starting position
const handlePieceSelect = () => {
    // Check if piece is already used
    if (usedPieces.has(POLYSPHERE_PIECES[currentPiece].id)) {
      return; // Don't allow selection of used pieces
    }

    const id = Date.now().toString();
    setPlacedPieces(prev => ({
      ...prev,
      [id]: {
        piece: POLYSPHERE_PIECES[currentPiece],
        position: { x: 0, y: 0, z: 0 }
      }
    }));
    setActivePiece(id);
    setSelectedPiece(currentPiece);
    
    // Mark piece as used
    setUsedPieces(prev => new Set([...prev, POLYSPHERE_PIECES[currentPiece].id]));
  };

    
      // Update the Pyramid Container section of your return statement
      return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', background: '#000000' }}>
          {/* Shapes Container */}
          <div style={{ 
            width: '50%', 
            height: '100%', 
            position: 'relative', 
            borderRight: '1px solid #333333' 
          }}>
            <Canvas 
              style={{ background: '#000000' }} 
              camera={{ 
                position: [3, 3, 5],
            fov: 50
           }}
            >
              <color attach="background" args={['#000000']} />
              <ambientLight intensity={0.8} />
              <pointLight position={[10, 10, 10]} intensity={1.2} />
              <group onClick={handlePieceSelect}>
                <PieceViewer piece={POLYSPHERE_PIECES[currentPiece]}
                isUsed={usedPieces.has(POLYSPHERE_PIECES[currentPiece].id)}
                 />
              </group>
              <OrbitControls />
            </Canvas>
      
            {/* Previous/Next buttons */}
            <div style={{ 
              position: 'absolute', 
              bottom: 20, 
              left: '50%', 
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '1rem',
              zIndex: 1000
            }}>
              <button 
            style={{
              padding: '0.5rem 2rem',
              background: '#ffffff',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              opacity: usedPieces.has(POLYSPHERE_PIECES[
                currentPiece > 0 ? currentPiece - 1 : POLYSPHERE_PIECES.length - 1
              ].id) ? 0.5 : 1
            }} 
            onClick={() => setCurrentPiece(prev => 
              prev > 0 ? prev - 1 : POLYSPHERE_PIECES.length - 1)}
          >
            Previous
          </button>

          <button 
            style={{
              padding: '0.5rem 2rem',
              background: '#ffffff',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              opacity: usedPieces.has(POLYSPHERE_PIECES[
                (currentPiece + 1) % POLYSPHERE_PIECES.length
              ].id) ? 0.5 : 1
            }} 
            onClick={() => setCurrentPiece(prev => 
              (prev + 1) % POLYSPHERE_PIECES.length)}
          >
            Next
          </button>
        </div>
      </div>

          {/* Pyramid Container */}
          <div style={{ width: '50%', height: '100%', position: 'relative' }}>
            <TopControls 
              isPlaying={isPlaying}
              onPlay={handlePlay}
              onPause={handlePause}
              onReset={handleReset}
            />
            
            <Canvas 
              style={{ background: '#000000' }} 
              camera={{ position: [5, 5, 5], fov: 50 }}
            >
              <color attach="background" args={['#000000']} />
              <ambientLight intensity={0.8} />
              <pointLight position={[10, 10, 10]} intensity={1.2} />
              
              {/* Pyramid */}
              <group>
                {pyramidPositions.map((pos, i) => (
                  <Sphere key={i} position={pos} color="#FFD700" />
                ))}
              </group>
      
              {/* Placed Pieces */}
              {Object.entries(placedPieces).map(([id, { piece, position }]) => (
                <group 
                key={id}
                position={[position.x, position.y, position.z]}
                rotation={[0, rotations[id]?.rotation * (Math.PI / 180) || 0, 0]}
                scale={[
                rotations[id]?.horizontal ? -1 : 1,
                rotations[id]?.vertical ? -1 : 1,
                1
                ]}
                onClick={() => setActivePiece(id)}
              >
               {piece.spheres.map((spherePos, idx) => (
               <Sphere
               key={idx}
               position={spherePos}
                color={activePiece === id ? '#ffff00' : piece.color}
              />
              ))}
              </group>
               ))}
              <OrbitControls 
                autoRotate={autoRotate}
                autoRotateSpeed={5}
              />
            </Canvas>
      
            <NavigationControls 
              onMove={handleMove}
              visible={activePiece !== null}
            />
            <RotationControls 
         onRotate={handleRotate}
         onFlip={handleFlip}
         visible={activePiece !== null}
        />
          </div>
        </div>
      );
    }
export default App;