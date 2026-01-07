
import React, { useState, useRef } from 'react';
import { AppMode, AppState, CreateFunction, EditFunction } from './types';
import { generateImageFromGemini } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    mode: AppMode.CREATE,
    activeCreateFunction: 'free',
    activeEditFunction: 'add-remove',
    prompt: '',
    isGenerating: false,
    generatedImageUrl: null,
    uploadedImage: null,
    uploadedImage2: null,
    showModal: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputDual1Ref = useRef<HTMLInputElement>(null);
  const fileInputDual2Ref = useRef<HTMLInputElement>(null);

  const handleModeChange = (mode: AppMode) => {
    setState(prev => ({ ...prev, mode }));
  };

  const handleCreateFunctionChange = (func: CreateFunction) => {
    setState(prev => ({ ...prev, activeCreateFunction: func }));
  };

  const handleEditFunctionChange = (func: EditFunction) => {
    setState(prev => ({ ...prev, activeEditFunction: func }));
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState(prev => ({ ...prev, prompt: e.target.value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, slot: number = 0) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (slot === 0) setState(prev => ({ ...prev, uploadedImage: base64 }));
        else if (slot === 1) setState(prev => ({ ...prev, uploadedImage: base64 }));
        else if (slot === 2) setState(prev => ({ ...prev, uploadedImage2: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const generateImage = async () => {
    if (state.isGenerating) return;
    if (!state.prompt && state.mode === AppMode.CREATE) {
      alert("Por favor, digite sua ideia no prompt.");
      return;
    }
    setState(prev => ({ ...prev, isGenerating: true, generatedImageUrl: null }));
    try {
      const result = await generateImageFromGemini(state);
      setState(prev => ({ ...prev, generatedImageUrl: result, isGenerating: false }));
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar imagem. Verifique sua conexão.");
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const downloadImage = () => {
    if (!state.generatedImageUrl) return;
    const link = document.createElement('a');
    link.href = state.generatedImageUrl;
    link.download = `francolino-ai-${Date.now()}.png`;
    link.click();
  };

  const editCurrentImage = () => {
    if (!state.generatedImageUrl) return;
    setState(prev => ({
      ...prev,
      mode: AppMode.EDIT,
      uploadedImage: prev.generatedImageUrl,
      generatedImageUrl: null
    }));
  };

  const backToEditFunctions = () => {
    setState(prev => ({ ...prev, activeEditFunction: 'add-remove' }));
  };

  const isComposeMode = state.mode === AppMode.EDIT && state.activeEditFunction === 'compose';

  return (
    <div className="container mx-auto h-screen flex flex-col md:flex-row p-0 m-0 max-w-none overflow-hidden bg-[#030005]">
      {/* LEFT PANEL */}
      <div className="left-panel w-full md:w-[400px] h-full flex flex-col p-6 overflow-y-auto border-r border-white/5 bg-[#0a0510]">
        <div className="mb-8">
          <h1 className="panel-title text-3xl font-black mb-1">Francolino AI Studio</h1>
          <p className="panel-subtitle text-sm text-purple-400 font-medium">Gerador profissional de imagens</p>
        </div>

        {/* Prompt Input Section */}
        <div className="prompt-section mb-6">
          <div className="section-title text-xs font-bold mb-3 uppercase tracking-widest text-purple-300">Qual a sua ideia:</div>
          <textarea
            id="prompt"
            className="prompt-input w-full h-32 p-4 rounded-2xl resize-none text-sm leading-relaxed"
            placeholder="Ex: Uma paisagem mágica em tons de violeta..."
            value={state.prompt}
            onChange={handlePromptChange}
          />
        </div>

        {/* Mode Toggle Section */}
        <div className="mode-toggle flex gap-2 mb-8 p-1 bg-white/5 rounded-2xl">
          <button
            className={`mode-btn flex-1 py-3 px-4 rounded-xl font-black text-xs tracking-widest transition-all ${state.mode === AppMode.CREATE ? 'active bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'bg-transparent text-gray-500'}`}
            data-mode="create"
            onClick={() => handleModeChange(AppMode.CREATE)}
          >
            CRIAR
          </button>
          <button
            className={`mode-btn flex-1 py-3 px-4 rounded-xl font-black text-xs tracking-widest transition-all ${state.mode === AppMode.EDIT ? 'active bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'bg-transparent text-gray-500'}`}
            data-mode="edit"
            onClick={() => handleModeChange(AppMode.EDIT)}
          >
            EDITAR
          </button>
        </div>

        {/* Create Functions Grid */}
        {state.mode === AppMode.CREATE && (
          <div id="createFunctions" className="functions-section mb-8">
            <div className="functions-grid grid grid-cols-2 gap-3">
              {[
                { id: 'free', label: 'Prompt', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19h16M6 3h12v14H6z"/><path d="M8 7h8M8 11h8"/></svg> },
                { id: 'sticker', label: 'Figura', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M7 3h7l7 7v7a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z"/><path d="M14 3v5a2 2 0 0 0 2 2h5"/></svg> },
                { id: 'text', label: 'Logo', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M10 6v12M14 6v12M6 18h12"/></svg> },
                { id: 'comic', label: 'Desenho', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h12v10H3z"/><path d="M15 7l6-2v10l-6 2z"/><path d="M5 9h8M5 12h6"/></svg> }
              ].map(item => (
                <div
                  key={item.id}
                  data-function={item.id}
                  className={`function-card p-5 rounded-2xl cursor-pointer flex flex-col items-center justify-center text-center transition-all ${state.activeCreateFunction === item.id ? 'active border-purple-500 bg-purple-500/10' : 'border-white/5 hover:border-white/10'}`}
                  onClick={() => handleCreateFunctionChange(item.id as CreateFunction)}
                >
                  <div className="icon mb-2" aria-hidden="true">{item.icon}</div>
                  <div className="name text-[10px] uppercase font-bold tracking-widest">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit Functions Grid */}
        {state.mode === AppMode.EDIT && !isComposeMode && (
          <div id="editFunctions" className="functions-section mb-8">
            <div className="functions-grid grid grid-cols-2 gap-3">
              {[
                { id: 'add-remove', label: 'Adicionar', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg> },
                { id: 'retouch', label: 'Retoque', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22l6-6"/><path d="M3 16l5 5"/><path d="M14.5 2.5l7 7-9.5 9.5H5v-7z"/></svg> },
                { id: 'style', label: 'Estilo', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a7 7 0 1 1-10.8-8.4"/></svg> },
                { id: 'compose', label: 'Mesclar', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="10" height="10" rx="1"/><rect x="11" y="3" width="10" height="10" rx="1"/></svg>, reqTwo: true }
              ].map(item => (
                <div
                  key={item.id}
                  data-function={item.id}
                  data-requires-two={item.reqTwo ? "true" : "false"}
                  className={`function-card p-5 rounded-2xl cursor-pointer flex flex-col items-center justify-center text-center transition-all ${state.activeEditFunction === item.id ? 'active border-purple-500 bg-purple-500/10' : 'border-white/5 hover:border-white/10'}`}
                  onClick={() => handleEditFunctionChange(item.id as EditFunction)}
                >
                  <div className="icon mb-2" aria-hidden="true">{item.icon}</div>
                  <div className="name text-[10px] uppercase font-bold tracking-widest">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Two Images Section */}
        {isComposeMode && (
          <div id="twoImagesSection" className="functions-section mb-8">
            <div className="section-title text-[10px] font-black mb-4 text-purple-300 uppercase tracking-[0.2em]">Duas Imagens Necessárias</div>
            
            <div className="space-y-4 mb-6">
              <div
                className="upload-area-dual relative h-36 rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-white/10 hover:border-purple-500/40"
                onClick={() => fileInputDual1Ref.current?.click()}
              >
                {!state.uploadedImage ? (
                  <>
                    <div className="mb-2 text-purple-400/60"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                    <div className="text-[10px] uppercase font-bold tracking-widest">Primeira Imagem</div>
                    <div className="upload-text text-[9px] text-gray-500 mt-1 uppercase tracking-widest">Clique para selecionar</div>
                  </>
                ) : (
                  <img src={state.uploadedImage} className="image-preview absolute inset-0 w-full h-full object-cover" alt="Preview 1" />
                )}
                <input type="file" id="imageUpload1" className="hidden" accept="image/*" ref={fileInputDual1Ref} onChange={(e) => handleImageUpload(e, 1)} />
              </div>

              <div
                className="upload-area-dual relative h-36 rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-white/10 hover:border-purple-500/40"
                onClick={() => fileInputDual2Ref.current?.click()}
              >
                {!state.uploadedImage2 ? (
                  <>
                    <div className="mb-2 text-purple-400/60"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                    <div className="text-[10px] uppercase font-bold tracking-widest">Segunda Imagem</div>
                    <div className="upload-text text-[9px] text-gray-500 mt-1 uppercase tracking-widest">Clique para selecionar</div>
                  </>
                ) : (
                  <img src={state.uploadedImage2} className="image-preview absolute inset-0 w-full h-full object-cover" alt="Preview 2" />
                )}
                <input type="file" id="imageUpload2" className="hidden" accept="image/*" ref={fileInputDual2Ref} onChange={(e) => handleImageUpload(e, 2)} />
              </div>
            </div>

            <button className="back-btn w-full py-2 text-[10px] font-black uppercase tracking-widest text-purple-300 hover:text-purple-100 transition-colors" onClick={backToEditFunctions}>
              ← Voltar para Edição
            </button>
          </div>
        )}

        {/* Dynamic Content Area (Single Upload) */}
        {state.mode === AppMode.EDIT && !isComposeMode && (
          <div className="dynamic-content mb-8">
            <div
              id="uploadArea"
              className="upload-area relative h-56 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-purple-900/40"
              onClick={() => fileInputRef.current?.click()}
            >
              {!state.uploadedImage ? (
                <>
                  <div className="mb-4 text-purple-500">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </div>
                  <div className="text-[11px] font-black uppercase tracking-widest text-center px-6 leading-relaxed">Clique ou arraste uma imagem</div>
                  <div className="upload-text text-[9px] text-purple-400/60 mt-2 uppercase tracking-widest">PNG, JPG, WebP (máx. 10MB)</div>
                </>
              ) : (
                <img id="imagePreview" src={state.uploadedImage} className="image-preview absolute inset-0 w-full h-full object-cover" alt="Upload Preview" />
              )}
              <input type="file" id="imageUpload" className="hidden" accept="image/*" ref={fileInputRef} onChange={(e) => handleImageUpload(e, 0)} />
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="mt-auto pt-6">
          <button
            id="generateBtn"
            className={`generate-btn w-full py-5 rounded-2xl flex items-center justify-center gap-4 transition-all ${state.isGenerating ? 'opacity-80 cursor-wait' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
            onClick={generateImage}
            disabled={state.isGenerating}
          >
            {state.isGenerating && (
              <div className="spinner w-5 h-5 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
            )}
            <span className="btn-text text-sm font-black uppercase tracking-[0.2em]">{state.isGenerating ? "Processando..." : "Gerar Imagem"}</span>
          </button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="right-panel flex-1 h-full p-8 md:p-12 flex flex-col items-center justify-center relative bg-gradient-to-br from-[#0a0515] to-[#000000]">
        {!state.generatedImageUrl && !state.isGenerating && (
          <div id="resultPlaceholder" className="result-placeholder flex flex-col items-center opacity-20 text-center">
            <div className="result-placeholder-icon mb-6 text-purple-500">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
            <div className="text-xl font-light uppercase tracking-[0.3em] text-purple-300">Sua obra de arte aparecerá aqui</div>
          </div>
        )}

        {state.isGenerating && (
          <div id="loadingContainer" className="loading-container flex flex-col items-center gap-8">
            <div className="relative">
              <div className="loading-spinner w-24 h-24 border-2 border-white/5 border-t-purple-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-12 h-12 bg-purple-500/10 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="loading-text text-purple-400 font-black tracking-[0.4em] text-xs uppercase animate-pulse">Criando Dimensões...</div>
          </div>
        )}

        {state.generatedImageUrl && !state.isGenerating && (
          <div id="imageContainer" className="image-container relative group max-w-full max-h-full flex items-center justify-center p-4">
            <img
              id="generatedImage"
              src={state.generatedImageUrl}
              className="generated-image max-w-full max-h-[85vh] rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.9)] border border-purple-500/10 object-contain"
              alt="Generated Art"
            />
            <div className="image-actions absolute top-10 right-10 flex gap-4 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
              <button className="action-btn p-4 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-purple-600 hover:text-white transition-all shadow-xl" onClick={editCurrentImage} title="Editar">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button className="action-btn p-4 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-purple-600 hover:text-white transition-all shadow-xl" onClick={downloadImage} title="Download">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE MODAL */}
      {state.showModal && state.generatedImageUrl && (
        <div id="mobileModal" className="mobile-modal fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 backdrop-blur-3xl bg-black/95">
          <div className="modal-content relative w-full max-w-lg flex flex-col">
            <img id="modalImage" src={state.generatedImageUrl} className="modal-image w-full h-auto rounded-[2rem] shadow-2xl border border-purple-500/20" alt="Modal view" />
            <div className="modal-actions mt-8 grid grid-cols-2 gap-4">
              <button className="modal-btn edit py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest text-white" onClick={editCurrentImage}>Editar Obra</button>
              <button className="modal-btn download py-4 bg-purple-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest" onClick={downloadImage}>Salvar na Galeria</button>
              <button className="modal-btn new col-span-2 py-4 text-purple-400 font-bold uppercase text-[9px] tracking-[0.3em] hover:text-white transition-colors" onClick={() => setState(p => ({ ...p, generatedImageUrl: null, showModal: false }))}>Voltar ao Estúdio</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
