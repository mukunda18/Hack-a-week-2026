export default function ProjectInfo() {
  return (
    <div className="mb-12 p-6 border border-blue-200 rounded-lg bg-blue-50">
      <h3 className="text-lg font-semibold text-blue-900 mb-4">
        About This Project
      </h3>
      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-3">
          <div className="text-blue-400 mt-0.5">📍</div>
          <div>
            <div className="font-medium text-blue-900">Student Project Initiative</div>
            <div className="text-blue-800">Kathmandu, Nepal</div>
            <div className="text-blue-800">Academic Research Project</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="text-blue-400 mt-0.5">🎓</div>
          <div>
            <div className="font-medium text-blue-900">Educational Purpose</div>
            <div className="text-blue-800">Developed as part of academic coursework</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="text-blue-400 mt-0.5">🔒</div>
          <div>
            <div className="font-medium text-blue-900">Open Source & Transparent</div>
            <div className="text-blue-800">Built with modern web technologies</div>
          </div>
        </div>
      </div>
    </div>
  );
}