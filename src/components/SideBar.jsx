import logo from "../assets/logo.png";
import dashboardicon from "../assets/dashboard-fill.png";
import peopleIcon from "../assets/people-fill.png";
// import menuIcom from "../assets/files.png";
import inventoryIcon from "../assets/inevntory.png";
import offerIcon from "../assets/discount.png";
import locationIcon from "../assets/location-pointer.png";
import reportIcon from "../assets/sheet.png";
import tablesIcon from "../assets/icons8-order-food-100.png";
import reservationIcon from "../assets/calendare.png";
import kitchenIcon from "../assets/kitchen.png";
import logoutIcon from "../assets/logout-outlined.png";
import recipeIcon from "../assets/files.png";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function SideBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((store) => store.user.user);

  const routes = [
    {
      title: "Dashboard",
      icon: dashboardicon,
      link: "/",
      access: ["admin", "operation"],
    },

    {
      title: "Service Managment",
      icon: reportIcon,
      link: "/managment",
      access: ["admin", "operation"],
    },
    // {
    //   title: "Menu",
    //   icon: menuIcom,
    //   link: "/menu",
    //   access: ["admin", "staff", "operation", "waiter"]
    // },
    {
      title: "Staff",
      icon: peopleIcon,
      link: "/staff",
      access: ["admin"],
    },
    // {
    //   title: "Inventory",
    //   icon: inventoryIcon,
    //   link: "/inventory",
    // },
    {
      title: "Orders Report",
      icon: reportIcon,
      link: "/orders-report",
      access: ["admin", "operation", "waiter"],
    },
    {
      title: "Orders",
      icon: tablesIcon,
      link: "/orders-tables",
      access: ["admin", "operation", "waiter"],
    },
    {
      title: "Tables",
      icon: reservationIcon,
      link: "/table",
      access: ["admin", "operation", "waiter"],
    },
    {
      title: "Sections",
      icon: reservationIcon,
      link: "/section",
      access: ["admin", "operation"],
    },
    {
      title: "Kitchen",
      icon: kitchenIcon,
      link: "/kitchen",
      access: ["admin", "staff", "operation"],
    },
    {
      title: "offer",
      icon: offerIcon,
      link: "/offer",
      access: ["admin", "staff", "operation"],
    },
    {
      title: "location",
      icon: locationIcon,
      link: "/location",
      access: ["admin", "staff", "operation"],
    },
    {
      title: "suppliers",
      icon: inventoryIcon,
      link: "/supplier",
      access: ["admin"],
    },
    {
      title: "inventory",
      icon: inventoryIcon,
      link: "/inventory",
      access: ["admin"],
    },
    {
      title: "Kitchen Inventory",
      icon: inventoryIcon,
      link: "/sub-inventory",
      access: ["admin", "operation", "staff"],
    },
    {
      title: "Recipes",
      icon: recipeIcon,
      link: "/recipe",
      access: ["admin", "operation"],
    },
    {
      title: "Cashier",
      icon: reportIcon,
      link: "/cashier",
      access: ["admin", "operation", "cashier"],
    },
    {
      title: "Transactions",
      icon: reportIcon,
      link: "/transactions",
      access: ["admin", "operation", "cashier"],
    },
    {
      title: "Registers",
      icon: inventoryIcon,
      link: "/registers",
      access: ["admin", "operation"],
    },
    {
      title: "Sessions",
      icon: reportIcon,
      link: "/sessions",
      access: ["admin", "operation", "cashier"],
    },
  ];

  return (
    <div className="bg-secondary text-white px-4 pb-3 h-full overflow-hidden w-full flex flex-col">
      <div className="">
        <img className="w-full" src={logo} />
      </div>

      {/* Navigation items - takes remaining space */}
      <div className="flex-1 flex flex-col">
        {routes.map(
          (ele, index) =>
            ele.access.includes(user.role) && (
              <div
                onClick={() => navigate(ele.link)}
                key={index}
                className="flex flex-col justify-center items-center cursor-pointer hover:bg-opacity-80 transition-all duration-200 py-2 mb-6"
              >
                <img
                  src={ele.icon}
                  alt="icon"
                  className={`mb-2 w-[25px] lg:w-[30px] transition-all duration-300 ease-in-out ${
                    location.pathname === ele.link
                      ? "filter brightness-0 invert"
                      : ""
                  }`}
                />
                <p className={`text-xs sm:text-sm text-center`}>{ele.title}</p>
              </div>
            )
        )}
      </div>

      {/* Logout button - stays at bottom */}
      <div
        onClick={() => {
          localStorage.removeItem("patriaUser");
          navigate("/login");
        }}
        className="flex flex-col items-center cursor-pointer hover:bg-opacity-80 transition-all duration-200 py-2 mb-6 mt-auto"
      >
        <img
          src={logoutIcon}
          alt="icon"
          className="mb-2 w-[30px] lg:w-[30px]"
        />
        <p className="text-sm text-center">Logout</p>
      </div>
    </div>
  );
}
