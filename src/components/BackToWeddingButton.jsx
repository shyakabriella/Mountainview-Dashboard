import { Link, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BackToWeddingButton() {
  const location = useLocation();
  
  // Don't show the button if we're already on the main wedding dashboard
  const isWeddingDashboard = location.pathname === "/admin/wedding";
  
  if (isWeddingDashboard) {
    return null;
  }
  
  return (
    <Link
      to="/admin/wedding"
      className="group inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:border-amber-300 hover:text-amber-600 mb-4"
    >
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
      Back to Wedding Dashboard
    </Link>
  );
}