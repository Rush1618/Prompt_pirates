"use client";

import { useState, useRef, useEffect } from "react";
import { CompassRose } from "@/components/ui/compass-rose";
import { BackButton } from "@/components/ui/back-button";
import { NauticalMap } from "@/components/ui/nautical-map";
import { Upload, Download, Feather, ImageIcon, Sparkles, CheckCircle2, AlertTriangle, Image as ImageLucide, MapPin } from "lucide-react";
import {
  embedPayloadInShantyText,
  extractPayloadFromShantyText,
  calculateImageCapacity,
  embedPayloadImageData,
  extractPayloadImageData,
  appendAuditEvent,
} from "@/lib/crypto";
import { nauticalAudio } from "@/lib/audio";

export default function StegoPage() {
  const [activeTab, setActiveTab] = useState<"shanty" | "image">("shanty");

  // Shanty Stego State
  const [shantyInput, setShantyInput] = useState(
    "Farewell and adieu to you, fair Spanish ladies,\nFarewell and adieu to you, ladies of Spain;\nFor we've received orders for to sail for old England,\nAnd we hope in a short time to see you again."
  );
  const [secretPayload, setSecretPayload] = useState("17.9241° N, 76.8122° W (Port Royal Vault)");
  const [shantyStegoOutput, setShantyStegoOutput] = useState<string | null>(null);
  const [extractedShantySecret, setExtractedShantySecret] = useState<string | null>(null);

  // Image LSB Stego State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageCapacity, setImageCapacity] = useState<{ usableBytes: number } | null>(null);
  const [stegoImageOutput, setStegoImageOutput] = useState<string | null>(null);
  const [extractedImageSecret, setExtractedImageSecret] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Helper to generate dynamic preset canvas image Data URLs
  const createPresetImage = (type: "jolly" | "chart" | "flag"): string => {
    if (typeof window === "undefined") return "";
    const c = document.createElement("canvas");
    c.width = 200;
    c.height = 200;
    const ctx = c.getContext("2d");
    if (!ctx) return "";

    if (type === "jolly") {
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, 200, 200);
      ctx.fillStyle = "#d97706";
      ctx.beginPath();
      ctx.arc(100, 90, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.arc(85, 80, 10, 0, Math.PI * 2);
      ctx.arc(115, 80, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "bold 14px monospace";
      ctx.fillStyle = "#fef3c7";
      ctx.fillText("JOLLY ROGER", 55, 175);
    } else if (type === "chart") {
      ctx.fillStyle = "#1e1b4b";
      ctx.fillRect(0, 0, 200, 200);
      ctx.strokeStyle = "#4338ca";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 200; i += 25) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 200);
        ctx.moveTo(0, i);
        ctx.lineTo(200, i);
        ctx.stroke();
      }
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 13px serif";
      ctx.fillText("NAUTICAL CHART", 40, 100);
    } else {
      ctx.fillStyle = "#881337";
      ctx.fillRect(0, 0, 200, 200);
      ctx.fillStyle = "#fef3c7";
      ctx.beginPath();
      ctx.moveTo(30, 30);
      ctx.lineTo(170, 100);
      ctx.lineTo(30, 170);
      ctx.closePath();
      ctx.fill();
      ctx.font = "bold 12px monospace";
      ctx.fillStyle = "#991b1b";
      ctx.fillText("CORSAIR FLAG", 40, 105);
    }

    return c.toDataURL("image/png");
  };

  useEffect(() => {
    // Set default preset image
    const defaultDataUrl = createPresetImage("jolly");
    setSelectedImage(defaultDataUrl);
    setImageCapacity(calculateImageCapacity(200, 200));
  }, []);

  const handleSelectPreset = (type: "jolly" | "chart" | "flag") => {
    const url = createPresetImage(type);
    setSelectedImage(url);
    setImageCapacity(calculateImageCapacity(200, 200));
    setStegoImageOutput(null);
    setExtractedImageSecret(null);
    nauticalAudio.playClick();
  };

  // Shanty Stego Embed & Extract
  const handleShantyEmbed = async () => {
    if (!shantyInput.trim() || !secretPayload.trim()) return;
    const res = embedPayloadInShantyText(shantyInput, secretPayload);
    setShantyStegoOutput(res.stegoText);
    nauticalAudio.playChime();

    await appendAuditEvent(
      "STEGO_EMBEDDED",
      "Steganography Master",
      `Embedded ${res.payloadLengthBits} bits into Sea Shanty text using zero-width characters.`
    );
  };

  const handleShantyExtract = () => {
    if (!shantyStegoOutput) return;
    const extracted = extractPayloadFromShantyText(shantyStegoOutput);
    setExtractedShantySecret(extracted || "No zero-width payload detected.");
    nauticalAudio.playBell();
  };

  // Image LSB Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const imgUrl = evt.target?.result as string;
      setSelectedImage(imgUrl);

      const img = new Image();
      img.onload = () => {
        const cap = calculateImageCapacity(img.width, img.height);
        setImageCapacity(cap);
      };
      img.src = imgUrl;
    };
    reader.readAsDataURL(file);
  };

  // Image LSB Embed
  const handleImageEmbed = async () => {
    if (!selectedImage || !canvasRef.current) return;

    const img = new Image();
    img.onload = async () => {
      const canvas = canvasRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const stegoData = embedPayloadImageData(imageData, secretPayload);
      ctx.putImageData(stegoData, 0, 0);

      const stegoUrl = canvas.toDataURL("image/png");
      setStegoImageOutput(stegoUrl);
      nauticalAudio.playChime();

      await appendAuditEvent(
        "STEGO_EMBEDDED",
        "Steganography Master",
        `Embedded LSB payload into ${img.width}x${img.height} canvas image pixels.`
      );
    };
    img.src = selectedImage;
  };

  // Image LSB Extract
  const handleImageExtract = () => {
    const targetImage = stegoImageOutput || selectedImage;
    if (!targetImage || !canvasRef.current) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const extracted = extractPayloadImageData(imageData);

      setExtractedImageSecret(
        extracted || "No valid LSB payload header detected in image pixels."
      );
      nauticalAudio.playBell();
    };
    img.src = targetImage;
  };

  const handleDownloadStegoImage = () => {
    if (!stegoImageOutput) return;
    const a = document.createElement("a");
    a.href = stegoImageOutput;
    a.download = "sail_emblem_stego.png";
    a.click();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <BackButton />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-900/30 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-500 text-sm font-mono tracking-wider uppercase mb-1">
            <Feather className="w-4 h-4" /> Steganography Lab
          </div>
          <h1 className="text-3xl font-bold font-serif text-amber-100">
            Nautical Steganography & Covert Carriers
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Hide encrypted coordinates inside Sea Shanty lyrics (Zero-Width Unicode) or Sail Emblem PNG images (LSB Pixels).
          </p>
        </div>
        <div className="w-16 h-16 relative opacity-80">
          <CompassRose ringColor="#d97706" arrowColor="#f59e0b" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-amber-900/30 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("shanty")}
          className={`py-2 px-4 rounded-lg font-mono text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === "shanty"
              ? "bg-amber-500/20 text-amber-200 border border-amber-500/50"
              : "text-slate-400 hover:text-amber-300"
          }`}
        >
          <Feather className="w-4 h-4" /> Sea Shanty Text Stego (Zero-Width)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("image")}
          className={`py-2 px-4 rounded-lg font-mono text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === "image"
              ? "bg-amber-500/20 text-amber-200 border border-amber-500/50"
              : "text-slate-400 hover:text-amber-300"
          }`}
        >
          <ImageIcon className="w-4 h-4" /> Sail Emblem Image LSB Stego
        </button>
      </div>

      {/* Tab 1: Sea Shanty Text Stego */}
      {activeTab === "shanty" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6 bg-slate-900/60 border border-amber-900/30 rounded-xl p-6 backdrop-blur-md">
            <h2 className="text-lg font-serif font-semibold text-amber-200">
              Embed Payload into Sea Shanty
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Carrier Shanty Lyrics
              </label>
              <textarea
                rows={4}
                value={shantyInput}
                onChange={(e) => setShantyInput(e.target.value)}
                className="w-full bg-slate-950 border border-amber-900/40 rounded-lg p-3 text-slate-300 font-mono text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Interactive Nautical Map & Preset Location Selection */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Secret Message / Treasure Location Payload</span>
                <span className="text-[10px] text-amber-500 font-mono">Select from Map or Type</span>
              </label>

              {/* Map selector */}
              <NauticalMap
                selectedCoordinates={secretPayload}
                onSelectCoordinates={(coords, name) => {
                  setSecretPayload(`${coords} (${name})`);
                  nauticalAudio.playClick();
                }}
              />

              <input
                type="text"
                value={secretPayload}
                onChange={(e) => setSecretPayload(e.target.value)}
                placeholder="e.g. 17.9241° N, 76.8122° W (Port Royal Vault)"
                className="w-full bg-slate-950 border border-amber-900/40 rounded-lg px-4 py-2.5 text-amber-200 font-mono text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Carrier Shanty Lyrics
              </label>
              <textarea
                rows={3}
                value={shantyInput}
                onChange={(e) => setShantyInput(e.target.value)}
                className="w-full bg-slate-950 border border-amber-900/40 rounded-lg p-3 text-slate-300 font-mono text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="button"
              onClick={handleShantyEmbed}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold font-mono uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4" /> Embed Secret into Shanty (Zero-Width)
            </button>
          </div>

          <div className="space-y-6 bg-slate-900/60 border border-amber-900/30 rounded-xl p-6 backdrop-blur-md">
            <h2 className="text-lg font-serif font-semibold text-amber-200">
              Steganographic Shanty Carrier & Extraction
            </h2>

            {shantyStegoOutput ? (
              <div className="space-y-4">
                <div className="bg-slate-950 border border-emerald-900/50 rounded-lg p-4 font-serif text-sm text-amber-100 whitespace-pre-line leading-relaxed">
                  {shantyStegoOutput}
                </div>

                <button
                  type="button"
                  onClick={handleShantyExtract}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-200 font-mono text-xs rounded border border-amber-900/40 cursor-pointer"
                >
                  Test Extract Payload from Shanty
                </button>

                {extractedShantySecret && (
                  <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded text-emerald-300 font-mono text-xs">
                    Extracted Secret: {extractedShantySecret}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 border-2 border-dashed border-amber-900/30 rounded-lg flex flex-col items-center justify-center text-slate-500 p-6 text-center">
                <Feather className="w-8 h-8 mb-2 text-amber-900/50" />
                <p className="font-serif text-sm text-slate-400 font-semibold">
                  No Shanty Carrier Generated Yet
                </p>
                <p className="text-xs font-mono text-slate-500 mt-1 max-w-xs">
                  Select location on nautical map or type payload above, then click embed.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Image LSB Stego */}
      {activeTab === "image" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6 bg-slate-900/60 border border-amber-900/30 rounded-xl p-6 backdrop-blur-md">
            <h2 className="text-lg font-serif font-semibold text-amber-200">
              Sail Emblem / Chart Image Carrier Selection
            </h2>

            {/* Secret Payload Input & Map for Image Stego */}
            <div className="space-y-2 border-b border-amber-900/30 pb-4">
              <label className="text-xs font-mono text-amber-400 uppercase tracking-wider flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-amber-500" /> Select Location from Map or Type Message</span>
              </label>

              <NauticalMap
                selectedCoordinates={secretPayload}
                onSelectCoordinates={(coords, name) => {
                  setSecretPayload(`${coords} (${name})`);
                  nauticalAudio.playClick();
                }}
              />

              <input
                type="text"
                value={secretPayload}
                onChange={(e) => setSecretPayload(e.target.value)}
                placeholder="Type secret location or message..."
                className="w-full bg-slate-950 border border-amber-900/40 rounded-lg px-4 py-2.5 text-amber-200 font-mono text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Preset Emblem Selection Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Select Preset Carrier Graphic OR Upload File
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectPreset("jolly")}
                  className="p-2.5 bg-slate-950 border border-amber-900/40 hover:border-amber-500 rounded-lg text-xs font-mono text-amber-200 flex flex-col items-center gap-1 cursor-pointer"
                >
                  <ImageLucide className="w-5 h-5 text-amber-500" /> Jolly Roger
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset("chart")}
                  className="p-2.5 bg-slate-950 border border-amber-900/40 hover:border-amber-500 rounded-lg text-xs font-mono text-amber-200 flex flex-col items-center gap-1 cursor-pointer"
                >
                  <ImageLucide className="w-5 h-5 text-indigo-400" /> Chart Grid
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset("flag")}
                  className="p-2.5 bg-slate-950 border border-amber-900/40 hover:border-amber-500 rounded-lg text-xs font-mono text-amber-200 flex flex-col items-center gap-1 cursor-pointer"
                >
                  <ImageLucide className="w-5 h-5 text-rose-400" /> Corsair Flag
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Custom PNG Image Upload
              </label>
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleImageUpload}
                className="w-full bg-slate-950 border border-amber-900/40 rounded-lg p-3 text-xs font-mono text-slate-400"
              />
            </div>

            {selectedImage && (
              <div className="space-y-4 pt-2">
                <img src={selectedImage} alt="Carrier" className="max-h-48 rounded border border-amber-900/40 mx-auto shadow-md" />
                {imageCapacity && (
                  <div className="text-xs font-mono text-amber-400 text-center">
                    Carrier Capacity: ~{imageCapacity.usableBytes} bytes usable for payload.
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleImageEmbed}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold font-mono uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4" /> Embed LSB Pixel Payload into Image
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6 bg-slate-900/60 border border-amber-900/30 rounded-xl p-6 backdrop-blur-md">
            <h2 className="text-lg font-serif font-semibold text-amber-200 flex items-center justify-between">
              <span>Stego Image Output & LSB Extraction</span>
              {stegoImageOutput && (
                <button
                  type="button"
                  onClick={handleDownloadStegoImage}
                  className="text-xs font-mono text-amber-400 hover:text-amber-300 border border-amber-900/40 px-2.5 py-1 rounded flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Download Stego PNG
                </button>
              )}
            </h2>

            <canvas ref={canvasRef} className="hidden" />

            {stegoImageOutput ? (
              <div className="space-y-4 text-center">
                <img src={stegoImageOutput} alt="Stego Output" className="max-h-48 rounded border border-emerald-900/50 mx-auto" />
                <button
                  type="button"
                  onClick={handleImageExtract}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-200 font-mono text-xs rounded border border-amber-900/40"
                >
                  Extract LSB Payload from Image Canvas
                </button>

                {extractedImageSecret && (
                  <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded text-emerald-300 font-mono text-xs text-left">
                    Extracted Secret: {extractedImageSecret}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 border-2 border-dashed border-amber-900/30 rounded-lg flex flex-col items-center justify-center text-slate-500 text-center p-6">
                <ImageIcon className="w-10 h-10 mb-2 text-amber-900/50" />
                <p className="font-serif text-sm text-slate-400 font-semibold">
                  No Stego Image Generated
                </p>
                <p className="text-xs font-mono text-slate-500 mt-1 max-w-xs">
                  Select one of the preset nautical emblems on the left or upload your own PNG image, then click embed.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
