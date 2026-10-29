import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getVariant } from "@/lib/editor/sections";
import type { SectionInstance } from "@/lib/editor/types";
import { Copy, Eye, EyeOff, GripVertical, Trash2 } from "lucide-react";
import { PanelShell } from "./PanelShell";

interface Props {
  sections: SectionInstance[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReorder: (fromId: string, toId: string) => void;
  onToggleHidden: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
  overlay?: boolean;
}

export function LayersPanel(props: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) props.onReorder(String(active.id), String(over.id));
  };

  return (
    <PanelShell title="Camadas" onClose={props.onClose} overlay={props.overlay}>
      <p className="ae-label px-4 pb-2">
        // {props.sections.length} {props.sections.length === 1 ? "seção" : "seções"} · arraste para
        ordenar
      </p>
      {props.sections.length === 0 ? (
        <p className="px-4 py-8 text-center text-xs text-muted-foreground">
          A página ainda não tem seções.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext
            items={props.sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-0.5 px-2">
              {props.sections.map((s) => (
                <LayerRow key={s.id} section={s} active={s.id === props.selectedId} {...props} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </PanelShell>
  );
}

function LayerRow({
  section,
  active,
  ...props
}: Props & { section: SectionInstance; active: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });
  const variant = getVariant(section.variantId);
  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
      className={`group flex h-11 items-center gap-1 rounded-[10px] pr-1 transition-colors ${
        active
          ? "bg-ion/10 text-ion shadow-[inset_0_0_0_1px_rgb(60_207_224/0.35)]"
          : "text-foreground hover:bg-surface"
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex h-full w-7 shrink-0 cursor-grab items-center justify-center text-faint active:cursor-grabbing"
        aria-label={`Arrastar ${variant?.name ?? "seção"}`}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => props.onSelect(section.id)}
        className={`min-w-0 flex-1 truncate text-left text-sm ${active ? "font-semibold" : "font-medium"} ${section.hidden ? "text-faint line-through" : ""}`}
      >
        {variant?.name ?? section.variantId}
      </button>
      <button
        type="button"
        onClick={() => props.onToggleHidden(section.id)}
        className={`ae-ib h-8 w-8 ${section.hidden ? "" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"}`}
        aria-label={section.hidden ? "Mostrar seção" : "Ocultar seção"}
        title={section.hidden ? "Mostrar seção" : "Ocultar seção"}
      >
        {section.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
      <button
        type="button"
        onClick={() => props.onDuplicate(section.id)}
        className="ae-ib h-8 w-8 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
        aria-label="Duplicar seção"
        title="Duplicar seção"
      >
        <Copy className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => props.onRemove(section.id)}
        className="ae-ib ae-ib-danger h-8 w-8 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
        aria-label="Excluir seção"
        title="Excluir seção (Ctrl Z desfaz)"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}
