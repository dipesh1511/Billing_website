function StatsCard({ title, value, color, icon }) {
  return (
    <div
      className={`bg-gradient-to-r ${color} text-white p-5 rounded-2xl shadow-lg hover:scale-105 transition`}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <h2 className="text-2xl font-bold">{value}</h2>
        </div>

        <div className="text-3xl opacity-80">{icon}</div>
      </div>
    </div>
  );
}

export default StatsCard;
