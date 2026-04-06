export default function LoadingState() {
  return (
    <div className="w-full max-w-lg mx-auto bg-card rounded-2xl shadow-sm border p-6 md:p-10 animate-pulse">
      <div className="h-6 bg-secondary rounded w-3/4 mb-6"></div>
      <div className="h-4 bg-secondary rounded w-full mb-8"></div>
      <div className="space-y-4">
         <div className="h-12 bg-secondary rounded w-full"></div>
         <div className="h-12 bg-secondary rounded w-full"></div>
         <div className="h-12 bg-secondary rounded w-full"></div>
      </div>
      <div className="flex justify-between mt-10">
         <div className="h-12 bg-secondary rounded w-32"></div>
         <div className="h-12 bg-secondary rounded w-32"></div>
      </div>
    </div>
  );
}
