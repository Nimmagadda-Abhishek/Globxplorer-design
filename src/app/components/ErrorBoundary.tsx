import { useRouteError, Link } from "react-router";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";

export function ErrorBoundary() {
  const error: any = useRouteError();
  console.error("Router Boundary Error:", error);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#F8FAFC] p-4 text-center pb-20">
      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-12 h-12 text-red-600" />
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold text-[#111827] mb-2">
        {error?.status === 404 ? "Page Not Found" : "Unexpected Error"}
      </h1>
      
      <p className="text-[#6B7280] mb-8 max-w-md">
        {error?.status === 404 
          ? "We couldn't find the page you're looking for. It might have been moved or doesn't exist." 
          : "An unexpected application error has occurred. Our systems have logged the fault."}
      </p>
      
      {error && !error.status && (
        <div className="bg-white border border-red-200 p-4 rounded-lg shadow-sm text-left w-full max-w-lg mb-8 overflow-auto">
          <p className="text-xs font-mono text-red-600 font-semibold">{error.statusText || error.message}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#111827] hover:bg-[#F3F4F6] transition-colors"
        >
          <RefreshCcw className="w-4 h-4 text-[#6B7280]" />
          Reload Page
        </button>
        <Link 
          to="/"
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors"
        >
          <Home className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
