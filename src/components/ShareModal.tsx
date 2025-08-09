import { Fragment, Lesson } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: Lesson;
  fragment: Fragment;
  fragmentIndex: number;
}

export function ShareModal({ isOpen, onClose, lesson, fragment, fragmentIndex }: ShareModalProps) {
  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/shared-slide?lesson=${lesson.id}&fragment=${fragmentIndex}`;
  const shareText = shareUrl; // Solo el enlace, texto más corto

  const copyToClipboard = async () => {
    try {
      if ((navigator as any).clipboard) {
        await (navigator as any).clipboard.writeText(shareUrl); // Solo el URL
        return true;
      }
    } catch (error) {
      console.error('Error al copiar:', error);
    }
    return false;
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-green-500 hover:bg-green-600',
      action: async () => {
        await copyToClipboard();
        // Para WhatsApp, enviar solo el URL para que sea clickeable
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}`;
        window.open(whatsappUrl, '_blank');
        setTimeout(() => alert('✅ ¡Enlace copiado y WhatsApp abierto! Solo la URL para que sea clickeable.'), 500);
        onClose();
      }
    },
    {
      name: 'Telegram',
      icon: '✈️',
      color: 'bg-blue-500 hover:bg-blue-600',
      action: async () => {
        await copyToClipboard();
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`📖 ${lesson.title} - Fragmento ${fragmentIndex + 1}`)}`;
        window.open(telegramUrl, '_blank');
        setTimeout(() => alert('✅ ¡Enlace copiado y Telegram abierto! Selecciona a quién enviar.'), 500);
        onClose();
      }
    },
    {
      name: 'Email',
      icon: '📧',
      color: 'bg-red-500 hover:bg-red-600',
      action: async () => {
        await copyToClipboard();
        const emailSubject = encodeURIComponent(`${lesson.title} - Fragmento ${fragmentIndex + 1}`);
        const emailBody = encodeURIComponent(shareUrl); // Solo el URL
        const mailtoUrl = `mailto:?subject=${emailSubject}&body=${emailBody}`;
        window.location.href = mailtoUrl;
        setTimeout(() => alert('✅ ¡Enlace copiado y cliente de email abierto!'), 500);
        onClose();
      }
    },
    {
      name: 'Copiar Enlace',
      icon: '📋',
      color: 'bg-gray-500 hover:bg-gray-600',
      action: async () => {
        const success = await copyToClipboard();
        if (success) {
          alert('✅ ¡Enlace copiado al portapapeles! Puedes pegarlo en cualquier aplicación.');
        } else {
          prompt('Copia este enlace:', shareUrl); // Solo el URL
        }
        onClose();
      }
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Compartir Diapositiva</h3>
          <p className="text-gray-600 text-sm">
            {lesson.title} - Fragmento {fragmentIndex + 1}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {shareOptions.map((option, index) => (
            <button
              key={index}
              onClick={option.action}
              className={`${option.color} text-white p-3 rounded-lg font-medium transition duration-200 flex flex-col items-center space-y-1`}
            >
              <span className="text-lg">{option.icon}</span>
              <span className="text-xs">{option.name}</span>
            </button>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-xs text-gray-600 mb-2">Enlace directo:</p>
          <div className="bg-white border rounded p-2">
            <a 
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline text-sm break-all"
            >
              {shareUrl}
            </a>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-200"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
