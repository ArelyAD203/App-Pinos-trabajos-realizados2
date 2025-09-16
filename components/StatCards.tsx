import React from 'react';

const ClipboardListIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" />
      <path d="M12 16h4" />
      <path d="M8 11h.01" />
      <path d="M8 16h.01" />
    </svg>
);

const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const CalendarDaysIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
    <path d="M8 14h.01" />
    <path d="M12 14h.01" />
    <path d="M16 14h.01" />
    <path d="M8 18h.01" />
    <path d="M12 18h.01" />
    <path d="M16 18h.01" />
  </svg>
);


interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  theme: 'purple' | 'orange' | 'green';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, theme }) => {
    const themeClasses = {
        purple: {
            gradient: "from-purple-500 to-indigo-600",
            shadow: "shadow-purple-500/30",
        },
        orange: {
            gradient: "from-orange-400 to-amber-500",
            shadow: "shadow-orange-500/30",
        },
        green: {
            gradient: "from-lime-400 to-green-500",
            shadow: "shadow-lime-500/30",
        },
    };
    const currentTheme = themeClasses[theme];

    return (
        <div className="group relative p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-[1.03] hover:shadow-2xl dark:hover:shadow-slate-900/50">
            <div className={`absolute -right-10 -top-10 w-36 h-36 bg-gradient-to-br ${currentTheme.gradient} rounded-full opacity-10 dark:opacity-20 blur-xl`}></div>
            <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                    <div className={`mb-4 inline-block p-3 rounded-xl bg-gradient-to-br ${currentTheme.gradient} ${currentTheme.shadow} shadow-lg text-white transition-transform duration-300 ease-in-out group-hover:scale-110 group-hover:-rotate-6`}>
                        {icon}
                    </div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
                </div>
                <p className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mt-2 self-end">{value}</p>
            </div>
        </div>
    );
};


interface StatCardsProps {
    totalEntries: number;
    uniquePeople: number;
    activeMonths: number;
}

const StatCards: React.FC<StatCardsProps> = ({ totalEntries, uniquePeople, activeMonths }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
                title="Total de Registros"
                value={totalEntries}
                icon={<ClipboardListIcon className="w-8 h-8" />}
                theme="purple"
            />
            <StatCard
                title="Personas Involucradas"
                value={uniquePeople}
                icon={<UsersIcon className="w-8 h-8" />}
                theme="orange"
            />
            <StatCard
                title="Meses con Actividad"
                value={activeMonths}
                icon={<CalendarDaysIcon className="w-8 h-8" />}
                theme="green"
            />
        </div>
    );
};

export default StatCards;