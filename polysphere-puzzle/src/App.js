import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// Helper functions for coordinates manipulation
const rotate90Degrees = (coords) => {
  return coords.map(([x, y, z]) => [-z, y, x]);
};

const flip = (coords) => {
  return coords.map(([x, y, z]) => [-x, y, z]);
};
const rotateHorizontal = (coords) => {
  return coords.map(([x, y, z]) => [x, 0, z]);
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
  {
    id: 'A',  // Base layer - Large L (7 spheres)
    spheres: [
      [0, 0, 0], [0.8, 0, 0], [1.6, 0, 0],
      [0, 0, 0.8], [0.8, 0, 0.8],
      [0, 0, 1.6], [0, 0, 2.4]
    ],
    color: '#FF0000'
  },
  {
    id: 'B',  // Base layer - T shape (6 spheres)
    spheres: [
      [0, 0, 0], [0.8, 0, 0], [1.6, 0, 0],
      [0.8, 0, 0.8], [0.8, 0, 1.6],
      [0.8, 0, 2.4]
    ],
    color: '#0000FF'
  },
  {
    id: 'C',  // Base/second layer - Square (6 spheres)
    spheres: [
      [0, 0, 0], [0.8, 0, 0], [1.6, 0, 0],
      [0, 0, 0.8], [0.8, 0, 0.8], [1.6, 0, 0.8]
    ],
    color: '#00FF00'
  },
  {
    id: 'D',  // Base layer - Z shape (6 spheres)
    spheres: [
      [0, 0, 0], [0.8, 0, 0], [1.6, 0, 0],
      [1.6, 0, 0.8], [2.4, 0, 0.8], [3.2, 0, 0.8]
    ],
    color: '#800080'
  },
  {
    id: 'E',  // Second layer - L shape (5 spheres)
    spheres: [
      [0, 0, 0], [0.8, 0, 0], [1.6, 0, 0],
      [0, 0, 0.8], [0, 0, 1.6]
    ],
    color: '#FFA500'
  },
  {
    id: 'F',  // Second layer - T shape (5 spheres)
    spheres: [
      [0, 0, 0], [0.8, 0, 0], [1.6, 0, 0],
      [0.8, 0, 0.8], [0.8, 0, 1.6]
    ],
    color: '#FFFF00'
  },
  {
    id: 'G',  // Third layer - Corner (5 spheres)
    spheres: [
      [0, 0, 0], [0.8, 0, 0],
      [0, 0, 0.8], [0.8, 0, 0.8],
      [0, 0, 1.6]
    ],
    color: '#FF69B4'
  },
  {
    id: 'H',  // Third layer - L shape (4 spheres)
    spheres: [
      [0, 0, 0], [0.8, 0, 0],
      [0, 0, 0.8], [0, 0, 1.6]
    ],
    color: '#00FFFF'
  },
  {
    id: 'I',  // Fourth layer piece 1 (2 spheres)
    spheres: [
      [0, 0, 0], [0.8, 0, 0]
    ],
    color: '#8B4513'
  },
  {
    id: 'J',  // Fourth layer piece 2 (2 spheres)
    spheres: [
      [0, 0, 0], [0.8, 0, 0]
    ],
    color: '#4B0082'
  },
  {
    id: 'K',  // Bridge piece (4 spheres)
    spheres: [
      [0, 0, 0], [0.8, 0, 0],
      [0, 0, 0.8], [0.8, 0, 0.8]
    ],
    color: '#32CD32'
  },
  {
    id: 'L',  // Top piece (1 sphere)
    spheres: [
      [0, 0, 0]
    ],
    color: '#FF4500'
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
function TopControls({ onReset }) {  // Remove other props
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
      }} onClick={() => alert('Solving feature coming soon!')}>  {/* Placeholder for solve function */}
        SOLVE
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
        <button style={buttonStyle} onClick={() => onRotate()}>
          Rotate
        </button>
        <button style={buttonStyle} onClick={() => onFlip()}>
          Flip
        </button>
      </div>
    );
  }

  // Add UndoRedoControls component
  function UndoRedoControls({ onUndo, onRedo, canUndo, canRedo }) {
    const buttonStyle = {
      padding: '8px 16px',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      width: '120px',
      fontSize: '14px',
      margin: '5px'
    };
  
    return (
      <div style={{
        position: 'absolute',
        bottom: '20px',   // Same bottom position as NavigationControls
        left: '90%',      // Center like NavigationControls
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',  // Stack vertically
        marginTop: '120px',      // Add margin to separate from other buttons
        gap: '10px',
        zIndex: 1000
      }}>
        <button
          style={{
            ...buttonStyle,
            background: canUndo ? '#FF4444' : '#888888',
            cursor: canUndo ? 'pointer' : 'not-allowed'
          }}
          onClick={onUndo}
          disabled={!canUndo}
        >
          Undo
        </button>
        <button
          style={{
            ...buttonStyle,
            background: canRedo ? '#4CAF50' : '#888888',
            cursor: canRedo ? 'pointer' : 'not-allowed'
          }}
          onClick={onRedo}
          disabled={!canRedo}
        >
          Redo
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
    const [usedPieces, setUsedPieces] = useState(new Set()); // Track used pieces
    const [rotations, setRotations] = useState({}); // Track rotation state for each piece
    const [placementHistory, setPlacementHistory] = useState([]);
    const [redoStack, setRedoStack] = useState([]);

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
  

      // Add these handler functions
const handleUndo = () => {
  if (placementHistory.length === 0) return;

  const lastAction = placementHistory[placementHistory.length - 1];
  
  // Save to redo stack
  setRedoStack(prev => [...prev, {
    ...lastAction,
    pieceData: placedPieces[lastAction.pieceId]
  }]);

  // Remove the last placed piece
  setPlacedPieces(prev => {
    const newPieces = { ...prev };
    delete newPieces[lastAction.pieceId];
    return newPieces;
  });

  // Remove from used pieces
  setUsedPieces(prev => {
    const newUsed = new Set(prev);
    newUsed.delete(lastAction.pieceType);
    return newUsed;
  });

  // Update history
  setPlacementHistory(prev => prev.slice(0, -1));
  
  // Clear active piece if it was the undone piece
  if (activePiece === lastAction.pieceId) {
    setActivePiece(null);
  }
};

const handleRedo = () => {
  if (redoStack.length === 0) return;

  const redoAction = redoStack[redoStack.length - 1];
  
  // Restore the piece
  setPlacedPieces(prev => ({
    ...prev,
    [redoAction.pieceId]: redoAction.pieceData
  }));

  // Add back to used pieces
  setUsedPieces(prev => new Set([...prev, redoAction.pieceType]));

  // Update history
  setPlacementHistory(prev => [...prev, {
    pieceId: redoAction.pieceId,
    pieceType: redoAction.pieceType
  }]);

  // Remove from redo stack
  setRedoStack(prev => prev.slice(0, -1));
};
    
      const handleReset = () => {
        setPlacedPieces({});
        setActivePiece(null);
        setIsPlaying(false);
        setUsedPieces(new Set());
        setRotations({});
        setPlacementHistory([]);
        setRedoStack([]);
      };
      const handleRotate = () => {
        if (!activePiece || !placedPieces[activePiece]) return;
        
        setPlacedPieces(prev => {
          const piece = prev[activePiece];
          const rotatedCoords = rotate90Degrees(piece.piece.spheres);
          
          return {
            ...prev,
            [activePiece]: {
              ...piece,
              piece: {
                ...piece.piece,
                spheres: rotatedCoords
              }
            }
          };
        });
      };
      
      const handleFlip = () => {
        if (!activePiece || !placedPieces[activePiece]) return;
        
        setPlacedPieces(prev => {
          const piece = prev[activePiece];
          const flippedCoords = flip(piece.piece.spheres);
          
          return {
            ...prev,
            [activePiece]: {
              ...piece,
              piece: {
                ...piece.piece,
                spheres: flippedCoords
              }
            }
          };
        });
      };

      // Update handlePieceSelect
const handlePieceSelect = () => {
  if (usedPieces.has(POLYSPHERE_PIECES[currentPiece].id)) {
    return;
  }

  const id = Date.now().toString();
  const horizontalPiece = {
    ...POLYSPHERE_PIECES[currentPiece],
    spheres: POLYSPHERE_PIECES[currentPiece].spheres.map(([x, y, z]) => [x, 0, z])
  };

  // Clear redo stack when new piece is placed
  setRedoStack([]);

  setPlacedPieces(prev => ({
    ...prev,
    [id]: {
      piece: horizontalPiece,
      position: { x: 0, y: 0, z: 0 }
    }
  }));
  
  setPlacementHistory(prev => [...prev, {
    pieceId: id,
    pieceType: POLYSPHERE_PIECES[currentPiece].id
  }]);

  setActivePiece(id);
  setSelectedPiece(currentPiece);
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
        <UndoRedoControls 
    onUndo={handleUndo}
    onRedo={handleRedo}
    canUndo={placementHistory.length > 0}
    canRedo={redoStack.length > 0}
  />
        
          </div>
          
        </div>
        
      );
    }
export default App;