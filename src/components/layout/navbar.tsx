import { MobileSidebar } from "@/components/layout/mobile-sidebar";

export const Navbar = () => {
  return (
    <div className="flex items-center p-4">
      <MobileSidebar />
      <div className="flex w-full justify-end">
        {/* UserButton will go here */}
      </div>
    </div>
  );
};
