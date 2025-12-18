
import React, { useState } from 'react';
import { EcoTacho } from '../types';
import { ECO_TACHOS_DATA } from '../constants';
import { Card, Button } from './Button';
import { Info, ShoppingBag, Users, ChevronLeft, ArrowRightCircle, ExternalLink } from 'lucide-react';

const EcoTachosView: React.FC = () => {
  const [selectedTacho, setSelectedTacho] = useState<EcoTacho | null>(null);

  // --- REDIRECCIÓN A TIENDA ---
  const handleShopRedirect = () => {
    const url = "https://shop-eco-delta.vercel.app/";
    window.open(url, '_blank');
  };

  // --- VISTA DETALLE ---
  if (selectedTacho) {
    return (
      <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right duration-300">
        <div className="p-4 bg-white sticky top-0 z-10 shadow-sm flex items-center gap-2 pt-safe">
          <button onClick={() => setSelectedTacho(null)} className="p-2 hover:bg-slate-100 rounded-full">
            <ChevronLeft size={24} className="text-slate-600" />
          </button>
          <h2 className="font-bold text-lg text-slate-800">Detalle del Producto</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Imagen / Icono */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
              HUANCAYO
            </div>
            {selectedTacho.image ? (
               <img 
                 src={selectedTacho.image} 
                 alt={selectedTacho.nombre}
                 className="w-48 h-48 mx-auto object-contain drop-shadow-xl mb-4" 
               />
            ) : (
              <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-6xl shadow-inner">
                {selectedTacho.tipo === 'Punto Verde' ? '♻️' : '🗑️'}
              </div>
            )}
            
            <h1 className="text-2xl font-bold text-slate-800 mb-1 leading-tight">{selectedTacho.nombre}</h1>
            <span className="inline-block mt-2 bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full font-medium border border-slate-200">
              {selectedTacho.tipo}
            </span>
          </div>

          {/* Especificaciones */}
          <Card>
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
              <Info size={16} className="text-emerald-500" /> Ficha Técnica
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Capacidad</span>
                <span className="font-bold text-slate-800">{selectedTacho.capacidadLitros} Litros</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Alcance sugerido</span>
                <span className="font-bold text-emerald-700">{selectedTacho.casasSugeridas}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Moneda</span>
                <span className="font-bold text-slate-800">{selectedTacho.moneda}</span>
              </div>
            </div>
            <p className="mt-4 text-slate-600 text-sm leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
              {selectedTacho.descripcion}
            </p>
          </Card>

          {/* Precio Referencial */}
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide mb-1">Inversión Estimada (Referencial)</p>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-bold text-amber-900">S/ {selectedTacho.precioMin}</span>
              <span className="text-sm text-amber-700 font-medium mb-1"> - S/ {selectedTacho.precioMax}</span>
            </div>
            <p className="text-[10px] text-amber-600/70 mt-2 leading-tight">
              * Precios promedio de mercado en Junín. Únete con tus vecinos para comprar al por mayor.
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="p-4 bg-white border-t border-slate-200 pb-safe">
          <Button fullWidth onClick={handleShopRedirect} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 py-4">
            <ShoppingBag className="mr-2" size={24}/> Crear Campaña Vecinal
          </Button>
          <p className="text-[10px] text-center text-slate-400 mt-2">
            Serás redirigido a nuestra tienda oficial para ver opciones.
          </p>
        </div>
      </div>
    );
  }

  // --- VISTA LISTA ---
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="p-6 pb-4 pt-safe bg-white shadow-sm z-10 sticky top-0">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <ShoppingBag className="text-emerald-600" /> EcoTachos
        </h1>
        <p className="text-slate-500 text-sm mt-1">Equipamiento urbano para tu barrio.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {ECO_TACHOS_DATA.map((tacho) => (
          <div 
            key={tacho.id}
            onClick={() => setSelectedTacho(tacho)}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 active:scale-[0.98] transition-transform cursor-pointer flex gap-4 group hover:border-emerald-200"
          >
             <div className="w-24 h-24 bg-slate-50 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden group-hover:bg-emerald-50 transition-colors">
              {tacho.image ? (
                <img src={tacho.image} alt={tacho.nombre} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">{tacho.tipo === 'Punto Verde' ? '♻️' : '🗑️'}</span>
              )}
            </div>
            
            <div className="flex-1 py-1">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                  {tacho.tipo}
                </span>
                <ArrowRightCircle size={20} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
              </div>
              
              <h3 className="font-bold text-slate-800 leading-tight mt-2 mb-1 text-lg">{tacho.nombre}</h3>
              
              <div className="flex items-center gap-2 mt-3">
                 <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-1 rounded-md font-bold">
                   {tacho.capacidadLitros} L
                 </span>
                 <span className="text-xs font-bold text-slate-500">
                   S/ {tacho.precioMin} aprox.
                 </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EcoTachosView;
