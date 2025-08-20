import { FiLoader } from 'react-icons/fi';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Loading({ message = "Cargando...", size = 'lg' }: LoadingProps) {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-4">
        <FiLoader 
          className={`${iconSizes[size]} text-blue-600 animate-spin`}
        />
        <p className={`${textSizes[size]} text-gray-700 font-medium`}>
          {message}
        </p>
      </div>
    </div>
  );
}
