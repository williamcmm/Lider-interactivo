import { FiEdit, FiTrash2, FiBook } from "react-icons/fi";
import { ContainerCardProps } from "../types";

export function ContainerCard({
  container,
  type,
  onEdit,
  onDelete,
}: ContainerCardProps) {
  const formatDate = (date: Date | undefined) => {
    if (!date) return "Sin fecha";
    const d = new Date(date);
    return d.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <FiBook className="w-10 text-blue-600" size={20} />
          <h3 className="font-semibold text-gray-900 text-lg">
            {container.title}
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(container)}
            className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50"
            title="Editar lecciones"
          >
            <FiEdit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(container.id)}
            className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50"
            title="Eliminar"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {container.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {container.description}
        </p>
      )}

      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{container.lessons.length} lecciones</span>
        <span>Creado: {formatDate(container.createdAt)}</span>
      </div>

      {container.audioFiles.length > 0 && (
        <div className="mt-2 text-sm text-gray-500">
          🎵 {container.audioFiles.length} pistas de audio
        </div>
      )}
    </div>
  );
}
