
const StatsCard = ({ title, value, icon, description, className = '' }) => {
  return (
    <div className={`card bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm ${className} text-[#4E56C0]  hover:border-[#4E56C0]`}>
      <div className="card-body p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
            {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;