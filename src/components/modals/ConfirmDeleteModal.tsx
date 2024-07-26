interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Confirmer la suppression</h2>
        <p>{message}</p>
        <div className="mt-6 flex justify-end">
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={onConfirm}
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;