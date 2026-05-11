export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-beige-50 p-6">
      <div className="w-full max-w-md bg-white border border-stroke rounded-xl shadow-md p-8">
        {children}
      </div>
    </div>
  );
}
