import { Construction } from "lucide-react";

export default function About() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-amber-100">
          <Construction size={48} className="text-amber-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Coming Soon</h1>
        <p className="text-slate-500 max-w-md">
          The About page is currently under construction. 
          We're working hard to bring you this feature soon!
        </p>
        <div className="mt-6 h-2 w-32 mx-auto bg-amber-200 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-amber-500 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}