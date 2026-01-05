import { createBrowserRouter, RouterProvider } from "react-router-dom";

import ProtectedRoutes from "./services/ProtectedRoutes";
import ReverseProtectedRoutes from "./services/ReverseProtectedRoutes";
import RoleBasedRoute from "./services/RoleBasedRoute";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Layout from "./pages/Layout";
import Inventory from "./pages/Inventory";
import Kitchen from "./pages/Kitchen";
import Menu from "./pages/Menu";
import OrdersAndTables from "./pages/OrdersAndTables";
import EditOrder from "./pages/EditOrder";
import Staff from "./pages/Staff";
import Reports from "./pages/Reports";
import Reservation from "./pages/Reservation";
import Managment from "./pages/Managment";
import CategoryAdd from "./components/category/CategoryAdd";
import SubCategoryAdd from "./components/subCategory/SubCategoryAdd";
import DishAdd from "./components/dishes/DishAdd";
import OrderTracking from "./components/order/OrderTracking";
import AddStaff from "./components/Staff/AddStaff";
import Editstaff from "./components/Staff/Editstaff";
import EachKitchen from "./pages/EachKitchen";
import MakeOrder from "./components/order/MakeOrder";
import { Table } from "lucide-react";
import Tables from "./pages/Tables";
import NotFound from "./pages/NotFound";
import EditProduct from "./components/dishes/EditProduct";
import EditSubCategory from "./components/subCategory/EditSubCategory";
import Offer from "./pages/Offer";
import ViewSubCategoryDetails from "./components/subCategory/ViewSubCategoryDetails";
import IngredientAdd from "./components/ingredients/IngredientAdd";
import EditIngredient from "./components/ingredients/EditIngredient";
import EditCategory from "./components/category/EditCategory";
import ViewCategoryDetails from "./components/category/ViewCategoryDetails";
import Section from "./pages/Section";
import TablesBySection from "./pages/TablesBySection";
import Location from "./pages/Location";
import MergePage from "./pages/MergePage";
import Checkout from "./components/order/Checkout";
import Supplier from "./pages/Supplier";
import AddSupplier from "./pages/AddSupplier";
import UpdateSupplier from "./pages/UpdateSupplier";
import Purchase from "./pages/Purchase";
import CreatePuchase from "./pages/CreatePuchase";
import PurchaseView from "./pages/PurchaseView";
import Batches from "./components/inventory/Batches";
import Recipe from "./pages/Recipe";
import AddRecipe from "./components/recipe/AddRecipe";
import EditRecipe from "./components/recipe/EditRecipe";
import ViewRecipe from "./components/recipe/ViewRecipe";
import SubInventory from "./pages/SubInventory";
import OrdersReport from "./pages/OrdersReport";
import TableOrders from "./pages/TableOrders";
import CashierDashboard from "./pages/CashierDashboard";
import TransactionHistory from "./pages/TransactionHistory";
import RegisterManagement from "./pages/RegisterManagement";
import SessionHistory from "./pages/SessionHistory";
import SessionSummary from "./pages/SessionSummary";

function App() {
  const router = createBrowserRouter([
    {
      path: "/login",
      element: (
        <ReverseProtectedRoutes>
          <Login />
        </ReverseProtectedRoutes>
      ),
    },
    {
      path: "",
      element: (
        <ProtectedRoutes>
          <Layout />
        </ProtectedRoutes>
      ),
      children: [
        {
          index: true,

          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation"]}>
              <Dashboard />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/add-ingredient",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation"]}>
              <IngredientAdd />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/staff",
          element: (
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Staff />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/add-staff",
          element: (
            <RoleBasedRoute allowedRoles={["admin"]}>
              <AddStaff />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/product/:id",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation"]}>
              <EditProduct />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/subcategory/:id",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation"]}>
              <EditSubCategory />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/ingredients/:id",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation"]}>
              <EditIngredient />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/category/:id",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation"]}>
              <EditCategory />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/subcategoryDetails/:id",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation"]}>
              <ViewSubCategoryDetails />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/categoryDetails/:id",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation"]}>
              <ViewCategoryDetails />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/edit-staff/:id",
          element: (
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Editstaff />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/service",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation"]}>
              <Managment />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/add-category",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation"]}>
              <CategoryAdd />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/add-sub-category",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation"]}>
              <SubCategoryAdd />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/add-dish",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation"]}>
              <DishAdd />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/inventory",
          element: (
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Inventory />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/inventory/:id",
          element: (
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Batches />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/sub-inventory",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation", "staff"]}>
              <SubInventory />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/recipe",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation"]}>
              <Recipe />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/add-recipe",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation"]}>
              <AddRecipe />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/edit-recipe/:id",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation"]}>
              <EditRecipe />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/recipe/:id",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation", "staff"]}>
              <ViewRecipe />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/create-purchase/:id",
          element: (
            <RoleBasedRoute allowedRoles={["admin"]}>
              <CreatePuchase />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/purchase/:id",
          element: (
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Purchase />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/purchase/view/:id",
          element: (
            <RoleBasedRoute allowedRoles={["admin"]}>
              <PurchaseView />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/kitchen",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "staff", "operation"]}>
              <Kitchen />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/section",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "staff", "operation"]}>
              <Section />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/location",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "staff", "operation"]}>
              <Location />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/section-tables/:id",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "staff", "operation"]}>
              <TablesBySection />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/offer",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation"]}>
              <Offer />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/kitchen/:id",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "staff", "operation"]}>
              <EachKitchen />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/follow-order",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation", "waiter"]}>
              <OrderTracking />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/menu",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation"]}>
              <Menu />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/orders-tables",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation", "waiter"]}>
              <OrdersAndTables />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/orders-tables/edit/:id",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation", "waiter"]}>
              <EditOrder />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/make-order",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation", "waiter"]}>
              <MakeOrder />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/supplier",
          element: (
            <RoleBasedRoute allowedRoles={["admin"]}>
              <Supplier />
            </RoleBasedRoute>
          ),
        },

        {
          path: "/add-supplier",
          element: (
            <RoleBasedRoute allowedRoles={["admin"]}>
              <AddSupplier />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/update-supplier/:id",
          element: (
            <RoleBasedRoute allowedRoles={["admin"]}>
              <UpdateSupplier />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/checkout",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation", "waiter"]}>
              <Checkout />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/merge-order",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation", "waiter"]}>
              <MergePage />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/table",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation", "waiter"]}>
              <Tables />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/table-orders/:tableId",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation", "waiter"]}>
              <TableOrders />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/reports",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation"]}>
              <Reports />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/orders-report",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation", "waiter"]}>
              <OrdersReport />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/reservation",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation"]}>
              <Reservation />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/managment",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation"]}>
              <Managment />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/cashier",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation", "cashier"]}>
              <CashierDashboard />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/transactions",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation", "cashier"]}>
              <TransactionHistory />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/registers",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation"]}>
              <RegisterManagement />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/sessions",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation", "cashier"]}>
              <SessionHistory />
            </RoleBasedRoute>
          ),
        },
        {
          path: "/session/:id",
          element: (
            <RoleBasedRoute allowedRoles={["admin", "operation", "cashier"]}>
              <SessionSummary />
            </RoleBasedRoute>
          ),
        },
        { path: "*", element: <NotFound /> },
      ],
    },
  ]);

  return <RouterProvider router={router}></RouterProvider>;
}

export default App;
