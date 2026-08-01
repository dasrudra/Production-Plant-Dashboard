type ConfirmationModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmationModal({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonClass = "",
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="confirmation-modal">
        <div className="confirmation-header">
          <div className="confirmation-icon">⚠️</div>

          <h2>{title}</h2>
        </div>

        <p className="confirmation-message">{message}</p>

        <div className="confirmation-actions">
          <button className="modal-cancel-button" onClick={onCancel}>
            {cancelText}
          </button>

          <button
            className={`modal-confirm-button ${confirmButtonClass}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
