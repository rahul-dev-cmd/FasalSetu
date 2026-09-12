import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Send,
  Mic,
  MicOff,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  CloudSun,
  Droplets,
  ShieldCheck,
  RotateCcw,
  Languages,
  Bot
} from 'lucide-react';

export interface MessageItem {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  cardType?: 'price' | 'weather' | 'irrigation' | 'health' | 'advisor';
  cardData?: any;
}

interface KisanChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  farmerName?: string;
  farmerCrop?: string;
  farmerLocation?: string;
}

export const KisanChatDrawer: React.FC<KisanChatDrawerProps> = ({
  isOpen,
  onClose,
  farmerName = 'Ramesh ji',
  farmerCrop = 'Rice',
  farmerLocation = 'Kothapet, Telangana',
}) => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'EN' | 'HI'>('EN');
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial messages
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Namaste ${farmerName}! 👋 I'm your Kisan AI Assistant. I'm here to help with your ${farmerCrop} crop, real-time weather updates, local mandi prices, or any daily farming question. What would you like to know?`,
      timestamp: 'Just now',
    },
  ]);

  // Quick suggestion chips
  const quickChips = language === 'EN'
    ? [
        { label: '🌾 Is my crop healthy?', query: 'Is my crop healthy?' },
        { label: "💰 Today's Rice mandi price", query: "Today's Rice mandi price" },
        { label: '🌦️ Weather this week', query: 'Weather this week' },
        { label: '💧 Should I irrigate today?', query: 'Should I irrigate today?' },
      ]
    : [
        { label: '🌾 क्या मेरी फसल स्वस्थ है?', query: 'Is my crop healthy?' },
        { label: '💰 आज का धान मंडी भाव', query: "Today's Rice mandi price" },
        { label: '🌦️ इस हफ्ते का मौसम', query: 'Weather this week' },
        { label: '💧 क्या आज सिंचाई करें?', query: 'Should I irrigate today?' },
      ];

  // Auto-scroll to bottom on message updates
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle sending user input
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg: MessageItem = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response delay (~1.2s)
    setTimeout(() => {
      const lower = text.toLowerCase();
      let replyText = '';
      let cardType: MessageItem['cardType'];
      let cardData: any;

      if (lower.includes('price') || lower.includes('mandi') || lower.includes('rate') || lower.includes('bhav') || lower.includes('market') || lower.includes('sell')) {
        replyText = language === 'EN'
          ? `Today's wholesale Mandi prices for Paddy/Rice in Telangana markets are trending strong! At Suryapet Mandi, Grade-A paddy is trading at ₹2,240/quintal (up ₹60 from yesterday). You also have verified buyer offers on FasalSetu up to ₹2,280/qtl.`
          : `तेलंगाना मंडियों में आज धान (Paddy Grade-A) का भाव मजबूत है! सूर्यपेट मंडी में ₹2,240 प्रति क्विंटल भाव खुला है (कल से ₹60 अधिक)। फसलसेतु पर खरीदारों की अधिकतम बोली ₹2,280 प्रति क्विंटल है।`;
        cardType = 'price';
        cardData = {
          crop: `${farmerCrop} (Paddy Grade-A)`,
          mandi: 'Suryapet APMC Mandi',
          currentPrice: '₹2,240 / quintal',
          trend: '+₹60 (▲ 2.7%)',
          topBuyerOffer: 'Telangana Agro Foods — ₹2,280/qtl',
        };
      } else if (lower.includes('weather') || lower.includes('rain') || lower.includes('temp') || lower.includes('cloud') || lower.includes('mausam') || lower.includes('barish')) {
        replyText = language === 'EN'
          ? `Weather forecast for ${farmerLocation} shows partly cloudy skies today with 31°C max temperature. Moderate scattered showers are expected on Thursday and Friday (~65% chance). Good conditions for active tillering!`
          : `${farmerLocation} में आज आंशिक बादल रहेंगे और अधिकतम तापमान 31°C रहेगा। गुरुवार और शुक्रवार को हल्की से मध्यम बारिश (65% संभावना) का अनुमान है।`;
        cardType = 'weather';
        cardData = {
          location: farmerLocation,
          todayTemp: '31°C / 24°C',
          condition: 'Partly Cloudy ⛅',
          rainChance: 'Light rain expected Thu–Fri (65%)',
          advisory: 'Hold off chemical spraying until Saturday after showers pass.',
        };
      } else if (lower.includes('irrigate') || lower.includes('water') || lower.includes('moisture') || lower.includes('pump') || lower.includes('sinchai') || lower.includes('paani')) {
        replyText = language === 'EN'
          ? `Based on your estimated soil moisture (58%, balanced status) and upcoming rain forecast on Thursday, you do NOT need heavy irrigation today. A light surface wetting for 30 minutes tomorrow evening will maintain optimal root zone moisture.`
          : `आपके खेत की मिट्टी में 58% नमी (संतुलित) है और गुरुवार को बारिश का पूर्वानुमान है। आज भारी सिंचाई की आवश्यकता नहीं है। कल शाम 30 मिनट हल्की सिंचाई पर्याप्त रहेगी।`;
        cardType = 'irrigation';
        cardData = {
          status: 'Balanced Moisture (58%)',
          recommendation: 'Skip heavy irrigation today',
          nextSlot: 'Tomorrow 5:30 PM (30 min wetting)',
          waterSaving: 'Saves ~450 kWh pump power & groundwater',
        };
      } else if (lower.includes('health') || lower.includes('disease') || lower.includes('pest') || lower.includes('yellow') || lower.includes('spot') || lower.includes('keeda') || lower.includes('bimari') || lower.includes('scan')) {
        replyText = language === 'EN'
          ? `Your last Rice crop scan showed 88% overall health index. However, warm humid weather slightly increases the risk of Brown Leaf Spot and Stem Borer. Keep an eye out for pinhead holes or yellow leaf tips.`
          : `आपकी पिछली धान फसल जांच में 88% स्वास्थ्य सूचकांक दर्ज हुआ था। उमस भरे मौसम के कारण तना छेदक (Stem Borer) का हल्का खतरा बना हुआ है। पत्तियों के सिरों पर नजर रखें।`;
        cardType = 'health';
        cardData = {
          crop: `${farmerCrop} Crop`,
          healthScore: '88% Healthy',
          riskLevel: 'Low-Moderate (Humidity Warning)',
          actionTip: 'Inspect lower leaf sheaths for early spots',
        };
      } else if (lower.includes('crop') || lower.includes('advisor') || lower.includes('sow') || lower.includes('recommend') || lower.includes('next crop')) {
        replyText = language === 'EN'
          ? `Looking for what crop to sow next? Our new Crop Advisor wizard evaluates your soil type, water availability, and previous crop to recommend top-yielding varieties with full harvest timelines!`
          : `अगली फसल की योजना बना रहे हैं? हमारा नया 'क्रॉप एडवाइजर' आपकी मिट्टी और पानी के अनुसार सर्वोत्तम फसलों की सिफारिश करता है!`;
        cardType = 'advisor';
        cardData = {
          recommended: 'Maize / Groundnut / Chickpea',
          suitability: 'Up to 93% suitable for your loamy soil',
        };
      } else {
        replyText = language === 'EN'
          ? `I'm still learning! For now, feel free to ask about your ${farmerCrop} health, weekly weather, today's mandi prices, or irrigation advice. 🌱`
          : `मैं लगातार सीख रहा हूँ! अभी आप अपनी धान फसल के स्वास्थ्य, मौसम, मंडी भाव या सिंचाई के बारे में पूछ सकते हैं। 🌱`;
      }

      const aiMsg: MessageItem = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cardType,
        cardData,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const handleMicClick = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      handleSendMessage("Today's Rice mandi price");
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Dark backdrop overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-in panel from the right on desktop, full screen on mobile */}
      <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[460px] md:w-[500px] bg-farmBg flex flex-col shadow-2xl border-l border-slate-200 animate-in slide-in-from-right duration-300 z-10">
        {/* ========================================================
            HEADER (Sticky Top)
           ======================================================== */}
        <div className="p-4 sm:p-5 bg-white border-b border-farmBorder flex items-center justify-between shrink-0 shadow-2xs z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 -ml-1 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* AI Avatar + Online Indicator */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-emerald-400 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-base text-slate-800 leading-tight">
                  Kisan AI Assistant
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Usually replies instantly • 24×7 Farm Support
              </p>
            </div>
          </div>

          {/* Language Toggle & Close */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage(language === 'EN' ? 'HI' : 'EN')}
              className="px-2.5 py-1 rounded-full text-xs font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all flex items-center gap-1 cursor-pointer"
              title="Toggle Language"
            >
              <Languages className="w-3.5 h-3.5 text-primary" />
              <span>{language === 'EN' ? 'हिं' : 'EN'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================
            CHAT BODY (Scrollable, Light Background #F8FAFC)
           ======================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-farmBg">
          {/* Welcome Capsule */}
          <div className="text-center my-2">
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-200/60 px-3 py-1 rounded-full">
              FasalSetu Verified AI Agronomist
            </span>
          </div>

          {/* Messages */}
          {messages.map((msg) => {
            const isAi = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isAi ? 'items-start' : 'items-end'} animate-in fade-in duration-200`}
              >
                <div
                  className={`max-w-[88%] p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isAi
                      ? 'bg-white text-slate-800 border border-farmBorder shadow-xs rounded-tl-xs'
                      : 'bg-primary text-white font-medium rounded-tr-xs shadow-xs'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* ── INLINE MINI CARD FOR PRICE ──────────── */}
                  {msg.cardType === 'price' && msg.cardData && (
                    <div className="mt-3 p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                          {msg.cardData.crop}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {msg.cardData.trend}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between pt-1 border-t border-emerald-100">
                        <span className="text-xs text-slate-600 font-medium">{msg.cardData.mandi}</span>
                        <span className="text-sm font-extrabold text-slate-900">{msg.cardData.currentPrice}</span>
                      </div>
                      <div className="text-[11px] text-emerald-800 bg-white p-2 rounded-lg border border-emerald-100">
                        <strong>Top Buyer:</strong> {msg.cardData.topBuyerOffer}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          navigate('/farmer/market');
                        }}
                        className="w-full py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>View All Buyer Bids</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* ── INLINE MINI CARD FOR WEATHER ────────── */}
                  {msg.cardType === 'weather' && msg.cardData && (
                    <div className="mt-3 p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                          <CloudSun className="w-4 h-4 text-blue-600" />
                          {msg.cardData.location}
                        </span>
                        <span className="text-xs font-extrabold text-blue-900">
                          {msg.cardData.todayTemp}
                        </span>
                      </div>
                      <div className="text-xs text-slate-700 font-medium pt-1 border-t border-blue-100">
                        🌧️ {msg.cardData.rainChance}
                      </div>
                      <div className="text-[11px] text-blue-900 bg-white p-2 rounded-lg border border-blue-100">
                        <strong>Farming Advisory:</strong> {msg.cardData.advisory}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          navigate('/farmer/irrigation');
                        }}
                        className="w-full py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Check Soil Moisture</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* ── INLINE MINI CARD FOR IRRIGATION ─────── */}
                  {msg.cardType === 'irrigation' && msg.cardData && (
                    <div className="mt-3 p-3 bg-teal-50/80 rounded-xl border border-teal-200 text-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                          <Droplets className="w-4 h-4 text-teal-600" />
                          {msg.cardData.status}
                        </span>
                        <span className="text-[11px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                          Advisory Active
                        </span>
                      </div>
                      <div className="text-xs text-slate-700 pt-1 border-t border-teal-100">
                        <strong>Schedule:</strong> {msg.cardData.nextSlot}
                      </div>
                      <div className="text-[11px] text-teal-900 bg-white p-2 rounded-lg border border-teal-100">
                        ⚡ {msg.cardData.waterSaving}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          navigate('/farmer/irrigation');
                        }}
                        className="w-full py-1.5 bg-teal-700 text-white text-xs font-bold rounded-lg hover:bg-teal-800 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Open Water & Irrigation</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* ── INLINE MINI CARD FOR CROP HEALTH ────── */}
                  {msg.cardType === 'health' && msg.cardData && (
                    <div className="mt-3 p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-primary" />
                          {msg.cardData.crop}
                        </span>
                        <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {msg.cardData.healthScore}
                        </span>
                      </div>
                      <div className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        ⚠️ {msg.cardData.riskLevel}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          navigate('/farmer/crop-health');
                        }}
                        className="w-full py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Run New AI Camera Scan</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* ── INLINE MINI CARD FOR CROP ADVISOR ───── */}
                  {msg.cardType === 'advisor' && msg.cardData && (
                    <div className="mt-3 p-3 bg-purple-50/80 rounded-xl border border-purple-200 text-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                          Crop Advisor Engine
                        </span>
                        <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                          36 Crops
                        </span>
                      </div>
                      <div className="text-xs text-slate-700">
                        <strong>Top Picks:</strong> {msg.cardData.recommended}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          navigate('/farmer/crop-advisor');
                        }}
                        className="w-full py-1.5 bg-purple-700 text-white text-xs font-bold rounded-lg hover:bg-purple-800 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Launch Crop Advisor Wizard</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-slate-500 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                AI
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-1.5">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
              </div>
            </div>
          )}

          {/* Listening Indicator overlay if mic tapped */}
          {isListening && (
            <div className="p-4 bg-emerald-800 text-white rounded-2xl shadow-lg animate-in zoom-in-95 duration-150 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-urgent text-white flex items-center justify-center animate-ping">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold">Listening... बोलिए!</div>
                <div className="text-xs text-emerald-200">Listening to your voice question...</div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ========================================================
            QUICK SUGGESTION CHIPS (Horizontal Scrollable)
           ======================================================== */}
        <div className="p-2.5 px-4 bg-white/90 border-t border-slate-100 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          {quickChips.map((chip, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(chip.query)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#DCFCE7] text-primary hover:bg-emerald-200 transition-all whitespace-nowrap cursor-pointer shadow-2xs hover:scale-102"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* ========================================================
            INPUT BAR (Sticky Bottom)
           ======================================================== */}
        <div className="p-3 sm:p-4 bg-white border-t border-farmBorder shrink-0 z-20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 relative"
          >
            {/* Input with Mic Icon inside */}
            <div className="relative flex-1">
              <button
                type="button"
                onClick={handleMicClick}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors p-1 cursor-pointer"
                title="Voice Search (Speak in Hindi or English)"
              >
                <Mic className="w-4 h-4" />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={language === 'EN' ? 'Type your question... (e.g. mandi price, weather)' : 'अपना प्रश्न लिखें या पूछें...'}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm ${
                inputValue.trim()
                  ? 'bg-primary text-white hover:bg-primary-dark hover:scale-105'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              title="Send Message"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default KisanChatDrawer;
