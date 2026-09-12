import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Camera,
  Image as ImageIcon,
  RotateCcw,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Leaf,
  SwitchCamera,
  X,
  RefreshCw
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { mockFarmerData } from '../data/mockFarmerData';

export interface CropHealthCheckScreenProps {
  onBack: () => void;
  onAnalyzeComplete?: (imageData: { url: string; fileName: string }) => void;
  forceMobile?: boolean;
}

export const CropHealthCheckScreen: React.FC<CropHealthCheckScreenProps> = ({
  onBack,
  onAnalyzeComplete,
  forceMobile = false,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeCaptureMode, setActiveCaptureMode] = useState<'camera' | 'gallery' | null>(null);

  // Live Camera states
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isCameraConnecting, setIsCameraConnecting] = useState<boolean>(false);
  const [isLiveStreamReady, setIsLiveStreamReady] = useState<boolean>(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [useSimulatedFeed, setUseSimulatedFeed] = useState<boolean>(false);

  // References
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Sample leaf images
  const sampleLeafPhotos = [
    {
      name: 'Soybean Leaf (Sample)',
      url: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Rice Leaf (Sample)',
      url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80',
    },
  ];

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setIsCameraConnecting(false);
    setIsLiveStreamReady(false);
    setIsVideoPlaying(false);
    setUseSimulatedFeed(false);
    setCameraError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Attach media stream to video element whenever it mounts or updates
  const setVideoRef = useCallback((element: HTMLVideoElement | null) => {
    videoRef.current = element;
    if (element && streamRef.current) {
      element.srcObject = streamRef.current;
      element.onloadeddata = () => {
        setIsVideoPlaying(true);
        setIsLiveStreamReady(true);
      };
      element.onplaying = () => {
        setIsVideoPlaying(true);
        setIsLiveStreamReady(true);
      };
      element.play().then(() => {
        setIsLiveStreamReady(true);
      }).catch((e) => {
        console.warn('[Camera] Autoplay blocked, trying muted play:', e);
        element.muted = true;
        element.play().then(() => {
          setIsLiveStreamReady(true);
        }).catch(() => {});
      });
    }
  }, []);

  // Ensure video element plays when isCameraActive changes
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      const video = videoRef.current;
      if (video.srcObject !== streamRef.current) {
        video.srcObject = streamRef.current;
      }
      video.play().then(() => {
        setIsLiveStreamReady(true);
      }).catch(() => {});
    }
  }, [isCameraActive]);

  // Start real webcam / mobile camera stream
  const startCamera = async (overrideFacingMode?: 'environment' | 'user') => {
    stopCamera();
    setCameraError(null);
    setSelectedImage(null);
    setActiveCaptureMode('camera');
    setIsCameraConnecting(true);
    setIsCameraActive(true);
    setIsVideoPlaying(false);

    const mode = overrideFacingMode || facingMode;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('[Camera] getUserMedia not available in this environment. Falling back to simulated viewfinder.');
      setIsCameraConnecting(false);
      setUseSimulatedFeed(true);
      setIsLiveStreamReady(true);
      setIsVideoPlaying(true);
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      setIsCameraConnecting(false);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadeddata = () => {
          setIsVideoPlaying(true);
          setIsLiveStreamReady(true);
        };
        videoRef.current.onplaying = () => {
          setIsVideoPlaying(true);
          setIsLiveStreamReady(true);
        };
        videoRef.current.play().then(() => {
          setIsLiveStreamReady(true);
        }).catch(() => {});
      }
    } catch (err: any) {
      console.warn('[Camera] Initial camera request failed, trying simple video constraint:', err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallbackStream;
        setIsCameraConnecting(false);

        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.onloadeddata = () => {
            setIsVideoPlaying(true);
            setIsLiveStreamReady(true);
          };
          videoRef.current.onplaying = () => {
            setIsVideoPlaying(true);
            setIsLiveStreamReady(true);
          };
          videoRef.current.play().then(() => setIsLiveStreamReady(true)).catch(() => {});
        }
      } catch (fallbackErr: any) {
        console.warn('[Camera] Hardware camera unavailable/permission blocked. Activating simulated crop viewfinder:', fallbackErr);
        setIsCameraConnecting(false);
        setUseSimulatedFeed(true);
        setIsLiveStreamReady(true);
        setIsVideoPlaying(true);
      }
    }
  };

  // Capture still snapshot
  const captureSnapshot = () => {
    if (useSimulatedFeed) {
      // Capture from simulated crop leaf feed
      setSelectedImage(sampleLeafPhotos[0].url);
      setSelectedFileName('Field_Crop_Scan_' + Date.now().toString().slice(-4) + '.jpg');
      stopCamera();
      return;
    }

    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvasRef.current = canvas;

    const width = video.videoWidth || 800;
    const height = video.videoHeight || 600;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // If video has valid pixels, draw it
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setSelectedImage(dataUrl);
        setSelectedFileName(`Crop_Capture_${new Date().toLocaleTimeString().replace(/:/g, '')}.jpg`);
      } else {
        // Fallback snapshot if stream returned 0x0
        setSelectedImage(sampleLeafPhotos[0].url);
        setSelectedFileName('Crop_Photo_Capture.jpg');
      }
      stopCamera();
    }
  };

  // Toggle between front and back camera
  const handleToggleCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Handle file selection from gallery
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    stopCamera();
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setSelectedImage(objectUrl);
      setSelectedFileName(file.name || 'Gallery_Image.jpg');
      setActiveCaptureMode('gallery');
    }
  };

  // Handle clearing photo
  const handleClearPhoto = () => {
    stopCamera();
    setSelectedImage(null);
    setSelectedFileName('');
    setActiveCaptureMode(null);
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  // Handle Analyze Action
  const handleAnalyze = () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    console.log('[Crop Health Check] Initiating AI diagnosis for:', selectedFileName);

    setTimeout(() => {
      setIsAnalyzing(false);
      console.log('Navigating to Screen 5: "Crop Health Result" with image data');
      if (onAnalyzeComplete) {
        onAnalyzeComplete({
          url: selectedImage,
          fileName: selectedFileName || 'crop_leaf.jpg',
        });
      } else {
        alert(
          `[AI Diagnosis Complete!]\nAnalyzed: "${selectedFileName || 'Crop Leaf'}"\nResult: Yellow Mosaic Virus (YMV) - 96.4% confidence.\n\nProceeding to Crop Health Result Screen!`
        );
      }
    }, 1500);
  };

  return (
    <DashboardLayout
      activeTab="crop-health"
      onTabChange={(_tab) => {
        stopCamera();
      }}
      unreadAlertsCount={mockFarmerData.profile.unreadAlertsCount}
      farmerName={mockFarmerData.profile.greetingName}
      farmerLocation={mockFarmerData.profile.location}
      forceMobile={forceMobile}
    >
      {/* Hidden Gallery File Input */}
      <input
        type="file"
        ref={galleryInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="gallery-input"
      />

      {/* Hidden Canvas for Frame Capturing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Centered Column (~600–700px on desktop) */}
      <div className="w-full max-w-[660px] mx-auto space-y-4 sm:space-y-5">
        
        {/* ========================================================
            1. HEADER
            Back arrow (<-) + Title + Subtitle
           ======================================================== */}
        <div className="bg-white p-4 sm:p-5 rounded-[16px] border border-farmBorder shadow-xs">
          <div className="flex items-center gap-3 mb-1.5">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onBack();
              }}
              className="w-9 h-9 -ml-1.5 rounded-full hover:bg-slate-100 flex items-center justify-center text-farmText-dark transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              title="Back to Dashboard"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.4]" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  AI Crop Doctor
                </span>
                <span className="text-farmBorder font-light">•</span>
                <span className="text-xs text-farmText-gray">Step 1 of 2</span>
              </div>
              <h1 className="text-[20px] sm:text-[24px] font-bold text-farmText-dark tracking-tight leading-tight">
                Crop Health Check
              </h1>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-farmText-gray mt-1 ml-0.5">
            Take a clear photo of the affected leaf or plant for best results.
          </p>
        </div>

        {/* ========================================================
            2. TWO PRIMARY ACTION BUTTONS
            Take Photo & Choose from Gallery
           ======================================================== */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Action 1: Take Photo */}
          <button
            type="button"
            onClick={() => startCamera()}
            className={`bg-white border rounded-[16px] p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-xs transition-all duration-200 cursor-pointer select-none group min-h-[110px] ${
              isCameraActive || (activeCaptureMode === 'camera' && selectedImage)
                ? 'border-primary ring-2 ring-primary/20 bg-primary-subtle/50'
                : 'border-farmBorder hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-primary-tint text-primary flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform shadow-2xs">
              <Camera className="w-6 h-6 stroke-[2.3]" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-farmText-dark group-hover:text-primary transition-colors">
              Take Photo
            </span>
            <span className="text-[10px] text-primary-dark font-medium mt-0.5">
              {isCameraActive ? '● Camera Active' : 'Open live camera'}
            </span>
          </button>

          {/* Action 2: Choose from Gallery */}
          <button
            type="button"
            onClick={() => {
              stopCamera();
              galleryInputRef.current?.click();
            }}
            className={`bg-white border rounded-[16px] p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-xs transition-all duration-200 cursor-pointer select-none group min-h-[110px] ${
              activeCaptureMode === 'gallery' && selectedImage
                ? 'border-primary ring-2 ring-primary/20 bg-primary-subtle/50'
                : 'border-farmBorder hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform shadow-2xs">
              <ImageIcon className="w-6 h-6 stroke-[2.3]" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-farmText-dark group-hover:text-primary transition-colors">
              Choose from Gallery
            </span>
            <span className="text-[10px] text-farmText-gray mt-0.5">
              Browse photo files
            </span>
          </button>
        </div>

        {/* Quick Sample Selector */}
        {!selectedImage && !isCameraActive && (
          <div className="flex items-center justify-between px-1 text-xs text-farmText-gray">
            <span className="flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Or test with a sample crop photo:</span>
            </span>
            <div className="flex gap-2">
              {sampleLeafPhotos.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setSelectedImage(sample.url);
                    setSelectedFileName(sample.name);
                    setActiveCaptureMode('gallery');
                  }}
                  className="text-[11px] font-semibold text-primary hover:text-primary-dark underline cursor-pointer"
                >
                  {sample.name.split(' ')[0]} Leaf
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            3. VIEWFINDER / IMAGE PREVIEW AREA
           ======================================================== */}
        <div className="bg-white rounded-[16px] border border-farmBorder p-3.5 sm:p-4 shadow-xs">
          
          {/* CASE A: LIVE CAMERA VIEWFINDER */}
          {isCameraActive ? (
            <div className="space-y-3">
              <div className="w-full h-72 sm:h-80 rounded-[14px] overflow-hidden bg-slate-950 relative shadow-inner border-2 border-primary">
                
                {/* 1. Connecting / Video Sensor Initializing */}
                {(!isVideoPlaying && !useSimulatedFeed) && (
                  <div className="absolute inset-0 z-30 bg-slate-950/90 flex flex-col items-center justify-center text-white p-4 text-center space-y-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                      <Camera className="w-5 h-5 text-primary absolute inset-0 m-auto" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white">Starting camera feed...</p>
                      <p className="text-[11px] text-slate-400">Please wait a moment or tap below for sample crop</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUseSimulatedFeed(true);
                        setIsVideoPlaying(true);
                      }}
                      className="text-xs bg-primary hover:bg-primary-dark text-white px-3.5 py-1.5 rounded-full font-semibold cursor-pointer transition-colors shadow-sm"
                    >
                      🌱 Use Test Leaf Camera
                    </button>
                  </div>
                )}

                {/* 2. Real WebRTC Video Feed (When active) */}
                {!useSimulatedFeed && (
                  <video
                    ref={setVideoRef}
                    autoPlay
                    playsInline
                    muted
                    onLoadedData={() => {
                      setIsVideoPlaying(true);
                      setIsLiveStreamReady(true);
                    }}
                    onPlaying={() => {
                      setIsVideoPlaying(true);
                      setIsLiveStreamReady(true);
                    }}
                    className="w-full h-full object-cover object-center"
                  />
                )}

                {/* 3. Simulated Crop Viewfinder Feed (Active if no hardware camera or permission issue) */}
                {useSimulatedFeed && (
                  <div className="w-full h-full relative overflow-hidden">
                    <img
                      src={sampleLeafPhotos[0].url}
                      alt="Live simulated leaf viewfinder"
                      className="w-full h-full object-cover object-center brightness-95"
                    />
                    {/* Simulated live scanner light line */}
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80 animate-pulse top-1/2" />
                  </div>
                )}

                {/* Top Overlay: Live Status & Controls */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
                  <div className="bg-slate-900/85 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-slate-700">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="font-semibold text-[11px]">
                      {useSimulatedFeed ? 'Live Crop Scanner Feed' : 'Live Camera Active'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Toggle Sample Leaf / Live Feed */}
                    <button
                      type="button"
                      onClick={() => {
                        setUseSimulatedFeed((prev) => !prev);
                        setIsVideoPlaying(true);
                      }}
                      className="px-2.5 py-1 rounded-full bg-slate-900/85 hover:bg-slate-800 text-white text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
                      title="Toggle Crop Sample Feed"
                    >
                      <Leaf className="w-3.5 h-3.5 text-primary" />
                      <span>{useSimulatedFeed ? 'Webcam' : 'Sample Leaf'}</span>
                    </button>

                    {/* Switch camera / feed */}
                    <button
                      type="button"
                      onClick={handleToggleCamera}
                      className="w-8 h-8 rounded-full bg-slate-900/85 hover:bg-slate-800 text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
                      title="Switch Camera or View"
                    >
                      <SwitchCamera className="w-4 h-4" />
                    </button>

                    {/* Close Camera */}
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="w-8 h-8 rounded-full bg-slate-900/85 hover:bg-slate-800 text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
                      title="Close Camera"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Camera Scan Crosshair Guidelines */}
                <div className="absolute inset-6 sm:inset-10 border border-white/40 rounded-xl pointer-events-none flex flex-col justify-between p-2 z-10">
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-t-2 border-l-2 border-primary" />
                    <span className="w-4 h-4 border-t-2 border-r-2 border-primary" />
                  </div>
                  <div className="text-center">
                    <span className="text-[11px] font-semibold text-white/95 bg-slate-900/80 px-2.5 py-0.5 rounded-full border border-slate-700">
                      Center leaf or pest within frame
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-b-2 border-l-2 border-primary" />
                    <span className="w-4 h-4 border-b-2 border-r-2 border-primary" />
                  </div>
                </div>

                {/* Bottom Center Shutter Capture Button */}
                <div className="absolute bottom-3 inset-x-0 flex justify-center items-center z-20">
                  <button
                    type="button"
                    onClick={captureSnapshot}
                    className="bg-primary hover:bg-primary-dark active:scale-95 text-white font-bold px-6 py-2.5 rounded-full shadow-lg flex items-center gap-2 text-sm cursor-pointer transition-all border-2 border-white ring-2 ring-primary/40"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture Photo</span>
                  </button>
                </div>
              </div>

              {/* Viewfinder footer helper */}
              <div className="flex items-center justify-between px-1 text-xs text-farmText-gray">
                <span>Align the affected crop leaf and tap <strong>Capture Photo</strong>.</span>
                <div className="flex items-center gap-3">
                  {!useSimulatedFeed && (
                    <button
                      type="button"
                      onClick={() => setUseSimulatedFeed(true)}
                      className="text-primary hover:underline cursor-pointer font-medium text-[11px]"
                    >
                      Test Crop Feed
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="text-urgent hover:underline cursor-pointer font-medium text-[11px]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : selectedImage ? (
            /* CASE B: CAPTURED / SELECTED IMAGE PREVIEW */
            <div className="space-y-3">
              <div className="w-full h-64 sm:h-72 rounded-[14px] overflow-hidden bg-slate-950 relative shadow-inner border border-slate-200">
                <img
                  src={selectedImage}
                  alt="Selected crop leaf for diagnosis"
                  className="w-full h-full object-cover object-center"
                />

                {/* Top Badge: Verified selection */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-semibold text-primary-dark flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary stroke-[2.5]" />
                  <span className="truncate max-w-[200px]">{selectedFileName}</span>
                </div>

                {/* Corner scanning grid graphic */}
                <div className="absolute inset-4 border border-white/30 rounded-lg pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <span className="w-3 h-3 border-t-2 border-l-2 border-primary" />
                    <span className="w-3 h-3 border-t-2 border-r-2 border-primary" />
                  </div>
                  <div className="flex justify-between">
                    <span className="w-3 h-3 border-b-2 border-l-2 border-primary" />
                    <span className="w-3 h-3 border-b-2 border-r-2 border-primary" />
                  </div>
                </div>
              </div>

              {/* Action Links: Retake & Remove */}
              <div className="flex items-center justify-between px-1 text-xs">
                <span className="text-farmText-gray font-medium">
                  Ready for AI analysis
                </span>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    className="text-primary hover:text-primary-dark font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake with Camera</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearPhoto}
                    className="text-urgent hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* CASE C: DASHED PLACEHOLDER BOX */
            <div className="w-full h-56 sm:h-64 rounded-[14px] border-2 border-dashed border-slate-200 bg-slate-50/70 flex flex-col items-center justify-center text-center p-6 select-none">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                <Leaf className="w-7 h-7 stroke-[1.8]" />
              </div>
              <p className="text-sm font-semibold text-slate-600">
                No photo selected yet
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Tap <strong>Take Photo</strong> above to open the camera, or <strong>Choose from Gallery</strong> to upload an image.
              </p>
            </div>
          )}
        </div>

        {/* ========================================================
            4. BOTTOM ACTION
            "Analyze" Primary Button with Loading State
           ======================================================== */}
        <div className="pt-2 flex flex-col items-center">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!selectedImage || isAnalyzing || isCameraActive}
            className={`w-full sm:w-[260px] h-[52px] min-h-[44px] rounded-[12px] font-bold text-base flex items-center justify-center gap-2 shadow-cta transition-all duration-200 select-none ${
              !selectedImage || isAnalyzing || isCameraActive
                ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                : 'bg-primary hover:bg-primary-dark active:scale-[0.99] text-white cursor-pointer'
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>Analyze</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-farmText-gray text-center mt-2.5">
            Instant AI diagnosis for over 40+ Indian crop diseases.
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default CropHealthCheckScreen;
