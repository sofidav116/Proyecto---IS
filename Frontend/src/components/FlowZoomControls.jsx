import { Panel, useReactFlow } from "reactflow";
import { ZoomIn, ZoomOut } from "lucide-react";

// Botones explícitos de Acercar / Alejar el lienzo, además de los que ya
// trae React Flow por defecto (<Controls />). Debe usarse como hijo directo
// de <ReactFlow> (o de un descendiente dentro de él) para poder acceder al
// hook useReactFlow.
export default function FlowZoomControls({ position = "top-right" }) {
  const { zoomIn, zoomOut } = useReactFlow();

  return (
    <Panel position={position} className="flex gap-1.5">
      <button
        type="button"
        title="Acercar"
        onClick={() => zoomIn({ duration: 150 })}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-border dark:border-navyCard bg-white dark:bg-navy text-ink dark:text-white shadow-soft hover:border-blue transition-colors cursor-pointer"
      >
        <ZoomIn size={15} />
      </button>
      <button
        type="button"
        title="Alejar"
        onClick={() => zoomOut({ duration: 150 })}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-border dark:border-navyCard bg-white dark:bg-navy text-ink dark:text-white shadow-soft hover:border-blue transition-colors cursor-pointer"
      >
        <ZoomOut size={15} />
      </button>
    </Panel>
  );
}
