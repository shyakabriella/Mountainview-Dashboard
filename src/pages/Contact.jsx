import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function Contact() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="text-center max-w-2xl mx-auto px-4">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
          <Mail size={48} className="text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Coming Soon</h1>
        <p className="text-slate-500 mb-8">
          The Contact page is currently under construction. 
          We're working hard to bring you this feature soon!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 text-left">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <Mail size={18} className="text-emerald-500" />
              <span className="font-medium text-slate-700">Email</span>
            </div>
            <p className="text-sm text-slate-500">info@mountainviewresort.com</p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <Phone size={18} className="text-emerald-500" />
              <span className="font-medium text-slate-700">Phone</span>
            </div>
            <p className="text-sm text-slate-500">+250 788 123 456</p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <MapPin size={18} className="text-emerald-500" />
              <span className="font-medium text-slate-700">Address</span>
            </div>
            <p className="text-sm text-slate-500">Kigali, Rwanda</p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <Clock size={18} className="text-emerald-500" />
              <span className="font-medium text-slate-700">Hours</span>
            </div>
            <p className="text-sm text-slate-500">24/7 Customer Support</p>
          </div>
        </div>
      </div>
    </div>
  );
}