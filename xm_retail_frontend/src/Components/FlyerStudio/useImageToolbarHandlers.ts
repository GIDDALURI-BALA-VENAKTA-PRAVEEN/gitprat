import { useCallback, useState } from 'react';

interface UseImageToolbarHandlersProps {
  flyer: any;
  setFlyer: (f: any) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  lockedElements: string[];
  setLockedElements: (ids: string[]) => void;
  saveFlyerToStorage: (f: any) => void;
  setSnackbar: (snackbar: { open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }) => void;
}

export function useImageToolbarHandlers({
  flyer,
  setFlyer,
  selectedId,
  setSelectedId,
  lockedElements,
  setLockedElements,
  saveFlyerToStorage,
  setSnackbar,
}: UseImageToolbarHandlersProps) {
  // Delete selected image
  const handleDelete = useCallback(() => {
    if (!selectedId) return;
    setFlyer((f: any) => {
      const newFlyer = { ...f, elements: f.elements.filter((el: any) => el.id !== selectedId) };
      saveFlyerToStorage(newFlyer);
      return newFlyer;
    });
    setSelectedId(null);
  }, [selectedId, setFlyer, setSelectedId, saveFlyerToStorage]);

  // Flip horizontally
  const handleFlipHorizontal = useCallback(() => {
    if (!selectedId) return;
    setFlyer((f: any) => {
      const newFlyer = {
        ...f,
        elements: f.elements.map((el: any) =>
          el.id === selectedId ? { ...el, scaleX: el.scaleX ? -el.scaleX : -1 } : el
        ),
      };
      saveFlyerToStorage(newFlyer);
      return newFlyer;
    });
  }, [selectedId, setFlyer, saveFlyerToStorage]);

  // Flip vertically
  const handleFlipVertical = useCallback(() => {
    if (!selectedId) return;
    setFlyer((f: any) => {
      const newFlyer = {
        ...f,
        elements: f.elements.map((el: any) =>
          el.id === selectedId ? { ...el, scaleY: el.scaleY ? -el.scaleY : -1 } : el
        ),
      };
      saveFlyerToStorage(newFlyer);
      return newFlyer;
    });
  }, [selectedId, setFlyer, saveFlyerToStorage]);

  // Bring forward
  const handleBringForward = useCallback(() => {
    setFlyer((f: any) => {
      const idx = f.elements.findIndex((e: any) => e.id === selectedId);
      if (idx < 0 || idx === f.elements.length - 1) return f;
      const newElements = [...f.elements];
      const [el] = newElements.splice(idx, 1);
      newElements.splice(idx + 1, 0, el);
      return { ...f, elements: newElements };
    });
    setSelectedId(selectedId);
  }, [selectedId, setFlyer, setSelectedId]);

  // Send backward
  const handleSendBackward = useCallback(() => {
    setFlyer((f: any) => {
      const idx = f.elements.findIndex((e: any) => e.id === selectedId);
      if (idx <= 0) return f;
      const newElements = [...f.elements];
      const [el] = newElements.splice(idx, 1);
      newElements.splice(idx - 1, 0, el);
      return { ...f, elements: newElements };
    });
    setSelectedId(selectedId);
  }, [selectedId, setFlyer, setSelectedId]);

  // Lock/unlock
  const handleLockToggle = useCallback(() => {
    if (!selectedId) return;
    if (lockedElements.includes(selectedId)) {
      setLockedElements(lockedElements.filter((id: string) => id !== selectedId));
    } else {
      setLockedElements([...lockedElements, selectedId]);
    }
  }, [selectedId, lockedElements, setLockedElements]);

  // Reset size
  const handleResetSize = useCallback(() => {
    if (!selectedId) return;
    setFlyer((f: any) => {
      const newFlyer = {
        ...f,
        elements: f.elements.map((el: any) =>
          el.id === selectedId ? { ...el, width: 180, height: 120, scaleX: 1, scaleY: 1 } : el
        ),
      };
      saveFlyerToStorage(newFlyer);
      return newFlyer;
    });
  }, [selectedId, setFlyer, saveFlyerToStorage]);

  return {
    handleDelete,
    handleFlipHorizontal,
    handleFlipVertical,
    handleBringForward,
    handleSendBackward,
    handleLockToggle,
    handleResetSize,
  };
} 