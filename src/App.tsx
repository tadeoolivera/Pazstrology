import { useState, useRef } from 'react';
import type { CSSProperties } from 'react';
import Chart, { type ChartActions } from './components/Chart.tsx';
import Summary from './components/SummaryBodies.tsx';
import SummaryHouses from './components/SummaryHouses.tsx';
import SummaryAspects from './components/SummaryAspects.tsx';
import Modal from './components/Modal.tsx';
import BodyPanel from './components/BodyPanel.tsx';
import type { ChartData } from './utils/summary.ts';

type ModalView = 'planets' | 'houses' | 'aspects' | null;

const buttonStyle: CSSProperties = {
  padding: '8px 18px',
  borderRadius: 8,
  border: '1px solid #8A5A22',
  background: '#FFFDF7',
  color: '#5C3A14',
  fontSize: 14,
  cursor: 'pointer',
};

export default function App() {
  const [data, setData] = useState<ChartData | null>(null);
  const [modal, setModal] = useState<ModalView>(null);
  const [showMinorAspects, setShowMinorAspects] = useState(true);
  const [showMajorAspects, setShowMajorAspects] = useState(true);
  const [showAsteroidAspects, setShowAsteroidAspects] = useState(true);
  const [showNodeAspects, setShowNodeAspects] = useState(true);
  const [syncRotation, setSyncRotation] = useState(false);
  const [retrogrades, setRetrogrades] = useState<Set<string>>(new Set());
  const chartRef = useRef<ChartActions>(null);

  return (
    <div className="App px-6 py-6 md:py-0 md:px-0">
      <div className="relative flex flex-col-reverse justify-center items-center gap-6 -mt-6 pb-6 md:flex-row md:justify-center md:mt-0 md:py-5 md:gap-13">
        <BodyPanel
          data={data}
          onAdd={(name) => chartRef.current?.addBody(name)}
          onRemove={(name) => chartRef.current?.removeBody(name)}
          retrogrades={retrogrades}
          onToggleRetrograde={(name) => chartRef.current?.toggleRetrograde(name)}
        />
        <Chart
          ref={chartRef}
          onSummary={setData}
          onOptionsChange={({showMinorAspects: mm, showMajorAspects: mM, showAsteroidAspects: mAA, showNodeAspects: mN }) => {
            setShowMinorAspects(mm);
            setShowMajorAspects(mM);
            setShowAsteroidAspects(mAA);
            setShowNodeAspects(mN);
          }}
          onRetrogradesChange={setRetrogrades}
          showMinorAspects={showMinorAspects}
          showMajorAspects={showMajorAspects}
          showAsteroidAspects={showAsteroidAspects}
          showNodeAspects={showNodeAspects}
          syncRotation={syncRotation}
        />
        <span className="md:w-100"/>
         <button 
          onClick={() => chartRef.current?.undo()}
          aria-label="Deshacer"
          className="absolute top-5 left-1 flex items-center justify-center gap-2 rounded-lg border border-[#8A5A22] bg-[#FFFDF7] p-2 text-[#5C3A14] shadow-2xl transition-all active:scale-95 hover:bg-[#f4efe1] md:hidden"
        >
          <svg 
            className="h-6 w-6 md:h-4 md:w-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
          <span className="hidden md:inline font-medium">
            Deshacer
          </span>
        </button>

        <button 
          onClick={() => chartRef.current?.redo()}
          aria-label="Rehacer"
          className="absolute top-5 right-1 flex items-center justify-center gap-2 rounded-lg border border-[#8A5A22] bg-[#FFFDF7] p-2 text-[#5C3A14] shadow-2xl transition-all active:scale-95 hover:bg-[#f4efe1] md:hidden"
        >
          <svg 
            className="h-6 w-6 md:h-4 md:w-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
          </svg>
          <span className="hidden md:inline font-medium">
            Rehacer
          </span>
        </button>
      </div>
      <div className="flex flex-col items-center justify-center gap-6"> 
        <div className="flex flex-wrap justify-center gap-3">
          <button style={buttonStyle} onClick={() => setSyncRotation((v) => !v)}>
            Giro sincronizado: {syncRotation ? 'SI' : 'NO'}
          </button>
          <button style={buttonStyle} onClick={() => setShowMinorAspects((v) => !v)}>
            Asp. menores: {showMinorAspects ? 'SI' : 'NO'}
          </button>
          <button style={buttonStyle} onClick={() => setShowMajorAspects((v) => !v)}>
            Asp. mayores: {showMajorAspects ? 'SI' : 'NO'}
          </button>
          <button style={buttonStyle} onClick={() => setShowAsteroidAspects((v) => !v)}>
            Asp. con Lilith/Quiron: {showAsteroidAspects ? 'SI' : 'NO'}
          </button>
          <button style={buttonStyle} onClick={() => setShowNodeAspects((v) => !v)}>
            Asp. con nodos: {showNodeAspects ? 'SI' : 'NO'}
          </button>
          <button style={buttonStyle} onClick={() => chartRef.current?.reset()}>
            Restablecer
          </button>
          <button style={buttonStyle} onClick={() => chartRef.current?.download()}>
            Descargar
          </button>
          <label style={{ ...buttonStyle, cursor: 'pointer' }}>
            Cargar
            <input
              type="file"
              accept="application/json,.json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) chartRef.current?.load(file);
                e.target.value = '';
              }}
            />
          </label>
          <button style={buttonStyle} onClick={() => setModal('planets')}>
            Posición de los cuerpos
          </button>
          <button style={buttonStyle} onClick={() => setModal('houses')}>
            Casas y signos
          </button>
          <button style={buttonStyle} onClick={() => setModal('aspects')}>
            Aspectos de la carta
          </button>
        </div>
      </div>

      {data && modal === 'planets' && (
        <Modal title="Posición de los cuerpos" onClose={() => setModal(null)}>
          <Summary planets={data.planets} retrogrades={retrogrades} />
        </Modal>
      )}
      {data && modal === 'houses' && (
        <Modal title="Casas y signos" onClose={() => setModal(null)}>
          <SummaryHouses houses={data.houses} />
        </Modal>
      )}
      {data && modal === 'aspects' && (
        <Modal title="Aspectos de la carta" onClose={() => setModal(null)}>
          <SummaryAspects aspects={data.aspects} />
        </Modal>
      )}

    </div>
  );
}
