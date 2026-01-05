import { Outlet } from "react-router-dom";
import SideBar from "../components/SideBar";
// import "./Layout.css"; // Import CSS file

export default function Layout() {
  return (
    <div className="flex bg-primary min-h-screen">
      {/* Sidebar */}
      <div className="w-[80px] sm:w-[100px] lg:w-[130px] bg-primary min-h-screen ">
        <SideBar />
      </div>

      {/* Main Content */}
      <main className="flex-1 text-white pt-12 px-10 max-w-3xl bg-slate-40  lg:max-w-7xl min-h-screen no-scrollbar h-screen hide-scrollbar  overflow-y-auto  overflow-x-auto mx-auto pb-10">
        <Outlet />
      </main>
    </div>
  );
}
