"use client";

import Link from 'next/link';
import { FiBook, FiList } from 'react-icons/fi';
import { useAdminPanel } from './hooks/useAdminPanel';
import type { Seminar, Series } from '@/types';
import { LessonEditor } from './components/LessonEditor';
import { CreationForm } from './components/CreationForm';
import { ContainerCard } from './components/ContainerCard';
import { CreationForm as CreationFormType } from './types';


interface AdminPanelProps {
  initialSeminars?: Seminar[];
  initialSeries?: Series[];
}

export function AdminPanel({ initialSeminars = [], initialSeries = [] }: AdminPanelProps) {
  const { state, actions } = useAdminPanel({ initialSeminars, initialSeries });

  // Si está editando lecciones, mostrar el editor
  if (state.isEditingLessons && state.editingContainer) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <LessonEditor
          container={state.editingContainer}
          selectedLessonIndex={state.selectedLessonIndex}
          fragments={state.fragmentsData}
          editingFragmentIndex={state.editingFragmentIndex}
          onSelectLesson={actions.handleSelectLesson}
          onFragmentEdit={(index) => 
            actions.setState(prev => ({ ...prev, editingFragmentIndex: index === -1 ? null : index }))
          }
          onFragmentUpdate={(fragments) => 
            actions.setState(prev => ({ ...prev, fragmentsData: fragments }))
          }
          onAddFragment={actions.addFragment}
          onRemoveFragment={actions.removeFragment}
          onSaveFragments={actions.saveFragmentsToLesson}
          onFinish={actions.handleFinishEditingLessons}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                ← Volver a la App
              </Link>
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-gray-600">Gestiona seminarios y series de estudio</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => actions.setActiveTab('seminars')}
                className={`cursor-pointer py-2 px-1 border-b-2 font-medium text-sm ${
                  state.activeTab === 'seminars'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiBook className="w-4 h-4 inline mr-2" />
                Seminarios ({state.seminars.length})
              </button>
              <button
                onClick={() => actions.setActiveTab('series')}
                className={`cursor-pointer py-2 px-1 border-b-2 font-medium text-sm ${
                  state.activeTab === 'series'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiList className="w-4 h-4 inline mr-2" />
                Series ({state.series.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Formulario de creación */}
        {state.isCreatingContainer ? (
          <div className="mb-6">
            <CreationForm
              form={state.creationForm}
              type={state.activeTab}
              onFormChange={(form: CreationFormType) => 
                actions.setState(prev => ({ ...prev, creationForm: form }))
              }
              onSave={actions.handleSaveContainer}
              onCancel={actions.handleCancelCreation}
              isSaving={state.isSavingCreate}
            />
          </div>
        ) : (
          /* Botón para crear nuevo contenedor */
          <div className="mb-6">
            <button
              onClick={actions.handleCreateContainer}
              className="cursor-pointer px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Crear Nuevo {state.activeTab === 'seminars' ? 'Seminario' : 'Serie'}
            </button>
          </div>
        )}

        {/* Lista de contenedores */}
        <div className="space-y-4">
          {state.currentData.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <div className="text-gray-400 mb-4">
                {state.activeTab === 'seminars' ? <FiBook className="w-12 h-12 mx-auto" /> : <FiList className="w-12 h-12 mx-auto" />}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay {state.activeTab === 'seminars' ? 'seminarios' : 'series'} creados
              </h3>
              <p className="text-gray-500 mb-4">
                Comienza creando tu primer {state.activeTab === 'seminars' ? 'seminario' : 'serie'} de estudio
              </p>
              <button
                onClick={actions.handleCreateContainer}
                className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear {state.activeTab === 'seminars' ? 'Seminario' : 'Serie'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.currentData.map((container) => (
                <ContainerCard
                  key={container.id}
                  container={container}
                  type={state.activeTab === 'seminars' ? 'seminar' : 'series'}
                  onEdit={actions.handleEditLessons}
                  onDelete={actions.handleDeleteContainer}
                  isDeleting={state.deletingId === container.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
