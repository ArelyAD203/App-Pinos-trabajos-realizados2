import React from 'react';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  theme: 'light' | 'dark';
  setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
}

const Header: React.FC<HeaderProps> = ({ theme, setTheme }) => {
  return (
    <header className="relative text-center lg:text-left p-8 rounded-2xl bg-blue-900 dark:bg-blue-950 shadow-2xl shadow-blue-500/20 transition-all duration-500 ease-in-out hover:-translate-y-1 hover:shadow-blue-500/40">
      <div className="absolute top-5 right-5">
          <ThemeToggle theme={theme} setTheme={setTheme} />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-white">
        Reporte y seguimiento de trabajos realizados
      </h1>
      <p className="mt-2 text-3xl text-amber-300 font-bold tracking-wide">
        Condominio Pinos 28
      </p>
      <p className="mt-4 text-lg text-blue-200 dark:text-blue-300 max-w-3xl mx-auto lg:mx-0">
        Una herramienta para registrar, consultar y gestionar las tareas de mantenimiento y trabajos completados en el condominio.
      </p>
      <div className="mt-6 inline-block">
        <div className="bg-gradient-to-r from-cyan-400 to-teal-500 dark:from-cyan-500 dark:to-teal-600 rounded-full px-5 py-2.5 shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-cyan-400/30">
            <p className="text-sm font-bold text-white uppercase tracking-widest select-none">
              Creado por Arely Aguilar
            </p>
        </div>
      </div>
    </header>
  );
};

export default Header;