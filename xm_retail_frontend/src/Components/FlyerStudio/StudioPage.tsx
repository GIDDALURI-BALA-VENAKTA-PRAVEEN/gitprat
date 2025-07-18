import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Button, Typography, IconButton, Drawer, Divider, TextField, Tooltip, Snackbar, Alert, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Add, Delete, FileUpload, Save, Download, Share, Layers, ArrowBack, TextFields, Image as ImageIcon, FormatColorFill, ContentCopy, Flip, Lock, LockOpen, Edit, Restore } from '@mui/icons-material';
import { Stage, Layer, Rect, Text as KonvaText, Image as KonvaImage, Transformer, Group, Circle } from 'react-konva';
import Nav from '../NavBar/Nav';
import { useTheme } from '@mui/material/styles';

import StudioFlyerLogin from './StudioFlyerLogin';
import StudioFlyerProfile from './StudioFlyerProfile';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import Stack from '@mui/material/Stack';
import SaveFlyerPage from './SaveFlyerPage';
import ShareFlyerPage from './ShareFlyerPage';
import PostFlyerPage from './PostFlyerPage';
import { KonvaEventObject } from 'konva/lib/Node';
import CloseIcon from '@mui/icons-material/Close';
import ScaledCanvas from './ScaledCanvas';
import { Tooltip as MuiTooltip } from '@mui/material';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';
import Popover from '@mui/material/Popover';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import TextEditPanel from './TextEditPanel';
import TextSidebar from './TextSidebar';
import NavBarStudio from './NavBarStudio';
import FlyerBottomToolbar from './FlyerBottomToolbar';
import ImageUploadPanel from './ImageUploadPanel';
import ImageToolbar from './ImageToolbar';
import ImageSidebar from './ImageSidebar';
import { useImageToolbarHandlers } from './useImageToolbarHandlers';
import DownloadFlyerPage from './DownloadFlyerPage';

// Preset canvas sizes
const CANVAS_PRESETS = [
  { label: 'Default (350x500)', width: 350, height: 500 },
  { label: 'Instagram (1080x1080)', width: 1080, height: 1080 },
  { label: 'Facebook Cover (820x312)', width: 820, height: 312 },
  { label: 'A4 (794x1123)', width: 794, height: 1123 },
  { label: 'Custom', width: 0, height: 0 },
];

// Helper for loading images
function useImages(urls: string[]): { [url: string]: HTMLImageElement | undefined } {
  const [images, setImages] = useState<{ [url: string]: HTMLImageElement | undefined }>({});
  const [imageErrors, setImageErrors] = useState<{ [url: string]: string }>({});
  const [loadingImages, setLoadingImages] = useState<{ [url: string]: boolean }>({});
  
  useEffect(() => {
    urls.forEach(url => {
      if (url && !images[url] && !loadingImages[url]) {
        console.log('Loading image:', url.substring(0, 50) + '...');
        setLoadingImages(prev => ({ ...prev, [url]: true }));
        
        const img = new window.Image();
        if (!url.startsWith('data:')) {
          img.crossOrigin = 'anonymous';
        }
        
        img.onload = () => {
          console.log('Image loaded successfully:', url.substring(0, 50) + '...');
          setImages(prev => ({ ...prev, [url]: img }));
          setImageErrors(prev => {
            const { [url]: _, ...rest } = prev;
            return rest;
          });
          setLoadingImages(prev => {
            const { [url]: _, ...rest } = prev;
            return rest;
          });
        };
        
        img.onerror = (e: any) => {
          console.error('Failed to load image:', url.substring(0, 100) + '...', e);
          console.error('Image error details:', {
            url: url.substring(0, 100) + '...',
            error: e?.message || 'Unknown error',
            isBase64: url.startsWith('data:'),
            length: url.length
          });
          setImages(prev => ({ ...prev, [url]: undefined }));
          setImageErrors(prev => ({ ...prev, [url]: e?.message || 'Failed to load image' }));
          setLoadingImages(prev => {
            const { [url]: _, ...rest } = prev;
            return rest;
          });
        };
        
        // Set a timeout to prevent infinite loading
        const timeout = setTimeout(() => {
          if (loadingImages[url]) {
            console.error('Image loading timeout:', url.substring(0, 100) + '...');
            setImages(prev => ({ ...prev, [url]: undefined }));
            setImageErrors(prev => ({ ...prev, [url]: 'Loading timeout' }));
            setLoadingImages(prev => {
              const { [url]: _, ...rest } = prev;
              return rest;
            });
          }
        }, 10000); // 10 second timeout
        
        img.src = url;
        
        // Cleanup timeout when image loads or errors
        img.onload = () => {
          clearTimeout(timeout);
          console.log('Image loaded successfully:', url.substring(0, 50) + '...');
          setImages(prev => ({ ...prev, [url]: img }));
          setImageErrors(prev => {
            const { [url]: _, ...rest } = prev;
            return rest;
          });
          setLoadingImages(prev => {
            const { [url]: _, ...rest } = prev;
            return rest;
          });
        };
        
        img.onerror = (e: any) => {
          clearTimeout(timeout);
          console.error('Failed to load image:', url.substring(0, 100) + '...', e);
          setImages(prev => ({ ...prev, [url]: undefined }));
          setImageErrors(prev => ({ ...prev, [url]: e?.message || 'Failed to load image' }));
          setLoadingImages(prev => {
            const { [url]: _, ...rest } = prev;
            return rest;
          });
        };
      }
    });
    // eslint-disable-next-line
  }, [urls.join(',')]);
  
  // Attach errors to images object for external use
  (images as any)._errors = imageErrors;
  (images as any)._loading = loadingImages;
  return images;
}

// Helper to check if image is a local upload (data URL)
function isLocalImage(url: string): boolean {
  return url.startsWith('data:');
}

function getProxiedImageUrl(originalUrl: string): string {
  return `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`;
}

const defaultFlyer = {
  backgroundColor: '#fff',
  elements: [],
};

// Helper function to optimize flyer data while preserving all images
const optimizeFlyerData = (flyerData: any) => {
  try {
    // Validate input data structure
    if (!flyerData || typeof flyerData !== 'object') {
      console.error('Invalid flyer data structure:', flyerData);
      return flyerData;
    }
    
    if (!Array.isArray(flyerData.elements)) {
      console.error('Flyer data elements is not an array:', flyerData.elements);
      return flyerData;
    }
    
    const originalSize = JSON.stringify(flyerData).length;
    console.log('Original flyer data size:', originalSize, 'bytes');
    
    // Count images for debugging
    const imageCount = flyerData.elements?.filter((el: any) => el.type === 'image').length || 0;
    console.log('Number of images in flyer:', imageCount);
    
    // Optimize image data while preserving all images
    const optimizedElements = flyerData.elements.map((el: any) => {
      if (el.type === 'image' && el.image && el.image.startsWith('data:')) {
        // Optimize base64 images by reducing quality slightly if they're very large
        const imageSize = el.image.length;
        if (imageSize > 5000000) { // 5MB per image
          console.log(`Large image detected: ${imageSize} bytes, optimizing...`);
          // For now, keep the image as-is but log it
          // In a real implementation, you might want to compress the base64 data
        }
      }
      return el;
    });
    
    const optimizedData = {
          ...flyerData,
      elements: optimizedElements
        };
      
    const optimizedSize = JSON.stringify(optimizedData).length;
    console.log('Optimized flyer data size:', optimizedSize, 'bytes');
    console.log('Size difference:', originalSize - optimizedSize, 'bytes');
    
    return optimizedData;
  } catch (error) {
    console.error('Error optimizing flyer data:', error);
    return flyerData;
  }
};

// Helper function to decompress flyer data
const decompressFlyerData = (compressedData: any) => {
  try {
    // For now, just return the compressed data as-is
    // In a real implementation, you might want to restore base64 data from a separate storage
    return compressedData;
  } catch (error) {
    console.error('Error decompressing flyer data:', error);
    return defaultFlyer;
  }
};

// Helper function to safely save flyer to localStorage
const saveFlyerToStorage = (flyerData: any) => {
  try {
    const originalImageCount = flyerData.elements.filter((el: any) => el.type === 'image').length;
    const optimizedData = optimizeFlyerData(flyerData);
    const optimizedImageCount = optimizedData.elements.filter((el: any) => el.type === 'image').length;
    
    // All images should be preserved
    if (originalImageCount !== optimizedImageCount) {
      console.warn(`Image count mismatch: ${originalImageCount} vs ${optimizedImageCount}`);
    }
    
    localStorage.setItem('flyer', JSON.stringify(optimizedData));
    console.log(`✅ Saved flyer with ${optimizedImageCount} images preserved`);
  } catch (error) {
    if (error && typeof error === 'object' && 'name' in error && (error as any).name === 'QuotaExceededError') {
      console.error('❌ Failed to save flyer: Storage quota exceeded. Your flyer is too large for localStorage. Try reducing the number or size of images, or use a different browser.');
    } else {
    console.error('Failed to save flyer to localStorage:', error);
    }
    // If localStorage is full, try to clear some space
    try {
      localStorage.clear();
      const optimizedData = optimizeFlyerData(flyerData);
      localStorage.setItem('flyer', JSON.stringify(optimizedData));
    } catch (clearError) {
      if (clearError && typeof clearError === 'object' && 'name' in clearError && (clearError as any).name === 'QuotaExceededError') {
        console.error('❌ Failed to clear localStorage: Storage quota exceeded. Your flyer is too large for localStorage. Try reducing the number or size of images, or use a different browser.');
      } else {
      console.error('Failed to clear localStorage:', clearError);
      }
      // If all else fails, try to save without images
      try {
        const fallbackData = {
          ...flyerData,
          elements: flyerData.elements.filter((el: any) => el.type !== 'image')
        };
        localStorage.setItem('flyer', JSON.stringify(fallbackData));
        console.warn('Saved flyer without images due to storage issues');
      } catch (finalError) {
        if (finalError && typeof finalError === 'object' && 'name' in finalError && (finalError as any).name === 'QuotaExceededError') {
          console.error('❌ Completely failed to save flyer: Storage quota exceeded. Your flyer is too large for localStorage. Try reducing the number or size of images, or use a different browser.');
        } else {
        console.error('Completely failed to save flyer:', finalError);
        }
      }
    }
  };
};

const StudioPage = () => {
  // Flyer state
  const [flyer, setFlyer] = useState(() => {
    try {
      const saved = localStorage.getItem('flyer');
      if (!saved) return defaultFlyer;
      
      let flyerData = JSON.parse(saved);
      flyerData = decompressFlyerData(flyerData);
      
      // Force all non-data images to use the proxy
      flyerData.elements = flyerData.elements?.map((el: any) => {
        if (el.type === 'image' && el.image && !el.image.startsWith('data:') && !el.image.startsWith('/api/proxy-image')) {
          return { ...el, image: getProxiedImageUrl(el.image) };
        }
        return el;
      }) || [];
      return flyerData;
    } catch (error) {
      console.error('Error loading flyer from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem('flyer');
      return defaultFlyer;
    }
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const stageRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const theme = useTheme();
  const [zoom, setZoom] = useState(1);

  // Auth state
  const [studioToken, setStudioToken] = useState<string | null>(() => localStorage.getItem('studioToken'));
  const [showRegister, setShowRegister] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Canvas size state
  const [canvasSize, setCanvasSize] = useState({ width: 350, height: 500 });
  const [canvasPreset, setCanvasPreset] = useState('Default (350x500)');
  const [customSize, setCustomSize] = useState({ width: 350, height: 500 });
  const [previewOpen, setPreviewOpen] = useState(false);

  // Locked elements state
  const [lockedElements, setLockedElements] = useState<string[]>([]);

  // Dialog open handlers (now just open/close state)
  const [openPost, setOpenPost] = useState(false);
  const [openSave, setOpenSave] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  const [openDownload, setOpenDownload] = useState(false);

  // New state variables for inline rendering
  const [showSaveFlyer, setShowSaveFlyer] = useState(false);
  const [showPostFlyer, setShowPostFlyer] = useState(false);
  const [showShareFlyer, setShowShareFlyer] = useState(false);
  const [showDownloadFlyer, setShowDownloadFlyer] = useState(false);

  

  // Add this with other useState hooks at the top:
  const [openAssetPanel, setOpenAssetPanel] = useState<string | null>(null);

  // Add state for crop/resize mode
  const [cropResizeId, setCropResizeId] = useState<string | null>(null);

  // Fetch profile if logged in
  useEffect(() => {
    if (studioToken) {
      setProfileLoading(true);
      fetch('/api/studio-users/profile', { headers: { Authorization: `Bearer ${studioToken}` } })
        .then(res => res.ok ? res.json() : null)
        .then(data => { setProfile(data); setProfileLoading(false); })
        .catch(() => { setProfile(null); setProfileLoading(false); });
    } else {
      setProfile(null);
    }
  }, [studioToken]);

  // Load flyer from storage on component mount
  useEffect(() => {
    const loadFlyerFromStorage = async () => {
      // Try localStorage first
      let savedFlyer = localStorage.getItem('flyer');
      let isCompressed = localStorage.getItem('flyer_compressed') === 'true';
      
      if (savedFlyer) {
        try {
          let parsedFlyer = JSON.parse(savedFlyer);
          
          // If it was compressed, decompress it
          if (isCompressed) {
            console.log('📦 Loading compressed flyer from localStorage');
            parsedFlyer = decompressFlyerData(parsedFlyer);
          }
          
          // Force all non-data images to use the proxy
          parsedFlyer.elements = parsedFlyer.elements?.map((el: any) => {
            if (el.type === 'image' && el.image && !el.image.startsWith('data:') && !el.image.startsWith('/api/proxy-image')) {
              return { ...el, image: getProxiedImageUrl(el.image) };
            }
            return el;
          }) || [];
          
          setFlyer(parsedFlyer);
          console.log('✅ Loaded flyer from localStorage');
      return;
        } catch (error) {
          console.error('Failed to parse saved flyer from localStorage:', error);
          localStorage.removeItem('flyer');
        }
      }
      
      // Try sessionStorage
      savedFlyer = sessionStorage.getItem('flyer');
      if (savedFlyer) {
        try {
          const parsedFlyer = JSON.parse(savedFlyer);
          
          // Force all non-data images to use the proxy
          parsedFlyer.elements = parsedFlyer.elements?.map((el: any) => {
            if (el.type === 'image' && el.image && !el.image.startsWith('data:') && !el.image.startsWith('/api/proxy-image')) {
              return { ...el, image: getProxiedImageUrl(el.image) };
            }
            return el;
          }) || [];
          
          setFlyer(parsedFlyer);
          console.log('✅ Loaded flyer from sessionStorage');
          return;
        } catch (error) {
          console.error('Failed to parse saved flyer from sessionStorage:', error);
          sessionStorage.removeItem('flyer');
        }
      }
      
      // Try IndexedDB as last resort
      try {
        const flyerFromIndexedDB = await loadFromIndexedDB();
        if (flyerFromIndexedDB) {
          // Force all non-data images to use the proxy
          flyerFromIndexedDB.elements = flyerFromIndexedDB.elements?.map((el: any) => {
            if (el.type === 'image' && el.image && !el.image.startsWith('data:') && !el.image.startsWith('/api/proxy-image')) {
              return { ...el, image: getProxiedImageUrl(el.image) };
            }
            return el;
          }) || [];
          
          setFlyer(flyerFromIndexedDB);
          console.log('✅ Loaded flyer from IndexedDB');
          return;
        }
      } catch (error) {
        console.error('Failed to load from IndexedDB:', error);
      }
      
      console.log('No saved flyer found in any storage, using default');
    };
    
    loadFlyerFromStorage();
  }, []);

  // Helper function to load from IndexedDB
  const loadFromIndexedDB = async (): Promise<any> => {
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open('FlyerStorage', 1);
        
        request.onerror = () => {
          reject(new Error('Failed to open IndexedDB'));
        };
        
        request.onsuccess = (event) => {
          const target = event.target as IDBOpenDBRequest;
          const db = target.result;
          const transaction = db.transaction(['flyers'], 'readonly');
          const store = transaction.objectStore('flyers');
          const getRequest = store.get('current');
          
          getRequest.onsuccess = () => {
            if (getRequest.result) {
              resolve(getRequest.result.data);
            } else {
              resolve(null);
            }
          };
          
          getRequest.onerror = () => {
            reject(new Error('Failed to get data from IndexedDB'));
          };
        };
        
        request.onupgradeneeded = (event) => {
          const target = event.target as IDBOpenDBRequest;
          const db = target.result;
          if (!db.objectStoreNames.contains('flyers')) {
            db.createObjectStore('flyers', { keyPath: 'id' });
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  };

  // Centralized export function
  const exportFlyerImage = useCallback(() => {
    if (!stageRef.current || typeof stageRef.current.toDataURL !== 'function') return null;
    const stage = stageRef.current;
    // Save current scale and position
    const oldScaleX = stage.scaleX();
    const oldScaleY = stage.scaleY();
    const oldX = stage.x();
    const oldY = stage.y();
    // Reset to original
    stage.scale({ x: 1, y: 1 });
    stage.position({ x: 0, y: 0 });
    stage.batchDraw();
    // Export at original size
    const imageData = stage.toDataURL({
      width: canvasSize.width,
      height: canvasSize.height,
      pixelRatio: 2
    });
    // Restore previous scale and position
    stage.scale({ x: oldScaleX, y: oldScaleY });
    stage.position({ x: oldX, y: oldY });
    return imageData;
  }, [canvasSize]);

 

  
  
  // Asset upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    let successCount = 0;
    let errorCount = 0;
    
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        setSnackbar({ open: true, message: 'Only image files are allowed.', severity: 'error' });
        errorCount++;
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setSnackbar({ open: true, message: 'Image is too large. Please upload images < 5MB.', severity: 'error' });
        errorCount++;
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target && typeof ev.target.result === 'string') {
          setUploadedImages(prev => [...prev, ev.target!.result as string]);
          successCount++;
          if (successCount === files.length - errorCount) {
            setSnackbar({ 
              open: true, 
              message: `Successfully uploaded ${successCount} image${successCount > 1 ? 's' : ''}!`, 
              severity: 'success' 
            });
          }
        }
      };
      reader.onerror = () => {
        errorCount++;
        setSnackbar({ open: true, message: `Failed to read file: ${file.name}`, severity: 'error' });
      };
      reader.readAsDataURL(file);
    });
    
    // Clear the input
    e.target.value = '';
  };

  // Add image to canvas (centered)
  const addImageToCanvas = (url: string) => {
    let finalUrl = url;
    if (!isLocalImage(url)) {
      setSnackbar({ open: true, message: 'Web images may cause sharing/export to fail due to browser security (CORS). Please use images uploaded from your device for best results.', severity: 'warning' });
      finalUrl = getProxiedImageUrl(url);
    }
    
    // Pre-load the image to ensure it loads before adding to canvas
    const img = new window.Image();
    if (!finalUrl.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    
    // Set a timeout for image loading
    const timeout = setTimeout(() => {
      setSnackbar({ 
        open: true, 
        message: 'Image loading timeout. Please try uploading the image from your device instead.', 
        severity: 'error' 
      });
    }, 5000);
    
    img.onload = () => {
      clearTimeout(timeout);
      console.log('Image pre-loaded successfully, adding to canvas:', finalUrl.substring(0, 50) + '...');
      const { x, y } = getCenterPosition();
      setFlyer((f: any) => {
        const newFlyer = {
          ...f,
          elements: [
            ...f.elements,
            {
              id: Date.now() + Math.random(),
              type: 'image',
              image: finalUrl,
              x,
              y,
              width: 180,
              height: 120,
              rotation: 0,
              crop: null, // for cropping
            },
          ],
        };
        saveFlyerToStorage(newFlyer);
        return newFlyer;
      });
      setSnackbar({ open: true, message: 'Image added to canvas successfully!', severity: 'success' });
    };
    
    img.onerror = (e: any) => {
      clearTimeout(timeout);
      console.error('Failed to pre-load image:', finalUrl.substring(0, 100) + '...', e);
      setSnackbar({ 
        open: true, 
        message: 'Failed to load image. Please try uploading the image from your device instead.', 
        severity: 'error' 
      });
    };
    
    img.src = finalUrl;
  };

  // Add text to canvas
  const addTextToCanvas = () => {
    setFlyer((f: any) => {
      const newFlyer = {
        ...f,
        elements: [
          ...f.elements,
          {
            id: Date.now() + Math.random(),
            type: 'text',
            text: 'Double-click to edit',
            x: 120,
            y: 120,
            fontSize: 32,
            fill: '#222',
            width: 200,
            rotation: 0,
          },
        ],
      };
      saveFlyerToStorage(newFlyer);
      return newFlyer;
    });
  };

  // Add background color
  const setBackgroundColor = (color: string) => {
    setFlyer((f: any) => {
      const newFlyer = { ...f, backgroundColor: color };
      saveFlyerToStorage(newFlyer);
      return newFlyer;
    });
  };

  // Select element
  const handleSelect = (id: string) => {
    setSelectedId(id);
    // Prevent opening the side panel when clicking a text element in the canvas
    // const element = flyer.elements.find((el: any) => el.id === id);
    // if (element?.type === 'text') {
    //   setOpenAssetPanel('text');
    // }
  };

  // Deselect on empty area
  const handleStageClick = (e: any) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
    }
  };

  // Edit text
  const handleTextEdit = (id: string, value: string) => {
    setFlyer((f: any) => {
      const newFlyer = {
        ...f,
        elements: f.elements.map((el: any) => el.id === id ? { ...el, text: value } : el),
      };
      saveFlyerToStorage(newFlyer);
      return newFlyer;
    });
  };

  // Move/resize/rotate
  const handleTransform = (id: string, newAttrs: any) => {
    setFlyer((f: any) => {
      const newFlyer = {
        ...f,
        elements: f.elements.map((el: any) => el.id === id ? { ...el, ...newAttrs } : el),
      };
      saveFlyerToStorage(newFlyer);
      return newFlyer;
    });
  };


  // Inline text editing
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingTextValue, setEditingTextValue] = useState<string>('');
  useEffect(() => {
    if (editingTextId) {
      const el = flyer.elements.find((e: any) => e.id === editingTextId);
      setEditingTextValue(el?.text || '');
    }
  }, [editingTextId]);

  // --- CROP/RESIZE TOOL STATE ---
  // Remove cropMode state and all references to it

  // Helper to get center position for new images (use current flyer size)
  const getCenterPosition = (imgWidth: number = 180, imgHeight: number = 120) => ({
    x: (canvasSize.width - imgWidth) / 2,
    y: (canvasSize.height - imgHeight) / 2,
  });

  // Helper to get the selected image's screen position for toolbar
  const getSelectedImageScreenPos = useCallback(() => {
    if (!selectedId) return null;
    const el = flyer.elements.find((e: any) => e.id === selectedId && e.type === 'image');
    if (!el || !stageRef.current) return null;
    const containerRect = stageRef.current.container().getBoundingClientRect();
    const scale = zoom * Math.min(220 / canvasSize.width, 340 / canvasSize.height);
    return {
      left: containerRect.left + el.x * scale,
      top: containerRect.top + el.y * scale-40,
      width: (el.crop ? el.crop.width : el.width) * scale,
    };
  }, [selectedId, flyer.elements, zoom, canvasSize, stageRef]);

  // UI
  const imageUrls = flyer.elements.filter((el: any) => el.type === 'image').map((el: any) => el.image);
  const images = useImages(imageUrls);

  

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Remove crop mode when pressing Escape
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const isGuest = !studioToken || !profile;

  // Add these functions for different text styles
  const addHeading = () => {
    setFlyer((f: any) => {
      const newFlyer = {
        ...f,
        elements: [
          ...f.elements,
          {
            id: Date.now() + Math.random(),
            type: 'text',
            text: 'Add a heading',
            x: 100,
            y: 100,
            fontSize: 36,
            fill: '#222',
            width: 300,
            rotation: 0,
            fontWeight: 'bold',
          },
        ],
      };
      saveFlyerToStorage(newFlyer);
      return newFlyer;
    });
  };
  const addSubheading = () => {
    setFlyer((f: any) => {
      const newFlyer = {
        ...f,
        elements: [
          ...f.elements,
          {
            id: Date.now() + Math.random(),
            type: 'text',
            text: 'Add a subheading',
            x: 100,
            y: 160,
            fontSize: 28,
            fill: '#444',
            width: 260,
            rotation: 0,
            fontWeight: 600,
          },
        ],
      };
      saveFlyerToStorage(newFlyer);
      return newFlyer;
    });
  };
  const addBodyText = () => {
    setFlyer((f: any) => {
      const newFlyer = {
        ...f,
        elements: [
          ...f.elements,
          {
            id: Date.now() + Math.random(),
            type: 'text',
            text: 'Add a little bit of body text',
            x: 100,
            y: 220,
            fontSize: 18,
            fill: '#555',
            width: 220,
            rotation: 0,
            fontWeight: 400,
          },
        ],
      };
      saveFlyerToStorage(newFlyer);
      return newFlyer;
    });
  };

  // Replace the main return with a Canva-like layout
  const imageToolbarHandlers = useImageToolbarHandlers({
    flyer,
    setFlyer,
    selectedId,
    setSelectedId,
    lockedElements,
    setLockedElements,
    saveFlyerToStorage,
    setSnackbar,
  });

  // Add this ref for the crop rectangle
  const cropRectRef = useRef<any>(null);
  const cropTransformerRef = useRef<any>(null);

  // Destructure crop handlers/state from the hook
  const {
    // ...other handlers
  } = imageToolbarHandlers;

  return (
    <>
      <Box sx={{ minHeight: '100vh', minWidth: '100vw', height: '100vh', width: '100vw', overflow: 'hidden', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        {/* Top Bar */}
        <NavBarStudio
          navigate={navigate}
          handleDownload={() => setShowDownloadFlyer(true)}
          studioToken={studioToken}
          profile={profile}
          anchorEl={anchorEl}
          open={open}
          handleProfileMenu={handleProfileMenu}
          handleCloseMenu={handleCloseMenu}
          setStudioToken={setStudioToken}
          onClearFlyer={() => {
            setFlyer(defaultFlyer);
            setSelectedId(null);
            saveFlyerToStorage(defaultFlyer);
            setSnackbar({ open: true, message: 'Flyer cleared!', severity: 'info' });
          }}
          flyer={flyer}
          canvasSize={canvasSize}
          stageRef={stageRef}
          onOpenShare={() => setShowShareFlyer(true)}
          onOpenSave={() => setShowSaveFlyer(true)}
          onOpenPost={() => setShowPostFlyer(true)}
        />
        {/* Main Content Layout */}
        <Box sx={{ display: 'flex', pt: '56px', height: 'calc(100vh - 56px)' }}>
          {/* Left Sidebar: Assets */}
          <Box sx={{ display: 'flex', height: 'calc(100vh - 56px)', pt: 0 }}>
            {/* Sidebar: icon-only, under nav, full content height */}
            <Box sx={{ width: 60, background: '#fff', borderRight: '1px solid #eee', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 2, boxShadow: 2, borderRadius: '0 16px 16px 0', position: 'relative', zIndex: 1201 }}>
              <Tooltip title="Images" placement="right">
                <IconButton sx={{ mb: 2, color: openAssetPanel === 'images' ? '#1976d2' : '#888', borderRadius: 2, '&:hover': { background: '#f0f0f0', color: '#1976d2' } }} onClick={() => setOpenAssetPanel(openAssetPanel === 'images' ? null : 'images')}>
                  <ImageIcon fontSize="large" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Text" placement="right">
                <IconButton sx={{ mb: 2, color: openAssetPanel === 'text' ? '#1976d2' : '#888', borderRadius: 2, '&:hover': { background: '#f0f0f0', color: '#1976d2' } }} onClick={() => setOpenAssetPanel(openAssetPanel === 'text' ? null : 'text')}>
                  <TextFields fontSize="large" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Background" placement="right">
                <IconButton sx={{ mb: 2, color: openAssetPanel === 'background' ? '#1976d2' : '#888', borderRadius: 2, '&:hover': { background: '#f0f0f0', color: '#1976d2' } }} onClick={() => setOpenAssetPanel(openAssetPanel === 'background' ? null : 'background')}>
                  <FormatColorFill fontSize="large" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Uploads" placement="right">
                <IconButton sx={{ mb: 2, color: openAssetPanel === 'uploads' ? '#1976d2' : '#888', borderRadius: 2, '&:hover': { background: '#f0f0f0', color: '#1976d2' } }} onClick={() => setOpenAssetPanel(openAssetPanel === 'uploads' ? null : 'uploads')}>
                  <FileUpload fontSize="large" />
                </IconButton>
              </Tooltip>
        </Box>
            {/* Slide-out asset panel, visually attached to sidebar, full height, under nav */}
            {openAssetPanel && (
              // Only render the outer Box, header, and collapse button for non-image panels
              openAssetPanel === 'images' ? (
                <ImageSidebar
                  openAssetPanel={openAssetPanel}
                  setOpenAssetPanel={setOpenAssetPanel}
                  uploadedImages={uploadedImages}
                  setUploadedImages={setUploadedImages}
                  addImageToCanvas={addImageToCanvas}
                  setSnackbar={setSnackbar}
                />
              ) : (
              <Box sx={{
                width: 320,
                height: '100%',
                background: '#fff',
                boxShadow: 4,
                borderRadius: '0 16px 16px 0',
                p: 0,
                position: 'relative',
                zIndex: 1200,
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
                ml: '-8px',
                borderLeft: 'none',
                borderTop: 'none',
                borderBottom: 'none',
                borderRight: '1px solid #eee',
                  overflowY: 'auto',
              }}>
                {/* Collapse arrow in the vertical center */}
                <IconButton
                  onClick={() => setOpenAssetPanel(null)}
                  sx={{
                  position: 'absolute',
                    right: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      margin: 0,
                  zIndex: 1300,
                  background: '#fff',
                  boxShadow: 2,
                      borderRadius: '0 8px 8px 0',
                  border: '1px solid #eee',
                      borderLeft: 'none',
                    width: 40,
                      height: 48,
                  '&:hover': { background: '#f0f0f0' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                      padding: 0,
                  }}
                >
                  <ChevronLeftIcon fontSize="large" />
                </IconButton>
                <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 2, borderBottom: '1px solid #f0f0f0', background: '#fafbfc', borderRadius: '0 16px 0 0', position: 'sticky', top: 0, zIndex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{openAssetPanel.charAt(0).toUpperCase() + openAssetPanel.slice(1)}</Typography>
                </Box>
            <Box sx={{ p: 2 }}>
                  {/* Panel content by type */}
                  {openAssetPanel === 'text' && (
                    <TextSidebar
                      flyer={flyer}
                      setFlyer={setFlyer}
                      saveFlyerToStorage={saveFlyerToStorage}
                    />
              )}
                  {openAssetPanel === 'background' && (
                    <>
                  <Typography variant="body2" sx={{ mb: 1 }}>Background Color</Typography>
                      <input type="color" value={flyer.backgroundColor} onChange={e => setBackgroundColor(e.target.value)} style={{ width: '100%', height: 40, border: 'none', borderRadius: 6 }} />
                    </>
                  )}
                  {openAssetPanel === 'uploads' && (
                    <Typography variant="body2" color="text.secondary">Uploads panel coming soon.</Typography>
                  )}
                </Box>
                </Box>
              )
              )}
            </Box>
          {/* Centered Canvas Area */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 0, minWidth: 0 }}>
            {/* TextEditPanel between NavBar and Canvas */}
            {selectedId && (() => {
              const el = flyer.elements.find((e: any) => e.id === selectedId && e.type === 'text');
              if (!el) return null;
              return (
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 3, mb: 2, zIndex: 1300 }}>
                  <TextEditPanel
                    el={el}
                    editing={editingTextId === el.id}
                    editingValue={editingTextValue}
                    onChange={attrs => handleTransform(el.id, attrs)}
                    onDelete={imageToolbarHandlers.handleDelete}
                    onEditChange={val => setEditingTextValue(val)}
                    onEditBlur={() => {
                      handleTextEdit(el.id, editingTextValue);
                      setEditingTextId(null);
                    }}
                    onEditKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleTextEdit(el.id, editingTextValue);
                        setEditingTextId(null);
                      } else if (e.key === 'Escape') {
                        setEditingTextId(null);
                      }
                    }}
                  />
                </Box>
              );
            })()}
            {/* Canvas controls (zoom, preview, etc.) */}
            {/* REMOVE the entire Box with mb: 2, display: 'flex', alignItems: 'center', gap: 2, and its children (canvas size select, custom size, preview, zoom, etc) */}
            <ScaledCanvas
              width={canvasSize.width}
              height={canvasSize.height}
              displayWidth={220}
              displayHeight={340}
              stageRef={stageRef}
              flyer={flyer}
              selectedId={selectedId}
              images={images}
              isGuest={isGuest}
              lockedElements={lockedElements}
              trRef={trRef}
              zoom={zoom}
              backgroundColor={flyer.backgroundColor}
              onMouseDown={e => {
                if (isGuest) {
                  setLoginModalOpen(true);
                  return;
                }
                // If click is not on an image, exit crop/resize mode
                if (e.target === e.target.getStage()) {
                  setSelectedId(null);
                  setCropResizeId(null);
                }
                handleStageClick(e);
              }}
              onTouchStart={e => {
                if (isGuest) {
                  setLoginModalOpen(true);
                  return;
                }
                if (e.target === e.target.getStage()) {
                  setSelectedId(null);
                  setCropResizeId(null);
                }
                handleStageClick(e);
              }}
              onSelect={handleSelect}
              onTransform={handleTransform}
              onDelete={imageToolbarHandlers.handleDelete}
              setEditingTextId={setEditingTextId}
              editingTextId={editingTextId}
              editingTextValue={editingTextValue}
              setEditingTextValue={setEditingTextValue}
              handleTextEdit={handleTextEdit}
              cropResizeId={cropResizeId}
            />

            {/* Canva-style floating toolbar above selected image */}
            {selectedId && (() => {
              const el = flyer.elements.find((e: any) => e.id === selectedId && e.type === 'image');
              if (!el) return null;
              const pos = getSelectedImageScreenPos();
              if (!pos) return null;
              const isLocked = lockedElements.includes(selectedId);
              return (
                <ImageToolbar
                  isLocked={isLocked}
                  onCrop={() => { setCropResizeId(el.id); setSelectedId(el.id); }}
                  onFlipHorizontal={imageToolbarHandlers.handleFlipHorizontal}
                  onFlipVertical={imageToolbarHandlers.handleFlipVertical}
                  onEdit={() => {}}
                  onDelete={imageToolbarHandlers.handleDelete}
                  onBringForward={imageToolbarHandlers.handleBringForward}
                  onSendBackward={imageToolbarHandlers.handleSendBackward}
                  onLockToggle={imageToolbarHandlers.handleLockToggle}
                  onResetSize={imageToolbarHandlers.handleResetSize}
                  style={{ left: pos.left, top: pos.top - 48 }}
                  cropMode={cropResizeId === el.id}
                />
              );
            })()}
            {/* --- Crop/Resize Overlay --- */}
            {/* Crop rectangle and Transformer for crop mode are now handled inside ScaledCanvas. Remove them from here. */}
            {/* --- Crop/Resize Apply/Cancel Buttons --- */}
            {/* Remove all crop/resize mode UI and Apply/Cancel buttons */}

                        <Typography variant="caption" color="primary" sx={{ mt: 1, mb: 2, display: 'block', textAlign: 'center' }}>
                Visible area: {canvasSize.width} x {canvasSize.height} px
              </Typography>
              {/* Remove all crop/resize mode UI and Apply/Cancel buttons */}
          </Box>
          </Box>
        </Box>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={2500}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity as any} sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
        {/* Preview Dialog */}
        <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="xl">
          <Box sx={{ p: 2, position: 'relative', background: '#f5f5f5' }}>
            <IconButton onClick={() => setPreviewOpen(false)} sx={{ position: 'absolute', top: 8, right: 8 }}><CloseIcon /></IconButton>
            <Typography variant="h6" sx={{ mb: 2 }}>Flyer Preview</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fff', borderRadius: 2, boxShadow: 2, p: 2 }}>
              {React.createElement(
                Stage as any,
                {
                  width: canvasSize.width,
                  height: canvasSize.height,
                  style: {
                    background: flyer.backgroundColor,
                    borderRadius: 12,
                    width: canvasSize.width,
                    height: canvasSize.height,
                    border: '2px solid #1976d2',
                    boxSizing: 'border-box',
                  },
                },
                React.createElement(
                  Layer as any,
                  null,
                  React.createElement(Rect as any, {
                    x: 0,
                    y: 0,
                    width: canvasSize.width,
                    height: canvasSize.height,
                    fill: flyer.backgroundColor,
                    listening: false,
                  }),
                  flyer.elements.map((el: any, idx: number) => {
                    if (el.type === 'image') {
                      const img = images[el.image];
                      const cropProps = el.crop ? {
                        crop: {
                          x: el.crop.x,
                          y: el.crop.y,
                          width: el.crop.width,
                          height: el.crop.height,
                        },
                        width: el.crop.width,
                        height: el.crop.height,
                      } : {
                        width: el.width,
                        height: el.height,
                      };
                      return React.createElement(
                        Group as any,
                        {
                          key: el.id,
                          x: el.x,
                          y: el.y,
                          rotation: el.rotation,
                        },
                        React.createElement(KonvaImage as any, { image: img, ...cropProps, key: 'img', scaleX: el.scaleX ?? 1, scaleY: el.scaleY ?? 1 })
                      );
                    }
                    if (el.type === 'text') {
                      return React.createElement(
                        Group as any,
                        {
                          key: el.id,
                          x: el.x,
                          y: el.y,
                          rotation: el.rotation,
                        },
                        React.createElement(KonvaText as any, {
                          text: el.text,
                          fontSize: el.fontSize,
                          fill: el.fill,
                          width: el.width,
                          key: 'txt',
                        })
                      );
                    }
                    return null;
                  })
                )
              )}
            </Box>
            <Typography variant="caption" color="primary" sx={{ mt: 2, textAlign: 'center', display: 'block' }}>
              Preview size: {canvasSize.width} x {canvasSize.height} px
            </Typography>
          </Box>
        </Dialog>


        {/* Save Flyer Dialog */}
        {showSaveFlyer && (
          <SaveFlyerPage
            flyer={flyer}
            studioToken={studioToken}
            onSuccess={() => setShowSaveFlyer(false)}
            onError={() => setShowSaveFlyer(false)}
            canvasSize={canvasSize}
            stageRef={stageRef}
          />
        )}




        {/* Post Flyer Dialog */}
        {showPostFlyer && (
          <PostFlyerPage
            flyer={flyer}
            profile={profile}
            onSuccess={() => setShowPostFlyer(false)}
            onError={() => setShowPostFlyer(false)}
            canvasSize={canvasSize}
            stageRef={stageRef}
          />
        )}
        {/* Share Flyer Dialog */}
        {showShareFlyer && (
          <ShareFlyerPage
            flyer={flyer}
            studioToken={studioToken}
            onSuccess={() => setShowShareFlyer(false)}
            onError={() => setShowShareFlyer(false)}
            canvasSize={canvasSize}
            stageRef={stageRef}
          />
        )}

        {/* Download Flyer Dialog */}
        {showDownloadFlyer && (
          <DownloadFlyerPage
            flyer={flyer}
            canvasSize={canvasSize}
            stageRef={stageRef}
            onSuccess={() => setShowDownloadFlyer(false)}
            onError={() => setShowDownloadFlyer(false)}
          />
        )}
        {/* Add the bottom toolbar for preview and size controls */}
        <FlyerBottomToolbar
          zoom={zoom}
          onZoomChange={setZoom}
          setPreviewOpen={setPreviewOpen}
          canvasPreset={canvasPreset}
          setCanvasPreset={setCanvasPreset}
          customSize={customSize}
          setCustomSize={setCustomSize}
          onSizeChange={(w: number, h: number) => setCanvasSize({ width: w, height: h })}
        />
      
    </>
  );
};

export default StudioPage;